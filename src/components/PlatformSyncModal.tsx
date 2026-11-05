import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Upload, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  School,
  Database
} from 'lucide-react';
import { Course, Assignment } from '../types';
import { syncCanvasOrICal, parseSyllabus } from '../services/api';
import { parseICS } from '../utils/icalParser';
import { INITIAL_COURSES, INITIAL_ASSIGNMENTS } from '../data/initialData';

interface PlatformSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCourses: Course[], newAssignments: Assignment[]) => void;
  onResetToDemo: (courses: Course[], assignments: Assignment[]) => void;
}

export const PlatformSyncModal: React.FC<PlatformSyncModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onResetToDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'ical' | 'syllabus' | 'presets'>('canvas');
  
  // Canvas Form
  const [canvasUrl, setCanvasUrl] = useState('https://canvas.instructure.com');
  const [apiToken, setApiToken] = useState('');
  
  // iCal Form
  const [icalUrl, setIcalUrl] = useState('');
  const [icsFile, setIcsFile] = useState<File | null>(null);

  // Syllabus Form
  const [syllabusText, setSyllabusText] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // 1. Sync Canvas via API Proxy
  const handleSyncCanvas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canvasUrl.trim() || !apiToken.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Canvas School URL and Access Token.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const data = await syncCanvasOrICal({
        canvasUrl: canvasUrl.trim(),
        apiToken: apiToken.trim(),
      });

      if (data.courses && Array.isArray(data.courses)) {
        const colors = ['#818CF8', '#38BDF8', '#F59E0B', '#34D399', '#FB7185', '#A78BFA'];
        const mappedCourses: Course[] = data.courses.map((c: any, idx: number) => ({
          id: 'canvas-c-' + c.id,
          name: c.name || c.course_code || 'Canvas Course',
          code: c.course_code || 'CANV',
          instructor: 'Canvas Instructor',
          color: colors[idx % colors.length],
          platform: 'canvas',
          grade: c.enrollments?.[0]?.computed_current_score
            ? `${c.enrollments[0].computed_current_score}%`
            : undefined,
        }));

        const mappedAssignments: Assignment[] = (data.assignments || []).map((a: any) => {
          const course = mappedCourses.find((c) => c.id === 'canvas-c-' + a.courseId) || mappedCourses[0];
          return {
            id: 'canvas-a-' + a.id,
            title: a.name || 'Untitled Canvas Assignment',
            courseId: course?.id || 'course-gen',
            courseName: course?.name || a.courseName || 'Canvas Course',
            dueDate: a.due_at || new Date().toISOString(),
            priority: a.points_possible > 50 ? 'High' : 'Medium',
            status: a.has_submitted_submissions ? 'submitted' : 'todo',
            type: (a.submission_types?.includes('online_quiz') ? 'Quiz' : 'Homework') as any,
            description: a.description ? a.description.replace(/<[^>]+>/g, '').slice(0, 300) : '',
            topics: [course?.name || 'Canvas'],
            estimatedMinutes: 60,
            canvasUrl: a.html_url,
            subtasks: [
              { id: 'st1', text: 'Review Canvas instructions and rubric', done: false },
              { id: 'st2', text: 'Complete and submit assignment work', done: false },
            ],
          };
        });

        onImportSuccess(mappedCourses, mappedAssignments);
        setStatusMessage({
          type: 'success',
          text: `Successfully connected! Imported ${mappedCourses.length} courses and ${mappedAssignments.length} assignments.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Could not connect to Canvas. Please verify your token and URL.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Sync via iCal Feed URL or .ics File
  const handleSyncICal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      let icsContent = '';

      if (icsFile) {
        icsContent = await icsFile.text();
      } else if (icalUrl.trim()) {
        const response = await syncCanvasOrICal({ icalUrl: icalUrl.trim() });
        icsContent = response.data;
      } else {
        setStatusMessage({ type: 'error', text: 'Please enter an iCal Feed URL or upload an .ics file.' });
        setIsLoading(false);
        return;
      }

      const { assignments: parsedAsgs, detectedCourses } = parseICS(icsContent);

      const colors = ['#818CF8', '#38BDF8', '#F59E0B', '#34D399', '#FB7185', '#A78BFA'];
      const newCourses: Course[] = detectedCourses.map((cName, idx) => ({
        id: 'ical-c-' + idx,
        name: cName,
        code: cName.slice(0, 8).toUpperCase(),
        color: colors[idx % colors.length],
        platform: 'ical',
      }));

      const newAssignments: Assignment[] = parsedAsgs.map((pa, idx) => {
        const course = newCourses.find((c) => c.name === pa.courseName) || newCourses[0];
        return {
          id: 'ical-asg-' + idx + '-' + Date.now(),
          title: pa.title || 'Course Assignment',
          courseId: course?.id || 'course-gen',
          courseName: pa.courseName || 'Imported Course',
          dueDate: pa.dueDate || new Date().toISOString(),
          priority: pa.priority || 'Medium',
          status: 'todo',
          type: pa.type || 'Homework',
          description: pa.description || '',
          topics: [pa.courseName || 'Coursework'],
          estimatedMinutes: pa.estimatedMinutes || 60,
          subtasks: pa.subtasks || [
            { id: 'st1', text: 'Review materials & instructions', done: false },
            { id: 'st2', text: 'Complete work & submit', done: false },
          ],
        };
      });

      onImportSuccess(newCourses, newAssignments);
      setStatusMessage({
        type: 'success',
        text: `iCal Feed parsed! Imported ${newCourses.length} classes and ${newAssignments.length} deadlines.`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error parsing iCal feed. Please check the URL or file format.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Sync via AI Syllabus Text Extractor
  const handleSyncSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste syllabus text or assignment schedule.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await parseSyllabus({ rawText: syllabusText });
      
      const newCourses: Course[] = result.detectedCourses.map((c, idx) => ({
        id: 'syl-c-' + idx,
        name: c.name,
        code: c.code || 'COURSE',
        color: c.color || '#818CF8',
        platform: 'manual',
      }));

      const newAssignments: Assignment[] = result.assignments.map((a: any, idx: number) => {
        const matchedCourse = newCourses.find((c) => c.name.toLowerCase() === a.course.toLowerCase()) || newCourses[0];
        return {
          id: 'syl-asg-' + idx + '-' + Date.now(),
          title: a.title,
          courseId: matchedCourse?.id || 'course-gen',
          courseName: matchedCourse?.name || a.course,
          dueDate: a.dueDate,
          priority: a.priority || 'Medium',
          status: 'todo',
          type: a.type || 'Homework',
          description: a.description || '',
          topics: a.keyTopics || [matchedCourse?.name || 'Classwork'],
          estimatedMinutes: a.estimatedMinutes || 60,
          subtasks: [
            { id: 'st1', text: 'Complete problem sets / reading', done: false },
            { id: 'st2', text: 'Prepare for submission', done: false },
          ],
        };
      });

      onImportSuccess(newCourses, newAssignments);
      setStatusMessage({
        type: 'success',
        text: `AI extracted ${newCourses.length} courses and ${newAssignments.length} assignments from syllabus!`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error parsing syllabus text. Please verify formatting.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Reset to Realistic Demo Data
  const handleLoadDemo = () => {
    onResetToDemo(INITIAL_COURSES, INITIAL_ASSIGNMENTS);
    setStatusMessage({
      type: 'success',
      text: 'Loaded complete high school / college AP academic profile with realistic courses, exams, and due dates!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFDF9] border border-[#EFE9E0] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl text-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE9E0]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Connect School Platform & Sync</h2>
              <p className="text-xs text-stone-500">Import assignments, classes, and deadlines into ScholarSync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EFE9E0] bg-stone-50/70 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'canvas'
                ? 'border-rose-400 text-rose-800 bg-[#FFFDF9]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <School className="w-3.5 h-3.5 text-rose-500" />
            <span>Canvas LMS Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('ical')}
            className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ical'
                ? 'border-rose-400 text-rose-800 bg-[#FFFDF9]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>iCal / Calendar Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'syllabus'
                ? 'border-rose-400 text-rose-800 bg-[#FFFDF9]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Syllabus Extractor</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'presets'
                ? 'border-rose-400 text-rose-800 bg-[#FFFDF9]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sample Presets</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 text-xs space-y-4">
          
          {/* Feedback alerts */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-start space-x-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: Canvas LMS Direct */}
          {activeTab === 'canvas' && (
            <form onSubmit={handleSyncCanvas} className="space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-1">
                <h4 className="font-semibold text-stone-900">How to connect Canvas LMS:</h4>
                <ol className="list-decimal list-inside text-stone-600 space-y-1 leading-relaxed">
                  <li>Log into your school's Canvas portal (e.g. your university or high school Canvas).</li>
                  <li>Go to <strong>Account</strong> &gt; <strong>Settings</strong>.</li>
                  <li>Scroll to <strong>Approved Integrations</strong> and click <strong>+ New Access Token</strong>.</li>
                  <li>Copy and paste your token below to automatically sync courses and due dates!</li>
                </ol>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Canvas Instance URL</label>
                <input
                  type="url"
                  placeholder="https://canvas.instructure.com or https://school.instructure.com"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Canvas Access Token</label>
                <input
                  type="password"
                  placeholder="Paste your Canvas personal access token here"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-rose-400 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Canvas & Syncing...</span>
                  </>
                ) : (
                  <span>Sync Courses & Assignments from Canvas</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: iCal Calendar Feed */}
          {activeTab === 'ical' && (
            <form onSubmit={handleSyncICal} className="space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-1">
                <h4 className="font-semibold text-stone-900">Universal iCal / Calendar Subscription:</h4>
                <p className="text-stone-600 leading-relaxed">
                  Every Canvas account, Google Classroom, and school portal provides a standard Calendar Feed URL (ends in <code>.ics</code>).
                  In Canvas, go to <strong>Calendar</strong> &gt; click <strong>Calendar Feed</strong> on the bottom right.
                </p>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Calendar Feed URL (.ics)</label>
                <input
                  type="text"
                  placeholder="https://canvas.instructure.com/feeds/calendars/user_XXXX.ics or webcal://..."
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-400 text-xs"
                />
              </div>

              <div className="text-center text-stone-400 font-semibold">— OR —</div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Upload Exported .ics Calendar File</label>
                <input
                  type="file"
                  accept=".ics"
                  onChange={(e) => setIcsFile(e.target.files?.[0] || null)}
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-400 file:text-white hover:file:bg-rose-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Parsing Calendar Feed...</span>
                  </>
                ) : (
                  <span>Import Deadlines from iCal Feed</span>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: AI Syllabus / Schedule Extractor */}
          {activeTab === 'syllabus' && (
            <form onSubmit={handleSyncSyllabus} className="space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900">Paste Syllabus or Class Schedule:</h4>
                <p className="text-stone-600 mt-1">
                  Paste course syllabi, weekly reading lists, homework schedules, or exam dates. Gemini AI will automatically extract classes, due dates, and priorities.
                </p>
              </div>

              <div>
                <textarea
                  rows={6}
                  placeholder={`Example:
AP Calculus BC - Fall Semester
Sept 15: Limits Homework #1
Oct 10: Midterm Exam on Derivatives
Nov 5: Related Rates Problem Set due 11:59pm
Nov 20: Unit 4 Taylor Series Test`}
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg p-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI is parsing schedule dates...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Assignments with AI</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: Sample Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-900">Instant Academic Presets:</h4>
                <p className="text-stone-600 mt-0.5">
                  Want to explore immediately without entering credentials? Load pre-configured sample courses, homework deadlines, test dates, and practice sets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={handleLoadDemo}
                  className="p-4 bg-white hover:bg-rose-50/20 border border-stone-200 rounded-xl cursor-pointer transition-all hover:border-rose-300 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <h5 className="font-bold text-stone-900">High School AP Scholar Profile</h5>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Includes AP Calculus BC, AP Chemistry, APUSH, English Lit, and CS Data Structures with active assignments due this week.
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-rose-600 mt-1">
                    Click to load 1-click preset →
                  </span>
                </div>

                <div
                  onClick={() => {
                    onImportSuccess([], []);
                    setStatusMessage({ type: 'success', text: 'Tracker reset to fresh blank state.' });
                  }}
                  className="p-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl cursor-pointer transition-all hover:border-stone-400 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                    <h5 className="font-bold text-stone-900">Clean Blank Workspace</h5>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Wipe sample items to start tracking your own custom school schedule from scratch.
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-stone-600 mt-1">
                    Reset to empty →
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
