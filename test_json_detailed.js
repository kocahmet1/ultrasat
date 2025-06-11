const fs = require('fs');

console.log('Detailed JSON Analysis...\n');

// Read the working file and analyze it
const workingContent = fs.readFileSync('working_test.json', 'utf8');
console.log('Working file content around position 250:');
console.log('Position 240-260:', JSON.stringify(workingContent.substring(240, 260)));

// Let's examine the explanation field specifically
const working = JSON.parse(workingContent);
console.log('\nWorking explanation contains \\n?', working[0].explanation.includes('\n'));
console.log('Working explanation substring:', JSON.stringify(working[0].explanation.substring(0, 100)));

// Test if the issue is specifically with the length
console.log('\nTesting with shortened problematic content...');
const shortProblematic = `[
  {
    "text": "Test",
    "options": ["A", "B"],
    "correctAnswer": 0,
    "difficulty": "easy", 
    "explanation": "Short explanation\nwith newline",
    "subcategory": "Test"
  }
]`;

try {
  JSON.parse(shortProblematic);
  console.log('✅ Short problematic content is valid JSON');
} catch(e) {
  console.log('❌ Short problematic content error:', e.message);
}

// Test the fixed version
console.log('\nTesting fixed version...');
try {
  const fixedContent = fs.readFileSync('fixed_question.json', 'utf8');
  JSON.parse(fixedContent);
  console.log('✅ Fixed version is valid JSON');
} catch(e) {
  console.log('❌ Fixed version error:', e.message);
} 