import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Award, 
  Zap, 
  AlertCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Assignment, Course, PracticeQuestion, PracticeSession } from '../types';
import { fetchPracticeProblems } from '../services/api';

interface PracticeStudioProps {
  courses: Course[];
  assignments: Assignment[];
  initialTopic?: string;
  initialSubject?: string;
  initialAssignmentTitle?: string;
  onLaunchLessonFromPractice: (topic: string, subject: string) => void;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  courses,
  assignments,
  initialTopic = '',
  initialSubject = '',
  initialAssignmentTitle = '',
  onLaunchLessonFromPractice,
}) => {
  // Setup State
  const [subject, setSubject] = useState(initialSubject || (courses[0]?.name || 'AP Calculus BC'));
  const [topic, setTopic] = useState(initialTopic || 'Derivatives & Chain Rule');
  const [difficulty, setDifficulty] = useState<'Foundations' | 'Standard' | 'AP / Challenge'>('Standard');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Quiz State
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Quick Preset Topics
  const presetTopics = [
    { name: 'Related Rates & Implicit Differentiation', subject: 'AP Calculus BC' },
    { name: 'Gibbs Free Energy & Spontaneity', subject: 'AP Chemistry' },
    { name: 'Binary Search Tree Rotations (AVL)', subject: 'Data Structures' },
    { name: 'Reconstruction Amendments & Black Codes', subject: 'AP US History' },
    { name: 'Shakespearean Rhetorical Devices', subject: 'English Literature' },
  ];

  const handleStartPractice = async () => {
    if (!topic.trim()) {
      setErrorMessage('Please enter a topic or concept to practice.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await fetchPracticeProblems({
        subject,
        topic: topic.trim(),
        difficulty,
        questionCount,
        assignmentTitle: initialAssignmentTitle,
      });

      const session: PracticeSession = {
        id: 'session-' + Date.now(),
        title: result.title || `${topic} Practice Test`,
        topic: result.topic || topic,
        subject,
        difficulty,
        overview: result.overview || 'Targeted practice session to test core understanding and exam readiness.',
        questions: result.questions || [],
        userAnswers: {},
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setActiveSession(session);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setRevealedHints({});
      setCheckedAnswers({});
      setIsCompleted(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate practice problems. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (checkedAnswers[questionId]) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleCheckAnswer = (questionId: string) => {
    setCheckedAnswers({
      ...checkedAnswers,
      [questionId]: true,
    });
  };

  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let correct = 0;
      activeSession.questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correct++;
        }
      });
      const pct = Math.round((correct / activeSession.questions.length) * 100);
      setActiveSession({
        ...activeSession,
        completed: true,
        scorePercentage: pct,
        userAnswers: selectedAnswers,
      });
      setIsCompleted(true);
    }
  };

  const currentQ = activeSession?.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* View Title & Step 2 Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold tracking-wide">
              Step 2 of Blueprint
            </span>
            <span className="text-xs text-stone-500">AI Adaptive Test Prep</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center space-x-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span>Practice Problems & Test Prep Studio</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Generate customized practice quizzes for any course or assignment. Get instant step-by-step solutions, diagnostic hints, and test readiness scores.
          </p>
        </div>

        {activeSession && !isCompleted && (
          <button
            onClick={() => setActiveSession(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold border border-stone-200 transition-colors self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Practice Set</span>
          </button>
        )}
      </div>

      {/* Quiz Generator Form */}
      {!activeSession && (
        <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 shadow-2xs space-y-5 text-stone-800">
          
          <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Configure Practice Problem Set</span>
          </h3>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Subject / Course */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Target Subject / Course
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-400 font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
                <option value="Physics">Physics</option>
                <option value="Economics">Economics</option>
                <option value="Biology">Biology</option>
                <option value="General Prep">Other Subject</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Foundations', 'Standard', 'AP / Challenge'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition-all ${
                      difficulty === lvl
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Specific Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Specific Topic, Chapter, or Problem Type
            </label>
            <input
              type="text"
              placeholder="e.g. Implicit differentiation with trigonometry, Gibbs free energy calculations, etc."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Preset Suggestions */}
          <div>
            <p className="text-[11px] text-stone-500 mb-2 font-medium">Or choose a trending school topic:</p>
            <div className="flex flex-wrap gap-1.5">
              {presetTopics.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(p.name);
                    setSubject(p.subject);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-[#FFFDF9] hover:bg-stone-50 text-stone-700 hover:text-amber-900 rounded-lg border border-stone-200 transition-colors font-medium"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Number of Questions
            </label>
            <div className="flex items-center space-x-3">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    questionCount === num
                      ? 'bg-amber-400 text-stone-950 border-amber-500 font-bold shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900'
                  }`}
                >
                  {num} Questions {num === 3 ? '(Quick Drill)' : num === 5 ? '(Standard)' : '(Full Exam)'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <button
              onClick={handleStartPractice}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Custom Practice Test with AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>Generate Practice Test & Problems</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Active Quiz Runner */}
      {activeSession && !isCompleted && currentQ && (
        <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 shadow-2xs space-y-6 text-stone-800">
          
          {/* Quiz Header & Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-bold text-amber-700">
                Question {currentQuestionIndex + 1} of {activeSession.questions.length}
              </span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200 font-medium">
                {activeSession.difficulty}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeSession.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Statement */}
          <div className="bg-[#FFFDF9] p-5 rounded-xl border border-stone-200/90">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed">
                  {currentQ.question}
                </p>
                {currentQ.keyConcept && (
                  <span className="inline-block mt-2 text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
                    Concept: {currentQ.keyConcept}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progressive Hint */}
          {currentQ.hint && (
            <div>
              {revealedHints[currentQ.id] ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Diagnostic Hint: </span>
                    <span>{currentQ.hint}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRevealedHints({ ...revealedHints, [currentQ.id]: true })}
                  className="flex items-center space-x-1.5 text-xs text-amber-700 hover:text-amber-800 transition-colors font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Stuck? Reveal a progressive hint</span>
                </button>
              )}
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              const isChecked = checkedAnswers[currentQ.id];
              const isCorrect = optIdx === currentQ.correctIndex;

              let optionStyle = 'bg-[#FFFDF9] border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50/60';

              if (isChecked) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                } else {
                  optionStyle = 'bg-stone-50/60 border-stone-200 text-stone-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-amber-50 border-amber-400 text-amber-900 font-semibold ring-1 ring-amber-400';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-white border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                      {letters[optIdx]}
                    </span>
                    <span className="text-xs sm:text-sm">{option}</span>
                  </div>

                  {isChecked && isCorrect && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  {isChecked && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          {checkedAnswers[currentQ.id] && (
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-2 animate-fade-in">
              <div className="flex items-center space-x-2 text-xs font-bold">
                {selectedAnswers[currentQ.id] === currentQ.correctIndex ? (
                  <span className="text-emerald-700 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Correct! Great reasoning.</span>
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Incorrect. Review the step-by-step solution below:</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {currentQ.explanation}
              </p>

              {/* Step 3 Bridge */}
              {selectedAnswers[currentQ.id] !== currentQ.correctIndex && (
                <div className="pt-2">
                  <button
                    onClick={() => onLaunchLessonFromPractice(currentQ.keyConcept || activeSession.topic, activeSession.subject)}
                    className="flex items-center space-x-1.5 text-xs text-sky-700 hover:text-sky-800 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Confused about this? Open an interactive lesson on "{currentQ.keyConcept || activeSession.topic}"</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs text-stone-500">
              {selectedAnswers[currentQ.id] !== undefined ? 'Answer chosen' : 'Select an answer to continue'}
            </span>

            <div className="flex items-center space-x-2">
              {!checkedAnswers[currentQ.id] ? (
                <button
                  onClick={() => handleCheckAnswer(currentQ.id)}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className="px-4 py-2 bg-rose-400 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <span>
                    {currentQuestionIndex < activeSession.questions.length - 1
                      ? 'Next Question'
                      : 'View Final Score & Analysis'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Quiz Completion & Readiness Report */}
      {isCompleted && activeSession && (
        <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 sm:p-8 shadow-xs text-center space-y-6 animate-fade-in text-stone-800">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Practice Session Completed!</h3>
            <p className="text-xs text-stone-500 mt-1">Topic: {activeSession.topic} • {activeSession.subject}</p>
          </div>

          {/* Score Badge */}
          <div className="max-w-xs mx-auto p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Test Readiness Score</span>
            <div className="text-4xl font-bold text-amber-600 mt-1">
              {activeSession.scorePercentage}%
            </div>
            <p className="text-xs text-stone-600 mt-1 font-medium">
              {activeSession.scorePercentage! >= 80
                ? '🎉 Excellent mastery! You are well prepared for the test.'
                : activeSession.scorePercentage! >= 60
                ? '👍 Solid foundation, but review the concepts you missed.'
                : '⚠️ We recommend reviewing the extra lessons below before test day.'}
            </p>
          </div>

          {/* Bridge to Step 3: Extra Lessons */}
          <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-200 text-left max-w-xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-stone-900">Need an Extra Lesson on this material?</h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Our Step 3 feature breaks down confusing concepts step-by-step with intuitive real-world analogies, worked examples, and common traps.
                </p>
                <button
                  onClick={() => onLaunchLessonFromPractice(activeSession.topic, activeSession.subject)}
                  className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <span>Launch Extra Lesson for "{activeSession.topic}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                setActiveSession(null);
                setIsCompleted(false);
              }}
              className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-colors border border-stone-200"
            >
              Practice Another Topic
            </button>
            <button
              onClick={handleStartPractice}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Retry This Test Set
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
