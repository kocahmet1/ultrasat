# Digital SAT Question Generation Prompt

## Context and Objective

You are an expert Digital SAT question creator tasked with generating high-quality practice questions for the question subcategory: **[subcategory name]**. You will be provided with a PDF file containing many sample questions from this subcategory, along with detailed explanations. Your goal is to analyze these samples thoroughly and create 30 new questions (10 easy, 10 medium, 10 hard) that maintain the same quality and testing standards while being completely original.

## Analysis Phase Instructions

### Sample Question Analysis
Carefully examine the provided PDF file and analyze:

**Content Analysis:**
- What specific skills, concepts, and knowledge areas are being tested
- Common question patterns, formats, and structures
- Types of distractors (incorrect answer choices) used
- How questions test different cognitive levels (recall, application, analysis, synthesis)
- Subject-specific terminology and language patterns
- Text passage structures and how they integrate with question content
- Relationship between passages and questions (main ideas, inferences, evidence, etc.)

**Difficulty Level Analysis:**
- **Easy Questions:** Identify characteristics that make questions accessible (direct application, familiar contexts, straightforward language, minimal steps)
- **Medium Questions:** Note features that add complexity (multi-step reasoning, less familiar contexts, integration of concepts)
- **Hard Questions:** Analyze what makes questions challenging (complex reasoning, abstract concepts, multiple integrated skills, sophisticated analysis)

**Quality Standards:**
- Clarity and precision of question stems
- Effectiveness of answer choices (one clearly correct, plausible distractors)
- Appropriateness of explanations
- Alignment with Digital SAT format and standards
- Integration of text passages when present
- Authentic passage selection and question alignment

### Pattern Recognition
Identify recurring elements:
- Question stem structures and formats
- Common linguistic constructs and rhetorical patterns
- Typical contexts and scenarios used
- Standard explanation formats and reasoning patterns
- Types of passages used (literary, informational, argumentative, etc.)
- Question types and their relationship to passages

## Generation Requirements

### Format Specifications
Generate exactly 30 questions in the following JSON format:

```json
[
  {
    "text": "[Passage text] _____ [continuation of passage text]\n\nWhich choice completes the text with the most logical transition?",
    "graphDescription": null,
    "options": [
      "Specifically,",
      "However,",
      "Therefore,",
      "For example,"
    ],
    "correctAnswer": 0,
    "difficulty": "easy",
    "explanation": [
      "Step 1: Analyze the relationship between the ideas before and after the blank.",
      "Step 2: Determine what type of logical connection is needed (contrast, example, conclusion, etc.).",
      "Step 3: Select the transition word that best signals this logical relationship.",
      "Option B is incorrect because 'However' signals contrast, but the ideas are not contrasting.",
      "Option C is incorrect because 'Therefore' signals a conclusion, but the second idea is not a result of the first.",
      "Option D is incorrect because 'For example' signals an example, but the second idea is not an example of the first."
    ],
    "subcategory": "[subcategory name]",
    "skillTags": ["relevant-skill-tag-1", "relevant-skill-tag-2"],
    "usageContext": "general"
  }
]
```

**Important:** Always set `"graphDescription": null` for all questions.

### Passage and Question Guidelines

**Transitions Format:**
```json
{
  "text": "[Passage text establishing context] _____ [continuation that requires logical transition]\n\nWhich choice completes the text with the most logical transition?",
  // ... rest of question structure
}
```

**Passage Requirements:**
- **ALL questions must include a passage with a blank line (represented as _____)**
- Passages should be 2-4 sentences total (including the sentence with the blank)
- The blank should appear at the beginning of a sentence that logically follows from the previous content
- Passages should be on realistic topics (science, history, literature, social issues, etc.)
- The context before and after the blank should clearly indicate what type of transition is needed
- Ensure the passage flows naturally when the correct transition is inserted

**Transition Types and Examples:**
- **Addition/Continuation:** "Additionally," "Furthermore," "Moreover," "Also," "Similarly," "Likewise,"
- **Contrast/Opposition:** "However," "Nevertheless," "Conversely," "On the other hand," "Instead," "But," "Yet,"
- **Cause and Effect/Conclusion:** "Therefore," "Thus," "Consequently," "As a result," "Hence," "Accordingly,"
- **Examples/Specification:** "For example," "Specifically," "For instance," "In particular," "Namely,"
- **Time/Sequence:** "Then," "Next," "Finally," "Subsequently," "Meanwhile," "Previously," "Lastly,"
- **Emphasis/Clarification:** "Indeed," "In fact," "Certainly," "Clearly," "Obviously," "Granted,"
- **Summary/Repetition:** "In other words," "That is," "Again," "Once more," "In summary,"

