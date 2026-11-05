import { Course, Assignment, ExtraLesson, PracticeSession, FlashcardDeck } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-calc',
    name: 'AP Calculus BC',
    code: 'MATH-201',
    instructor: 'Dr. Evelyn Alvarez',
    color: '#818CF8', // Soft Periwinkle
    platform: 'canvas',
    grade: '94.2% (A)',
  },
  {
    id: 'course-chem',
    name: 'AP Chemistry',
    code: 'CHEM-102',
    instructor: 'Prof. Marcus Hastings',
    color: '#38BDF8', // Soft Sky Blue
    platform: 'canvas',
    grade: '88.5% (B+)',
  },
  {
    id: 'course-apush',
    name: 'AP United States History',
    code: 'HIST-110',
    instructor: 'Ms. Clara Warren',
    color: '#F59E0B', // Warm Peach / Amber
    platform: 'manual',
    grade: '92.0% (A-)',
  },
  {
    id: 'course-lit',
    name: 'English Literature & Composition',
    code: 'ENGL-215',
    instructor: 'Mr. David Thorne',
    color: '#FB7185', // Soft Pastel Rose
    platform: 'ical',
    grade: '96.0% (A)',
  },
  {
    id: 'course-cs',
    name: 'Data Structures & Algorithms',
    code: 'CS-211',
    instructor: 'Prof. Raymond Lin',
    color: '#34D399', // Soft Sage Mint
    platform: 'canvas',
    grade: '95.5% (A)',
  },
];

