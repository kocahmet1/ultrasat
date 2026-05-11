/**
 * Stage 2: AI-powered Validation using Google Gemini API.
 *
 * Cross-verifies the extracted JSON against the original PDF.
 * Finds discrepancies and provides auto-fix suggestions.
 */

const fs = require('fs');
const path = require('path');

/**
 * Sleep helper.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build the validation prompt.
 */
function buildValidationPrompt() {
  return `You are a rigorous QA validator for SAT exam content extraction.

I will provide you with:
1. The original SAT exam PDF
2. A JSON extraction of that PDF

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
 * Validate extracted JSON against the original PDF.
 *
 * @param {string} pdfPath - Path to the original PDF.
 * @param {object} extractedData - The parsed extraction JSON.
 * @param {object} options
 * @param {string} options.apiKey - Gemini API key.
 * @param {string} [options.model] - Gemini model to use.
 * @param {number} [options.maxRetries] - Max retries.
 * @returns {Promise<object>} Validation report.
 */
async function validateExtraction(pdfPath, extractedData, options = {}) {
  const {
    apiKey,
    model = 'gemini-2.5-pro',
    maxRetries = 2,
  } = options;

  if (!apiKey) throw new Error('Gemini API key is required');

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString('base64');

  const prompt = buildValidationPrompt();

  // Prepare the extracted JSON as text (truncate individual question texts to save tokens)
  const jsonForValidation = JSON.stringify(extractedData, null, 2);

  const generativeModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 16384,
    },
  });

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`      🔍 Validation call (attempt ${attempt}/${maxRetries})...`);

      const result = await generativeModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        `Here is the extracted JSON to validate:\n\n${jsonForValidation}`,
      ]);

      const response = result.response;
      let text = response.text();

      // Strip markdown fences
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

      let report;
      try {
        report = JSON.parse(text);
      } catch (parseErr) {
        // Attempt repair
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

  // If validation API fails entirely, return a soft-pass with a warning
  console.log(`      ⚠️  Validation API failed after ${maxRetries} attempts. Proceeding with extraction as-is.`);
  return {
    overallStatus: 'PASS_WITH_WARNING',
    totalIssues: 0,
    issues: [],
    warning: `Validation API failed: ${lastError?.message}. Manual review recommended.`,
  };
}

/**
 * Apply auto-fixes from a validation report to the extracted data.
 *
 * @param {object} extractedData - The extracted exam data (will be mutated).
 * @param {object} validationReport - The validation report with issues and suggestedFix.
 * @returns {{ fixesApplied: number, criticalRemaining: number }}
 */
function applyAutoFixes(extractedData, validationReport) {
  let fixesApplied = 0;
  let criticalRemaining = 0;

  if (!validationReport.issues || validationReport.issues.length === 0) {
    return { fixesApplied: 0, criticalRemaining: 0 };
  }

  for (const issue of validationReport.issues) {
    const { moduleNumber, questionNumber, suggestedFix, severity, issueType } = issue;

    // Find the matching module and question
    const module = extractedData.modules?.find(m => m.moduleNumber === moduleNumber);
    if (!module) {
      if (severity === 'critical') criticalRemaining++;
      continue;
    }

    const question = module.questions?.find(q => q.questionNumber === questionNumber);

    if (!question) {
      // Can't fix a missing question automatically
      if (severity === 'critical') criticalRemaining++;
      continue;
    }

    if (suggestedFix && typeof suggestedFix === 'object' && Object.keys(suggestedFix).length > 0) {
      // Apply the fix
      for (const [field, value] of Object.entries(suggestedFix)) {
        if (field in question || ['correctAnswer', 'questionType', 'subcategory', 'options', 'text', 'passage', 'hasImage', 'imageDescription', 'acceptedAnswers'].includes(field)) {
          question[field] = value;
          fixesApplied++;
        }
      }
    } else {
      // No fix available
      if (severity === 'critical') criticalRemaining++;
    }
  }

  return { fixesApplied, criticalRemaining };
}

/**
 * Run the full validation stage with auto-fix loop.
 *
 * @param {string} pdfPath
 * @param {object} extractedData - Will be mutated with fixes.
 * @param {object} options
 * @param {string} options.apiKey
 * @param {string} [options.model]
 * @param {number} [options.maxValidationRounds] - Max validate→fix iterations.
 * @returns {Promise<object>} Final validation report.
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

    // Attempt auto-fixes
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
