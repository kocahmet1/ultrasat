/**
 * Embedded Quiz Sample Questions — one HARD question per subcategory
 *
 * Each key is a kebab-case subcategory ID (the canonical format).
 * These are designed to be challenging, SAT-hard-level questions that
 * require multi-step reasoning, nuanced reading, or tricky distractors.
 */

const EMBEDDED_QUIZ_QUESTIONS = {

  // ─── Reading & Writing — Information & Ideas ─────────────────

  'central-ideas-details': {
    text: 'A 2023 study found that while urban tree canopy cover reduces local temperatures by up to 5°C, neighborhoods with the lowest canopy coverage are disproportionately those with the highest poverty rates — a pattern researchers attribute to decades of inequitable municipal investment. Which choice best states the central idea of the text?',
    options: [
      'Urban trees are effective at reducing temperatures in cities.',
      'Poverty rates correlate with higher urban temperatures due to systemic underinvestment in tree coverage.',
      'Municipal governments should plant more trees in all neighborhoods equally.',
      'Researchers have discovered that trees can lower temperatures by exactly 5°C.'
    ],
    correctAnswer: 'Poverty rates correlate with higher urban temperatures due to systemic underinvestment in tree coverage.',
    explanation: 'The passage links two findings — trees reduce heat, and low-canopy areas coincide with high-poverty areas — and attributes the disparity to inequitable investment. Answer B captures both the correlation and the causal mechanism, while A is only a supporting detail and C/D are unsupported inferences.'
  },

  'inferences': {
    text: 'A recent experiment exposed two genetically identical plant groups to different light conditions: Group A received natural sunlight, and Group B received the same intensity of artificial LED light at the same wavelengths. After six weeks, Group A produced 30% more fruit. The researchers concluded that a factor beyond light spectrum and intensity must account for the difference. Which of the following, if true, would best explain the researchers\' conclusion?',
    options: [
      'Natural sunlight contains ultraviolet wavelengths that were not replicated by the LEDs, which may trigger hormonal responses related to fruit production.',
      'Group A was watered more frequently than Group B during the experiment.',
      'LED lights are generally less energy-efficient than natural sunlight.',
      'The plants in Group B were a different species than those in Group A.'
    ],
    correctAnswer: 'Natural sunlight contains ultraviolet wavelengths that were not replicated by the LEDs, which may trigger hormonal responses related to fruit production.',
    explanation: 'The researchers controlled spectrum and intensity but still observed a difference, so the factor must be something in natural light NOT captured by those two variables. UV wavelengths (outside the replicated spectrum) affecting plant hormones provides a plausible mechanism that is consistent with the experimental design. B and D violate the controlled conditions described.'
  },

  'command-of-evidence': {
    text: 'A literary scholar argues that the protagonist in a novel undergoes a moral transformation rather than simply adapting to circumstances. Which quotation from the novel would most effectively support this claim?',
    options: [
      '"She learned to navigate the new city\'s streets with growing confidence each day."',
      '"She realized, standing in the rain, that the person she had been would have walked past without stopping — but she could no longer do that."',
      '"The winters were harsher than she expected, and she bought a heavier coat."',
      '"Her colleagues admired her ability to adjust to the company\'s demanding culture."'
    ],
    correctAnswer: '"She realized, standing in the rain, that the person she had been would have walked past without stopping — but she could no longer do that."',
    explanation: 'A moral transformation requires evidence of changed values or ethics, not just practical adaptation. Only B shows the protagonist reflecting on who she "had been" versus who she is now, indicating an internal moral shift. The other options describe situational or behavioral adjustments without moral dimension.'
  },

  // ─── Reading & Writing — Craft & Structure ───────────────────

  'words-in-context': {
    text: 'Although the policy was ostensibly designed to promote transparency, critics argued that it actually _______ the flow of information by creating bureaucratic obstacles that discouraged employees from filing reports. Which choice completes the text with the most logical and precise word?',
    options: [
      'facilitated',
      'impeded',
      'accelerated',
      'documented'
    ],
    correctAnswer: 'impeded',
    explanation: 'The sentence sets up a contrast ("ostensibly … transparency" vs "actually …"). The blank must describe the opposite of promoting transparency. "Impeded" (obstructed/hindered) fits the contrast and aligns with "bureaucratic obstacles that discouraged" reporting. "Facilitated" and "accelerated" would align with the stated goal, not contradict it.'
  },

  'text-structure-purpose': {
    text: 'A passage on antibiotic resistance opens with a case study of a patient whose infection did not respond to three rounds of antibiotics, then presents molecular research on how bacteria acquire resistance genes, and concludes by noting that current drug development pipelines have far fewer new antibiotics than in previous decades. What is the most likely purpose of the opening case study in relation to the rest of the text?',
    options: [
      'To provide a human-scale illustration of the consequences that the subsequent scientific and industrial analysis helps explain.',
      'To argue that doctors should prescribe fewer antibiotics to their patients.',
      'To contrast the patient\'s experience with more successful treatment outcomes.',
      'To demonstrate that the molecular research described later is unreliable.'
    ],
    correctAnswer: 'To provide a human-scale illustration of the consequences that the subsequent scientific and industrial analysis helps explain.',
    explanation: 'The case study functions as a concrete, relatable entry point into the abstract topics (molecular mechanisms, drug pipelines) that follow. It grounds the reader in real-world consequences before the text shifts to explanation and analysis. The other options either mischaracterize the case study\'s function or introduce claims not supported by the structure.'
  },

  'cross-text-connections': {
    text: 'Text 1: "Algorithmic content curation enables users to discover material aligned with their interests more efficiently than ever before." Text 2: "Research shows that algorithmically curated feeds systematically reduce users\' exposure to viewpoints that challenge their existing beliefs, reinforcing cognitive biases." Based on both texts, which statement most accurately captures the relationship between their claims?',
    options: [
      'Text 1 and Text 2 discuss entirely different technologies.',
      'Text 2 presents a consequence of the same mechanism that Text 1 describes as beneficial.',
      'Text 1 contradicts the research findings described in Text 2.',
      'Text 2 argues that algorithmic curation should be banned entirely.'
    ],
    correctAnswer: 'Text 2 presents a consequence of the same mechanism that Text 1 describes as beneficial.',
    explanation: 'Both texts discuss algorithmic curation. Text 1 frames the alignment feature as a benefit (efficiency), while Text 2 identifies a negative consequence of that same alignment feature (reduced exposure to challenging viewpoints). They address the same mechanism from different evaluative angles — B captures this nuanced relationship precisely.'
  },

  // ─── Reading & Writing — Expression of Ideas ─────────────────

  'rhetorical-synthesis': {
    text: 'A student is writing about the decline of bee populations and wants to connect economic impact data with ecological research. The student has the following notes: (1) U.S. crops pollinated by bees are worth over $15 billion annually; (2) A 2022 study found that wildflower border strips around farms increased local bee populations by 35%. Which choice most effectively synthesizes these notes to support the argument that ecological interventions have measurable economic value?',
    options: [
      'Bees pollinate many important crops in the United States.',
      'Wildflower border strips are beautiful additions to farmland and attract various insects.',
      'Since bee-pollinated crops contribute over $15 billion annually to the U.S. economy, interventions like wildflower borders — which increased local bee populations by 35% — represent ecologically informed strategies with direct economic implications.',
      'The 2022 study proves that all farms should be required to plant wildflower borders.'
    ],
    correctAnswer: 'Since bee-pollinated crops contribute over $15 billion annually to the U.S. economy, interventions like wildflower borders — which increased local bee populations by 35% — represent ecologically informed strategies with direct economic implications.',
    explanation: 'The task requires synthesizing both data points into a single argument connecting ecology to economics. Only C integrates the $15 billion economic figure with the 35% population increase and explicitly draws the bridge between ecological intervention and economic value.'
  },

  'transitions': {
    text: 'A longitudinal study tracked 2,000 bilingual children over ten years and found that they consistently outperformed monolingual peers on tasks requiring cognitive flexibility. _______, the researchers cautioned that socioeconomic factors — which correlated with bilingualism in their sample — could partially account for the observed differences.',
    options: [
      'Furthermore,',
      'Consequently,',
      'Nevertheless,',
      'In other words,'
    ],
    correctAnswer: 'Nevertheless,',
    explanation: 'The first sentence presents a positive finding (bilingual advantage). The second sentence introduces a qualification that complicates the finding (confounding variables). "Nevertheless" signals that the second point stands in contrast or tension with the first, acknowledging the finding while introducing a caveat.'
  },

  // ─── Reading & Writing — Standard English Conventions ─────────

  'boundaries': {
    text: 'The artist, whose early work was largely _______ began incorporating political themes after relocating to Berlin in 2015. Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      'abstract, she',
      'abstract;',
      'abstract,',
      'abstract. She'
    ],
    correctAnswer: 'abstract,',
    explanation: 'The clause "whose early work was largely abstract" is a nonrestrictive clause modifying "The artist." It must be closed with a comma to continue the main clause ("began incorporating…"). A semicolon or period would create a fragment since "began incorporating" has no subject without the main clause.'
  },

  'form-structure-sense': {
    text: 'Each of the three proposals submitted by the engineering team _______ a distinct approach to reducing the building\'s carbon footprint. Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      'outline',
      'outlines',
      'have outlined',
      'are outlining'
    ],
    correctAnswer: 'outlines',
    explanation: '"Each" is the subject and is always singular, regardless of the prepositional phrase "of the three proposals." The singular subject requires the singular verb "outlines." The plural forms "outline," "have outlined," and "are outlining" would be incorrect with "Each."'
  },

  // ─── Math — Algebra ──────────────────────────────────────────

  'linear-equations-one-variable': {
    text: 'A worker is paid $18 per hour for the first 40 hours per week and $27 per hour for each additional hour. If the worker earned $891 last week, how many hours of overtime did the worker work?',
    options: [
      '5',
      '7',
      '9',
      '11'
    ],
    correctAnswer: '7',
    explanation: 'Base pay: 40 × $18 = $720. Overtime pay: $891 − $720 = $171. Overtime hours: $171 ÷ $27 = 7 hours. Note: the overtime rate is 1.5× the regular rate, a common SAT detail.'
  },

  'linear-functions': {
    text: 'A water tank initially contains 200 gallons and is being drained at a constant rate. After 3 hours, the tank contains 125 gallons. At what time, in hours, will the tank be completely empty?',
    options: [
      '6',
      '7',
      '8',
      '9'
    ],
    correctAnswer: '8',
    explanation: 'Drain rate: (200 − 125) / 3 = 25 gallons/hour. Function: f(t) = 200 − 25t. Set f(t) = 0: 200 − 25t = 0 → t = 8 hours.'
  },

  'linear-equations-two-variables': {
    text: 'Line p has the equation 3x − 4y = 12. Line q is perpendicular to line p and passes through the point (6, 1). What is the y-intercept of line q?',
    options: [
      '9',
      '−7',
      '7',
      '−9'
    ],
    correctAnswer: '9',
    explanation: 'Line p slope: 3x − 4y = 12 → y = (3/4)x − 3, so slope = 3/4. Perpendicular slope = −4/3. Using point (6, 1): y − 1 = −(4/3)(x − 6) → y = −(4/3)x + 8 + 1 = −(4/3)x + 9. The y-intercept is 9.'
  },

  'systems-linear-equations': {
    text: 'A movie theater sold 350 tickets for a total of $3,250. Adult tickets cost $12 each and child tickets cost $7 each. How many adult tickets were sold?',
    options: [
      '140',
      '160',
      '180',
      '200'
    ],
    correctAnswer: '160',
    explanation: 'Let a = adults, c = children. a + c = 350 and 12a + 7c = 3250. From the first: c = 350 − a. Substituting: 12a + 7(350 − a) = 3250 → 12a + 2450 − 7a = 3250 → 5a = 800 → a = 160.'
  },

  'linear-inequalities': {
    text: 'A shipping company charges $0.75 per pound plus a flat fee of $8.00 per package. If a customer has a budget of at most $42 and needs to ship 3 identical packages, what is the maximum weight, in pounds, that each package can be?',
    options: [
      '6',
      '7',
      '8',
      '9'
    ],
    correctAnswer: '8',
    explanation: 'Total cost for 3 packages: 3(0.75w + 8) ≤ 42 → 2.25w + 24 ≤ 42 → 2.25w ≤ 18 → w ≤ 8. The maximum weight per package is 8 pounds. Verify: 3(0.75(8) + 8) = 3(6 + 8) = 3(14) = $42 ✓.'
  },

  // ─── Math — Advanced Math ────────────────────────────────────

  'nonlinear-functions': {
    text: 'The function g(x) = −2(x − 3)² + 18 models the height, in feet, of a ball at horizontal distance x feet. What is the maximum height of the ball, and at what horizontal distance does it occur?',
    options: [
      'Maximum height 18 feet at x = 3',
      'Maximum height 3 feet at x = 18',
      'Maximum height 18 feet at x = −3',
      'Maximum height 36 feet at x = 3'
    ],
    correctAnswer: 'Maximum height 18 feet at x = 3',
    explanation: 'In vertex form g(x) = a(x − h)² + k, the vertex is (h, k). Here h = 3 and k = 18. Since a = −2 < 0, the parabola opens downward, so the vertex is the maximum point: height 18 at x = 3.'
  },

  'nonlinear-equations': {
    text: 'If (2x + 3)(x − 5) = 2x² − kx − 15, what is the value of k?',
    options: [
      '−7',
      '7',
      '13',
      '−13'
    ],
    correctAnswer: '7',
    explanation: 'Expand: (2x + 3)(x − 5) = 2x² − 10x + 3x − 15 = 2x² − 7x − 15. Comparing with 2x² − kx − 15: −kx = −7x, so k = 7.'
  },

  'equivalent-expressions': {
    text: 'Which expression is equivalent to (9x⁴ − 25y²) / (3x² + 5y)?',
    options: [
      '3x² − 5y',
      '3x² + 5y',
      '9x² − 5y',
      '3x⁴ − 5y²'
    ],
    correctAnswer: '3x² − 5y',
    explanation: 'Recognize 9x⁴ − 25y² as a difference of squares: (3x²)² − (5y)². Factor: (3x² + 5y)(3x² − 5y). Dividing by (3x² + 5y) yields 3x² − 5y.'
  },

  // ─── Math — Problem Solving & Data Analysis ──────────────────

  'ratios-rates-proportions': {
    text: 'On a map, 2.5 centimeters represents 40 kilometers. Two cities are 7.5 centimeters apart on the map. A car travels between the cities at an average speed of 80 km/h. How long, in hours, does the trip take?',
    options: [
      '1',
      '1.25',
      '1.5',
      '2'
    ],
    correctAnswer: '1.5',
    explanation: 'Scale: 2.5 cm = 40 km → 1 cm = 16 km. Distance: 7.5 × 16 = 120 km. Time: 120 ÷ 80 = 1.5 hours. This requires chaining the proportion with the rate calculation.'
  },

  'percentages': {
    text: 'A store marks up a product by 60% from its wholesale cost, then offers a 25% discount on the marked-up price. If the customer pays $96 after the discount, what was the original wholesale cost?',
    options: [
      '$70',
      '$75',
      '$80',
      '$85'
    ],
    correctAnswer: '$80',
    explanation: 'Let wholesale cost = w. Marked-up price: 1.60w. After 25% discount: 0.75 × 1.60w = 1.20w = $96. So w = $96 / 1.20 = $80. A common trap is computing 60% − 25% = 35% markup, but discounts and markups don\'t simply subtract.'
  },

  'one-variable-data': {
    text: 'A dataset of test scores has a mean of 74 and a standard deviation of 8. A score of 90 is how many standard deviations above the mean?',
    options: [
      '1',
      '1.5',
      '2',
      '2.5'
    ],
    correctAnswer: '2',
    explanation: 'z = (value − mean) / SD = (90 − 74) / 8 = 16 / 8 = 2 standard deviations above the mean.'
  },

  'two-variable-data': {
    text: 'A scatterplot of study hours (x) versus exam score (y) yields a line of best fit y = 4.2x + 52. The correlation coefficient is r = 0.87. Which statement is the best interpretation of these results?',
    options: [
      'Studying for one hour causes the exam score to increase by exactly 4.2 points.',
      'There is a strong positive linear association; each additional study hour is associated with a predicted 4.2-point increase in exam score, though the relationship is not perfectly predictive.',
      'Approximately 87% of students who study will pass the exam.',
      'The exam score is always 52 points when a student does not study.'
    ],
    correctAnswer: 'There is a strong positive linear association; each additional study hour is associated with a predicted 4.2-point increase in exam score, though the relationship is not perfectly predictive.',
    explanation: 'r = 0.87 indicates a strong positive association but not causation (eliminating A). The slope 4.2 is a predicted average increase, not an exact guarantee. D uses "always," which is too strong for a regression model. B correctly qualifies both the strength and the limitation.'
  },

  'probability': {
    text: 'A class has 12 boys and 18 girls. Two students are selected at random without replacement to serve as class representatives. What is the probability that both selected students are girls?',
    options: [
      '9/29',
      '17/58',
      '9/25',
      '51/145'
    ],
    correctAnswer: '51/145',
    explanation: 'P(1st girl) = 18/30 = 3/5. P(2nd girl | 1st girl) = 17/29. P(both girls) = (18/30)(17/29) = 306/870 = 51/145. The "without replacement" detail is critical — it changes the second probability.'
  },

  'inference-statistics': {
    text: 'A researcher surveys 400 randomly selected adults in a state and finds that 68% support a proposed policy. The margin of error is ±4 percentage points at a 95% confidence level. Which statement is the most appropriate interpretation?',
    options: [
      'Exactly 68% of all adults in the state support the policy.',
      'We are 95% confident that between 64% and 72% of all adults in the state support the policy.',
      'If the survey were repeated, exactly 95% of respondents would give the same answer.',
      'The survey proves the policy will be adopted since more than half support it.'
    ],
    correctAnswer: 'We are 95% confident that between 64% and 72% of all adults in the state support the policy.',
    explanation: 'The confidence interval is 68% ± 4% = [64%, 72%]. The correct interpretation is that we are 95% confident the true population proportion falls within this interval. A is too exact, C misinterprets confidence level, and D conflates survey results with policy outcomes.'
  },

  'evaluating-statistical-claims': {
    text: 'A health magazine reports: "People who eat breakfast daily are 20% less likely to be overweight." The study cited was observational and surveyed participants about their eating habits. Which limitation most weakens the magazine\'s implied causal claim?',
    options: [
      'The study used a survey rather than measuring participants directly.',
      'People who eat breakfast may also exercise more frequently and make other healthier choices, making it impossible to attribute the weight difference solely to breakfast.',
      'Twenty percent is too small a difference to be statistically significant.',
      'The magazine should have cited multiple studies instead of just one.'
    ],
    correctAnswer: 'People who eat breakfast may also exercise more frequently and make other healthier choices, making it impossible to attribute the weight difference solely to breakfast.',
    explanation: 'The key issue with observational studies is confounding variables. People who eat breakfast may systematically differ from those who don\'t in other health behaviors (exercise, diet quality, sleep). This confounding prevents establishing that breakfast itself causes lower weight — which is what the magazine implies.'
  },

  // ─── Math — Geometry & Trigonometry ──────────────────────────

  'area-volume': {
    text: 'A cone and a cylinder have the same radius (r = 4) and the same height (h = 9). What fraction of the cylinder\'s volume is the cone\'s volume?',
    options: [
      '1/4',
      '1/3',
      '1/2',
      '2/3'
    ],
    correctAnswer: '1/3',
    explanation: 'V_cylinder = πr²h. V_cone = (1/3)πr²h. The ratio V_cone / V_cylinder = 1/3, regardless of the specific values of r and h. This is a fundamental geometric relationship students must know.'
  },

  'lines-angles-triangles': {
    text: 'In triangle ABC, angle A = 50° and the exterior angle at vertex C is 130°. What is the measure of angle B?',
    options: [
      '50°',
      '60°',
      '70°',
      '80°'
    ],
    correctAnswer: '80°',
    explanation: 'An exterior angle of a triangle equals the sum of the two non-adjacent interior angles. So the exterior angle at C = angle A + angle B → 130° = 50° + angle B → angle B = 80°. (Note: angle C = 180° − 130° = 50°, and 50 + 80 + 50 = 180° ✓)'
  },

  'right-triangles-trigonometry': {
    text: 'In right triangle PQR, angle Q = 90° and sin(P) = 5/13. What is the value of cos(R)?',
    options: [
      '5/13',
      '12/13',
      '5/12',
      '13/5'
    ],
    correctAnswer: '5/13',
    explanation: 'In a right triangle, angles P and R are complementary (P + R = 90°). A key identity: sin(P) = cos(90° − P) = cos(R). Therefore cos(R) = sin(P) = 5/13. This tests understanding of complementary angle relationships in trigonometry.'
  },

  'circles': {
    text: 'A circle in the xy-plane has the equation x² + y² + 6x − 10y + 18 = 0. What are the coordinates of the center and the radius of the circle?',
    options: [
      'Center (−3, 5), radius 4',
      'Center (3, −5), radius 4',
      'Center (−3, 5), radius 16',
      'Center (3, 5), radius 4'
    ],
    correctAnswer: 'Center (−3, 5), radius 4',
    explanation: 'Complete the square: (x² + 6x + 9) + (y² − 10y + 25) = −18 + 9 + 25 → (x + 3)² + (y − 5)² = 16. In standard form (x − h)² + (y − k)² = r², the center is (h, k) = (−3, 5) and radius = √16 = 4. Common traps: sign errors give (3, −5), and forgetting to take the square root gives r = 16.'
  }
};

export default EMBEDDED_QUIZ_QUESTIONS;
