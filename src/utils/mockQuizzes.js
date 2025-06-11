/**
 * Mock quiz data for when Firebase Functions are unavailable
 * This provides fallback content for development and testing
 */

export const mockQuizzes = {
  "boundaries": {
    skillTag: "boundaries",
    skillName: "Boundaries",
    title: "Boundaries Skill Drill",
    description: "Practice identifying and fixing boundary issues in writing.",
    questions: [
      {
        id: "boundaries-q1",
        text: "Which of the following is a run-on sentence?",
        options: [
          "She wrote the essay, it was excellent.",
          "She wrote the essay. It was excellent.",
          "She wrote the essay, and it was excellent.",
          "She wrote the excellent essay."
        ],
        correctAnswer: 0,
        explanation: "The first option is a run-on sentence because it joins two independent clauses ('She wrote the essay' and 'it was excellent') with only a comma. This creates a comma splice, which is a type of run-on sentence. To fix it, you could use a period, semicolon, or coordinating conjunction with a comma."
      },
      {
        id: "boundaries-q2",
        text: "Which sentence contains a sentence fragment?",
        options: [
          "The students completed their assignments on time.",
          "Although it was raining heavily.",
          "The professor, who had been teaching for thirty years, retired last week.",
          "Running through the park, I saw my friend."
        ],
        correctAnswer: 1,
        explanation: "'Although it was raining heavily' is a sentence fragment because it's a dependent clause that cannot stand alone as a complete sentence. It begins with a subordinating conjunction ('although') which makes it dependent on a main clause that is missing. To fix it, you would need to connect it to an independent clause, such as 'Although it was raining heavily, we still went to the game.'"
      },
      {
        id: "boundaries-q3",
        text: "How should the following sentence be corrected? 'The team won the championship everyone celebrated.'",
        options: [
          "The team won the championship, everyone celebrated.",
          "The team won the championship; everyone celebrated.",
          "The team won the championship and everyone celebrated.",
          "The team won the championship everyone was celebrating."
        ],
        correctAnswer: 2,
        explanation: "The original sentence is a run-on because it joins two independent clauses without any punctuation or connecting words. Option C correctly fixes this by adding the coordinating conjunction 'and' to join the clauses. Option B would also be correct if it used a semicolon to separate the independent clauses."
      },
      {
        id: "boundaries-q4",
        text: "Identify the correctly punctuated sentence:",
        options: [
          "Because the rain continued all day the game was canceled.",
          "Many students passed the exam, however, some need to retake it.",
          "The museum closed early; therefore, we went to the park instead.",
          "Since morning, the temperature has been rising, it might reach 90 degrees."
        ],
        correctAnswer: 2,
        explanation: "Option C correctly uses a semicolon followed by a transitional expression ('therefore') with a comma. This is the proper way to join two independent clauses using a conjunctive adverb. Options A and D contain comma splices, while option B incorrectly uses a comma where a semicolon is needed before 'however.'"
      },
      {
        id: "boundaries-q5",
        text: "Which of the following is NOT a complete sentence?",
        options: [
          "Walking to school every morning.",
          "The dog barked loudly.",
          "She speaks three languages fluently.",
          "Close the door behind you."
        ],
        correctAnswer: 0,
        explanation: "'Walking to school every morning' is not a complete sentence because it lacks a main verb and subject combination. It's a participial phrase that could serve as the subject of a sentence, but it needs a complete predicate to form a complete thought. The other options all contain both a subject and a verb that form a complete thought."
      }
    ],
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  },
  "form-structure-sense": {
    skillTag: "form-structure-sense",
    skillName: "Form, Structure, and Sense",
    title: "Form, Structure, and Sense Quiz",
    description: "Practice identifying and fixing issues with grammar, structure, and logical sense in writing.",
    questions: [
      {
        id: "form-structure-q1",
        text: "Which sentence demonstrates faulty parallelism?",
        options: [
          "He enjoys swimming, hiking, and to ride bicycles.",
          "She not only wrote the report but also presented it to the board.",
          "The team practiced hard, played well, and won decisively.",
          "Either you must study more or you should get a tutor."
        ],
        correctAnswer: 0,
        explanation: "The sentence 'He enjoys swimming, hiking, and to ride bicycles' demonstrates faulty parallelism because it mixes gerunds ('swimming, hiking') with an infinitive ('to ride'). For proper parallelism, all items in a series should follow the same grammatical form. The correct version would be 'He enjoys swimming, hiking, and riding bicycles.'"
      },
      {
        id: "form-structure-q2",
        text: "Which sentence contains a misplaced modifier?",
        options: [
          "The waiter served the customers who were sitting at the table.",
          "Running quickly, the bus was missed by several passengers.",
          "She only ate vegetables from her garden.",
          "The professor explained the concept clearly to the students."
        ],
        correctAnswer: 1,
        explanation: "In the sentence 'Running quickly, the bus was missed by several passengers,' the modifier 'running quickly' is misplaced because it appears to modify 'the bus,' which logically cannot run. The modifier should instead be connected to the passengers. A corrected version would be: 'Running quickly, several passengers still missed the bus.' or 'Several passengers, running quickly, missed the bus.'"
      },
      {
        id: "form-structure-q3",
        text: "Which sentence contains a pronoun with an unclear referent?",
        options: [
          "After Maria talked with Sophia, she went home.",
          "The dog chased the cat until it disappeared over the fence.",
          "John told Robert that his presentation was excellent.",
          "When the flowers bloom, they attract many bees."
        ],
        correctAnswer: 0,
        explanation: "In 'After Maria talked with Sophia, she went home,' it's unclear whether 'she' refers to Maria or Sophia. This creates ambiguity about who went home. To clarify, the sentence should specify the subject: 'After Maria talked with Sophia, Maria went home.' or 'After talking with Sophia, Maria went home.'"
      },
      {
        id: "form-structure-q4",
        text: "Which sentence contains a logical error in comparison?",
        options: [
          "Sam's essay is longer than Julia's.",
          "The population of New York is larger than Chicago.",
          "Her apartment is more spacious than mine.",
          "This book is more interesting than the one I read last week."
        ],
        correctAnswer: 1,
        explanation: "The sentence 'The population of New York is larger than Chicago' contains a logical error in comparison because it compares a population (of New York) with a city (Chicago). The correct comparison would be between similar elements: 'The population of New York is larger than the population of Chicago' or 'New York has a larger population than Chicago.'"
      },
      {
        id: "form-structure-q5",
        text: "Which sentence uses redundant language?",
        options: [
          "She completely finished her assignment before the deadline.",
          "The team won the championship last season.",
          "Please submit your application by Friday.",
          "They discussed several different topics at the meeting."
        ],
        correctAnswer: 0,
        explanation: "The phrase 'completely finished' in 'She completely finished her assignment before the deadline' is redundant because 'finished' already implies completeness. 'Completely' is unnecessary and adds no new meaning. The sentence would be more concise as 'She finished her assignment before the deadline.'"
      }
    ],
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  }
};

