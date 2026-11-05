import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  RotateCcw, 
  BookOpen, 
  Award, 
  Target, 
  Lightbulb, 
  Plus, 
  Filter, 
  Check, 
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Assignment, Course, Flashcard, FlashcardDeck, FlashcardMasteryStatus } from '../types';
import { fetchFlashcards } from '../services/api';
import { SAMPLE_FLASHCARD_DECKS } from '../data/initialData';

interface FlashcardsViewProps {
  assignments: Assignment[];
  courses: Course[];
  initialAssignmentId?: string;
  onLaunchPractice: (topic: string, subject: string) => void;
  onLaunchLesson: (topic: string, subject: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  assignments,
  courses,
  initialAssignmentId,
  onLaunchPractice,
  onLaunchLesson,
}) => {
  // Stored Decks
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    try {
      const saved = localStorage.getItem('scholarsync_flashcard_decks');
      return saved ? JSON.parse(saved) : SAMPLE_FLASHCARD_DECKS;
    } catch {
      return SAMPLE_FLASHCARD_DECKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('scholarsync_flashcard_decks', JSON.stringify(decks));
    } catch (e) {
      console.error('Failed to save flashcard decks', e);
    }
  }, [decks]);

  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    if (initialAssignmentId) {
      const matched = decks.find((d) => d.assignmentTitle?.toLowerCase().includes(initialAssignmentId.toLowerCase()));
      if (matched) return matched.id;
    }
    return decks[0]?.id || 'deck-calc';
  });

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0] || null;

  // Deck Study State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'need_review'>('all');
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);

  // Deck Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSubject, setGenSubject] = useState(courses[0]?.name || 'AP Calculus BC');
  const [genTopic, setGenTopic] = useState('Related Rates & Differentiation');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('custom');
  const [cardCount, setCardCount] = useState<number>(8);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update topic when an assignment is picked in generator
  const handleSelectAssignment = (asgId: string) => {
    setSelectedAssignmentId(asgId);
    if (asgId === 'custom') return;
    const asg = assignments.find((a) => a.id === asgId);
    if (asg) {
      setGenSubject(asg.courseName);
      setGenTopic(asg.topics?.join(', ') || asg.title);
    }
  };

  // Active cards based on filter (All vs Need Review)
  const activeCards: Flashcard[] = (activeDeck?.cards || []).filter((card) => {
    if (filterMode === 'need_review') {
      return card.status === 'review';
    }
    return true;
  });

  const currentCard = activeCards[currentCardIndex] || null;

  // Reset card state when moving or flipping
  const goToCard = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleMarkCard('mastered');
      } else if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleMarkCard('review');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Mark card as Mastered or Need Review
  const handleMarkCard = (status: 'mastered' | 'review') => {
    if (!activeDeck || !currentCard) return;

    const updatedCards = activeDeck.cards.map((c) => (c.id === currentCard.id ? { ...c, status } : c));
    const updatedDecks = decks.map((d) => (d.id === activeDeck.id ? { ...d, cards: updatedCards } : d));
    setDecks(updatedDecks);

    if (currentCardIndex < activeCards.length - 1) {
      goToCard(currentCardIndex + 1);
    } else {
      setIsDeckCompleted(true);
    }
  };

  // Generate Deck via Gemini
  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      setErrorMessage('Please enter a topic to generate flashcards.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const relatedAsg = assignments.find((a) => a.id === selectedAssignmentId);

    try {
      const data = await fetchFlashcards({
        subject: genSubject,
        topic: genTopic.trim(),
        assignmentTitle: relatedAsg?.title,
        count: cardCount,
      });

      const newDeck: FlashcardDeck = {
        id: 'deck-' + Date.now(),
        title: data.deckTitle || `${genTopic} Study Deck`,
        topic: data.topic || genTopic,
        subject: genSubject,
        assignmentTitle: relatedAsg?.title,
        cards: data.cards.map((c, i) => ({
          ...c,
          id: 'card-' + i + '-' + Date.now(),
          status: 'unreviewed',
        })),
      };

      setDecks([newDeck, ...decks]);
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setIsDeckCompleted(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate flashcard deck. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Deck Mastery Stats
  const totalDeckCards = activeDeck?.cards.length || 0;
  const masteredCount = activeDeck?.cards.filter((c) => c.status === 'mastered').length || 0;
  const reviewCount = activeDeck?.cards.filter((c) => c.status === 'review').length || 0;
  const masteryPercentage = totalDeckCards > 0 ? Math.round((masteredCount / totalDeckCards) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#EFE9E0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold tracking-wide">
              Active Recall Engine
            </span>
            <span className="text-xs text-stone-500">Interactive Topic Flashcards</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-rose-500" />
            <span>Interactive Study Flashcards</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Parse assignment topics into active recall flashcards. Flip to test your memory, categorize into Mastered vs Need Review piles, and study until mastery.
          </p>
        </div>

        {/* Deck Switcher Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={activeDeckId}
            onChange={(e) => {
              setActiveDeckId(e.target.value);
              setCurrentCardIndex(0);
              setIsFlipped(false);
              setShowHint(false);
              setIsDeckCompleted(false);
            }}
            className="bg-[#FFFDF9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium focus:outline-none focus:border-rose-400 max-w-[200px] truncate shadow-2xs"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      {activeDeck && !isDeckCompleted && currentCard ? (
        <div className="space-y-4">
          
          {/* Deck Metadata & Mastery Progress */}
          <div className="bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                  <span>{activeDeck.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                    {activeDeck.subject}
                  </span>
                </h3>
                {activeDeck.assignmentTitle && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Parsed from: {activeDeck.assignmentTitle}
                  </p>
                )}
              </div>

              {/* Progress Count */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{masteredCount} Mastered</span>
                </span>
                <span className="text-rose-600 font-semibold flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{reviewCount} Need Review</span>
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(masteredCount / totalDeckCards) * 100}%` }}
                  title="Mastered"
                />
                <div
                  className="bg-rose-400 h-full transition-all duration-300"
                  style={{ width: `${(reviewCount / totalDeckCards) * 100}%` }}
                  title="Need Review"
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>Card {currentCardIndex + 1} of {activeCards.length}</span>
                <span>{masteryPercentage}% Mastered</span>
              </div>
            </div>

            {/* Filter Toggle: All vs Need Review */}
            {reviewCount > 0 && (
              <div className="flex items-center space-x-2 pt-1 border-t border-stone-100">
                <span className="text-[11px] text-stone-500 font-medium">Study Pile:</span>
                <button
                  onClick={() => {
                    setFilterMode('all');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    filterMode === 'all'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-stone-50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All Cards ({totalDeckCards})
                </button>
                <button
                  onClick={() => {
                    setFilterMode('need_review');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    filterMode === 'need_review'
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Need Review Only ({reviewCount})
                </button>
              </div>
            )}
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none perspective-1000 min-h-[300px] sm:min-h-[340px] flex"
          >
            <div
              className={`w-full rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm relative ${
                isFlipped
                  ? 'bg-gradient-to-br from-[#FFFDF9] via-pink-50/20 to-sky-50/20 border-rose-200/90 shadow-md text-stone-900'
                  : 'bg-white hover:bg-[#FFFDF9] border-[#EFE9E0] hover:border-pink-200 text-stone-900 shadow-2xs'
              }`}
            >
              
              {/* Card Header Tag */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700">
                    {currentCardIndex + 1}
                  </span>
                  <span className="font-semibold text-stone-700">
                    {isFlipped ? 'Answer & Core Concept' : 'Question / Prompt'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {currentCard.status === 'mastered' && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Mastered</span>
                    </span>
                  )}
                  {currentCard.status === 'review' && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold flex items-center space-x-1">
                      <XCircle className="w-3 h-3 text-rose-500" />
                      <span>Need Review</span>
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400 flex items-center space-x-1">
                    <RotateCw className="w-3.5 h-3.5 text-stone-400" />
                    <span className="hidden sm:inline">Click to flip</span>
                  </span>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="my-auto py-6">
                {!isFlipped ? (
                  /* FRONT: Question / Problem */
                  <div className="space-y-3">
                    <h4 className="text-xl sm:text-2xl font-bold text-stone-900 leading-relaxed tracking-tight">
                      {currentCard.front}
                    </h4>

                    {/* Hint reveal */}
                    {currentCard.hint && (
                      <div className="pt-2">
                        {showHint ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>Hint: </strong> {currentCard.hint}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHint(true);
                            }}
                            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Need a hint before flipping?</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* BACK: Detailed Explanation & Key Takeaway */
                  <div className="space-y-4 animate-fade-in">
                    <div className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                      {currentCard.back}
                    </div>

                    {currentCard.keyTakeaway && (
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 font-semibold">
                        💡 Key Takeaway: {currentCard.keyTakeaway}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Cue */}
              <div className="text-center text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                Press <kbd className="px-1.5 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700 font-mono text-[10px]">Space</kbd> to flip • <kbd className="px-1.5 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700 font-mono text-[10px]">←</kbd> Need Review • <kbd className="px-1.5 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700 font-mono text-[10px]">→</kbd> Mastered
              </div>

            </div>
          </div>

          {/* Rating & Navigation Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EFE9E0] shadow-2xs">
            
            {/* Card Index Nav */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToCard(Math.max(0, currentCardIndex - 1))}
                disabled={currentCardIndex === 0}
                className="p-2 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-stone-600 rounded-lg transition-colors border border-stone-200"
                title="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-stone-500 font-medium px-2">
                {currentCardIndex + 1} / {activeCards.length}
              </span>
              <button
                onClick={() => goToCard(Math.min(activeCards.length - 1, currentCardIndex + 1))}
                disabled={currentCardIndex === activeCards.length - 1}
                className="p-2 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-stone-600 rounded-lg transition-colors border border-stone-200"
                title="Next card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Core Action: Need Review vs Mastered */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Need Review Button */}
              <button
                onClick={() => handleMarkCard('review')}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                title="Mark this card for review and study again"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Need Review</span>
              </button>

              {/* Mastered Button */}
              <button
                onClick={() => handleMarkCard('mastered')}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Mark this card as mastered"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered</span>
              </button>
            </div>

            {/* Flip / Reset Action */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-medium border border-stone-200 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Show Front' : 'Flip to Answer'}</span>
            </button>

          </div>

        </div>
      ) : activeDeck && isDeckCompleted ? (
        /* Deck Finished Screen */
        <div className="bg-white rounded-2xl border border-[#EFE9E0] p-8 shadow-xs text-center space-y-6 animate-fade-in text-stone-800">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Deck Study Completed!</h3>
            <p className="text-xs text-stone-500 mt-1">{activeDeck.title} • {activeDeck.subject}</p>
          </div>

          {/* Mastery Breakdown */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Mastered</span>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{masteredCount}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{masteryPercentage}% of deck</p>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-semibold text-rose-700 uppercase">Need Review</span>
              <p className="text-3xl font-bold text-rose-600 mt-1">{reviewCount}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Focus areas</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {reviewCount > 0 && (
              <button
                onClick={() => {
                  setFilterMode('need_review');
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setIsDeckCompleted(false);
                }}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Drill {reviewCount} "Need Review" Cards</span>
              </button>
            )}

            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setIsDeckCompleted(false);
              }}
              className="px-5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 border border-stone-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Full Deck</span>
            </button>

            <button
              onClick={() => onLaunchPractice(activeDeck.topic, activeDeck.subject)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Test with Practice Quiz</span>
            </button>
          </div>

        </div>
      ) : null}

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-[#EFE9E0] p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-pink-50 text-rose-500 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Generate New Flashcard Deck</h3>
            <p className="text-xs text-stone-500">Parse topics directly from an upcoming assignment or enter any subject</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleGenerateDeck} className="space-y-4 text-xs">
          
          {/* Quick Select from Upcoming Assignments */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Parse Topics from an Assignment:
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => handleSelectAssignment(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 text-xs focus:outline-none focus:border-rose-400 font-medium"
            >
              <option value="custom">— Custom Topic / Enter Manually —</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.courseName}: {a.title} ({a.topics?.join(', ') || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Subject</label>
              <select
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-rose-400 font-medium"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Physics">Physics</option>
                <option value="Economics">Economics</option>
                <option value="General Academic">General Academic</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Card Count</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCardCount(num)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      cardCount === num
                        ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Topic or Key Terms to Cover
            </label>
            <input
              type="text"
              placeholder="e.g. Implicit Differentiation, Gibbs Free Energy, Reconstruction Amendments..."
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Active Recall Flashcards with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Interactive Flashcard Deck</span>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};
