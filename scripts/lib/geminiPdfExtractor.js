/**
 * Stage 1: PDF Extraction using Google Gemini API.
 *
 * Reads a SAT exam PDF and extracts all questions as structured JSON.
 * Gemini natively supports PDF uploads and can "see" graphs/images.
 *
 * PDF FORMAT (Verity Prep style):
 * - Modules labeled: "English Reading & Writing Module 1/2" and "Math Math Module 1/2"
 * - Our mapping: R&W Module 1→1, R&W Module 2→2, Math Module 1→3, Math Module 2→4
 * - Questions numbered per-module starting at 1 (sometimes 2 in Module 1)
 * - Options labeled A/B/C/D with text on separate lines
 * - Correct answer in "DETAILED SOLUTION" section as "Correct: [Letter]"
 * - FRQ questions labeled "Student-Produced Response" with no A/B/C/D
 * - FRQ solutions give explanation but may not have "Correct: X" explicitly
 * - Metadata lines to IGNORE: "Solve with AI", "Similar Questions by AI",
 *   "Hide Answer", "Report", "Priority: Practice", "Add to Favorites",
 *   "Verity Prep AI", "Filters", "Show On Top", "Overlay", "ID:", "Index Order"
 * - Passages appear as blocks before the question text
 * - Images/graphs/tables appear before the question they relate to
 * - Each question has metadata: Level (Easy/Medium/Hard), topic category
 */

const fs = require('fs');
const path = require('path');
const { getSubcategoryPromptList } = require('./subcategoryMap');

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build the extraction prompt for Gemini.
 */
function buildExtractionPrompt() {
  const subcategoryList = getSubcategoryPromptList();

  return `You are an expert SAT exam content parser. Your task is to extract EVERY question from this SAT exam PDF with perfect accuracy.

UNDERSTANDING THE PDF FORMAT:
This PDF uses a specific format from a test-prep platform. Here is how to parse it:

MODULE IDENTIFICATION:
- "English Reading & Writing Module 1" → This is MODULE 1 (our moduleNumber: 1)
- "English Reading & Writing Module 2" → This is MODULE 2 (our moduleNumber: 2)
- "Math Math Module 1" → This is MODULE 3 (our moduleNumber: 3)
- "Math Math Module 2" → This is MODULE 4 (our moduleNumber: 4)
Question counts: Module 1 ~26-27 (R&W), Module 2 ~27 (R&W), Module 3 ~22 (Math), Module 4 ~22 (Math)

QUESTION FORMAT:
- Questions are numbered per-module (e.g., "1)", "2)", etc.)
- Multiple-choice options are labeled A, B, C, D with their text
- The "DETAILED SOLUTION" section follows each question and contains:
  * For MCQ: "Correct: [Letter]" (e.g., "Correct: C")
  * For FRQ/Student-Produced Response: the answer is in the explanation text
- FRQ questions are labeled "Student-Produced Response" and have NO A/B/C/D options

METADATA TO IGNORE (do NOT include in question text):
- "Solve with AI", "Similar Questions by AI"
- "Hide Answer", "Report", "Priority: Practice", "Add to Favorites"
- "Verity Prep AI", "Filters", "Show On Top", "Overlay"
- "ID: [number]", "Index Order [number]", "Order 1"
- Level indicators like "Level: Easy" (but DO extract the difficulty from this)

DIFFICULTY EXTRACTION:
- Extract from "Level: Easy" → "easy", "Level: Medium" → "medium", "Level: Hard" → "hard"

WHAT TO EXTRACT FOR EACH QUESTION:
1. The clean question text (without metadata noise)
2. Any passage that precedes the question (include full text)
3. Options A, B, C, D for MCQ (include the letter prefix)
4. The correct answer from the "DETAILED SOLUTION" section
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
          "text": "<clean question text without metadata noise>",
          "passage": "<full passage text if any, otherwise null>",
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
 * Extract questions from a SAT exam PDF using Gemini API.
 *
 * @param {string} pdfPath - Absolute path to the PDF file.
 * @param {object} options
 * @param {string} options.apiKey - Google Gemini API key.
 * @param {string} [options.model] - Gemini model to use.
 * @param {number} [options.maxRetries] - Max retries on failure.
 * @returns {Promise<object>} Parsed extraction result.
 */
async function extractFromPdf(pdfPath, options = {}) {
  const {
    apiKey,
    model = 'gemini-2.5-pro',
    maxRetries = 3,
  } = options;

  if (!apiKey) throw new Error('Gemini API key is required');
  if (!fs.existsSync(pdfPath)) throw new Error(`PDF file not found: ${pdfPath}`);

  // Dynamically import the Gemini SDK (ESM-style package)
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  // Read PDF as base64
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString('base64');
  const pdfSizeKB = Math.round(pdfBuffer.length / 1024);

  console.log(`      📄 PDF loaded: ${path.basename(pdfPath)} (${pdfSizeKB} KB)`);

  const prompt = buildExtractionPrompt();

  const generativeModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.1, // Low temperature for accuracy
      maxOutputTokens: 65536,
    },
  });

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`      🤖 Calling Gemini (attempt ${attempt}/${maxRetries})...`);

      const result = await generativeModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
      ]);

      const response = result.response;
      let text = response.text();

      // Strip markdown code fences if present
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

      // Try to parse JSON
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        // Attempt to fix common JSON issues
        console.log(`      ⚠️  JSON parse failed, attempting repair...`);
        
        // Fix trailing commas before ] or }
        let fixed = text.replace(/,\s*([}\]])/g, '$1');
        // Fix unescaped control characters inside strings
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
          throw new Error(`JSON parse failed after repair attempt: ${parseErr.message}\nFirst 500 chars: ${text.substring(0, 500)}`);
        }
      }

      // Basic structural validation
      if (!parsed.modules || !Array.isArray(parsed.modules)) {
        throw new Error('Invalid response structure: missing "modules" array');
      }

      if (parsed.modules.length === 0) {
        throw new Error('Invalid response: "modules" array is empty');
      }

      // Count total questions
      let totalQuestions = 0;
      for (const mod of parsed.modules) {
        if (!mod.questions || !Array.isArray(mod.questions)) {
          throw new Error(`Module ${mod.moduleNumber} has no "questions" array`);
        }
        totalQuestions += mod.questions.length;
      }

      if (totalQuestions < 50) {
        throw new Error(`Only ${totalQuestions} questions extracted — expected ~97-98. The model may have truncated output.`);
      }

      // Print per-module counts
      for (const mod of parsed.modules) {
        const section = mod.section || (mod.moduleNumber <= 2 ? 'Reading & Writing' : 'Math');
        console.log(`      ✓ Module ${mod.moduleNumber}: ${mod.questions.length} questions (${section})`);
      }

      return parsed;

    } catch (err) {
      lastError = err;
      console.error(`      ❌ Attempt ${attempt} failed: ${err.message}`);

      if (attempt < maxRetries) {
        const waitMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        console.log(`      ⏳ Retrying in ${waitMs / 1000}s...`);
        await sleep(waitMs);
      }
    }
  }

  throw new Error(`Extraction failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

module.exports = { extractFromPdf };