// Helper to get formatted date string offset from now
function getDateOffset(daysOffset: number, hours = 23, minutes = 59): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}`;
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Unit 4 Exam: Derivatives, Chain Rule & Related Rates',
    courseId: 'course-calc',
    courseName: 'AP Calculus BC',
    dueDate: getDateOffset(1, 14, 0), // Tomorrow 2pm
    priority: 'Urgent',
    status: 'in_progress',
    type: 'Exam',
    description: 'Covers implicit differentiation, logarithmic differentiation, velocity/acceleration, and 3D related rates problems. Calculator active section included.',
    topics: ['Chain Rule', 'Implicit Differentiation', 'Related Rates', 'Derivatives'],
    estimatedMinutes: 120,
    subtasks: [
      { id: 'st1', text: 'Review textbook chapter 4 review problems', done: true },
      { id: 'st2', text: 'Complete practice FRQ on ladder/cone related rates', done: false },
      { id: 'st3', text: 'Take ScholarSync AI practice test (10 questions)', done: false },
    ],
  },
  {
    id: 'asg-2',
    title: 'Thermodynamics & Gibbs Free Energy Problem Set #6',
    courseId: 'course-chem',
    courseName: 'AP Chemistry',
    dueDate: getDateOffset(0, 23, 59), // Due today midnight!
    priority: 'Urgent',
    status: 'todo',
    type: 'Homework',
    description: 'Calculate ΔH, ΔS, and ΔG° for non-standard temperatures. Determine spontaneity and equilibrium constant relationship (ΔG° = -RT ln K).',
    topics: ['Gibbs Free Energy', 'Entropy (ΔS)', 'Enthalpy (ΔH)', 'Equilibrium Constant'],
    estimatedMinutes: 75,
    subtasks: [
      { id: 'st4', text: 'Calculate standard enthalpy of formation table', done: true },
      { id: 'st5', text: 'Solve questions 1-8 on temperature spontaneity', done: false },
      { id: 'st6', text: 'Submit PDF work on Canvas portal', done: false },
    ],
  },
  {
    id: 'asg-3',
    title: 'Reconstruction Era DBQ Essay Outline',
    courseId: 'course-apush',
    courseName: 'AP United States History',
    dueDate: getDateOffset(3, 23, 59), // In 3 days
    priority: 'High',
    status: 'todo',
    type: 'Project',
    description: 'Analyze primary source documents on Radical Reconstruction, the 14th & 15th Amendments, and the Compromise of 1877.',
    topics: ['Reconstruction Era', 'Radical Republicans', '14th Amendment', 'Jim Crow Era'],
    estimatedMinutes: 90,
    subtasks: [
      { id: 'st7', text: 'Annotate the 7 primary documents', done: true },
      { id: 'st8', text: 'Formulate defensible thesis with HIPPO analysis', done: false },
      { id: 'st9', text: 'Write body paragraph topic sentences and evidence', done: false },
    ],
  },
  {
    id: 'asg-4',
    title: 'Binary Search Tree & AVL Rebalancing Lab',
    courseId: 'course-cs',
    courseName: 'Data Structures & Algorithms',
    dueDate: getDateOffset(5, 23, 59), // In 5 days
    priority: 'Medium',
    status: 'in_progress',
    type: 'Lab',
    description: 'Implement left/right rotations for AVL self-balancing trees in Java/Python. Verify O(log n) worst-case lookup height invariance.',
    topics: ['Binary Search Trees', 'AVL Tree Rotations', 'Tree Traversals', 'Time Complexity'],
    estimatedMinutes: 110,
    subtasks: [
      { id: 'st10', text: 'Implement insert and delete recursive methods', done: true },
      { id: 'st11', text: 'Handle double rotation cases (Left-Right and Right-Left)', done: false },
      { id: 'st12', text: 'Pass JUnit test suite and submit GitHub repository', done: false },
    ],
  },
  {
    id: 'asg-5',
    title: 'Hamlet Act III Soliloquy Rhetorical Analysis',
    courseId: 'course-lit',
    courseName: 'English Literature & Composition',
    dueDate: getDateOffset(6, 17, 0), // In 6 days
    priority: 'Low',
    status: 'todo',
    type: 'Reading',
    description: 'Write a 2-page essay examining the syntactic parallelism and existential metaphors in "To be, or not to be".',
    topics: ['Shakespeare', 'Hamlet Act 3', 'Rhetorical Devices', 'Soliloquy Analysis'],
    estimatedMinutes: 60,
    subtasks: [
      { id: 'st13', text: 'Close-read lines 56-89 and note antithesis', done: false },
      { id: 'st14', text: 'Draft introductory paragraph with thesis statement', done: false },
    ],
  },
  {
    id: 'asg-6',
    title: 'Chemical Kinetics & Rate Laws Practice Worksheet',
    courseId: 'course-chem',
    courseName: 'AP Chemistry',
    dueDate: getDateOffset(-2, 23, 59), // 2 days ago
    priority: 'Medium',
    status: 'completed',
    type: 'Homework',
    description: 'Determine reaction orders from initial rates table and find activation energy from Arrhenius equation.',
    topics: ['Rate Laws', 'Reaction Orders', 'Arrhenius Equation', 'Half-Life'],
    estimatedMinutes: 50,
    score: '98 / 100',
    subtasks: [
      { id: 'st15', text: 'All problems verified and turned in', done: true },
    ],
  },
];

export const SAMPLE_LESSON: ExtraLesson = {
  id: 'lesson-related-rates',
  topic: 'Related Rates (Calculus)',
  subject: 'AP Calculus BC',
  title: 'Mastering Related Rates: The 4-Step Mental Blueprint',
  readTimeMinutes: 6,
  coreIdea: 'Related rates problems are just about tracking how fast two interconnected quantities change with respect to TIME using the Chain Rule (d/dt).',
  analogy: {
    title: 'The Sliding Ladder & The Shadow Runner',
    story: 'Imagine pulling the bottom of a 10-foot ladder away from a wall at 2 ft/sec. Notice that when the ladder is almost flat, the top barely slides down; but when the ladder is almost vertical, a tiny pull sends the top plummeting! Because the length is locked by the Pythagorean Theorem (x² + y² = 10²), the speeds dx/dt and dy/dt are handcuffed to each other by calculus.',
  },
  sections: [
    {
      heading: 'Step 1: Draw & Label Constant vs. Variable Values',
      content: 'The most fatal mistake students make is plugging in numbers too early. ONLY plug in numbers before differentiating if they are FOREVER CONSTANT throughout the entire physical process (like the fixed 10ft ladder length). Quantities that change with time (like distance from wall x or height y) MUST remain variables until AFTER you differentiate with respect to t.',
      keyRule: 'Never substitute a variable number before taking the derivative d/dt.',
    },
    {
      heading: 'Step 2: Differentiate Both Sides with Respect to Time (t)',
      content: 'Since x and y both depend on time t, every time you take the derivative of x or y, the Chain Rule kicks in: derivative of x² is 2x · (dx/dt). Derivative of y² is 2y · (dy/dt). Derivative of a constant like 10² is 0.',
      keyRule: 'd/dt [x²] = 2x(dx/dt). Never forget the rate factor!',
    },
    {
      heading: 'Step 3: Freeze the Snapshot in Time and Solve',
      content: 'Now—and ONLY now—plug in the snapshot values given in the problem (e.g. "when x = 6 ft, so y = 8 ft by Pythagorean theorem") and solve for the unknown rate. If height is decreasing, dy/dt must come out negative!',
    },
  ],
  commonPitfalls: [
    {
      mistake: 'Plugging in snapshot dimensions (x = 6) before differentiating.',
      whyItHappens: 'Students see numbers in the prompt and plug them into the equation right away.',
      howToAvoid: 'Ask yourself: "Is this quantity frozen in time, or is it changing as time passes?" If it changes, keep it as a letter until after d/dt!',
    },
    {
      mistake: 'Forgetting negative signs for shrinking quantities.',
      whyItHappens: 'Writing dy/dt = 3 instead of -3 when a distance or water level is decreasing.',
      howToAvoid: 'Sanity check: if a quantity is shrinking, its rate of change with time is ALWAYS negative.',
    },
  ],
  workedExample: {
    problemStatement: 'A 10 ft ladder leans against a vertical wall. If the bottom of the ladder slides away from the wall at 2 ft/s, how fast is the top of the ladder sliding down when the bottom is 6 ft from the wall?',
    steps: [
      {
        stepNumber: 1,
        action: 'Geometric Equation',
        explanation: 'Pythagorean Theorem: x² + y² = 10² = 100. (10 is constant; x and y change with time).',
      },
      {
        stepNumber: 2,
        action: 'Differentiate with respect to t (Chain Rule)',
        explanation: '2x(dx/dt) + 2y(dy/dt) = 0  ==>  Divide by 2:  x(dx/dt) + y(dy/dt) = 0.',
      },
      {
        stepNumber: 3,
        action: 'Find snapshot y when x = 6',
        explanation: '6² + y² = 100  ==>  36 + y² = 100  ==>  y = √64 = 8 ft.',
      },
      {
        stepNumber: 4,
        action: 'Substitute snapshot values & solve',
        explanation: '(6)(2) + (8)(dy/dt) = 0  ==>  12 + 8(dy/dt) = 0  ==>  dy/dt = -12/8 = -1.5 ft/sec.',
      },
    ],
    finalAnswer: 'The top of the ladder is sliding down at 1.5 ft/second (dy/dt = -1.5 ft/s).',
    proTip: 'Notice the negative sign confirms the top is moving downwards toward the floor!',
  },
  quickCheck: [
    {
      question: 'In a problem where water is leaking out of a cone tank, which quantity is CONSTANT and can be plugged in before differentiating?',
      options: [
        'The current depth of water h',
        'The fixed ratio of radius to height (r/h) of the cone container',
        'The volume of water remaining V',
        'The rate at which water is leaving dV/dt',
      ],
      correctIndex: 1,
      explanation: 'Correct! The physical tank does not change its shape, so the geometric ratio r/h is constant at all times and can be used to eliminate r before differentiating!',
    },
    {
      question: 'If a balloon is deflating at 5 cm³/s, what is the value of dV/dt in your calculus equation?',
      options: ['+5 cm³/s', '-5 cm³/s', '5 / (4πr²)', '0'],
      correctIndex: 1,
      explanation: 'Correct! Because the volume is shrinking over time, dV/dt must be negative (-5 cm³/s).',
    },
  ],
};

export const SAMPLE_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-calc',
    title: 'Derivatives & Chain Rule Mastery',
    topic: 'Derivatives & Related Rates',
    subject: 'AP Calculus BC',
    assignmentTitle: 'Unit 4 Exam: Derivatives, Chain Rule & Related Rates',
    cards: [
      {
        id: 'fc-1',
        front: 'What is the Chain Rule formula for composite function f(g(x))?',
        back: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)\n\nDifferentiate the outer function evaluated at the inner function, then multiply by the derivative of the inner function.',
        keyTakeaway: 'Always multiply by the derivative of the "inside"!',
        hint: 'Think "derivative of outer" times "derivative of inner".',
        status: 'unreviewed',
      },
      {
        id: 'fc-2',
        front: 'In Related Rates, what is the critical difference between constant dimensions and snapshot dimensions?',
        back: '• Constants (e.g., fixed ladder length) are frozen throughout the entire process and can be substituted BEFORE differentiating.\n• Snapshots (e.g., distance x when ladder slides) change over time and must ONLY be plugged in AFTER taking d/dt!',
        keyTakeaway: 'Never substitute changing values before d/dt.',
        hint: 'Ask yourself: Does this quantity stay the same for the whole experiment?',
        status: 'unreviewed',
      },
      {
        id: 'fc-3',
        front: 'What is the derivative of natural log ln(u) where u is a function of x?',
        back: 'd/dx [ln(u)] = (1/u) · (du/dx) = u\' / u',
        keyTakeaway: 'Derivative of argument divided by the argument.',
        hint: 'Use the Chain Rule on ln(x).',
        status: 'unreviewed',
      },
      {
        id: 'fc-4',
        front: 'What is implicit differentiation and when must you use it?',
        back: 'A technique used when an equation relating x and y cannot be easily solved explicitly for y (e.g., x² + y² = 25 or x·sin(y) = 4).\n\nYou differentiate each term with respect to x, treating y as an implicit function of x, meaning every time you differentiate a term with y, you multiply by dy/dx.',
        keyTakeaway: 'Multiply by dy/dx whenever differentiating y terms.',
        hint: 'Used for curves like circles and hyperbolas.',
        status: 'unreviewed',
      },
      {
        id: 'fc-5',
        front: 'What is the geometric meaning of the Mean Value Theorem (MVT)?',
        back: 'If a function f is continuous on [a, b] and differentiable on (a, b), there exists at least one point c in (a, b) where the instantaneous rate of change (tangent line slope f\'(c)) equals the average rate of change (secant line slope [f(b)-f(a)]/(b-a)).',
        keyTakeaway: 'Instantaneous velocity = Average velocity at at least one point.',
        hint: 'Secant line slope equals tangent line slope.',
        status: 'unreviewed',
      },
    ],
  },
  {
    id: 'deck-chem',
    title: 'Thermodynamics & Gibbs Free Energy',
    topic: 'Gibbs Free Energy & Spontaneity',
    subject: 'AP Chemistry',
    assignmentTitle: 'Thermodynamics & Gibbs Free Energy Problem Set #6',
    cards: [
      {
        id: 'fc-6',
        front: 'What is the Gibbs Free Energy equation, and what condition determines a spontaneous process?',
        back: 'ΔG = ΔH - TΔS\n\n• If ΔG < 0 (negative), the reaction is thermodynamically favored (spontaneous).\n• If ΔG > 0 (positive), non-spontaneous.\n• If ΔG = 0, system is at dynamic equilibrium.',
        keyTakeaway: 'ΔG < 0 is the hallmark of thermodynamic spontaneity.',
        hint: 'T must always be in Kelvin (K).',
        status: 'unreviewed',
      },
      {
        id: 'fc-7',
        front: 'When ΔH > 0 (endothermic) and ΔS > 0 (entropy increases), at what temperatures is the reaction spontaneous?',
        back: 'Spontaneous ONLY AT HIGH TEMPERATURES.\n\nAt high T, the -TΔS term becomes large and negative, overcoming the unfavorable positive ΔH.',
        keyTakeaway: 'High T drives reactions with positive entropy forward.',
        hint: 'Ice melting is endothermic (ΔH>0) with increasing entropy (ΔS>0). When does ice melt?',
        status: 'unreviewed',
      },
      {
        id: 'fc-8',
        front: 'What is the relationship between standard Gibbs Free Energy (ΔG°) and equilibrium constant K?',
        back: 'ΔG° = -RT ln(K)\n\n• If K > 1 (products favored), ln(K) > 0, so ΔG° < 0 (spontaneous under standard conditions).\n• If K < 1 (reactants favored), ln(K) < 0, so ΔG° > 0.',
        keyTakeaway: 'Large equilibrium constant K corresponds to negative standard ΔG°.',
        hint: 'R = 8.314 J/(mol·K). Check units with ΔG in kJ!',
        status: 'unreviewed',
      },
    ],
  },
];

