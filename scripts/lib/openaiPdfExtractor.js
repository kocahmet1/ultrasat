/**
 * Stage 1: PDF Extraction using OpenAI API (gpt-5.4).
 *
 * Uploads the PDF to OpenAI's Files API, then uses the Responses API
 * with file_id reference for vision-capable PDF parsing.
 *
 * PDF FORMAT (Verity Prep style):
 * - Modules: "English Reading & Writing Module 1/2" and "Math Math Module 1/2"
 * - Our mapping: R&W Module 1→1, R&W Module 2→2, Math Module 1→3, Math Module 2→4
 * - Correct answers in "DETAILED SOLUTION" section as "Correct: [Letter]"
 * - FRQ questions labeled "Student-Produced Response" (no A/B/C/D)
 * - Metadata noise to ignore: "Solve with AI", "Hide Answer", "Report", etc.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { getSubcategoryPromptList } = require('./subcategoryMap');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload a file to OpenAI's Files API.
 * @returns {Promise<string>} The file_id.
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
    // Best-effort cleanup — don't fail the pipeline
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
 * Build the extraction prompt.
 */
function buildExtractionPrompt() {
  const subcategoryList = getSubcategoryPromptList();

  return `You are an expert SAT exam content parser. Your task is to extract EVERY question from this SAT exam PDF with perfect accuracy, including all associated passages.

UNDERSTANDING THE PDF FORMAT:
This PDF uses a specific format from a test-prep platform. Here is how to parse it:

MODULE IDENTIFICATION:
- "English Reading & Writing Module 1" → This is MODULE 1 (our moduleNumber: 1)
- "English Reading & Writing Module 2" → This is MODULE 2 (our moduleNumber: 2)
- "Math Math Module 1" → This is MODULE 3 (our moduleNumber: 3)
- "Math Math Module 2" → This is MODULE 4 (our moduleNumber: 4)
Question counts: Module 1 ~26-27 (R&W), Module 2 ~27 (R&W), Module 3 ~22 (Math), Module 4 ~22 (Math)

⚠️ PASSAGE EXTRACTION — THIS IS THE MOST CRITICAL REQUIREMENT:
Almost every Reading & Writing question (Modules 1 and 2) has a PASSAGE that appears BEFORE the question. This passage is the text the student must read to answer the question. WITHOUT the passage, the question is USELESS.

PASSAGE RULES:
- The passage typically appears as a block of text ABOVE the question number or between it and the options
- Passages can be: short stories, poems, scientific articles, historical documents, social science texts
- Some questions share a passage (paired questions) — include the FULL passage for each question that uses it
- For "Words in Context" questions, the passage contains a blank (______) that the student must fill
- For "Text Structure and Purpose" questions, the passage is the text being analyzed
- For math questions (Modules 3-4), there is usually NO passage (set to null)
- If a question says "Based on the text..." or "According to the passage...", there IS a passage — find it
- The passage field must contain the COMPLETE passage text, not a summary
- If there are TWO texts (e.g., "Text 1" and "Text 2"), include BOTH in the passage field

QUESTION FORMAT:
- Questions are numbered per-module (e.g., "1)", "2)", etc.)
- Multiple-choice options are labeled A, B, C, D with their text
- The "DETAILED SOLUTION" section follows each question and contains:
  * For MCQ: "Correct: [Letter]" (e.g., "Correct: C")
  * For FRQ/Student-Produced Response: the answer is in the explanation text
- FRQ questions are labeled "Student-Produced Response" and have NO A/B/C/D options

METADATA TO IGNORE (do NOT include in question text or passage):
- "Solve with AI", "Similar Questions by AI"
- "Hide Answer", "Report", "Priority: Practice", "Add to Favorites"
- "Verity Prep AI", "Filters", "Show On Top", "Overlay"
- "ID: [number]", "Index Order [number]", "Order 1"
- Level indicators like "Level: Easy" (but DO extract the difficulty from this)

DIFFICULTY EXTRACTION:
- Extract from "Level: Easy" → "easy", "Level: Medium" → "medium", "Level: Hard" → "hard"

WHAT TO EXTRACT FOR EACH QUESTION:
1. **passage** (CRITICAL): The FULL reading passage/text that precedes the question. Must be COMPLETE — do not truncate or summarize. For R&W questions, this is almost always present. For math, usually null.
2. **text**: The actual question stem (e.g., "Which choice completes the text with the most logical and precise word or phrase?")
3. **options**: A, B, C, D for MCQ (include the letter prefix)
4. **correctAnswer**: From the "DETAILED SOLUTION" section
5. For FRQ: extract the correct numeric/text answer from the solution explanation
6. Whether the question has an image/graph/table
7. For images: provide a detailed description for recreation
8. The difficulty level (from "Level:" metadata)

SUBCATEGORY CLASSIFICATION — classify each question into exactly ONE of these:
${subcategoryList}

Return ONLY valid JSON (no markdown code fences, no extra text). Use this exact structure:

{
  "examName": "<name derived from the PDF>",
  "modules": [
    {
      "moduleNumber": 1,
      "section": "Reading and Writing",
      "calculatorAllowed": false,
      "timeLimit": 1920,
      "questions": [
        {
          "questionNumber": 1,
          "text": "Which choice completes the text with the most logical and precise word or phrase?",
          "passage": "In 2019, chemist Silvia Vidal and her team discovered an New New New New New underwater lake beneath the Arctic ice sheet. The lake, which is approximately 5 kilometers long, was detected using...[FULL PASSAGE TEXT HERE]...the findings suggest that ______ beneath polar ice caps.",
          "questionType": "multiple-choice",
          "options": ["A) option text", "B) option text", "C) option text", "D) option text"],
          "correctAnswer": "C) option text",
          "acceptedAnswers": [],
          "hasImage": false,
          "imageDescription": null,
          "difficulty": "medium",
          "subcategory": "Words in Context"
        }
      ]
    },
    {
      "moduleNumber": 2,
      "section": "Reading and Writing",
      "calculatorAllowed": false,
      "timeLimit": 1920,
      "questions": [...]
    },
    {
      "moduleNumber": 3,
      "section": "Math",
      "calculatorAllowed": false,
      "timeLimit": 2100,
      "questions": [...]
    },
    {
      "moduleNumber": 4,
      "section": "Math",
      "calculatorAllowed": true,
      "timeLimit": 2100,
      "questions": [...]
    }
  ]
}

CRITICAL RULES:
- ⚠️ PASSAGES ARE MANDATORY for Modules 1 & 2 (R&W). Every R&W question has a passage — you MUST extract it
- Map "English Reading & Writing Module 1" to moduleNumber 1
- Map "English Reading & Writing Module 2" to moduleNumber 2
- Map "Math Math Module 1" to moduleNumber 3
- Map "Math Math Module 2" to moduleNumber 4
- Options MUST include letter prefix: "A) ...", "B) ...", "C) ...", "D) ..."
- correctAnswer MUST exactly match one of the options strings (for MCQ)
- For user-input/FRQ: set options to [], questionType to "user-input"
- For FRQ, extract the correct answer value from the solution (look for the answer in the explanation)
- If FRQ has multiple acceptable answers, list them in acceptedAnswers
- Use the EXACT subcategory names from the list above (case-sensitive)
- Do NOT skip any questions — count carefully per module
- Escape special characters in JSON properly
- Strip HTML tags like <br> from all text content
- Do NOT include "DETAILED SOLUTION" text in the question text field`;
}

