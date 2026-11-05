import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  Square, 
  Clock, 
  Target, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  BookOpen, 
  Award,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight
} from 'lucide-react';
import { Assignment, Course } from '../types';

interface FocusModeViewProps {
  assignments: Assignment[];
  courses: Course[];
  onExit: () => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onLaunchPractice: (assignment: Assignment) => void;
  onLaunchLesson: (assignment: Assignment) => void;
  onOpenTutor?: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  assignments,
  courses,
  onExit,
  onToggleStatus,
  onToggleSubtask,
  onLaunchPractice,
  onLaunchLesson,
  onOpenTutor,
}) => {
  // Sort pending tasks by priority (Urgent > High > Medium > Low) and then earliest due date
  const priorityWeights: Record<string, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const pendingAssignments = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => {
      const pDiff = (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Safeguard index if assignments list changes
  const activeAssignment = pendingAssignments[currentIndex] || pendingAssignments[0] || null;
  const course = activeAssignment ? courses.find((c) => c.id === activeAssignment.courseId) : null;

  // Deep Work Pomodoro Timer (in seconds)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60); // 25 minutes default
  const [timerTotal, setTimerTotal] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'25' | '50' | '5'>('25');

  // Handle keyboard shortcut 'Esc' to exit Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSetTimerMode = (mode: '25' | '50' | '5') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    const secs = mode === '25' ? 25 * 60 : mode === '50' ? 50 * 60 : 5 * 60;
    setTimerSeconds(secs);
    setTimerTotal(secs);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Subtasks calculation
  const totalSubtasks = activeAssignment?.subtasks?.length || 0;
  const completedSubtasks = activeAssignment?.subtasks?.filter((s) => s.done).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Relative due date calculation
  let dueText = '';
  if (activeAssignment) {
    const due = new Date(activeAssignment.dueDate);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);
    if (diffHours < 0) dueText = `Overdue by ${Math.abs(diffDays)}d`;
    else if (diffHours <= 12) dueText = `Due in ${Math.max(1, Math.round(diffHours))}h`;
    else if (diffDays <= 1) dueText = 'Due Tomorrow';
    else dueText = `Due ${due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  }

  // All caught up state
  if (!activeAssignment) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-stone-800">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-5 shadow-xs">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          All Priority Tasks Completed!
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-md leading-relaxed">
          You've cleared all urgent assignments. Take a well-deserved break or return to the dashboard to plan ahead.
        </p>
        <button
          onClick={onExit}
          className="mt-6 px-6 py-3 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-xs"
        >
          Exit Focus Mode
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5]/98 backdrop-blur-xl overflow-y-auto flex flex-col justify-between p-4 sm:p-8 animate-fade-in text-stone-800">
      
      {/* Top Floating Control Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#EFE9E0]">
        
        {/* Left: Focus Mode Badge & Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Zap className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>Deep Work Focus Mode</span>
          </div>

          {pendingAssignments.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-white border border-[#EFE9E0] rounded-lg p-1 text-xs shadow-2xs">
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pendingAssignments.length - 1))}
                className="p-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-50 transition-colors"
                title="Previous priority task"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-stone-600 px-1 font-semibold text-[11px]">
                Task {currentIndex + 1} of {pendingAssignments.length}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < pendingAssignments.length - 1 ? prev + 1 : 0))}
                className="p-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-50 transition-colors"
                title="Next priority task"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Exit Focus Mode Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Exit Focus Mode (Esc)"
          >
            <X className="w-4 h-4" />
            <span>Exit Focus Mode</span>
            <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-stone-100 text-stone-500 rounded border border-stone-200 ml-1">
              Esc
            </kbd>
          </button>
        </div>

      </div>

      {/* Main Focus Stage */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-8">
        
        {/* Course & Urgency Tag Row */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span
            className="px-3.5 py-1 rounded-lg text-sm font-semibold shadow-2xs"
            style={{
              backgroundColor: `${course?.color || '#818CF8'}18`,
              color: course?.color || '#818CF8',
              border: `1px solid ${course?.color || '#818CF8'}35`,
            }}
          >
            {activeAssignment.courseName}
          </span>

          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{dueText}</span>
          </span>

          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-[#EFE9E0] text-stone-600">
            {activeAssignment.type}
          </span>
        </div>

        {/* Extra Large Assignment Title */}
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
            {activeAssignment.title}
          </h1>

          {activeAssignment.description && (
            <p className="mt-4 text-base sm:text-xl text-stone-600 leading-relaxed max-w-3xl font-normal">
              {activeAssignment.description}
            </p>
          )}
        </div>

        {/* Subtask Action Checklist */}
        {totalSubtasks > 0 && (
          <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-rose-500" />
                <span>Action Checklist ({completedSubtasks}/{totalSubtasks})</span>
              </h3>
              <span className="text-sm font-bold text-rose-600">{subtaskProgress}% Complete</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-400 to-sky-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            {/* Large interactive items */}
            <div className="space-y-2.5 pt-2">
              {activeAssignment.subtasks?.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(activeAssignment.id, st.id)}
                  className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    st.done
                      ? 'bg-stone-50 border-stone-200/60 text-stone-400'
                      : 'bg-[#FFFDF9] hover:bg-white border-stone-200 text-stone-900 font-medium hover:border-rose-300 shadow-2xs'
                  }`}
                >
                  {st.done ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
                  )}
                  <span className={`text-base sm:text-lg ${st.done ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {st.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep Work Focus Timer & Quick Tools Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Deep Work Pomodoro Timer */}
          <div className="bg-white rounded-2xl border border-[#EFE9E0] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Deep Work Focus Timer</span>
              </span>

              {/* Mode switch */}
              <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg text-[11px] font-bold">
                <button
                  onClick={() => handleSetTimerMode('25')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    timerMode === '25' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  25m
                </button>
                <button
                  onClick={() => handleSetTimerMode('50')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    timerMode === '50' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  50m
                </button>
                <button
                  onClick={() => handleSetTimerMode('5')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    timerMode === '5' ? 'bg-emerald-50 text-emerald-700 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  5m Break
                </button>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center py-2">
              <div className="text-5xl sm:text-6xl font-black text-stone-900 font-mono tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {isTimerRunning ? '✨ Deep focus session running... distraction free' : 'Timer paused. Ready when you are.'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                  isTimerRunning
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    : 'bg-rose-400 hover:bg-rose-500 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4 fill-amber-900" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isTimerRunning ? 'Pause Focus' : 'Start Focus Timer'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  const secs = timerMode === '25' ? 25 * 60 : timerMode === '50' ? 50 * 60 : 5 * 60;
                  setTimerSeconds(secs);
                }}
                className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Focus Tools (AI Practice, Lessons, Tutor) */}
          <div className="bg-white rounded-2xl border border-[#EFE9E0] p-5 flex flex-col justify-between shadow-sm space-y-3">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Need Help on This Assignment?
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                Stay locked in your study flow. Launch targeted test prep or extra lessons without losing your place.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onLaunchPractice(activeAssignment)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-900 font-semibold text-xs transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>Practice Core Problems for this Task</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                onClick={() => onLaunchLesson(activeAssignment)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 border border-sky-200 text-sky-900 font-semibold text-xs transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Confused? Open Extra Lesson on Topic</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
              </button>

              {onOpenTutor && (
                <button
                  onClick={onOpenTutor}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-pink-50 hover:bg-pink-100/70 border border-pink-200 text-rose-900 font-semibold text-xs transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>Ask AI Tutor a Quick Question</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Task Completion Celebration Action */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              onToggleStatus(activeAssignment.id);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Mark Assignment Completed & Celebrate 🎉</span>
          </button>

          {pendingAssignments.length > 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => (prev < pendingAssignments.length - 1 ? prev + 1 : 0))}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium flex items-center space-x-1"
            >
              <span>Work on next priority task</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Bottom Subtle Status Bar */}
      <div className="max-w-5xl w-full mx-auto pt-4 border-t border-[#EFE9E0] flex items-center justify-between text-xs text-stone-500">
        <span>Deep Work Session • Press Esc anytime to return</span>
        <span>ScholarSync Focus Engine</span>
      </div>

    </div>
  );
};
