export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type AssignmentStatus = 'todo' | 'in_progress' | 'submitted' | 'completed';
export type AssignmentType = 'Homework' | 'Exam' | 'Quiz' | 'Project' | 'Reading' | 'Lab';
export type PlatformType = 'canvas' | 'classroom' | 'ical' | 'manual';

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  color: string;
  platform: PlatformType;
  grade?: string;
}

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string; // ISO string e.g. "2026-11-06T23:59"
  priority: Priority;
  status: AssignmentStatus;
  type: AssignmentType;
  description?: string;
  topics: string[];
  estimatedMinutes?: number;
  subtasks?: Subtask[];
  score?: string;
  canvasUrl?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  keyConcept: string;
}

export interface PracticeSession {
  id: string;
  title: string;
  topic: string;
  subject: string;
  difficulty: 'Foundations' | 'Standard' | 'AP / Challenge';
  overview: string;
  questions: PracticeQuestion[];
  userAnswers: Record<string, number>;
  completed: boolean;
  scorePercentage?: number;
  createdAt: string;
}

export interface ExtraLesson {
  id: string;
  topic: string;
  subject: string;
  title: string;
  readTimeMinutes: number;
  coreIdea: string;
  analogy: {
    title: string;
    story: string;
  };
  sections: {
    heading: string;
    content: string;
    keyRule?: string | null;
  }[];
  commonPitfalls: {
    mistake: string;
    whyItHappens: string;
    howToAvoid: string;
  }[];
  workedExample: {
    problemStatement: string;
    steps: {
      stepNumber: number;
      action: string;
      explanation: string;
    }[];
    finalAnswer: string;
    proTip: string;
  };
  quickCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type FlashcardMasteryStatus = 'unreviewed' | 'mastered' | 'review';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  keyTakeaway?: string;
  hint?: string;
  status?: FlashcardMasteryStatus;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  topic: string;
  subject: string;
  assignmentTitle?: string;
  cards: Flashcard[];
}

