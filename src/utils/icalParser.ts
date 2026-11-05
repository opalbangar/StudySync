import { Assignment, Course } from '../types';

export function parseICS(icsContent: string, defaultCourseId?: string): { assignments: Partial<Assignment>[]; detectedCourses: string[] } {
  const lines = icsContent.split(/\r\n|\n|\r/);
  const events: any[] = [];
  let currentEvent: any = null;
  const detectedCoursesSet = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Handle multi-line folding in ICS (lines beginning with whitespace)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      line += lines[i + 1].slice(1);
      i++;
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const keyPart = line.slice(0, colonIdx);
        const value = line.slice(colonIdx + 1).trim();
        const mainKey = keyPart.split(';')[0].toUpperCase();

        if (mainKey === 'SUMMARY') {
          currentEvent.summary = value.replace(/\\,/g, ',').replace(/\\;/g, ';');
        } else if (mainKey === 'DTSTART' || mainKey === 'DTEND') {
          currentEvent[mainKey.toLowerCase()] = parseICSDate(value);
        } else if (mainKey === 'DESCRIPTION') {
          currentEvent.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
        } else if (mainKey === 'URL') {
          currentEvent.url = value;
        } else if (mainKey === 'CATEGORIES') {
          currentEvent.categories = value;
        }
      }
    }
  }

  const assignments: Partial<Assignment>[] = [];

  for (const ev of events) {
    if (!ev.summary) continue;

    // Canvas often formats summary like: "Homework 4 [CS 101]" or "Essay 2 (AP Literature)"
    let title = ev.summary;
    let courseName = 'Imported Course';

    const bracketMatch = ev.summary.match(/\[(.*?)\]/) || ev.summary.match(/\((.*?)\)/);
    if (bracketMatch) {
      courseName = bracketMatch[1].trim();
      title = ev.summary.replace(bracketMatch[0], '').trim();
    } else if (ev.categories) {
      courseName = ev.categories;
    }

    detectedCoursesSet.add(courseName);

    // Determine type
    let type: any = 'Homework';
    const lower = (title + ' ' + (ev.description || '')).toLowerCase();
    if (lower.includes('exam') || lower.includes('midterm') || lower.includes('final')) {
      type = 'Exam';
    } else if (lower.includes('quiz')) {
      type = 'Quiz';
    } else if (lower.includes('project')) {
      type = 'Project';
    } else if (lower.includes('reading') || lower.includes('read chapter')) {
      type = 'Reading';
    } else if (lower.includes('lab')) {
      type = 'Lab';
    }

    // Determine priority
    let priority: any = 'Medium';
    if (type === 'Exam') priority = 'Urgent';
    else if (type === 'Project' || type === 'Quiz') priority = 'High';

    const dueDate = ev.dtend || ev.dtstart || new Date().toISOString();

    assignments.push({
      id: 'ics-' + Math.random().toString(36).substring(2, 9),
      title: title || 'Course Assignment',
      courseName,
      dueDate,
      priority,
      status: 'todo',
      type,
      description: ev.description || '',
      topics: [courseName],
      estimatedMinutes: type === 'Exam' ? 120 : type === 'Project' ? 90 : 45,
      canvasUrl: ev.url || '',
      subtasks: [
        { id: 'st1', text: 'Review lecture notes & instructions', done: false },
        { id: 'st2', text: 'Complete draft / core problems', done: false },
        { id: 'st3', text: 'Proofread and submit to LMS', done: false },
      ],
    });
  }

  return {
    assignments,
    detectedCourses: Array.from(detectedCoursesSet),
  };
}

function parseICSDate(dateStr: string): string {
  // e.g. 20261108T235900Z or 20261108
  if (!dateStr) return new Date().toISOString();

  // Strip timezone prefixes if any (e.g. TZID=America/New_York:20261108T180000)
  const clean = dateStr.includes(':') ? dateStr.split(':').pop()! : dateStr;

  const year = clean.slice(0, 4);
  const month = clean.slice(4, 6);
  const day = clean.slice(6, 8);

  if (clean.includes('T')) {
    const timePart = clean.split('T')[1].replace('Z', '');
    const hour = timePart.slice(0, 2);
    const minute = timePart.slice(2, 4);
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  return `${year}-${month}-${day}T23:59`;
}