**Question Stem:**
- Always use: "Which choice completes the text with the most logical transition?"

**Answer Choice Guidelines:**
- All options should be transition words or phrases followed by commas
- Include one clearly correct transition that fits the logical relationship
- Include three plausible but incorrect transitions that represent different logical relationships
- Vary the types of transitions across questions (don't overuse one type)
- Common incorrect options might signal the wrong logical relationship (contrast instead of continuation, example instead of conclusion, etc.)

**Important:** 
- Every question must test transition word/phrase selection
- Focus on testing students' understanding of logical relationships between ideas
- Ensure the context clearly supports one transition over the others
- The passage should make logical sense when the correct transition is inserted

### Content Requirements

**Question Distribution:**
- 10 Easy questions (difficulty: "easy")
- 10 Medium questions (difficulty: "medium") 
- 10 Hard questions (difficulty: "hard")

**Quality Standards:**
1. **Originality:** Questions must be completely original with no shared context, scenarios, or specific details from sample questions
2. **Authenticity:** Maintain the authentic Digital SAT style, format, and rigor
3. **Accuracy:** All questions must have exactly one correct answer with clear textual support
4. **Clarity:** Question stems should be clear, unambiguous, and appropriately challenging for the target difficulty
5. **Effective Distractors:** Incorrect options should be plausible and represent common misconceptions or errors
6. **Passage Alignment:** Questions must be directly answerable from the provided passage

**Answer Choice Guidelines:**
- Exactly 4 options (A, B, C, D) for each question
- One clearly correct answer that is well-supported by the passage
- Three plausible but incorrect distractors
- Avoid "all of the above" or "none of the above" options
- Ensure distractors test comprehension rather than just guessing
- Make distractors represent realistic misinterpretations or partial understandings

**Explanation Requirements:**
- First array elements: Step-by-step analysis showing how to get the correct answer from the passage
- Include relevant textual evidence and reasoning steps
- Last array elements: Brief explanation of why each incorrect option is wrong
- Use clear, educational language appropriate for students
- Keep each step concise and focused
- Reference specific parts of the passage when relevant

### Difficulty Calibration

**Easy Questions:**
- Shorter, more straightforward passages (2-4 sentences)
- Questions that test basic comprehension (main idea, explicit details)
- Clear, direct language in both passage and question
- Answer choices that are obviously distinct

**Medium Questions:**
- Moderate-length passages (4-6 sentences)
- Questions requiring some inference or analysis
- More sophisticated vocabulary and concepts
- Answer choices requiring careful consideration

**Hard Questions:**
- Longer, more complex passages (6+ sentences)
- Questions requiring deep analysis, synthesis, or complex inference
- Sophisticated vocabulary and abstract concepts
- Subtle distinctions between answer choices

### Technical Specifications

**Field Requirements:**
- `text`: The complete question including passage and question stem
- `graphDescription`: Always set to `null`
- `options`: Array of exactly 4 answer choices
- `correctAnswer`: Index (0-3) of the correct option
- `difficulty`: Must be "easy", "medium", or "hard"
- `explanation`: Array of strings with step-by-step solution and option analysis
- `subcategory`: Use the exact subcategory name as specified in the prompt
- `skillTags`: Array of relevant skill identifiers (use kebab-case format)
- `usageContext`: Always set to "general"

## Final Instructions

1. **Analyze First:** Thoroughly study the provided sample questions before generating new ones
2. **Maintain Standards:** Ensure all questions meet Digital SAT quality and format standards
3. **Ensure Originality:** Create completely new scenarios and contexts
4. **Validate Quality:** Review each question for accuracy, clarity, and appropriate difficulty
5. **Check Format:** Ensure the JSON output is properly formatted and complete
6. **Verify Passage Alignment:** Ensure each question is clearly answerable from its passage

**Output only the JSON array of 30 questions. Do not include any additional text, explanations, or commentary outside the JSON structure.** 