/**
 * Learning Content Importer
 * Utility for importing structured learning content from JSON files
 */

import { saveLearningContent } from '../firebase/learningContentServices';

/**
 * Validates the structure of imported learning content
 * @param {Object} content - The content object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateLearningContent = (content) => {
  const errors = [];
  
  if (!content) {
    errors.push('Content object is null or undefined');
    return { isValid: false, errors };
  }

  // Required fields
  const requiredFields = ['subcategoryId', 'title'];
  requiredFields.forEach(field => {
    if (!content[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate subcategoryId format (kebab-case)
  if (content.subcategoryId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.subcategoryId)) {
    errors.push('subcategoryId must be in kebab-case format (e.g., "central-ideas-and-details")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Transforms structured learning content to the format expected by the learning page
 * @param {Object} structuredContent - The imported structured content
 * @returns {Object} - Content formatted for the learning page
 */
export const transformContentForLearningPage = (structuredContent) => {
  const transformed = {
    subcategoryId: structuredContent.subcategoryId,
    title: structuredContent.title,
    lastUpdated: new Date().toISOString(),
  };

  // Build comprehensive overview HTML from all sections
  let overviewHtml = '';

  // Add overview sections
  if (structuredContent.overview?.sections) {
    overviewHtml += `<h3>${structuredContent.overview.title || 'Overview'}</h3>`;
    Object.entries(structuredContent.overview.sections).forEach(([sectionKey, section]) => {
      if (section.title && section.content) {
        overviewHtml += `<h4>${section.title}</h4><p>${section.content}</p>`;
      }
    });
  }

  // Add question analysis sections
  if (structuredContent.questionAnalysis?.sections) {
    overviewHtml += `<h3>${structuredContent.questionAnalysis.title || 'Question Analysis'}</h3>`;
    Object.entries(structuredContent.questionAnalysis.sections).forEach(([sectionKey, section]) => {
      if (section.title && section.content) {
        overviewHtml += `<h4>${section.title}</h4><p>${section.content}</p>`;
      }
    });
  }

  // Add strategic approaches sections
  if (structuredContent.strategicApproaches?.sections) {
    overviewHtml += `<h3>${structuredContent.strategicApproaches.title || 'Strategic Approaches'}</h3>`;
    Object.entries(structuredContent.strategicApproaches.sections).forEach(([sectionKey, section]) => {
      if (section.title && section.content) {
        overviewHtml += `<h4>${section.title}</h4><p>${section.content}</p>`;
      }
    });
  }

  // Add common mistakes analysis sections
  if (structuredContent.commonMistakesAnalysis?.sections) {
    overviewHtml += `<h3>${structuredContent.commonMistakesAnalysis.title || 'Common Mistakes Analysis'}</h3>`;
    Object.entries(structuredContent.commonMistakesAnalysis.sections).forEach(([sectionKey, section]) => {
      if (section.title && section.content) {
        overviewHtml += `<h4>${section.title}</h4><p>${section.content}</p>`;
      }
    });
  }

  // Add study strategies sections
  if (structuredContent.studyStrategies?.sections) {
    overviewHtml += `<h3>${structuredContent.studyStrategies.title || 'Study Strategies'}</h3>`;
    Object.entries(structuredContent.studyStrategies.sections).forEach(([sectionKey, section]) => {
      if (section.title && section.content) {
        overviewHtml += `<h4>${section.title}</h4><p>${section.content}</p>`;
      }
    });
  }

  transformed.overview = overviewHtml;

  // Use arrays from structured content
  transformed.keyStrategies = structuredContent.keyStrategies || [];
  transformed.commonMistakes = structuredContent.commonMistakes || [];
  transformed.studyTips = structuredContent.studyTips || [];

  // Add metadata
  if (structuredContent.metadata) {
    transformed.difficulty = structuredContent.metadata.difficulty || 'varies';
    transformed.estimatedStudyTime = structuredContent.metadata.estimatedStudyTime || '2-3 hours';
    transformed.questionFrequency = structuredContent.metadata.questionFrequency;
    transformed.testDomain = structuredContent.metadata.testDomain;
  }

  return transformed;
};

/**
 * Imports learning content from a JSON object
 * @param {Object} jsonContent - The JSON content to import
 * @returns {Promise<Object>} - Import result with success status and details
 */
