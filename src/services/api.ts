import { ExtraLesson, PracticeQuestion } from '../types';

export interface PracticeQuizResponse {
  title: string;
  topic: string;
  difficulty: string;
  overview: string;
  questions: PracticeQuestion[];
}

export async function fetchPracticeProblems(params: {
  subject: string;
  topic: string;
  difficulty?: string;
  questionCount?: number;
  assignmentTitle?: string;
  type?: string;
}): Promise<PracticeQuizResponse> {
  const res = await fetch('/api/ai/practice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate practice problems (${res.status})`);
  }

  return res.json();
}

export async function fetchFlashcards(params: {
  subject: string;
  topic: string;
  assignmentTitle?: string;
  count?: number;
}): Promise<{
  deckTitle: string;
  topic: string;
  subject: string;
  cards: { id: string; front: string; back: string; keyTakeaway?: string; hint?: string }[];
}> {
  const res = await fetch('/api/ai/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate flashcards (${res.status})`);
  }

  return res.json();
}

export async function fetchExtraLesson(params: {
  topic: string;
  subject?: string;
  learningStyle?: string;
  confusionDetail?: string;
}): Promise<ExtraLesson> {
  const res = await fetch('/api/ai/lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate extra lesson (${res.status})`);
  }

  const data = await res.json();
  return {
    ...data,
    id: 'lesson-' + Math.random().toString(36).substring(2, 9),
    subject: params.subject || 'General Study',
    topic: params.topic,
  };
}

export async function askTutor(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  topic: string;
  subject?: string;
}): Promise<{ role: 'assistant'; content: string }> {
  const res = await fetch('/api/ai/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get tutor answer (${res.status})`);
  }

  return res.json();
}

export async function parseSyllabus(params: {
  rawText: string;
  defaultCourseName?: string;
}): Promise<{
  detectedCourses: { name: string; code: string; color: string }[];
  assignments: any[];
}> {
  const res = await fetch('/api/ai/extract-assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to parse syllabus (${res.status})`);
  }

  return res.json();
}

export async function syncCanvasOrICal(params: {
  canvasUrl?: string;
  apiToken?: string;
  icalUrl?: string;
}): Promise<any> {
  const res = await fetch('/api/canvas/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to connect with Canvas / iCal (${res.status})`);
  }

  return res.json();
}
