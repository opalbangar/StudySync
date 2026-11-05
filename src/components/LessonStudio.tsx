import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  MessageSquare, 
  Zap, 
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Brain
} from 'lucide-react';
import { Course, ExtraLesson } from '../types';
import { fetchExtraLesson, askTutor } from '../services/api';
import { SAMPLE_LESSON } from '../data/initialData';

interface LessonStudioProps {
  courses: Course[];
  initialTopic?: string;
  initialSubject?: string;
  onLaunchPracticeFromLesson: (topic: string, subject: string) => void;
}

export const LessonStudio: React.FC<LessonStudioProps> = ({
  courses,
  initialTopic = '',
  initialSubject = '',
  onLaunchPracticeFromLesson,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'Related Rates (Calculus)');
  const [subject, setSubject] = useState(initialSubject || (courses[0]?.name || 'AP Calculus BC'));
  const [learningStyle, setLearningStyle] = useState('Intuitive & Analogies');
  const [confusionDetail, setConfusionDetail] = useState('');
  
  const [currentLesson, setCurrentLesson] = useState<ExtraLesson>(SAMPLE_LESSON);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lesson Checkpoint State
  const [userCheckAnswers, setUserCheckAnswers] = useState<Record<number, number>>({});
  const [checkedCheckpoints, setCheckedCheckpoints] = useState<Record<number, boolean>>({});

  // Inline Tutor Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor for ${currentLesson.title}. Read through the lesson above, and if any step or formula feels fuzzy, ask me below!`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  const handleGenerateLesson = async () => {
    if (!topic.trim()) {
      setErrorMessage('Please enter what topic you are confused about.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const lesson = await fetchExtraLesson({
        topic: topic.trim(),
        subject,
        learningStyle,
        confusionDetail: confusionDetail.trim() || undefined,
      });

      setCurrentLesson(lesson);
      setUserCheckAnswers({});
      setCheckedCheckpoints({});
      setChatMessages([
        {
          role: 'assistant',
          content: `I've prepared this deep-dive lesson on "${lesson.title}". What questions do you have as you read through it?`,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate extra lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newHistory);
    setIsSendingChat(true);

    try {
      const response = await askTutor({
        messages: newHistory,
        topic: currentLesson.topic,
        subject: currentLesson.subject,
      });
      setChatMessages([...newHistory, { role: 'assistant', content: response.content }]);
    } catch (err) {
      setChatMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble reaching the AI tutor server. Please try asking again!',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title & Step 3 Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold tracking-wide">
              Step 3 of Blueprint
            </span>
            <span className="text-xs text-stone-500">Concept Explainer & Guided Lessons</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <span>Extra Lessons Studio (Confused? Learn Here)</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            When a lecture or textbook leaves you confused, generate an interactive lesson that builds mental models, explains common pitfalls, and provides worked examples.
          </p>
        </div>
      </div>

      {/* Lesson Request Form */}
      <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 shadow-2xs space-y-4 text-stone-800">
        <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
          <Brain className="w-4 h-4 text-sky-500" />
          <span>What topic do you need explained?</span>
        </h3>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Subject / Course</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-sky-400 font-medium"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
              <option value="Economics">Economics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-sky-400 font-medium"
            >
              <option value="Intuitive & Analogies">💡 Intuitive & Real-World Analogies (Mental Models)</option>
              <option value="Step-by-Step Rigorous">📐 Step-by-Step Rigorous (Methodical Derivations)</option>
              <option value="Visual & Structural">🎨 Visual & Structural Walkthrough</option>
              <option value="Common Pitfalls & Traps">⚠️ Common Pitfalls & Exam Traps First</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Topic or Concept Name</label>
          <input
            type="text"
            placeholder="e.g. Related Rates, Le Chatelier's Principle, Why ΔG must be negative, Supply & Demand shifts..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Where exactly are you getting confused? (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 'I don't understand when to plug in numbers before taking the derivative', or 'I get lost with the signs'"
            value={confusionDetail}
            onChange={(e) => setConfusionDetail(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-400"
          />
        </div>

        <button
          onClick={handleGenerateLesson}
          disabled={isLoading}
          className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Crafting Interactive Lesson with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Generate Step-by-Step Extra Lesson</span>
            </>
          )}
        </button>
      </div>

      {/* Rendered Lesson Content */}
      {currentLesson && (
        <article className="bg-white rounded-2xl border border-[#EFE9E0] p-6 sm:p-8 shadow-2xs space-y-6 text-stone-800">
          
          {/* Lesson Header */}
          <div className="border-b border-stone-100 pb-5">
            <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2">
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                {currentLesson.subject}
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{currentLesson.readTimeMinutes || 5} min read</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {currentLesson.title}
            </h1>

            {currentLesson.coreIdea && (
              <div className="mt-3 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs sm:text-sm text-sky-950 font-medium leading-relaxed">
                <span className="font-bold text-sky-900">Core Takeaway: </span>
                {currentLesson.coreIdea}
              </div>
            )}
          </div>

          {/* The Analogy / Mental Model */}
          {currentLesson.analogy && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Mental Model: {currentLesson.analogy.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                "{currentLesson.analogy.story}"
              </p>
            </div>
          )}

          {/* Core Sections */}
          <div className="space-y-5">
            {currentLesson.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-7">
                  {sec.content}
                </p>
                {sec.keyRule && (
                  <div className="ml-7 p-2.5 bg-[#FAF8F5] rounded-lg border border-stone-200 text-xs font-semibold text-sky-900">
                    💡 Rule: {sec.keyRule}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Common Pitfalls & Mistakes */}
          {currentLesson.commonPitfalls && currentLesson.commonPitfalls.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Common Exam Traps & Misconceptions</span>
              </div>
              <div className="space-y-3">
                {currentLesson.commonPitfalls.map((pitfall, pIdx) => (
                  <div key={pIdx} className="text-xs space-y-1 border-t border-rose-200/60 pt-2 first:border-0 first:pt-0">
                    <p className="font-bold text-rose-900">❌ Mistake: {pitfall.mistake}</p>
                    <p className="text-stone-600">Why students stumble: {pitfall.whyItHappens}</p>
                    <p className="text-emerald-700 font-semibold">✅ How to avoid: {pitfall.howToAvoid}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worked Example */}
          {currentLesson.workedExample && (
            <div className="bg-[#FFFDF9] rounded-xl border border-stone-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Fully Worked Step-by-Step Example</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs font-medium text-stone-900">
                {currentLesson.workedExample.problemStatement}
              </div>

              <div className="space-y-2 pt-1">
                {currentLesson.workedExample.steps.map((st) => (
                  <div key={st.stepNumber} className="text-xs space-y-0.5 pl-3 border-l-2 border-rose-300">
                    <p className="font-bold text-stone-900">
                      Step {st.stepNumber}: {st.action}
                    </p>
                    <p className="text-stone-600 leading-relaxed">{st.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                Final Result: {currentLesson.workedExample.finalAnswer}
              </div>

              {currentLesson.workedExample.proTip && (
                <p className="text-[11px] text-stone-500 italic">
                  Pro-tip: {currentLesson.workedExample.proTip}
                </p>
              )}
            </div>
          )}

          {/* Quick Check Your Understanding */}
          {currentLesson.quickCheck && currentLesson.quickCheck.length > 0 && (
            <div className="bg-sky-50/30 rounded-xl border border-sky-200 p-5 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Check Your Understanding (Interactive Checkpoints)</span>
              </div>

              <div className="space-y-4">
                {currentLesson.quickCheck.map((qc, qIdx) => {
                  const selected = userCheckAnswers[qIdx];
                  const isChecked = checkedCheckpoints[qIdx];
                  const isCorrect = selected === qc.correctIndex;

                  return (
                    <div key={qIdx} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs shadow-2xs">
                      <p className="font-bold text-stone-900">
                        {qIdx + 1}. {qc.question}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {qc.options.map((opt, oIdx) => {
                          let optStyle = 'bg-[#FFFDF9] text-stone-700 hover:bg-stone-50 border-stone-200';
                          if (isChecked) {
                            if (oIdx === qc.correctIndex) optStyle = 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold';
                            else if (selected === oIdx) optStyle = 'bg-rose-50 text-rose-900 border-rose-300';
                          } else if (selected === oIdx) {
                            optStyle = 'bg-rose-50 text-rose-900 border-rose-300 font-bold';
                          }

                          return (
                            <div
                              key={oIdx}
                              onClick={() => {
                                if (!isChecked) {
                                  setUserCheckAnswers({ ...userCheckAnswers, [qIdx]: oIdx });
                                }
                              }}
                              className={`p-2 rounded-lg border cursor-pointer transition-colors ${optStyle}`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      {!isChecked ? (
                        <button
                          onClick={() => setCheckedCheckpoints({ ...checkedCheckpoints, [qIdx]: true })}
                          disabled={selected === undefined}
                          className="mt-2 px-3 py-1 bg-rose-400 hover:bg-rose-500 disabled:opacity-40 text-white rounded-md text-[11px] font-bold"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <div className={`mt-2 p-2 rounded-md text-[11px] ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                          <p className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect.'}</p>
                          <p className="text-stone-600 mt-0.5">{qc.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Trigger to Step 2 Test Prep */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-amber-900">Ready to test your new knowledge?</h4>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Generate a 5-question practice drill on "{currentLesson.topic}" to lock it in.
              </p>
            </div>
            <button
              onClick={() => onLaunchPracticeFromLesson(currentLesson.topic, currentLesson.subject)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              Take Practice Quiz
            </button>
          </div>

          {/* Embedded AI Tutor Chat Section */}
          <div className="pt-6 border-t border-stone-100 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-900">
              <MessageSquare className="w-4 h-4 text-sky-500" />
              <span>Ask the AI Tutor Questions About This Lesson</span>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl border border-stone-200 p-4 max-h-64 overflow-y-auto space-y-2.5">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-rose-400 text-white rounded-br-none shadow-2xs'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white text-stone-500 rounded-xl px-3.5 py-2 text-xs border border-stone-200 flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask a clarifying question (e.g. 'Can you explain step 2 in simpler words?')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </article>
      )}

    </div>
  );
};
