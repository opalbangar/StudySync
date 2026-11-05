import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronDown, ListChecks, Target, Sparkles, Compass } from 'lucide-react';

interface RoadmapBannerProps {
  currentTab: 'dashboard' | 'assignments' | 'flashcards' | 'practice' | 'lessons' | 'sync';
  onSelectStep: (stepTab: 'dashboard' | 'assignments' | 'flashcards' | 'practice' | 'lessons' | 'sync') => void;
}

export const RoadmapBanner: React.FC<RoadmapBannerProps> = ({ currentTab, onSelectStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Step 1: Multi-Platform Sync & Due Dates',
      description: 'Connect Canvas, iCal calendar feeds, or syllabi to aggregate all assignments, prioritize deadlines, and track your daily agenda.',
      tab: 'assignments' as const,
      icon: ListChecks,
      status: 'Ready & Active',
    },
    {
      num: 2,
      title: 'Step 2: Subject Test Prep & Practice Problems',
      description: 'Generate customized practice problem sets with progressive hints, step-by-step mathematical solutions, and test readiness scoring.',
      tab: 'practice' as const,
      icon: Target,
      status: 'Ready & Active',
    },
    {
      num: 3,
      title: 'Step 3: Extra Lessons for Confused Topics',
      description: 'On-demand master lessons breaking down confusing subjects with intuitive analogies, common exam traps, and interactive checks.',
      tab: 'lessons' as const,
      icon: Sparkles,
      status: 'Ready & Active',
    },
  ];

  return (
    <div className="bg-[#FFFDF9] border-b border-[#EFE9E0] text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* Compact Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              <Compass className="w-3.5 h-3.5 text-rose-500" />
              <span>Step-by-Step Blueprint</span>
            </div>
            <span className="text-stone-500 hidden sm:inline">All 3 Core Milestones Interconnected:</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
              {steps.map((s) => {
                const isActive = currentTab === s.tab;
                return (
                  <button
                    key={s.num}
                    onClick={() => onSelectStep(s.tab)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-rose-100 text-rose-900 border border-rose-200 font-semibold shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200/80 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{s.num}. {s.title.split(':')[1]?.trim() || s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-[11px] text-stone-500 hover:text-stone-800 transition-colors ml-2 font-medium"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Plan'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Plan Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[#EFE9E0] grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentTab === step.tab;
              return (
                <div
                  key={step.num}
                  onClick={() => onSelectStep(step.tab)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-rose-50/70 border-rose-200 shadow-xs ring-1 ring-rose-200'
                      : 'bg-white border-[#EFE9E0] hover:border-pink-200 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-pink-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        {step.num}
                      </div>
                      <span className="font-semibold text-xs text-stone-900">{step.title}</span>
                    </div>
                    <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" /> Built
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed mb-2">{step.description}</p>
                  <div className="flex items-center text-[11px] font-semibold text-rose-600">
                    <span>Open this module</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
