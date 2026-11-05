import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON cleaning
function extractJsonFromText(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// 1. AI Practice Problems Generator (Test Prep)
app.post('/api/ai/practice', async (req, res) => {
  try {
    const { subject, topic, difficulty = 'Standard', questionCount = 5, assignmentTitle, type = 'Multiple Choice' } = req.body;

    if (!topic && !subject) {
      return res.status(400).json({ error: 'Subject or topic is required' });
    }

    const prompt = `You are an expert high school and college tutor specializing in test preparation.
Generate a structured practice quiz for a student studying:
- Subject: ${subject || 'General'}
- Topic: ${topic}
${assignmentTitle ? `- Related Assignment/Context: ${assignmentTitle}` : ''}
- Difficulty Level: ${difficulty} (Options: Foundations, Standard, AP/Honors/Advanced)
- Question Count: ${questionCount}
- Format: ${type}

Ensure questions test genuine understanding, application, and problem solving—not just trivial memorization.
For each question, provide 4 distinct answer choices, the correct index (0-3), a thoughtful progressive hint, a clear step-by-step explanation, and the key concept being tested.

Return strictly valid JSON matching this schema:
{
  "title": "string",
  "topic": "string",
  "difficulty": "string",
  "overview": "string",
  "questions": [
    {
      "id": "q1",
      "question": "string (clear and mathematically/conceptually rigorous)",
      "type": "multiple_choice",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "hint": "string (nudges them without giving away the direct answer)",
      "explanation": "string (step-by-step breakdown of why this option is correct and why common distractors are wrong)",
      "keyConcept": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating practice problems:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate practice problems',
      details: 'Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
    });
  }
});

// Flashcards Generator from Assignment Topics
app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { subject, topic, assignmentTitle, count = 8 } = req.body;

    if (!topic && !subject) {
      return res.status(400).json({ error: 'Subject or topic is required' });
    }

    const prompt = `You are an expert academic tutor and cognitive learning specialist.
Generate a high-yield study flashcard deck for:
- Subject: ${subject || 'General Academic'}
- Topic: ${topic}
${assignmentTitle ? `- Related Assignment: ${assignmentTitle}` : ''}
- Target Card Count: ${count}

Create flashcards designed for active recall.
The "front" should be a high-impact question, core term, conceptual scenario, or formula prompt.
The "back" should provide a crystal-clear, structured explanation with key points and derivations.
Include a helpful "hint" and a concise "keyTakeaway" for each card.

Return strictly valid JSON matching this schema:
{
  "deckTitle": "string",
  "topic": "string",
  "subject": "string",
  "cards": [
    {
      "id": "c1",
      "front": "string",
      "back": "string",
      "keyTakeaway": "string",
      "hint": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate flashcards',
    });
  }
});

// 2. AI Extra Lessons Generator (When Confused)
app.post('/api/ai/lesson', async (req, res) => {
  try {
    const { topic, subject, learningStyle = 'Intuitive & Analogies', confusionDetail } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `You are a world-class, empathetic educator and master teacher.
A student is confused and requested an extra lesson on:
- Subject: ${subject || 'General Academic'}
- Topic: ${topic}
- Specific Confusion / Question: ${confusionDetail || 'Needs a clear, crystal-clear explanation from the ground up'}
- Preferred Learning Style: ${learningStyle} (e.g., 'Intuitive & Analogies', 'Step-by-Step Rigorous', 'Visual & Mental Models', 'Common Pitfalls & Fixes')

Break this down into an engaging, high-clarity lesson that makes difficult concepts click.
Include:
1. An intuitive hook/analogy that builds a mental model.
2. 3 progressive digestible sections explaining the core rules, principles, and concepts.
3. "Common Pitfalls" (why students frequently stumble on this on exams).
4. A full worked example showing step-by-step thinking.
5. A 2-question interactive "Check Your Understanding" checkpoint.

Return strictly valid JSON matching this schema:
{
  "title": "string",
  "topic": "string",
  "readTimeMinutes": 5,
  "coreIdea": "string (1-2 sentence core insight)",
  "analogy": {
    "title": "string",
    "story": "string"
  },
  "sections": [
    {
      "heading": "string",
      "content": "string",
      "keyRule": "string or null"
    }
  ],
  "commonPitfalls": [
    {
      "mistake": "string",
      "whyItHappens": "string",
      "howToAvoid": "string"
    }
  ],
  "workedExample": {
    "problemStatement": "string",
    "steps": [
      {
        "stepNumber": 1,
        "action": "string",
        "explanation": "string"
      }
    ],
    "finalAnswer": "string",
    "proTip": "string"
  },
  "quickCheck": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating lesson:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate extra lesson',
    });
  }
});

// 3. AI Interactive Tutor Chat (Follow-up questions)
app.post('/api/ai/tutor', async (req, res) => {
  try {
    const { messages, topic, subject } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemInstruction = `You are ScholarSync Tutor, a patient, encouraging, and pedagogically skilled AI study tutor.
Current Context:
- Subject: ${subject || 'School'}
- Topic: ${topic || 'General'}

Guidelines:
- Guide the student step by step rather than doing the entire assignment for them.
- Ask clarifying questions to diagnose misconceptions.
- Use simple markdown formatting (bolding key terms, numbered steps, code/math notation where relevant).
- Keep explanations crisp, warm, and easy to read.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      role: 'assistant',
      content: response.text || 'I am here to help! Could you clarify which part of this topic you are working through?',
    });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get tutor response',
    });
  }
});

