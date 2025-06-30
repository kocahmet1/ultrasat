# User-Input Questions Guide

The SAT practice exam system now supports two types of questions:

1. **Multiple Choice Questions** - Traditional questions with 4 answer options (A, B, C, D)
2. **User-Input Questions** - Questions where students enter their answer directly (like SAT Math Grid-In questions)

## Question Structure

### Multiple Choice Questions

```json
{
  "text": "What is 2 + 2?",
  "questionType": "multiple-choice",
  "options": ["2", "3", "4", "5"],
  "correctAnswer": "4",
  "explanation": "2 + 2 = 4",
  "subcategory": "arithmetic",
  "difficulty": "easy"
}
```

### User-Input Questions

```json
{
  "text": "A researcher surveyed undergraduate students, graduate students, and postdoctoral students. The number of undergraduate students surveyed was 7,450% of the number of postdoctoral students surveyed and the number of graduate students surveyed was 36% of the number of undergraduate students surveyed. If there were 5,364 graduate students surveyed, what was the sum of the number of undergraduate students and postdoctoral students surveyed?",
  "questionType": "user-input",
  "correctAnswer": "15096",
  "acceptedAnswers": ["15096", "15,096"],
  "inputType": "number",
  "answerFormat": "Enter your answer as a whole number without commas or spaces",
  "explanation": "First find undergraduate students: 5364 ÷ 0.36 = 14900. Then find postdoctoral: 14900 ÷ 74.5 = 200. Sum: 14900 + 200 = 15100. Wait, let me recalculate...",
  "subcategory": "problem-solving-and-data-analysis",
  "difficulty": "medium"
}
```

## Field Descriptions

### Required Fields (All Questions)
- `text`: The question text
- `correctAnswer`: The correct answer
- `subcategory`: Subcategory for progress tracking
- `questionType`: "multiple-choice" or "user-input" (defaults to "multiple-choice")

### Multiple Choice Specific Fields
- `options`: Array of answer choices (required for multiple-choice)

### User-Input Specific Fields
- `inputType`: Type of input expected - "number", "text", or "fraction" (defaults to "number")
- `acceptedAnswers`: Array of alternative correct answers (optional)
- `answerFormat`: Hint text shown to students (optional)

### Optional Fields (All Questions)
- `explanation`: Explanation shown after answering
- `difficulty`: "easy", "medium", or "hard"
- `graphUrl`: URL to associated graph image
- `graphDescription`: Text description of graph for accessibility

## Example Import File

```json
[
  {
    "text": "Which choice completes the text with the most logical and precise word or phrase?",
    "questionType": "multiple-choice",
    "options": ["however", "therefore", "meanwhile", "furthermore"],
    "correctAnswer": "therefore",
    "explanation": "The sentence shows a cause-and-effect relationship.",
    "subcategory": "words-in-context",
    "difficulty": "medium"
  },
  {
    "text": "If 3x + 7 = 22, what is the value of x?",
    "questionType": "user-input",
    "correctAnswer": "5",
    "acceptedAnswers": ["5", "5.0"],
    "inputType": "number",
    "answerFormat": "Enter your answer as a number",
    "explanation": "3x + 7 = 22, so 3x = 15, therefore x = 5",
    "subcategory": "linear-equations-in-one-variable",
    "difficulty": "easy"
  },
  {
    "text": "What fraction is equivalent to 0.75?",
    "questionType": "user-input", 
    "correctAnswer": "3/4",
    "acceptedAnswers": ["3/4", "6/8", "9/12", "0.75"],
    "inputType": "fraction",
    "answerFormat": "Enter as a simplified fraction or decimal",
    "explanation": "0.75 = 75/100 = 3/4 when simplified",
    "subcategory": "ratios-rates-proportional-relationships-and-units",
    "difficulty": "easy"
  }
]
```

## Interface Changes

### For Students
- Multiple choice questions display with radio buttons (A, B, C, D)
- User-input questions display with a text input field
- Cross-out functionality (ABC button) is only available for multiple choice questions
- Number inputs show a hint about acceptable formats

### For Administrators
- Question import validates both question types
- Preview shows question type and validates accordingly
- Multiple choice questions require `options` array
- User-input questions can optionally include `acceptedAnswers` array

## Answer Validation

The system handles various answer formats:

### For Number Inputs
- Exact string match: "5" matches "5"
- Numeric equivalence: "5.0" matches "5" 
- Floating point tolerance: "3.333" matches "3.3333" (within 0.0001)
- Alternative formats via `acceptedAnswers`

### For Text/Fraction Inputs  
- Exact string match required
- Case-sensitive by default
- Use `acceptedAnswers` for variations

## Migration Notes

- Existing questions default to `questionType: "multiple-choice"`
- No database migration required - new fields are optional
- Backward compatibility maintained with existing question format 