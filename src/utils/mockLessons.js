/**
 * Mock lesson data for when Firebase Functions are unavailable
 * This provides fallback content for development and testing
 */

export const mockLessons = {
  "boundaries": {
    title: "Understanding Boundaries in Writing",
    html: `
      <div class="lesson-content">
        <h2>Understanding Boundaries in SAT Writing</h2>
        
        <p>Boundaries in writing refer to the proper use of punctuation and structure to define where sentences, clauses, and paragraphs begin and end. Mastering boundaries is essential for clear, effective communication.</p>
        
        <h3>Key Boundary Concepts</h3>
        
        <h4>1. Sentence Boundaries</h4>
        <p>A sentence must express a complete thought with a subject and verb. Common boundary errors include:</p>
        <ul>
          <li><strong>Run-on Sentences:</strong> Two independent clauses joined without proper punctuation or conjunctions</li>
          <li><strong>Comma Splices:</strong> Using only a comma to join independent clauses</li>
          <li><strong>Sentence Fragments:</strong> Incomplete thoughts presented as sentences</li>
        </ul>
        
        <h4>2. Fixing Boundary Issues</h4>
        <p>You can correct boundary problems in several ways:</p>
        <ul>
          <li>Use a period to create separate sentences</li>
          <li>Add coordinating conjunctions (FANBOYS: for, and, nor, but, or, yet, so)</li>
          <li>Use semicolons between related independent clauses</li>
          <li>Add subordinating conjunctions to create dependent clauses</li>
        </ul>
        
        <h4>3. Paragraph Boundaries</h4>
        <p>Each paragraph should focus on a single main idea with supporting details. Effective paragraphs:</p>
        <ul>
          <li>Begin with a clear topic sentence</li>
          <li>Develop the main idea with supporting evidence</li>
          <li>Transition smoothly to the next paragraph</li>
        </ul>
        
        <h3>Common SAT Questions on Boundaries</h3>
        <p>The SAT often tests your ability to:</p>
        <ul>
          <li>Recognize and fix run-on sentences</li>
          <li>Identify and correct comma splices</li>
          <li>Complete sentence fragments</li>
          <li>Choose appropriate conjunctions or punctuation to join clauses</li>
        </ul>
        
        <h3>Practice Strategies</h3>
        <ol>
          <li>Identify subjects and verbs in complex sentences</li>
          <li>Practice spotting independent and dependent clauses</li>
          <li>Read your writing aloud to hear where natural breaks occur</li>
          <li>Study the different ways to join related ideas</li>
        </ol>
        
        <h3>Key Takeaways</h3>
        <p>Remember these principles:</p>
        <ul>
          <li>Every complete sentence needs a subject and verb</li>
          <li>Independent clauses must be properly joined or separated</li>
          <li>Punctuation signals to readers how ideas relate to each other</li>
          <li>Clear boundaries make writing easier to understand</li>
        </ul>
      </div>
    `,
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  },
  
  "form-structure-sense": {
    title: "Form, Structure, and Sense in Writing",
    html: `
      <div class="lesson-content">
        <h2>Form, Structure, and Sense in Writing</h2>
        
        <p>This skill category refers to understanding how sentences are constructed, organized, and how they convey meaning clearly and logically.</p>
        
        <h3>Key Concepts</h3>
        
        <h4>1. Form in Writing</h4>
        <p>Form refers to the grammatical structure of sentences:</p>
        <ul>
          <li><strong>Subject-verb agreement:</strong> Ensuring subjects and verbs match in number (singular/plural)</li>
          <li><strong>Pronoun-antecedent agreement:</strong> Correctly matching pronouns with their referents</li>
          <li><strong>Verb tense consistency:</strong> Maintaining appropriate and consistent verb tenses</li>
        </ul>
        
        <h4>2. Structure in Writing</h4>
        <p>Structure refers to how sentences and ideas are organized:</p>
        <ul>
          <li><strong>Parallel structure:</strong> Using the same grammatical form for similar elements in a series</li>
          <li><strong>Modifiers:</strong> Placing descriptive phrases close to what they modify</li>
          <li><strong>Logical organization:</strong> Arranging ideas in a clear, coherent sequence</li>
        </ul>
        
        <h4>3. Sense in Writing</h4>
        <p>Sense refers to clarity and logical meaning:</p>
        <ul>
          <li><strong>Clear references:</strong> Ensuring pronouns clearly refer to specific nouns</li>
          <li><strong>Logical comparisons:</strong> Making sure comparisons are between similar elements</li>
          <li><strong>Concision:</strong> Expressing ideas clearly without unnecessary words</li>
        </ul>
        
        <h3>Common SAT Questions</h3>
        <p>The SAT frequently tests:</p>
        <ul>
          <li>Identifying and correcting faulty parallelism</li>
          <li>Fixing dangling or misplaced modifiers</li>
          <li>Correcting illogical comparisons</li>
          <li>Revising wordy or redundant expressions</li>
          <li>Resolving ambiguous pronoun references</li>
        </ul>
        
        <h3>Practice Strategies</h3>
        <ol>
          <li>Read sentences aloud to hear structural problems</li>
          <li>Check that items in a list or series follow the same pattern</li>
          <li>Ensure modifiers are placed near the words they describe</li>
          <li>Verify that pronouns clearly refer to specific nouns</li>
          <li>Practice condensing wordy phrases into concise expressions</li>
        </ol>
        
        <h3>Key Takeaways</h3>
        <p>Remember these principles:</p>
        <ul>
          <li>Consistent grammatical forms create clarity</li>
          <li>Clear structure helps readers follow your ideas</li>
          <li>Logical sense depends on proper relationships between ideas</li>
          <li>Precision in language creates effective communication</li>
        </ul>
      </div>
    `,
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  }
};

/**
 * Get a mock lesson by skill tag
 * @param {string} skillTag - The skill tag to retrieve a lesson for
 * @returns {Object|null} - The mock lesson or null if not found
 */
export const getMockLesson = (skillTag) => {
  if (!skillTag) return null;
  
  // Normalize skill tag to handle case and format differences
  const normalizedTag = skillTag.toLowerCase().trim();
  
  // Check if we have a mock lesson for this skill
  if (mockLessons[normalizedTag]) {
    console.log(`Using mock lesson data for ${normalizedTag}`);
    return mockLessons[normalizedTag];
  }
  
  // If no exact match, create a generic lesson
  return {
    title: `Lesson on ${skillTag}`,
    html: `
      <div class="lesson-content">
        <h2>Understanding ${skillTag}</h2>
        <p>This is a placeholder lesson for ${skillTag}. In development mode, the actual lesson content would be generated by an LLM.</p>
        <p>Since we're having CORS issues connecting to the Cloud Functions, this placeholder content is being shown instead.</p>
        <h3>Key Concepts</h3>
        <ul>
          <li>This is a development placeholder</li>
          <li>In production, this would contain actual educational content</li>
          <li>The lesson would be generated based on the specific skill</li>
        </ul>
        <p>To see the real lesson content, you would need to:</p>
        <ol>
          <li>Deploy your Firebase Functions with proper CORS settings</li>
          <li>Configure your OpenAI API key in the Firebase config</li>
          <li>Ensure your Firebase project is properly set up</li>
        </ol>
      </div>
    `,
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  };
};