// 4. Syllabus / Schedule Text Parser to extract courses and assignments
app.post('/api/ai/extract-assignments', async (req, res) => {
  try {
    const { rawText, defaultCourseName } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Raw text is required' });
    }

    const prompt = `You are an academic schedule parser.
Analyze this raw syllabus, assignment schedule, or notes:
"""
${rawText.slice(0, 8000)}
"""

Extract all upcoming courses, assignments, due dates, test dates, and project milestones.
For dates, if no exact year is provided, assume current school year 2026-2027. Format due dates as YYYY-MM-DD or YYYY-MM-DDTHH:mm.
Estimate priorities (Low, Medium, High, Urgent) and approximate study time in minutes.

Return strictly valid JSON matching this schema:
{
  "detectedCourses": [
    { "name": "string", "code": "string", "color": "string (hex color like #4f46e5, #059669, #d97706, #dc2626)" }
  ],
  "assignments": [
    {
      "title": "string",
      "course": "string",
      "dueDate": "string (YYYY-MM-DDTHH:mm or YYYY-MM-DD)",
      "priority": "Low" | "Medium" | "High" | "Urgent",
      "type": "Homework" | "Exam" | "Quiz" | "Project" | "Reading",
      "description": "string",
      "estimatedMinutes": 60,
      "keyTopics": ["string", "string"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error parsing syllabus:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract assignments from syllabus',
    });
  }
});

// 5. Canvas LMS / iCal Proxy to bypass browser CORS
app.post('/api/canvas/proxy', async (req, res) => {
  try {
    const { canvasUrl, apiToken, icalUrl } = req.body;

    // If iCal URL is provided (standard Canvas calendar feed)
    if (icalUrl) {
      let fetchUrl = icalUrl.trim();
      if (fetchUrl.startsWith('webcal://')) {
        fetchUrl = fetchUrl.replace('webcal://', 'https://');
      }
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch calendar feed: ${response.statusText}` });
      }
      const icsText = await response.text();
      return res.json({ format: 'ical', data: icsText });
    }

    // Direct Canvas LMS REST API call
    if (canvasUrl && apiToken) {
      const sanitizedBase = canvasUrl.replace(/\/+$/, '');
      const coursesRes = await fetch(`${sanitizedBase}/api/v1/courses?enrollment_state=active&include[]=total_scores`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: 'application/json',
        },
      });

      if (!coursesRes.ok) {
        return res.status(coursesRes.status).json({
          error: `Canvas error (${coursesRes.status}): Please check your School Canvas URL and Access Token.`,
        });
      }

      const courses = await coursesRes.json();
      
      // Fetch upcoming assignments for active courses
      const assignmentsPromises = courses.slice(0, 6).map(async (c: any) => {
        try {
          const aRes = await fetch(`${sanitizedBase}/api/v1/courses/${c.id}/assignments?per_page=15&order_by=due_at`, {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              Accept: 'application/json',
            },
          });
          if (aRes.ok) {
            const list = await aRes.json();
            return list.map((item: any) => ({
              ...item,
              courseName: c.name || c.course_code || 'Canvas Course',
              courseId: c.id,
            }));
          }
          return [];
        } catch {
          return [];
        }
      });

      const assignmentResults = await Promise.all(assignmentsPromises);
      const allAssignments = assignmentResults.flat();

      return res.json({
        format: 'canvas_api',
        courses,
        assignments: allAssignments,
      });
    }

    return res.status(400).json({ error: 'Please provide either a Canvas URL + API Token, or an iCal Feed URL.' });
  } catch (error: any) {
    console.error('Canvas proxy error:', error);
    return res.status(500).json({ error: error?.message || 'Error connecting to Canvas' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ScholarSync server running on http://0.0.0.0:${port}`);
  });
}

startServer();
