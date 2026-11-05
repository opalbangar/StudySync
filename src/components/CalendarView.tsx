import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Target, Sparkles } from 'lucide-react';
import { Assignment, Course } from '../types';

interface CalendarViewProps {
  assignments: Assignment[];
  courses: Course[];
  onSelectAssignment: (assignment: Assignment) => void;
  onLaunchPractice: (assignment: Assignment) => void;
  onLaunchLesson: (assignment: Assignment) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  assignments,
  courses,
  onSelectAssignment,
  onLaunchPractice,
  onLaunchLesson,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map assignments by YYYY-MM-DD
  const assignmentsByDate: Record<string, Assignment[]> = {};
  for (const asg of assignments) {
    const d = new Date(asg.dueDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    if (!assignmentsByDate[key]) assignmentsByDate[key] = [];
    assignmentsByDate[key].push(asg);
  }

  // Selected date's assignments
  const selectedAssignments = selectedDateStr ? assignmentsByDate[selectedDateStr] || [] : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-stone-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-md border border-stone-200 font-medium transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-[#EFE9E0] overflow-hidden shadow-2xs">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-[#EFE9E0] bg-[#FFFDF9] text-center py-2 text-xs font-semibold text-stone-500">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#EFE9E0]">
          {/* Leading empty cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-stone-50/30 p-1.5" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayAssignments = assignmentsByDate[dateStr] || [];
            
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            const isSelected = selectedDateStr === dateStr;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-rose-50/70 ring-1 ring-rose-300'
                    : isToday
                    ? 'bg-pink-50/40'
                    : 'bg-white hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-rose-400 text-white shadow-2xs'
                        : isSelected
                        ? 'text-rose-700 font-extrabold'
                        : 'text-stone-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayAssignments.length > 0 && (
                    <span className="text-[10px] font-semibold text-stone-500">
                      {dayAssignments.length}
                    </span>
                  )}
                </div>

                {/* Assignment chips */}
                <div className="space-y-1 overflow-hidden">
                  {dayAssignments.slice(0, 3).map((asg) => {
                    const course = courses.find((c) => c.id === asg.courseId);
                    return (
                      <div
                        key={asg.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAssignment(asg);
                        }}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded font-medium shadow-2xs hover:brightness-95 transition-all"
                        style={{
                          backgroundColor: `${course?.color || '#818CF8'}18`,
                          color: course?.color || '#818CF8',
                          border: `1px solid ${course?.color || '#818CF8'}30`,
                        }}
                        title={`${asg.courseName}: ${asg.title}`}
                      >
                        {asg.title}
                      </div>
                    );
                  })}
                  {dayAssignments.length > 3 && (
                    <span className="text-[9px] text-stone-500 block pl-1">
                      +{dayAssignments.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drawer / Details */}
      {selectedDateStr && (
        <div className="bg-white rounded-xl border border-[#EFE9E0] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-rose-500" />
              <span>
                Deadlines for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </h3>
            <span className="text-xs text-stone-500">
              {selectedAssignments.length} assignment{selectedAssignments.length === 1 ? '' : 's'}
            </span>
          </div>

          {selectedAssignments.length === 0 ? (
            <p className="text-xs text-stone-500 py-3 text-center">
              No assignments or exams scheduled for this date. Good day for study or relaxation!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedAssignments.map((asg) => {
                const course = courses.find((c) => c.id === asg.courseId);
                return (
                  <div
                    key={asg.id}
                    className="p-3 bg-[#FFFDF9] rounded-xl border border-stone-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${course?.color || '#818CF8'}18`,
                            color: course?.color || '#818CF8',
                          }}
                        >
                          {asg.courseName}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">{asg.priority} Priority</span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900 mb-1">{asg.title}</h4>
                      {asg.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-2">{asg.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/80 text-[11px]">
                      <span className="text-stone-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-rose-500" />
                        <span>{new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onLaunchPractice(asg)}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-semibold transition-colors border border-amber-200"
                        >
                          <Target className="w-3 h-3 text-amber-600" />
                          <span>Practice</span>
                        </button>
                        <button
                          onClick={() => onLaunchLesson(asg)}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded font-semibold transition-colors border border-sky-200"
                        >
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>Lesson</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