/**
 * Get a mock quiz by skill tag
 * @param {string} skillTag - The skill tag to retrieve a quiz for
 * @returns {Object|null} - The mock quiz or null if not found
 */
export const getMockQuiz = (skillTag) => {
  if (!skillTag) return null;
  
  // Normalize skill tag to handle case and format differences
  const normalizedTag = skillTag.toLowerCase().trim();
  
  // Check if we have a mock quiz for this skill
  if (mockQuizzes[normalizedTag]) {
    console.log(`Using mock quiz data for ${normalizedTag}`);
    return mockQuizzes[normalizedTag];
  }
  
  // If no exact match, create a generic quiz
  return {
    skillTag: normalizedTag,
    skillName: normalizedTag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    title: `${normalizedTag} Skill Drill`,
    description: `Practice questions for ${normalizedTag}`,
    questions: [
      {
        id: `${normalizedTag}-q1`,
        text: `This is a sample question about ${normalizedTag}. Which of the following is correct?`,
        options: [
          "Option A - This would be specific to the skill",
          "Option B - Another skill-specific option",
          "Option C - This would be the correct answer in most cases",
          "Option D - A final option related to the skill"
        ],
        correctAnswer: 2,
        explanation: `This is a placeholder explanation for a question about ${normalizedTag}. In a real quiz, this would provide detailed reasoning about why option C is correct and why the other options are incorrect.`
      },
      {
        id: `${normalizedTag}-q2`,
        text: `Here's another sample question testing your knowledge of ${normalizedTag}.`,
        options: [
          "First option - Typically incorrect",
          "Second option - The correct answer",
          "Third option - Intentionally misleading",
          "Fourth option - Also incorrect"
        ],
        correctAnswer: 1,
        explanation: `This explanation would detail why the second option is the correct answer for this ${normalizedTag} question. It would explain concepts related to the skill and clarify any misconceptions.`
      },
      {
        id: `${normalizedTag}-q3`,
        text: `Which of these statements about ${normalizedTag} is correct?`,
        options: [
          "A statement that is true about the skill",
          "A statement that contains a common misconception",
          "A statement that is partially true but misleading",
          "A statement that is completely false"
        ],
        correctAnswer: 0,
        explanation: `The first option contains accurate information about ${normalizedTag}. The other options represent common misconceptions or errors that students often make when working with this skill.`
      },
      {
        id: `${normalizedTag}-q4`,
        text: `In the context of ${normalizedTag}, which approach is most effective?`,
        options: [
          "Approach A - Sometimes effective",
          "Approach B - Never recommended",
          "Approach C - The standard approach",
          "Approach D - Only effective in specific situations"
        ],
        correctAnswer: 2,
        explanation: `Approach C is the standard and most effective method when dealing with ${normalizedTag}. This explanation would provide details about why this approach works best and when the other approaches might be applicable or problematic.`
      },
      {
        id: `${normalizedTag}-q5`,
        text: `Final question about ${normalizedTag} application in real scenarios.`,
        options: [
          "Application example A - Incorrect",
          "Application example B - Incorrect",
          "Application example C - Incorrect",
          "Application example D - Correct application"
        ],
        correctAnswer: 3,
        explanation: `Application example D correctly demonstrates how ${normalizedTag} concepts should be applied in real-world scenarios. The explanation would detail why this application is correct and what makes the other examples incorrect or problematic.`
      }
    ],
    generatedAt: new Date(),
    validated: true,
    tokenCost: 0
  };
};
