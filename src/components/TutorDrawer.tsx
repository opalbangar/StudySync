import React, { useState } from 'react';
import { X, MessageSquare, Send, Sparkles, Bot, User, BookOpen, Lightbulb } from 'lucide-react';
import { askTutor } from '../services/api';
import { Course } from '../types';

interface TutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const TutorDrawer: React.FC<TutorDrawerProps> = ({ isOpen, onClose, courses }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "Hello! I am your ScholarSync AI Subject Tutor. What are you studying today? You can ask me to explain any confusing concept, generate practice drills, or walk through a homework problem step-by-step!",
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(courses[0]?.name || 'General Academic');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await askTutor({
        messages: newMsgs,
        topic: text.trim(),
        subject: selectedSubject,
      });

      setMessages([...newMsgs, { role: 'assistant', content: response.content }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error connecting to the tutor service. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    'How do I know when to use the Chain Rule in calculus?',
    'Explain Gibbs Free Energy (ΔG) with an intuitive analogy',
    'What were the main causes of the Reconstruction Compromise of 1877?',
    'Give me a step-by-step practice problem for AVL tree rotation',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/30 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-[#FFFDF9] border-l border-[#EFE9E0] h-full flex flex-col shadow-2xl text-stone-800">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#EFE9E0] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-rose-500 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                <span>ScholarSync AI Tutor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </h3>
              <p className="text-[11px] text-stone-500">Step-by-step guidance & conceptual clarity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Context Picker */}
        <div className="px-4 py-2 bg-stone-50/80 border-b border-[#EFE9E0] flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">Course Context:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-white border border-stone-200 rounded-md px-2 py-1 text-stone-800 text-xs focus:outline-none focus:border-rose-400 font-medium"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value="General Academic">General Academic</option>
          </select>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-pink-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-rose-400 text-white rounded-tr-none shadow-2xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none shadow-2xs'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-rose-200 text-rose-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-md bg-pink-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white text-stone-500 rounded-xl px-3.5 py-2 border border-stone-200 flex items-center space-x-1.5 shadow-2xs">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Starter Prompts */}
        {messages.length <= 2 && (
          <div className="p-3 border-t border-[#EFE9E0] bg-stone-50/60">
            <p className="text-[10px] text-stone-500 uppercase font-semibold mb-1.5 flex items-center space-x-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Suggested quick questions:</span>
            </p>
            <div className="space-y-1">
              {starterPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="w-full text-left truncate text-[11px] p-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors border border-stone-200 shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-[#EFE9E0] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your courses, homework, or exam..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#FFFDF9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-rose-400 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
