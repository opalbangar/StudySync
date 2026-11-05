/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoadmapBanner } from './components/RoadmapBanner';
import { AssignmentsView } from './components/AssignmentsView';
import { DashboardView } from './components/DashboardView';
import { FlashcardsView } from './components/FlashcardsView';
import { PracticeStudio } from './components/PracticeStudio';
import { LessonStudio } from './components/LessonStudio';
import { AssignmentModal } from './components/AssignmentModal';
import { PlatformSyncModal } from './components/PlatformSyncModal';
import { TutorDrawer } from './components/TutorDrawer';
import { Assignment, Course } from './types';
import { INITIAL_COURSES, INITIAL_ASSIGNMENTS } from './data/initialData';
import { Sparkles, Target, Calendar, Link2, MessageSquare, Plus } from 'lucide-react';

export default function App() {
  // Persistence with localStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('scholarsync_courses');
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem('scholarsync_assignments');
      return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('scholarsync_courses', JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses to localStorage', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('scholarsync_assignments', JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments to localStorage', e);
    }
  }, [assignments]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assignments' | 'flashcards' | 'practice' | 'lessons' | 'sync'>('dashboard');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // Cross-Module Deep-Link States
  const [practiceContext, setPracticeContext] = useState<{ topic: string; subject: string; title?: string }>({
    topic: 'Derivatives & Chain Rule',
    subject: 'AP Calculus BC',
  });

  const [lessonContext, setLessonContext] = useState<{ topic: string; subject: string }>({
    topic: 'Related Rates (Calculus)',
    subject: 'AP Calculus BC',
  });

  // Action Handlers
  const handleToggleStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'completed' ? 'todo' : 'completed';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const handleToggleSubtask = (assignmentId: string, subtaskId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId && a.subtasks) {
          return {
            ...a,
            subtasks: a.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)),
          };
        }
        return a;
      })
    );
  };

  const handleSaveAssignment = (data: Partial<Assignment>) => {
    if (data.id) {
      // Edit existing
      setAssignments((prev) =>
        prev.map((a) => (a.id === data.id ? ({ ...a, ...data } as Assignment) : a))
      );
    } else {
      // Create new
      const newAssignment: Assignment = {
        id: 'asg-' + Date.now(),
        title: data.title || 'Untitled Assignment',
        courseId: data.courseId || courses[0]?.id || 'course-gen',
        courseName: data.courseName || courses[0]?.name || 'General',
        dueDate: data.dueDate || new Date().toISOString(),
        priority: data.priority || 'Medium',
        status: data.status || 'todo',
        type: data.type || 'Homework',
        description: data.description || '',
        topics: data.topics || ['Study'],
        estimatedMinutes: data.estimatedMinutes || 60,
        subtasks: data.subtasks || [],
      };
      setAssignments((prev) => [newAssignment, ...prev]);
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // Launch Practice from assignment or lesson
  const handleLaunchPractice = (assignment: Assignment) => {
    const mainTopic = assignment.topics?.[0] || assignment.title;
    setPracticeContext({
      topic: mainTopic,
      subject: assignment.courseName,
      title: assignment.title,
    });
    setActiveTab('practice');
  };

  // Launch Lesson from assignment or practice quiz
  const handleLaunchLesson = (assignment: Assignment) => {
    const mainTopic = assignment.topics?.[0] || assignment.title;
    setLessonContext({
      topic: mainTopic,
      subject: assignment.courseName,
    });
    setActiveTab('lessons');
  };

  const handleLaunchLessonFromPractice = (topic: string, subject: string) => {
    setLessonContext({ topic, subject });
    setActiveTab('lessons');
  };

  const handleLaunchPracticeFromLesson = (topic: string, subject: string) => {
    setPracticeContext({ topic, subject });
    setActiveTab('practice');
  };

  const handleImportSuccess = (newCourses: Course[], newAssignments: Assignment[]) => {
    if (newCourses.length > 0) {
      // Merge unique courses
      setCourses((prev) => {
        const existingNames = new Set(prev.map((c) => c.name.toLowerCase()));
        const uniqueNew = newCourses.filter((c) => !existingNames.has(c.name.toLowerCase()));
        return [...prev, ...uniqueNew];
      });
    }
    if (newAssignments.length > 0) {
      setAssignments((prev) => [...newAssignments, ...prev]);
    }
    setActiveTab('assignments');
  };

  const handleResetToDemo = (demoCourses: Course[], demoAssignments: Assignment[]) => {
    setCourses(demoCourses);
    setAssignments(demoAssignments);
    setActiveTab('assignments');
  };

  // Counters
  const urgentCount = assignments.filter(
    (a) => a.status !== 'completed' && (a.priority === 'Urgent' || a.priority === 'High')
  ).length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans selection:bg-pink-200 selection:text-pink-900">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'sync') {
            setIsSyncModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => {
          setEditingAssignment(null);
          setIsAddModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenTutor={() => setIsTutorOpen(true)}
        urgentCount={urgentCount}
        completedCount={completedCount}
      />

      {/* Step Roadmap Banner */}
      <RoadmapBanner
        currentTab={activeTab}
        onSelectStep={(tab) => {
          if (tab === 'sync') {
            setIsSyncModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            assignments={assignments}
            courses={courses}
            onNavigateToAssignments={() => setActiveTab('assignments')}
            onLaunchPractice={handleLaunchPractice}
            onLaunchLesson={handleLaunchLesson}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
            onOpenTutor={() => setIsTutorOpen(true)}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsView
            assignments={assignments}
            courses={courses}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
            onEditAssignment={(asg) => {
              setEditingAssignment(asg);
              setIsAddModalOpen(true);
            }}
            onDeleteAssignment={handleDeleteAssignment}
            onAddAssignment={() => {
              setEditingAssignment(null);
              setIsAddModalOpen(true);
            }}
            onLaunchPractice={handleLaunchPractice}
            onLaunchLesson={handleLaunchLesson}
            onLaunchFlashcards={() => setActiveTab('flashcards')}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            assignments={assignments}
            courses={courses}
            onLaunchPractice={(t, s) => {
              setPracticeContext({ topic: t, subject: s });
              setActiveTab('practice');
            }}
            onLaunchLesson={(t, s) => {
              setLessonContext({ topic: t, subject: s });
              setActiveTab('lessons');
            }}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeStudio
            courses={courses}
            assignments={assignments}
            initialTopic={practiceContext.topic}
            initialSubject={practiceContext.subject}
            initialAssignmentTitle={practiceContext.title}
            onLaunchLessonFromPractice={handleLaunchLessonFromPractice}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonStudio
            courses={courses}
            initialTopic={lessonContext.topic}
            initialSubject={lessonContext.subject}
            onLaunchPracticeFromLesson={handleLaunchPracticeFromLesson}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile or Quick AI Tutor Access */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center space-x-2">
        <button
          onClick={() => setIsTutorOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-400 via-pink-400 to-sky-400 hover:from-rose-500 hover:to-sky-500 text-white font-bold text-xs rounded-full shadow-lg shadow-pink-200/50 transition-all hover:scale-105 active:scale-95 border border-white/60"
          title="Open AI Study Tutor"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <span>Ask AI Tutor</span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <AssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveAssignment}
        courses={courses}
        initialData={editingAssignment}
      />

      <PlatformSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onResetToDemo={handleResetToDemo}
      />

      <TutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        courses={courses}
      />

      {/* Footer */}
      <footer className="border-t border-[#EFE9E0] bg-[#FAF8F5]/90 py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ScholarSync • Connect Canvas LMS & School Calendars • AI Test Prep & Practice • Extra Lessons</span>
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="text-pink-600 hover:text-pink-700 font-medium underline-offset-4 hover:underline"
          >
            Connect School Platforms (Canvas / iCal)
          </button>
        </div>
      </footer>

    </div>
  );
}
