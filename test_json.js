const fs = require('fs');

console.log('Testing JSON files...\n');

// Test working file
console.log('Testing working_test.json...');
try {
  const workingContent = fs.readFileSync('working_test.json', 'utf8');
  console.log('File content length:', workingContent.length);
  const working = JSON.parse(workingContent);
  console.log('✅ working_test.json is valid JSON');
} catch(e) {
  console.log('❌ working_test.json error:', e.message);
}

console.log('\nTesting problematic content...');
// Test your original problematic content (shortened explanation)
const problematic = `[
  {
    "text": "If (2x - y)/(x + y) = 3/5 and y = 2, what is the value of x?",
    "options": ["3.5", "5.5", "7.5", "11.5"],
    "correctAnswer": 2,
    "difficulty": "hard",
    "explanation": "Given the equation (2x - y)/(x + y) = 3/5 and y = 2.\nSubstitute y = 2 into the equation:\n(2x - 2)/(x + 2) = 3/5.\nStep 1: Cross-multiply to eliminate the denominators:\n5(2x - 2) = 3(x + 2).",
    "subcategory": "Linear equations in one variable"
  }
]`;

try {
  JSON.parse(problematic);
  console.log('✅ problematic content is valid JSON');
} catch(e) {
  console.log('❌ problematic content error:', e.message);
}

console.log('\nDone testing.'); 