/**
 * Extract questions from a SAT exam PDF using OpenAI API.
 *
 * @param {string} pdfPath - Absolute path to the PDF file.
 * @param {object} options
 * @param {string} options.apiKey - OpenAI API key.
 * @param {string} [options.model] - OpenAI model to use.
 * @param {number} [options.maxRetries] - Max retries on failure.
 * @returns {Promise<object>} Parsed extraction result.
 */
async function extractFromPdf(pdfPath, options = {}) {
  const {
    apiKey,
    model = 'gpt-5.4',
    maxRetries = 3,
  } = options;

  if (!apiKey) throw new Error('OpenAI API key is required');
  if (!fs.existsSync(pdfPath)) throw new Error(`PDF file not found: ${pdfPath}`);

  const pdfSizeKB = Math.round(fs.statSync(pdfPath).size / 1024);
  console.log(`      📄 PDF loaded: ${path.basename(pdfPath)} (${pdfSizeKB} KB)`);

  // Upload PDF to OpenAI Files API
  console.log(`      📤 Uploading PDF to OpenAI Files API...`);
  const fileId = await uploadFileToOpenAI(pdfPath, apiKey);
  console.log(`      ✓ File uploaded: ${fileId}`);

  const prompt = buildExtractionPrompt();
  let lastError = null;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`      🤖 Calling OpenAI ${model} (attempt ${attempt}/${maxRetries})...`);

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
                content: 'You are an expert SAT exam content parser. You MUST extract the full reading passage for every Reading & Writing question — the passage is the most important part. A question without its passage is USELESS. Return ONLY valid JSON. No markdown fences, no explanations, no truncation.',
              },
              {
                role: 'user',
                content: [
                  { type: 'input_file', file_id: fileId },
                  { type: 'input_text', text: prompt },
                ],
              },
            ],
            temperature: 0,
            max_output_tokens: 100000,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${data.error?.message || response.status}`);
        }

        let text = extractResponseText(data);
        if (!text) {
          throw new Error('No content returned from OpenAI');
        }

        // Strip markdown code fences if present
        text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        // Parse JSON
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (parseErr) {
          console.log(`      ⚠️  JSON parse failed, attempting repair...`);
          let fixed = text.replace(/,\s*([}\]])/g, '$1');
          fixed = fixed.replace(/[\x00-\x1f]/g, (ch) => {
            if (ch === '\n') return '\\n';
            if (ch === '\r') return '\\r';
            if (ch === '\t') return '\\t';
            return '';
          });
          try {
            parsed = JSON.parse(fixed);
            console.log(`      ✅ JSON repair successful`);
          } catch (repairErr) {
            throw new Error(`JSON parse failed after repair: ${parseErr.message}\nFirst 500 chars: ${text.substring(0, 500)}`);
          }
        }

        // Structural validation
        if (!parsed.modules || !Array.isArray(parsed.modules)) {
          throw new Error('Invalid response structure: missing "modules" array');
        }
        if (parsed.modules.length === 0) {
          throw new Error('Invalid response: "modules" array is empty');
        }

        let totalQuestions = 0;
        for (const mod of parsed.modules) {
          if (!mod.questions || !Array.isArray(mod.questions)) {
            throw new Error(`Module ${mod.moduleNumber} has no "questions" array`);
          }
          totalQuestions += mod.questions.length;
        }

        if (totalQuestions < 50) {
          throw new Error(`Only ${totalQuestions} questions extracted — expected ~97-98. Output may have been truncated.`);
        }

        for (const mod of parsed.modules) {
          const section = mod.section || (mod.moduleNumber <= 2 ? 'Reading & Writing' : 'Math');
          console.log(`      ✓ Module ${mod.moduleNumber}: ${mod.questions.length} questions (${section})`);
        }

        // Check passage extraction quality (R&W modules MUST have passages)
        let rwTotal = 0;
        let rwWithPassage = 0;
        for (const mod of parsed.modules) {
          if (mod.moduleNumber <= 2) {
            for (const q of mod.questions) {
              rwTotal++;
              if (q.passage && q.passage.trim().length > 20) {
                rwWithPassage++;
              }
            }
          }
        }

        if (rwTotal > 0) {
          const passageRate = Math.round((rwWithPassage / rwTotal) * 100);
          console.log(`      📖 Passage extraction: ${rwWithPassage}/${rwTotal} R&W questions have passages (${passageRate}%)`);
          if (passageRate < 50) {
            throw new Error(`Only ${passageRate}% of R&W questions have passages — expected ~90%+. Model likely skipped passage extraction.`);
          }
        }

        return parsed;

      } catch (err) {
        lastError = err;
        console.error(`      ❌ Attempt ${attempt} failed: ${err.message}`);
        if (attempt < maxRetries) {
          const waitMs = 1000 * Math.pow(2, attempt - 1);
          console.log(`      ⏳ Retrying in ${waitMs / 1000}s...`);
          await sleep(waitMs);
        }
      }
    }

    throw new Error(`Extraction failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);

  } finally {
    // Always clean up the uploaded file
    console.log(`      🗑️  Cleaning up uploaded file...`);
    await deleteFileFromOpenAI(fileId, apiKey);
  }
}

module.exports = { extractFromPdf };
