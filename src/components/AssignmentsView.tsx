import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  List, 
  Grid3X3, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Plus, 
  BookOpen, 
  Clock,
  Sparkles,
  Target
} from 'lucide-react';
import { Assignment, Course } from '../types';
import { AssignmentCard } from './AssignmentCard';
import { CalendarView } from './CalendarView';

interface AssignmentsViewProps {
  assignments: Assignment[];
  courses: Course[];
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onAddAssignment: () => void;
  onLaunchPractice: (assignment: Assignment) => void;
  onLaunchLesson: (assignment: Assignment) => void;
  onLaunchFlashcards?: (assignment: Assignment) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  courses,
  onToggleStatus,
  onToggleSubtask,
  onEditAssignment,
  onDeleteAssignment,
  onAddAssignment,
  onLaunchPractice,
  onLaunchLesson,
  onLaunchFlashcards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_soon' | 'urgent' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'calendar'>('list');

  // Metrics
  const totalActive = assignments.filter((a) => a.status !== 'completed').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  const now = new Date();
  const dueSoonCount = assignments.filter((a) => {
    if (a.status === 'completed') return false;
    const diffHours = (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 36;
  }).length;

  const urgentCount = assignments.filter(
    (a) => a.status !== 'completed' && (a.priority === 'Urgent' || a.priority === 'High')
  ).length;

  // Filter logic
  const filteredAssignments = assignments.filter((a) => {
    // Course filter
    if (selectedCourseId !== 'all' && a.courseId !== selectedCourseId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchCourse = a.courseName.toLowerCase().includes(q);
      const matchTopics = a.topics?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCourse && !matchTopics) return false;
    }

    // Status filter
    if (statusFilter === 'completed') return a.status === 'completed';
    if (statusFilter === 'urgent') return a.status !== 'completed' && (a.priority === 'Urgent' || a.priority === 'High');
    if (statusFilter === 'due_soon') {
      if (a.status === 'completed') return false;
      const diffHours = (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 36;
    }

    return true;
  });

  // Sort: Incomplete first, then by due date ascending
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Active */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Active Tasks</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5 tracking-tight">{totalActive}</h3>
            <p className="text-[11px] text-stone-500 mt-0.5">Across {courses.length} courses</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Due Soon */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Due Soon (&lt;36h)</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-0.5 tracking-tight">{dueSoonCount}</h3>
            <p className="text-[11px] text-rose-600/80 mt-0.5">Requires prompt focus</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Urgent / High Priority */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Exams & High Priority</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5 tracking-tight">{urgentCount}</h3>
            <p className="text-[11px] text-amber-700/80 mt-0.5">Test prep recommended</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500">Completed Work</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5 tracking-tight">{completedCount}</h3>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Keep the streak going!</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search & Course Dropdown */}
        <div className="flex flex-1 items-center space-x-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments, topics, or classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Course Filter Dropdown */}
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-[#FFFDF9] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-rose-400 max-w-[150px] sm:max-w-[200px] truncate font-medium"
          >
            <option value="all">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs & View Toggle */}
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          
          {/* Status Pills */}
          <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('due_soon')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'due_soon' ? 'bg-rose-500 text-white shadow-2xs' : 'text-stone-600 hover:text-rose-700'
              }`}
            >
              Due Soon
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'urgent' ? 'bg-amber-500 text-white shadow-2xs' : 'text-stone-600 hover:text-amber-700'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-stone-600 hover:text-emerald-700'
              }`}
            >
              Done
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Timeline List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'matrix' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Priority Matrix View"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Monthly Calendar View"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'calendar' ? (
        <CalendarView
          assignments={sortedAssignments}
          courses={courses}
          onSelectAssignment={onEditAssignment}
          onLaunchPractice={onLaunchPractice}
          onLaunchLesson={onLaunchLesson}
        />
      ) : viewMode === 'matrix' ? (
        /* Priority Matrix View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Urgent & High Priority Column */}
          <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-200/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Immediate Focus (Urgent / Exams)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                {sortedAssignments.filter((a) => a.priority === 'Urgent' || a.priority === 'High').length}
              </span>
            </div>

            <div className="space-y-3">
              {sortedAssignments
                .filter((a) => a.priority === 'Urgent' || a.priority === 'High')
                .map((asg) => (
                  <AssignmentCard
                    key={asg.id}
                    assignment={asg}
                    course={courses.find((c) => c.id === asg.courseId)}
                    onToggleStatus={onToggleStatus}
                    onToggleSubtask={onToggleSubtask}
                    onEdit={onEditAssignment}
                    onDelete={onDeleteAssignment}
                    onLaunchPractice={onLaunchPractice}
                    onLaunchLesson={onLaunchLesson}
                    onLaunchFlashcards={onLaunchFlashcards}
                  />
                ))}
              {sortedAssignments.filter((a) => a.priority === 'Urgent' || a.priority === 'High').length === 0 && (
                <p className="text-xs text-stone-500 text-center py-6">No urgent deadlines pending!</p>
              )}
            </div>
          </div>

          {/* Standard & Regular Column */}
          <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-200/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-200">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Upcoming & Ongoing (Medium / Low)
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                {sortedAssignments.filter((a) => a.priority === 'Medium' || a.priority === 'Low').length}
              </span>
            </div>

            <div className="space-y-3">
              {sortedAssignments
                .filter((a) => a.priority === 'Medium' || a.priority === 'Low')
                .map((asg) => (
                  <AssignmentCard
                    key={asg.id}
                    assignment={asg}
                    course={courses.find((c) => c.id === asg.courseId)}
                    onToggleStatus={onToggleStatus}
                    onToggleSubtask={onToggleSubtask}
                    onEdit={onEditAssignment}
                    onDelete={onDeleteAssignment}
                    onLaunchPractice={onLaunchPractice}
                    onLaunchLesson={onLaunchLesson}
                    onLaunchFlashcards={onLaunchFlashcards}
                  />
                ))}
              {sortedAssignments.filter((a) => a.priority === 'Medium' || a.priority === 'Low').length === 0 && (
                <p className="text-xs text-stone-500 text-center py-6">No medium priority tasks.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Standard Timeline List View */
        <div className="space-y-3">
          {sortedAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#EFE9E0] p-8 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">No assignments match your filter</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                You're either all caught up or need to adjust your search and filters.
              </p>
              <button
                onClick={onAddAssignment}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add an Assignment</span>
              </button>
            </div>
          ) : (
            sortedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                course={courses.find((c) => c.id === assignment.courseId)}
                onToggleStatus={onToggleStatus}
                onToggleSubtask={onToggleSubtask}
                onEdit={onEditAssignment}
                onDelete={onDeleteAssignment}
                onLaunchPractice={onLaunchPractice}
                onLaunchLesson={onLaunchLesson}
                onLaunchFlashcards={onLaunchFlashcards}
              />
            ))
          )}
        </div>
      )}

    </div>
  );
};
