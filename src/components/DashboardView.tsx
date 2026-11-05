import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  Target, 
  Sparkles, 
  ChevronRight,
  Flame,
  Award,
  Zap,
  Maximize2
} from 'lucide-react';
import { Assignment, Course } from '../types';
import { FocusModeView } from './FocusModeView';

interface DashboardViewProps {
  assignments: Assignment[];
  courses: Course[];
  onNavigateToAssignments: () => void;
  onLaunchPractice: (assignment: Assignment) => void;
  onLaunchLesson: (assignment: Assignment) => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onOpenTutor?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assignments,
  courses,
  onNavigateToAssignments,
  onLaunchPractice,
  onLaunchLesson,
  onToggleStatus,
  onToggleSubtask,
  onOpenTutor,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const now = new Date();

  // Metrics
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
  
  const overdue = assignments.filter((a) => {
    if (a.status === 'completed') return false;
    return new Date(a.dueDate).getTime() < now.getTime();
  }).length;

  const pending = assignments.filter((a) => a.status === 'todo' && new Date(a.dueDate).getTime() >= now.getTime()).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalStudyMinutes = assignments
    .filter((a) => a.status !== 'completed')
    .reduce((sum, a) => sum + (a.estimatedMinutes || 60), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Urgent upcoming (<36 hours)
  const urgentAssignments = assignments.filter((a) => {
    if (a.status === 'completed') return false;
    const diffHours = (new Date(a.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 36;
  });

  // Soft Pastel Palette for Completion Status (PieChart)
  const completionData = [
    { name: 'Completed', value: completed, color: '#34D399' }, // soft sage mint
    { name: 'In Progress', value: inProgress, color: '#818CF8' }, // periwinkle
    { name: 'To Do', value: pending, color: '#38BDF8' }, // soft sky blue
    { name: 'Overdue', value: overdue, color: '#FB7185' }, // pastel rose
  ].filter((item) => item.value > 0);

  // Deadlines & Completion by Course Data (BarChart)
  const courseData = courses.map((course) => {
    const courseAssignments = assignments.filter((a) => a.courseId === course.id);
    const courseTotal = courseAssignments.length;
    const courseDone = courseAssignments.filter((a) => a.status === 'completed').length;
    const coursePending = courseTotal - courseDone;
    const courseMinutes = courseAssignments
      .filter((a) => a.status !== 'completed')
      .reduce((sum, a) => sum + (a.estimatedMinutes || 60), 0);

    return {
      courseName: course.code || course.name.slice(0, 10),
      fullName: course.name,
      total: courseTotal,
      completed: courseDone,
      pending: coursePending,
      rate: courseTotal > 0 ? Math.round((courseDone / courseTotal) * 100) : 0,
      studyMinutes: courseMinutes,
      color: course.color || '#818CF8',
    };
  });

  // Study Time Distribution by Course (PieChart)
  const studyTimeByCourseData = courses
    .map((course) => {
      const minutes = assignments
        .filter((a) => a.courseId === course.id && a.status !== 'completed')
        .reduce((sum, a) => sum + (a.estimatedMinutes || 60), 0);

      return {
        name: course.name,
        code: course.code,
        minutes,
        hours: (minutes / 60).toFixed(1),
        color: course.color || '#818CF8',
      };
    })
    .filter((c) => c.minutes > 0);

  // Next 7 Days Timeline Activity
  const timelineDays: { dateStr: string; label: string; count: number; exams: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString(undefined, { weekday: 'short' });

    const dayAssignments = assignments.filter((a) => {
      if (a.status === 'completed') return false;
      const aDate = new Date(a.dueDate);
      const aKey = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}-${String(aDate.getDate()).padStart(2, '0')}`;
      return aKey === dateKey;
    });

    const examsCount = dayAssignments.filter((a) => a.type === 'Exam' || a.priority === 'Urgent').length;

    timelineDays.push({
      dateStr: dateKey,
      label: dayLabel,
      count: dayAssignments.length,
      exams: examsCount,
    });
  }

  // Identify most demanding course
  const mostDemandingCourse = [...courseData].sort((a, b) => b.studyMinutes - a.studyMinutes)[0];

  return (
    <div className="space-y-6">
      
      {/* Fullscreen Deep Work Focus Mode */}
      {isFocusMode && (
        <FocusModeView
          assignments={assignments}
          courses={courses}
          onExit={() => setIsFocusMode(false)}
          onToggleStatus={onToggleStatus}
          onToggleSubtask={onToggleSubtask}
          onLaunchPractice={onLaunchPractice}
          onLaunchLesson={onLaunchLesson}
          onOpenTutor={onOpenTutor}
        />
      )}

      {/* Top Banner / Welcome Row */}
      <div className="bg-gradient-to-r from-[#FFFDF9] via-pink-50/30 to-sky-50/40 p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold tracking-wide">
              Study Analytics & Insights
            </span>
            <span className="text-xs text-stone-500">Visual Academic Overview</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <span>Academic Command Center</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Real-time visual tracking of assignment completion rates, course workloads, test preparation demands, and upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-2">
          {/* Deep Work Focus Mode Button */}
          <button
            onClick={() => setIsFocusMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all hover:scale-102 active:scale-98"
            title="Minimize all distractions and focus exclusively on your top-priority assignment"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>Focus Mode</span>
          </button>

          <button
            onClick={onNavigateToAssignments}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <span>Task List</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Completion Rate */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{completionRate}%</h3>
            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5">
              {completed} of {total} tasks submitted
            </p>
          </div>
        </div>

        {/* Study Time Remaining */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Study Time Needed</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{totalStudyHours} hrs</h3>
            <p className="text-[11px] text-stone-500 mt-1.5">
              Across {total - completed} pending tasks
            </p>
            <p className="text-[10px] text-sky-600 font-medium mt-0.5">
              ~{Math.round(totalStudyMinutes / Math.max(1, total - completed))} mins per assignment
            </p>
          </div>
        </div>

        {/* Deadlines Due Soon */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Urgent Deadlines</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-rose-600 tracking-tight">{urgentAssignments.length}</h3>
            <p className="text-[11px] text-rose-600/90 mt-1.5">
              Due within next 36 hours
            </p>
            <p className="text-[10px] text-stone-500 mt-0.5">
              {overdue > 0 ? `${overdue} overdue items need check-in` : 'Zero overdue assignments!'}
            </p>
          </div>
        </div>

        {/* Most Demanding Course */}
        <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Top Workload</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-stone-900 tracking-tight truncate">
              {mostDemandingCourse?.courseName || 'None'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-1">
              {(mostDemandingCourse?.studyMinutes || 0) / 60} hrs estimated study time
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">
              {mostDemandingCourse?.pending || 0} active assignments
            </p>
          </div>
        </div>

      </div>

      {/* CHARTS GRID 1: Completion Status & Course Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Chart 1: Overall Completion Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Assignment Completion Status</h3>
              <p className="text-xs text-stone-500">Status breakdown across all academic tasks</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">
              {completionRate}% Done
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = Math.round((data.value / total) * 100);
                      return (
                        <div className="bg-white border border-[#EFE9E0] p-2.5 rounded-xl text-xs shadow-lg text-stone-800">
                          <p className="font-bold flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            <span>{data.name}</span>
                          </p>
                          <p className="text-stone-600 mt-1">
                            {data.value} assignments ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-stone-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-2xl font-bold text-stone-900">{completionRate}%</span>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Completed</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Upcoming Deadlines & Progress Per Course (BarChart) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Course Workload & Completion</h3>
              <p className="text-xs text-stone-500">Completed vs Pending deadlines per enrolled class</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={courseData}
                margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" />
                <XAxis 
                  dataKey="courseName" 
                  stroke="#78716C" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#78716C" 
                  fontSize={11} 
                  allowDecimals={false} 
                  tickLine={false} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EFE9E0] p-2.5 rounded-xl text-xs shadow-lg text-stone-800">
                          <p className="font-bold text-stone-900 mb-1">{data.fullName}</p>
                          <p className="text-emerald-600 font-medium">Completed: {data.completed}</p>
                          <p className="text-sky-600 font-medium">Pending Deadlines: {data.pending}</p>
                          <p className="text-stone-500 text-[10px] mt-1">Completion: {data.rate}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={30}
                  formatter={(val) => <span className="text-xs text-stone-600 font-medium capitalize">{val}</span>}
                />
                <Bar dataKey="completed" name="Completed" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Deadlines" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHARTS GRID 2: Study Time Distribution & 7-Day Deadline Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Chart 3: Study Time Distribution by Course */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Study Time Distribution by Course</h3>
              <p className="text-xs text-stone-500">Where remaining study hours are focused</p>
            </div>
            <span className="text-xs font-semibold text-sky-700 px-2 py-0.5 bg-sky-50 rounded-md border border-sky-200">
              {totalStudyHours} hrs Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studyTimeByCourseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: any) => {
                    const hours = props.payload?.hours || (Number(props.value || 0) / 60).toFixed(1);
                    return `${hours}h`;
                  }}
                >
                  {studyTimeByCourseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = Math.round((data.minutes / Math.max(1, totalStudyMinutes)) * 100);
                      return (
                        <div className="bg-white border border-[#EFE9E0] p-2.5 rounded-xl text-xs shadow-lg text-stone-800">
                          <p className="font-bold flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                            <span>{data.name}</span>
                          </p>
                          <p className="text-stone-600 mt-1">
                            {data.hours} hours ({data.minutes} mins) • {pct}% of study schedule
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-stone-600 font-medium truncate">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Next 7 Days Deadline Intensity Timeline */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">7-Day Deadline Velocity</h3>
              <p className="text-xs text-stone-500">Daily volume of upcoming tests, papers, and problem sets</p>
            </div>
            <span className="text-xs font-semibold text-rose-700 px-2 py-0.5 bg-rose-50 rounded-md border border-rose-200">
              Exam Alerts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineDays}
                margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" />
                <XAxis dataKey="label" stroke="#78716C" fontSize={11} tickLine={false} />
                <YAxis stroke="#78716C" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#EFE9E0] p-2.5 rounded-xl text-xs shadow-lg text-stone-800">
                          <p className="font-bold text-stone-900 mb-1">{data.label} ({data.dateStr})</p>
                          <p className="text-sky-600 font-medium">Total Deadlines: {data.count}</p>
                          {data.exams > 0 && (
                            <p className="text-rose-600 font-bold">🚨 Urgent/Exam items: {data.exams}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="All Deadlines" 
                  stroke="#38BDF8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="exams" 
                  name="Exams / Urgent" 
                  stroke="#FB7185" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExams)" 
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={30}
                  formatter={(val) => <span className="text-xs text-stone-600 font-medium">{val}</span>}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Action Spotlight: Urgent Deadlines Requiring Test Prep / Extra Lessons */}
      {urgentAssignments.length > 0 && (
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-rose-200/70 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Immediate Attention Spotlight (Due &lt;36 Hours)</span>
            </h3>
            <span className="text-xs text-rose-700 font-medium bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {urgentAssignments.length} urgent task{urgentAssignments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentAssignments.slice(0, 2).map((asg) => {
              const course = courses.find((c) => c.id === asg.courseId);
              return (
                <div
                  key={asg.id}
                  className="p-4 bg-white rounded-xl border border-stone-200/80 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${course?.color || '#818CF8'}18`,
                          color: course?.color || '#818CF8',
                        }}
                      >
                        {asg.courseName}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {asg.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{asg.title}</h4>
                    {asg.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{asg.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-xs">
                    <span className="text-stone-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Due {new Date(asg.dueDate).toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onLaunchPractice(asg)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold transition-colors border border-amber-200/80 text-xs"
                      >
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span>Practice Prep</span>
                      </button>
                      <button
                        onClick={() => onLaunchLesson(asg)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg font-semibold transition-colors border border-sky-200/80 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>Extra Lesson</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
