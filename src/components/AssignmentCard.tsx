import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Target, 
  Sparkles, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Layers
} from 'lucide-react';
import { Assignment, Course, Priority } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
  course?: Course;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onLaunchPractice: (assignment: Assignment) => void;
  onLaunchLesson: (assignment: Assignment) => void;
  onLaunchFlashcards?: (assignment: Assignment) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  course,
  onToggleStatus,
  onToggleSubtask,
  onEdit,
  onDelete,
  onLaunchPractice,
  onLaunchLesson,
  onLaunchFlashcards,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Calculate relative due date
  const due = new Date(assignment.dueDate);
  const now = new Date();
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffHours / 24);

  let dueBadgeColor = 'bg-stone-50 text-stone-600 border-stone-200';
  let dueText = '';

  if (diffHours < 0) {
    dueBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    dueText = `Overdue by ${Math.abs(diffDays)}d`;
  } else if (diffHours <= 12) {
    dueBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    dueText = `Due in ${Math.max(1, Math.round(diffHours))}h`;
  } else if (diffDays <= 1) {
    dueBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    dueText = 'Due Tomorrow';
  } else if (diffDays <= 7) {
    dueBadgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
    dueText = `Due in ${diffDays} days`;
  } else {
    dueBadgeColor = 'bg-stone-50 text-stone-600 border-stone-200';
    dueText = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Priority color config (soft pastel)
  const priorityStyles: Record<Priority, { bg: string; text: string; border: string }> = {
    Urgent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    High: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Medium: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    Low: { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200' },
  };

  const priorityStyle = priorityStyles[assignment.priority] || priorityStyles.Medium;
  const isCompleted = assignment.status === 'completed';

  // Subtask progress
  const totalSubtasks = assignment.subtasks?.length || 0;
  const completedSubtasks = assignment.subtasks?.filter((s) => s.done).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-stone-50/70 border-stone-200 opacity-70'
          : 'bg-white hover:bg-[#FFFDF9] border-[#EFE9E0] hover:border-pink-200 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5">
        
        {/* Top Header: Course & Priority */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Course Tag */}
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
              style={{
                backgroundColor: `${course?.color || '#818CF8'}18`,
                color: course?.color || '#818CF8',
                border: `1px solid ${course?.color || '#818CF8'}30`,
              }}
            >
              {assignment.courseName}
            </span>

            {/* Type Tag */}
            <span className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
              {assignment.type}
            </span>

            {/* Priority Tag */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              {assignment.priority}
            </span>
          </div>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 mt-1 w-36 bg-white border border-[#EFE9E0] rounded-xl shadow-lg py-1 z-30 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                {onLaunchFlashcards && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLaunchFlashcards(assignment);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-purple-700 hover:bg-purple-50 font-medium"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Flashcards</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(assignment);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-stone-700 hover:bg-stone-50 font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(assignment.id);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Checkbox */}
        <div className="flex items-start space-x-3 mb-2">
          <button
            onClick={() => onToggleStatus(assignment.id)}
            className="mt-0.5 flex-shrink-0 text-stone-400 hover:text-rose-500 transition-colors"
            title={isCompleted ? 'Mark as to do' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 text-stone-400 hover:text-rose-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold leading-snug tracking-tight text-stone-900 ${isCompleted ? 'line-through text-stone-400' : ''}`}>
              {assignment.title}
            </h3>

            {assignment.description && (
              <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        {/* Topic Badges */}
        {assignment.topics && assignment.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 pl-8">
            {assignment.topics.map((t, i) => (
              <span key={i} className="text-[10px] text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded border border-stone-200">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Subtasks Progress Bar (if any) */}
        {totalSubtasks > 0 && (
          <div className="mb-3 pl-8">
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <button 
                onClick={() => setShowSubtasks(!showSubtasks)} 
                className="hover:text-stone-800 font-medium flex items-center space-x-1"
              >
                <span>Checklist ({completedSubtasks}/{totalSubtasks})</span>
                <span className="text-[10px] text-stone-400">[{showSubtasks ? 'hide' : 'show'}]</span>
              </button>
              <span className="font-semibold text-stone-700">{subtaskProgress}%</span>
            </div>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-rose-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>

            {/* Expanded subtask list */}
            {showSubtasks && (
              <div className="mt-2 space-y-1.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFE9E0]">
                {assignment.subtasks?.map((st) => (
                  <div 
                    key={st.id} 
                    onClick={() => onToggleSubtask(assignment.id, st.id)}
                    className="flex items-center space-x-2 text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none"
                  >
                    {st.done ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    )}
                    <span className={st.done ? 'line-through text-stone-400' : ''}>{st.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Due Date & Meta Row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${dueBadgeColor}`}>
              <Clock className="w-3 h-3" />
              <span>{dueText}</span>
            </div>

            {assignment.estimatedMinutes && (
              <span className="text-stone-400 text-[11px] hidden sm:inline flex items-center space-x-1">
                <span>~{assignment.estimatedMinutes}m prep</span>
              </span>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center space-x-1.5">
            {/* Step 2: Test Prep / Practice Problems */}
            <button
              onClick={() => onLaunchPractice(assignment)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 text-amber-900 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Generate practice problems and test questions for this assignment topic"
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Practice</span>
            </button>

            {/* Step 3: Extra Lesson if Confused */}
            <button
              onClick={() => onLaunchLesson(assignment)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100/70 border border-sky-200/80 text-sky-900 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Need an extra lesson? Generate a clear concept breakdown with analogies & worked examples"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Learn Topic</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