export const importLearningContent = async (jsonContent) => {
  try {
    // Validate the content structure
    const validation = validateLearningContent(jsonContent);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      };
    }

    // Transform the content
    const transformedContent = transformContentForLearningPage(jsonContent);

    // Save to Firebase
    await saveLearningContent(jsonContent.subcategoryId, transformedContent);

    return {
      success: true,
      subcategoryId: jsonContent.subcategoryId,
      title: jsonContent.title,
      details: 'Content imported successfully'
    };

  } catch (error) {
    console.error('Error importing learning content:', error);
    return {
      success: false,
      error: 'Import failed',
      details: error.message
    };
  }
};

/**
 * Imports multiple learning content files
 * @param {Array} jsonContents - Array of JSON content objects
 * @returns {Promise<Object>} - Batch import results
 */
export const importMultipleLearningContents = async (jsonContents) => {
  const results = {
    successful: [],
    failed: [],
    total: jsonContents.length
  };

  for (const content of jsonContents) {
    const result = await importLearningContent(content);
    if (result.success) {
      results.successful.push({
        subcategoryId: result.subcategoryId,
        title: result.title
      });
    } else {
      results.failed.push({
        subcategoryId: content.subcategoryId || 'unknown',
        error: result.error,
        details: result.details
      });
    }
  }

  return results;
};

/**
 * Generates a sample JSON structure for learning content
 * @param {string} subcategoryId - The subcategory ID
 * @param {string} title - The subcategory title
 * @returns {Object} - Sample JSON structure
 */
export const generateSampleJson = (subcategoryId = 'sample-subcategory', title = 'Sample Subcategory') => {
  return {
    subcategoryId,
    title,
    lastUpdated: new Date().toISOString().split('T')[0],
    metadata: {
      difficulty: "Varies by specific question",
      estimatedStudyTime: "2-3 hours for initial mastery",
      questionFrequency: "Approximately 3-5 questions per exam",
      testDomain: "Reading and Writing"
    },
    overview: {
      title: "Overview",
      sections: {
        definition: {
          title: "Definition",
          content: "Brief explanation of what this question type assesses and what students need to do."
        },
        digitalSatContext: {
          title: "Digital SAT Context",
          content: "How this question type appears on the digital SAT, including format, frequency, and interface details."
        },
        questionFrequency: {
          title: "Question Frequency",
          content: "Expected number of these questions per exam and their distribution across modules."
        }
      }
    },
    questionAnalysis: {
      title: "Question Analysis",
      sections: {
        commonQuestionStems: {
          title: "Common Question Stems",
          content: "Typical question formats and phrasing patterns students will encounter."
        },
        answerChoicePatterns: {
          title: "Answer Choice Patterns",
          content: "How correct and incorrect answers are typically structured and what to look for."
        },
        difficultyProgression: {
          title: "Difficulty Progression",
          content: "How questions vary in difficulty and what makes some harder than others."
        }
      }
    },
    strategicApproaches: {
      title: "Strategic Approaches",
      sections: {
        primaryStrategy: {
          title: "Primary Strategy",
          content: "The main approach students should use for this question type."
        },
        secondaryMethods: {
          title: "Secondary Methods",
          content: "Alternative strategies and backup approaches."
        },
        timeManagement: {
          title: "Time Management",
          content: "How to pace yourself and allocate time effectively for these questions."
        }
      }
    },
    commonMistakesAnalysis: {
      title: "Common Mistakes Analysis",
      sections: {
        frequentStudentErrors: {
          title: "Frequent Student Errors",
          content: "Most common mistakes students make and why they make them."
        },
        misconceptions: {
          title: "Misconceptions",
          content: "Common misunderstandings about this question type or content area."
        },
        trapAnswers: {
          title: "Trap Answers",
          content: "How test makers create attractive wrong answers and how to avoid them."
        }
      }
    },
    studyStrategies: {
      title: "Study Strategies",
      sections: {
        practiceRecommendations: {
          title: "Practice Recommendations",
          content: "Specific ways to practice and improve on this question type."
        },
        skillBuilding: {
          title: "Skill Building",
          content: "Fundamental skills to develop that support success on these questions."
        },
        reviewTechniques: {
          title: "Review Techniques",
          content: "How to effectively review practice questions and learn from mistakes."
        }
      }
    },
    keyStrategies: [
      "Main strategy point 1",
      "Main strategy point 2",
      "Main strategy point 3",
      "Main strategy point 4",
      "Main strategy point 5"
    ],
    commonMistakes: [
      "Common mistake 1",
      "Common mistake 2", 
      "Common mistake 3",
      "Common mistake 4",
      "Common mistake 5"
    ],
    studyTips: [
      "Study tip 1",
      "Study tip 2",
      "Study tip 3",
      "Study tip 4",
      "Study tip 5"
    ]
  };
}; 