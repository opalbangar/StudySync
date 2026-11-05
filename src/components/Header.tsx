import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Target, 
  Sparkles, 
  Link2, 
  Plus, 
  MessageSquare, 
  Flame,
  CheckCircle2,
  LayoutDashboard,
  Layers
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'assignments' | 'flashcards' | 'practice' | 'lessons' | 'sync';
  setActiveTab: (tab: 'dashboard' | 'assignments' | 'flashcards' | 'practice' | 'lessons' | 'sync') => void;
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  onOpenTutor: () => void;
  urgentCount: number;
  completedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSyncModal,
  onOpenTutor,
  urgentCount,
  completedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EFE9E0] text-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-300 via-pink-200 to-sky-200 p-0.5 shadow-sm shadow-pink-100 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center shadow-inner">
                <GraduationCap className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-stone-900 via-stone-800 to-rose-700 bg-clip-text text-transparent">
                  ScholarSync
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/80 rounded-full">
                  AI Study Hub
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Track Deadlines • Flashcards • Test Prep • Lessons</p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F4EFEA]/80 p-1 rounded-xl border border-[#E7DFD5] shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-500" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assignments'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>Assignments</span>
              {urgentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-400 text-white text-[10px] font-bold rounded-full">
                  {urgentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Flashcards</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'practice'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Prep</span>
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lessons'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Extra Lessons</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sync'
                  ? 'bg-white text-stone-900 shadow-xs border border-[#E0D7CC]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sync</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Study Streak Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold shadow-xs" title="5-day study streak!">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>5-Day Streak</span>
            </div>

            {/* AI Tutor Button */}
            <button
              onClick={onOpenTutor}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold transition-all shadow-xs"
              title="Open AI Study Tutor Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>

            {/* Quick Add Assignment Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-400 via-pink-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-200/50 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Assignment</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-[#EFE9E0] scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <LayoutDashboard className="w-3 h-3 text-sky-400" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'assignments' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'flashcards' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'practice' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Target className="w-3 h-3 text-amber-400" />
            <span>Test Prep</span>
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'lessons' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Extra Lessons</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'sync' ? 'bg-rose-400 text-white font-bold' : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Link2 className="w-3 h-3 text-emerald-400" />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
