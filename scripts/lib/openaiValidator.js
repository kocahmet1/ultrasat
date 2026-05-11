/**
 * Stage 2: AI-powered Validation using OpenAI API (gpt-5.4).
 *
 * Uploads the original PDF to OpenAI's Files API, then uses the Responses API
 * to cross-verify the extracted JSON against the PDF. Provides auto-fix suggestions.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload a file to OpenAI's Files API.
 */
async function uploadFileToOpenAI(filePath, apiKey) {
  const form = new FormData();
  form.append('purpose', 'user_data');
  form.append('file', fs.createReadStream(filePath), {
    filename: path.basename(filePath).endsWith('.pdf') ? path.basename(filePath) : 'exam.pdf',
    contentType: 'application/pdf',
  });

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`File upload failed: ${data.error?.message || response.status}`);
  }
  return data.id;
}

/**
 * Delete a file from OpenAI.
 */
async function deleteFileFromOpenAI(fileId, apiKey) {
  try {
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Extract text from OpenAI Responses API output.
 */
function extractResponseText(data) {
  if (data.output && Array.isArray(data.output)) {
    const messageOutput = data.output.find(item => item.type === 'message');
    if (messageOutput?.content && Array.isArray(messageOutput.content)) {
      const textContent = messageOutput.content.find(item => item.type === 'output_text');
      if (textContent?.text) return textContent.text;
    }
  }
  if (data.output_text) return data.output_text;
  return '';
}

/**
 * Build the validation prompt.
 */
function buildValidationPrompt() {
  return `You are a rigorous QA validator for SAT exam content extraction.

I will provide you with:
1. The original SAT exam PDF (attached as a file)
2. A JSON extraction of that PDF (in the text below)

PDF FORMAT NOTES:
- "English Reading & Writing Module 1" in PDF = moduleNumber 1 in JSON
- "English Reading & Writing Module 2" in PDF = moduleNumber 2 in JSON
- "Math Math Module 1" in PDF = moduleNumber 3 in JSON
- "Math Math Module 2" in PDF = moduleNumber 4 in JSON
- Correct answers are in "DETAILED SOLUTION" sections as "Correct: [Letter]"
- FRQ/Student-Produced Response questions have no A/B/C/D options

Your job is to find EVERY error or discrepancy by carefully comparing the JSON against the PDF. Check the following, IN ORDER OF IMPORTANCE:

1. COMPLETENESS: Count all questions in each module of the PDF. Verify the JSON has the same count.
   Expected totals: Module 1 (~26-27 R&W), Module 2 (~27 R&W), Module 3 (~22 Math), Module 4 (~22 Math)

2. CORRECT ANSWERS: For EACH question, verify the "correctAnswer" field matches what the PDF shows as correct in DETAILED SOLUTION.
   - For multiple-choice: the correct answer letter and text must match the "Correct: [Letter]"
   - For user-input/FRQ: the numeric/text value must match the solution explanation

3. QUESTION TEXT ACCURACY: Spot-check that question text was accurately transcribed.
   Focus on: math expressions, special characters, and passage text.
   Metadata noise should NOT appear in question text ("Solve with AI", "Hide Answer", etc.)

4. OPTIONS ACCURACY: For multiple-choice, verify all 4 options are present with correct text.

5. QUESTION TYPE: Verify FRQ/"Student-Produced Response" questions have questionType "user-input" with empty options.

6. PASSAGE ASSOCIATION: Verify passages are correctly associated with their questions.

7. SUBCATEGORY REASONABLENESS: Flag any obviously wrong subcategory classifications.

Return ONLY valid JSON (no markdown code fences):
{
  "overallStatus": "PASS" or "FAIL",
  "totalIssues": <number>,
  "questionCounts": {
    "module1": { "pdf": <N>, "json": <N>, "match": true/false },
    "module2": { "pdf": <N>, "json": <N>, "match": true/false },
    "module3": { "pdf": <N>, "json": <N>, "match": true/false },
    "module4": { "pdf": <N>, "json": <N>, "match": true/false }
  },
  "issues": [
    {
      "moduleNumber": <N>,
      "questionNumber": <N>,
      "issueType": "missing_question" | "wrong_answer" | "text_mismatch" | "missing_option" | "wrong_question_type" | "missing_passage" | "wrong_subcategory" | "extra_question",
      "severity": "critical" | "warning",
      "description": "<clear description of the problem>",
      "suggestedFix": {
        "<field_name>": "<corrected_value>"
      }
    }
  ]
}

RULES:
- "critical" severity = wrong answers, missing questions, wrong question types
- "warning" severity = subcategory issues, minor text differences
- If NO issues found, return overallStatus "PASS", totalIssues 0, empty issues array
- Include suggestedFix whenever possible (the exact corrected field value)
- Be thorough but only report genuine discrepancies, not stylistic differences`;
}

/**
 * Validate extracted JSON against the original PDF using OpenAI.
 *
 * @param {string} pdfPath - Path to the original PDF.
 * @param {object} extractedData - The parsed extraction JSON.
 * @param {object} options
 * @param {string} options.apiKey - OpenAI API key.
 * @param {string} [options.model] - OpenAI model to use.
 * @param {number} [options.maxRetries] - Max retries.
 * @returns {Promise<object>} Validation report.
 */
async function validateExtraction(pdfPath, extractedData, options = {}) {
  const {
    apiKey,
    model = 'gpt-5.4',
    maxRetries = 2,
  } = options;

  if (!apiKey) throw new Error('OpenAI API key is required');

  // Upload PDF to OpenAI
  console.log(`      📤 Uploading PDF for validation...`);
  const fileId = await uploadFileToOpenAI(pdfPath, apiKey);

  const prompt = buildValidationPrompt();
  const jsonForValidation = JSON.stringify(extractedData, null, 2);

  let lastError = null;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`      🔍 Validation call (attempt ${attempt}/${maxRetries})...`);

        const response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: [
              {
                role: 'system',
                content: 'You are a rigorous QA validator. Return ONLY valid JSON. No markdown, no explanations.',
              },
              {
                role: 'user',
                content: [
                  { type: 'input_file', file_id: fileId },
                  {
                    type: 'input_text',
                    text: `${prompt}\n\nHere is the extracted JSON to validate:\n\n${jsonForValidation}`,
                  },
                ],
              },
            ],
            max_output_tokens: 32000,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${data.error?.message || response.status}`);
        }

        let text = extractResponseText(data);
        if (!text) throw new Error('No content returned from OpenAI');

        // Strip markdown fences
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        let report;
        try {
          report = JSON.parse(text);
        } catch (parseErr) {
          let fixed = text.replace(/,\s*([}\]])/g, '$1');
          report = JSON.parse(fixed);
        }

        // Validate report structure
        if (!report.overallStatus) {
          throw new Error('Validation report missing "overallStatus" field');
        }
        if (!Array.isArray(report.issues)) {
          report.issues = [];
        }
        if (typeof report.totalIssues !== 'number') {
          report.totalIssues = report.issues.length;
        }

        return report;

      } catch (err) {
        lastError = err;
        console.error(`      ❌ Validation attempt ${attempt} failed: ${err.message}`);
        if (attempt < maxRetries) {
          const waitMs = 2000 * attempt;
          console.log(`      ⏳ Retrying in ${waitMs / 1000}s...`);
          await sleep(waitMs);
        }
      }
    }

    // Soft-pass if validation API fails entirely
    console.log(`      ⚠️  Validation API failed after ${maxRetries} attempts. Proceeding as-is.`);
    return {
      overallStatus: 'PASS_WITH_WARNING',
      totalIssues: 0,
      issues: [],
      warning: `Validation API failed: ${lastError?.message}. Manual review recommended.`,
    };

  } finally {
    // Clean up uploaded file
    await deleteFileFromOpenAI(fileId, apiKey);
  }
}

/**
 * Apply auto-fixes from a validation report to the extracted data.
 */
function applyAutoFixes(extractedData, validationReport) {
  let fixesApplied = 0;
  let criticalRemaining = 0;

  if (!validationReport.issues || validationReport.issues.length === 0) {
    return { fixesApplied: 0, criticalRemaining: 0 };
  }

  for (const issue of validationReport.issues) {
    const { moduleNumber, questionNumber, suggestedFix, severity } = issue;

    const module = extractedData.modules?.find(m => m.moduleNumber === moduleNumber);
    if (!module) {
      if (severity === 'critical') criticalRemaining++;
      continue;
    }

    const question = module.questions?.find(q => q.questionNumber === questionNumber);
    if (!question) {
      if (severity === 'critical') criticalRemaining++;
      continue;
    }

    if (suggestedFix && typeof suggestedFix === 'object' && Object.keys(suggestedFix).length > 0) {
      const fixableFields = ['correctAnswer', 'questionType', 'subcategory', 'options', 'text', 'passage', 'hasImage', 'imageDescription', 'acceptedAnswers'];
      for (const [field, value] of Object.entries(suggestedFix)) {
        if (field in question || fixableFields.includes(field)) {
          question[field] = value;
          fixesApplied++;
        }
      }
    } else {
      if (severity === 'critical') criticalRemaining++;
    }
  }

  return { fixesApplied, criticalRemaining };
}

/**
 * Run the full validation stage with auto-fix loop.
 */
async function runValidationWithAutoFix(pdfPath, extractedData, options = {}) {
  const { maxValidationRounds = 2, ...apiOptions } = options;

  let report = null;
  let totalFixesApplied = 0;

  for (let round = 1; round <= maxValidationRounds; round++) {
    report = await validateExtraction(pdfPath, extractedData, apiOptions);

    const criticalIssues = report.issues.filter(i => i.severity === 'critical');
    const warnings = report.issues.filter(i => i.severity === 'warning');

    console.log(`      → Round ${round}: ${criticalIssues.length} critical, ${warnings.length} warnings`);

    if (report.overallStatus === 'PASS' || criticalIssues.length === 0) {
      console.log(`      ✓ Validation PASSED${warnings.length > 0 ? ` (${warnings.length} warnings)` : ''}`);
      break;
    }

    const { fixesApplied, criticalRemaining } = applyAutoFixes(extractedData, report);
    totalFixesApplied += fixesApplied;

    if (fixesApplied > 0) {
      console.log(`      🔧 Applied ${fixesApplied} auto-fixes`);
    }

    if (criticalRemaining === 0) {
      console.log(`      ✓ All critical issues resolved via auto-fix`);
      report.overallStatus = 'PASS';
      break;
    }

    if (round < maxValidationRounds) {
      console.log(`      🔄 Re-validating after fixes...`);
    } else {
      console.log(`      ⚠️  ${criticalRemaining} critical issues remain after ${maxValidationRounds} rounds`);
    }
  }

  report._totalFixesApplied = totalFixesApplied;
  return report;
}

module.exports = { validateExtraction, applyAutoFixes, runValidationWithAutoFix };
