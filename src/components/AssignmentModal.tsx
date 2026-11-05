import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, Trash2, Tag, BookOpen, AlertCircle } from 'lucide-react';
import { Assignment, Course, Priority, AssignmentType } from '../types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignmentData: Partial<Assignment>) => void;
  courses: Course[];
  initialData?: Assignment | null;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  courses,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [type, setType] = useState<AssignmentType>('Homework');
  const [description, setDescription] = useState('');
  const [topicsString, setTopicsString] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [subtasks, setSubtasks] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCourseId(initialData.courseId);
      setDueDate(initialData.dueDate ? initialData.dueDate.slice(0, 16) : '');
      setPriority(initialData.priority);
      setType(initialData.type);
      setDescription(initialData.description || '');
      setTopicsString(initialData.topics?.join(', ') || '');
      setEstimatedMinutes(initialData.estimatedMinutes || 60);
      setSubtasks(initialData.subtasks || []);
    } else {
      setTitle('');
      setCourseId(courses[0]?.id || '');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      setDueDate(`${y}-${m}-${d}T23:59`);
      
      setPriority('Medium');
      setType('Homework');
      setDescription('');
      setTopicsString('');
      setEstimatedMinutes(60);
      setSubtasks([
        { id: 'st1', text: 'Review instructions & materials', done: false },
        { id: 'st2', text: 'Complete draft / problems', done: false },
        { id: 'st3', text: 'Final review and submit', done: false },
      ]);
    }
  }, [initialData, courses, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'st-' + Date.now(), text: newSubtaskText.trim(), done: false },
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];
    const topics = topicsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialData?.id,
      title: title.trim(),
      courseId: selectedCourse?.id || 'course-gen',
      courseName: selectedCourse?.name || 'General Subject',
      dueDate,
      priority,
      type,
      description: description.trim(),
      topics: topics.length > 0 ? topics : [selectedCourse?.name || 'Study'],
      estimatedMinutes: Number(estimatedMinutes) || 45,
      subtasks,
      status: initialData?.status || 'todo',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFDF9] border border-[#EFE9E0] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl text-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE9E0]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-rose-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">
              {initialData ? 'Edit Assignment' : 'Add New Assignment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 6 Problem Set: Thermodynamics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400 text-sm font-medium"
            />
          </div>

          {/* Course & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-rose-400 font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Assignment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssignmentType)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-rose-400 font-medium"
              >
                <option value="Homework">Homework / Problem Set</option>
                <option value="Exam">Exam / Midterm</option>
                <option value="Quiz">Quiz</option>
                <option value="Project">Project / Essay</option>
                <option value="Lab">Lab Experiment</option>
                <option value="Reading">Reading / Annotation</option>
              </select>
            </div>
          </div>

          {/* Due Date & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Due Date & Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-rose-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-rose-400 font-medium"
              >
                <option value="Urgent">🚨 Urgent (Immediate attention)</option>
                <option value="High">⚡ High (Important test or project)</option>
                <option value="Medium">📘 Medium (Standard homework)</option>
                <option value="Low">☕ Low (Light reading / optional)</option>
              </select>
            </div>
          </div>

          {/* Key Topics */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                <span>Key Topics Covered (used for AI Practice & Lessons)</span>
              </span>
              <span className="text-[10px] text-stone-400">Comma-separated</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Chain Rule, Related Rates, Derivatives"
              value={topicsString}
              onChange={(e) => setTopicsString(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Instructions & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add specific instructions, rubric details, or page numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Action Checklist / Subtasks
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs"
                >
                  <span className="text-stone-700 text-xs">{st.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add subtask (e.g. Solve odd numbered problems)..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Estimated Study Time */}
          <div className="flex items-center space-x-3 pt-1">
            <Clock className="w-4 h-4 text-stone-400" />
            <span className="text-stone-700 font-medium">Estimated Study / Prep Time:</span>
            <input
              type="number"
              min={10}
              max={360}
              step={10}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-20 bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-900 text-center focus:outline-none focus:border-rose-400 font-bold"
            />
            <span className="text-stone-500">minutes</span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-lg font-bold shadow-xs transition-all"
            >
              {initialData ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
