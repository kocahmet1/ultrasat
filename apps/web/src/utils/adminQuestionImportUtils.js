const officialSATCategories = {
  'Math': {
    mainCategories: [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis',
      'Geometry and Trigonometry'
    ],
    subcategories: {
      'Algebra': [
        'Linear equations in one variable',
        'Linear functions',
        'Linear equations in two variables',
        'Systems of two linear equations in two variables',
        'Linear inequalities in one or two variables'
      ],
      'Advanced Math': [
        'Nonlinear functions',
        'Nonlinear equations in one variable and systems of equations in two variables',
        'Equivalent expressions'
      ],
      'Problem-Solving and Data Analysis': [
        'Ratios, rates, proportional relationships, and units',
        'Percentages',
        'One-variable data: Distributions and measures of center and spread',
        'Two-variable data: Models and scatterplots',
        'Probability and conditional probability',
        'Inference from sample statistics and margin of error',
        'Evaluating statistical claims: Observational studies and experiments'
      ],
      'Geometry and Trigonometry': [
        'Area and volume',
        'Lines, angles, and triangles',
        'Right triangles and trigonometry',
        'Circles'
      ]
    }
  },
  'Reading and Writing': {
    mainCategories: [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ],
    subcategories: {
      'Information and Ideas': [
        'Central Ideas and Details',
        'Inferences',
        'Command of Evidence'
      ],
      'Craft and Structure': [
        'Words in Context',
        'Text Structure and Purpose',
        'Cross-Text Connections'
      ],
      'Expression of Ideas': [
        'Rhetorical Synthesis',
        'Transitions'
      ],
      'Standard English Conventions': [
        'Boundaries',
        'Form, Structure, and Sense'
      ]
    }
  }
};

const normalizeSubcategoryForComparison = (subcategory) => {
  if (!subcategory) return '';
  return subcategory.toLowerCase().trim();
};

const subcategoryMatchesAny = (subcategory, subcategoryList) => {
  if (!subcategory || !subcategoryList) return false;
  const normalizedSubcategory = normalizeSubcategoryForComparison(subcategory);
  return subcategoryList.some(item => normalizeSubcategoryForComparison(item) === normalizedSubcategory);
};

export const validateAndCorrectCategories = (question) => {
  const validationResult = {
    question: { ...question },
    corrected: false,
    warningMessage: null
  };

  let subcategoryValue = validationResult.question.subCategory ||
    validationResult.question.subcategory ||
    validationResult.question.subcategoryId;

  if (subcategoryValue) {
    validationResult.question.subCategory = subcategoryValue;
    validationResult.question.subcategory = subcategoryValue;
  }

  if (!validationResult.question.category && validationResult.question.subCategory) {
    let inferredCategory = null;
    let inferredMainCategory = null;

    for (const mainCategory of officialSATCategories['Math'].mainCategories) {
      if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories['Math'].subcategories[mainCategory])) {
        inferredCategory = 'Math';
        inferredMainCategory = mainCategory;
        break;
      }
    }

    if (!inferredCategory) {
      for (const mainCategory of officialSATCategories['Reading and Writing'].mainCategories) {
        if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories['Reading and Writing'].subcategories[mainCategory])) {
          inferredCategory = 'Reading and Writing';
          inferredMainCategory = mainCategory;
          break;
        }
      }
    }

    if (inferredCategory) {
      validationResult.question.category = inferredCategory;
      validationResult.question.section = inferredCategory;
      validationResult.question.mainSkillCategory = inferredMainCategory;
      validationResult.question.subSkillCategory = validationResult.question.subCategory;
      validationResult.corrected = true;
      console.log(`Auto-assigned category '${inferredCategory}' and main category '${inferredMainCategory}' based on subcategory '${validationResult.question.subCategory}'`);
    } else {
      const subcategoryMappings = {
        'Main Idea': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Central Ideas and Details' },
        'Detail': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Central Ideas and Details' },
        'Author\'s Tone': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Inferences' },
        'Vocabulary in Context': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Words in Context' },
        'Vocabulary': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Words in Context' },
        'Purpose': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Text Structure and Purpose' },
        'Evidence': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Command of Evidence' },
        'Prediction': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Cross-Text Connections' },
        'Grammar': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Form, Structure, and Sense' },
        'Punctuation': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Boundaries' },
        'Sentence Structure': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Form, Structure, and Sense' },
        'Organization': { category: 'Reading and Writing', mainCategory: 'Expression of Ideas', mapped: 'Rhetorical Synthesis' },
        'Functions': { category: 'Math', mainCategory: 'Algebra', mapped: 'Linear functions' },
        'Expressions': { category: 'Math', mainCategory: 'Advanced Math', mapped: 'Equivalent expressions' },
        'Geometry': { category: 'Math', mainCategory: 'Geometry and Trigonometry', mapped: 'Area and volume' },
        'Probability': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'Probability and conditional probability' },
        'Data Analysis': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'One-variable data: Distributions and measures of center and spread' },
        'Problem Solving': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'Ratios, rates, proportional relationships, and units' }
      };

      if (subcategoryMappings[validationResult.question.subCategory]) {
        const mapping = subcategoryMappings[validationResult.question.subCategory];
        validationResult.question.category = mapping.category;
        validationResult.question.section = mapping.category;
        validationResult.question.mainSkillCategory = mapping.mainCategory;
        validationResult.question.subSkillCategory = mapping.mapped;
        validationResult.question.subCategory = mapping.mapped;
        validationResult.question.subcategory = mapping.mapped;
        validationResult.corrected = true;
        console.log(`Mapped non-standard subcategory '${subcategoryValue}' to '${mapping.mapped}' in category '${mapping.category}'`);
      } else {
        validationResult.warningMessage = `Could not determine category from subcategory: '${validationResult.question.subCategory}'`;
        return validationResult;
      }
    }
  }

  if (!validationResult.question.category) {
    validationResult.warningMessage = 'Question has no category or valid subcategory';
    return validationResult;
  }

  if (validationResult.question.section && validationResult.question.section !== validationResult.question.category) {
    validationResult.question.section = validationResult.question.category;
    validationResult.corrected = true;
  }

  const categoryMapping = {
    'Reading': 'Reading and Writing',
    'Writing': 'Reading and Writing'
  };

  if (categoryMapping[validationResult.question.category]) {
    validationResult.question.category = categoryMapping[validationResult.question.category];
    validationResult.corrected = true;
  }

  if (!(validationResult.question.category in officialSATCategories)) {
    validationResult.warningMessage = `Invalid main category: '${validationResult.question.category}'`;
    return validationResult;
  }

  if (!validationResult.question.subCategory) {
    validationResult.warningMessage = 'Question has no subcategory';
    return validationResult;
  }

  let foundMainCategory = null;
  let subcategoryValid = false;

  for (const mainCategory of officialSATCategories[validationResult.question.category].mainCategories) {
    if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories[validationResult.question.category].subcategories[mainCategory])) {
      const officialSubcategories = officialSATCategories[validationResult.question.category].subcategories[mainCategory];
      const normalizedInput = normalizeSubcategoryForComparison(validationResult.question.subCategory);

      for (const officialSubcategory of officialSubcategories) {
        if (normalizeSubcategoryForComparison(officialSubcategory) === normalizedInput) {
          validationResult.question.subCategory = officialSubcategory;
          validationResult.question.subcategory = officialSubcategory;
          break;
        }
      }

      foundMainCategory = mainCategory;
      subcategoryValid = true;
      break;
    }
  }

  if (subcategoryValid) {
    validationResult.question.mainSkillCategory = foundMainCategory;
    validationResult.question.subSkillCategory = validationResult.question.subCategory;
    validationResult.corrected = true;
  } else {
    const subcategoryMappings = {
      'Main Idea': 'Central Ideas and Details',
      'Detail': 'Central Ideas and Details',
      'Author\'s Tone': 'Inferences',
      'Vocabulary in Context': 'Words in Context',
      'Vocabulary': 'Words in Context',
      'Purpose': 'Text Structure and Purpose',
      'Evidence': 'Command of Evidence',
      'Prediction': 'Cross-Text Connections',
      'Grammar': 'Form, Structure, and Sense',
      'Punctuation': 'Boundaries',
      'Sentence Structure': 'Form, Structure, and Sense',
      'Organization': 'Rhetorical Synthesis',
      'Functions': 'Linear functions',
      'Expressions': 'Equivalent expressions',
      'Geometry': 'Area and volume',
      'Probability': 'Probability and conditional probability',
      'Data Analysis': 'One-variable data: Distributions and measures of center and spread',
      'Problem Solving': 'Ratios, rates, proportional relationships, and units'
    };

    if (subcategoryMappings[validationResult.question.subCategory]) {
      const mappedSubcategory = subcategoryMappings[validationResult.question.subCategory];

      for (const mainCategory of officialSATCategories[validationResult.question.category].mainCategories) {
        if (officialSATCategories[validationResult.question.category].subcategories[mainCategory].includes(mappedSubcategory)) {
          validationResult.question.mainSkillCategory = mainCategory;
          validationResult.question.subSkillCategory = mappedSubcategory;
          validationResult.question.subCategory = mappedSubcategory;
          validationResult.question.subcategory = mappedSubcategory;
          validationResult.corrected = true;
          break;
        }
      }
    }

    if (!validationResult.question.mainSkillCategory) {
      validationResult.warningMessage = `Invalid subcategory '${validationResult.question.subCategory}' for ${validationResult.question.category}`;
    }
  }

  return validationResult;
};
