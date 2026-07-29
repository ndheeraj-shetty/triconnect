'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Custom canvas-free confetti animation helper
const triggerConfetti = () => {
  if (typeof window === 'undefined') return;
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.style.position = 'fixed';
    p.style.zIndex = '9999';
    p.style.width = `${Math.random() * 8 + 6}px`;
    p.style.height = `${Math.random() * 8 + 6}px`;
    p.style.backgroundColor = ['#FFD700', '#FF5722', '#2196F3', '#4CAF50', '#E91E63'][Math.floor(Math.random() * 5)];
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = '-10px';
    p.style.borderRadius = '50%';
    p.style.pointerEvents = 'none';
    document.body.appendChild(p);

    const anim = p.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(105vh) translateX(${(Math.random() - 0.5) * 160}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 1800 + 1200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    anim.onfinish = () => p.remove();
  }
};
import { 
  Trophy, 
  Flame, 
  Heart, 
  Coins, 
  Sparkles, 
  Lock, 
  Check, 
  Star, 
  Compass, 
  Play, 
  Award, 
  ShoppingBag,
  Code,
  ListOrdered,
  Layers,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- Default Mock Data for Instant Hackathon Demonstration ---
const defaultSubjects = [
  { id: 'math-kingdom', name: 'Mathematics Kingdom', icon: '📐', theme: 'from-amber-500 to-orange-600' },
  { id: 'science-galaxy', name: 'Science Galaxy', icon: '🌌', theme: 'from-blue-500 to-indigo-600' },
  { id: 'cs-lab', name: 'Computer Science Lab', icon: '💻', theme: 'from-emerald-500 to-teal-600' },
  { id: 'history-timeline', name: 'History Timeline', icon: '⏳', theme: 'from-rose-500 to-pink-600' }
];

const mockChapters = [
  {
    id: 'chap-1',
    chapter_number: 1,
    title: 'Algebra Valley',
    description: 'Learn simple variables, equations, and expressions.',
    levels: [
      {
        id: 'lvl-1',
        level_number: 1,
        title: 'Variables Unveiled',
        activity_type: 'MCQ',
        difficulty: 'Easy',
        xp_reward: 50,
        coins_reward: 10,
        stars_earned: 3,
        is_completed: true,
        is_unlocked: true,
        is_current: false,
        quest_content: JSON.stringify({
          question: 'If x + 5 = 12, what is the value of x?',
          options: ['5', '6', '7', '8'],
          answer: '7'
        })
      },
      {
        id: 'lvl-2',
        level_number: 2,
        title: 'Equation Scales',
        activity_type: 'Puzzle',
        difficulty: 'Medium',
        xp_reward: 100,
        coins_reward: 20,
        stars_earned: 2,
        is_completed: true,
        is_unlocked: true,
        is_current: false,
        quest_content: JSON.stringify({
          instruction: 'Match the equivalent expressions to balance the scale:',
          pairs: [
            { left: '2x + 2x', right: '4x' },
            { left: '3x - x', right: '2x' },
            { left: 'x * 5', right: '5x' }
          ]
        })
      },
      {
        id: 'lvl-3',
        level_number: 3,
        title: 'Python Scripting 101',
        activity_type: 'Coding',
        difficulty: 'Hard',
        xp_reward: 150,
        coins_reward: 30,
        stars_earned: 0,
        is_completed: false,
        is_unlocked: true,
        is_current: true,
        quest_content: JSON.stringify({
          instruction: 'Complete the Python function to return the square of a number:',
          skeleton: 'def square_number(n):\n    # TODO: return n square\n    _______',
          answer: 'return n * n'
        })
      },
      {
        id: 'lvl-4',
        level_number: 4,
        title: 'Algebra Overlord (Boss Level)',
        activity_type: 'Boss',
        difficulty: 'Boss',
        xp_reward: 300,
        coins_reward: 50,
        stars_earned: 0,
        is_completed: false,
        is_unlocked: false,
        is_current: false,
        quest_content: JSON.stringify({
          question: 'Solve for x: 3x - 7 = 5x + 3',
          options: ['-5', '5', '-2', '2'],
          answer: '-5'
        })
      }
    ]
  }
];

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  
  // Selection States
  const [selectedSubject, setSelectedSubject] = useState(defaultSubjects[0]);
  const [chapters, setChapters] = useState(mockChapters);
  const [activeTab, setActiveTab] = useState<'map' | 'leaderboard' | 'shop'>('map');

  // Student Profile Stats
  const [xp, setXp] = useState(380);
  const [level, setLevel] = useState(3);
  const [coins, setCoins] = useState(120);
  const [hearts, setHearts] = useState(4);
  const [streak, setStreak] = useState(5);
  
  // Active Level Modals
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  
  // Code editor states
  const [codeAnswer, setCodeAnswer] = useState('');
  
  // Scale matching states
  const [puzzleMatches, setPuzzleMatches] = useState<any>([]);
  const [puzzleSelectedLeft, setPuzzleSelectedLeft] = useState('');

  // Outcome Celebration States
  const [celebration, setCelebration] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestStats();
    fetchLeaderboard();
  }, [selectedSubject]);

  const fetchQuestStats = async () => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      // Fetch Wallet
      const walletRes = await fetch('http://localhost:8000/api/v1/assignments/quests/wallet', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (walletRes.ok) {
        const walletData = await walletRes.ok ? await walletRes.json() : null;
        if (walletData) {
          setCoins(walletData.coins);
          setHearts(walletData.hearts);
        }
      }

      // Fetch Subject Map
      const mapRes = await fetch(`http://localhost:8000/api/v1/assignments/quests/map/${selectedSubject.id}`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (mapRes.ok) {
        const mapData = await mapRes.json();
        if (mapData.chapters && mapData.chapters.length > 0) {
          setChapters(mapData.chapters);
        }
      }
    } catch (e) {
      console.warn('Backend connection offline. Rendering sandbox demo map.');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/assignments/quests/leaderboard', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (e) {
      // Mock ranks
      setLeaderboard([
        { student_name: 'Harry Potter', roll_number: 'STU-9903', xp: 540, streak: 8, rank: 1 },
        { student_name: 'Hermione Granger', roll_number: 'STU-9904', xp: 480, streak: 12, rank: 2 },
        { student_name: user?.name || 'Your Profile', roll_number: 'STU-001', xp: xp, streak: streak, rank: 3 },
        { student_name: 'Ron Weasley', roll_number: 'STU-9905', xp: 210, streak: 2, rank: 4 }
      ]);
    }
  };

  // Launch Quest
  const handleOpenLevel = (lvl: any) => {
    if (!lvl.is_unlocked) return;
    setActiveLevel(lvl);
    setSelectedAnswer('');
    setCodeAnswer('');
    setPuzzleMatches([]);
    setPuzzleSelectedLeft('');
    setErrorMsg('');
    setCelebration(null);
  };

  // Submit attempt
  const handleVerifyQuestAttempt = async () => {
    if (!activeLevel) return;
    setErrorMsg('');

    const parsedContent = JSON.parse(activeLevel.quest_content);
    let isCorrect = false;

    // Check answers locally based on quest type
    if (activeLevel.activity_type === 'MCQ' || activeLevel.activity_type === 'Boss') {
      if (!selectedAnswer) {
        setErrorMsg('Please select an option to submit!');
        return;
      }
      isCorrect = selectedAnswer === parsedContent.answer;
    } else if (activeLevel.activity_type === 'Coding') {
      if (!codeAnswer) {
        setErrorMsg('Please enter your code implementation!');
        return;
      }
      isCorrect = codeAnswer.trim().replace(/\s+/g, '') === parsedContent.answer.trim().replace(/\s+/g, '');
    } else if (activeLevel.activity_type === 'Puzzle') {
      isCorrect = puzzleMatches.length === parsedContent.pairs.length;
    }

    const accuracy = isCorrect ? 100.0 : 0.0;
    
    // Heart depletion logic check
    if (!isCorrect && hearts <= 1) {
      setHearts(0);
      setErrorMsg('💔 Quest Failed! You lost your last heart. Refill your hearts in the Shop.');
      return;
    }

    const payload = {
      level_id: activeLevel.id,
      completion_time_sec: 42,
      accuracy_percentage: accuracy,
      hearts_left: isCorrect ? hearts : hearts - 1
    };

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/assignments/quests/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const outcome = await response.json();
        triggerSuccessCelebration(outcome);
      } else {
        throw new Error('API save rejected');
      }
    } catch (e) {
      // Offline fallback processing
      if (isCorrect) {
        const starBonus = 3;
        const xpGained = activeLevel.xp_reward;
        const coinsGained = activeLevel.coins_reward;
        
        triggerSuccessCelebration({
          stars_earned: starBonus,
          xp_earned: xpGained,
          coins_earned: coinsGained,
          streak_count: streak + 1,
          status: 'COMPLETED'
        });
      } else {
        setHearts(prev => Math.max(0, prev - 1));
        setErrorMsg('❌ Incorrect Answer! Try again. Hint: Check the variables logic.');
      }
    }
  };

  const triggerSuccessCelebration = (outcome: any) => {
    triggerConfetti();

    setCelebration({
      xp: outcome.xp_earned,
      coins: outcome.coins_earned,
      stars: outcome.stars_earned,
      streak: outcome.streak_count
    });

    setXp(prev => prev + outcome.xp_earned);
    setCoins(prev => prev + outcome.coins_earned);
    setStreak(outcome.streak_count);

    // Update level locally
    const currentChap = chapters[0];
    const updatedLevels = currentChap.levels.map(lvl => {
      if (lvl.id === activeLevel.id) {
        return { ...lvl, is_completed: true, stars_earned: outcome.stars_earned };
      }
      // Unlock next level
      if (lvl.level_number === activeLevel.level_number + 1) {
        return { ...lvl, is_unlocked: true, is_current: true };
      }
      return lvl;
    });

    setChapters([{ ...currentChap, levels: updatedLevels }]);
  };

  // Purchase Heart Store
  const handlePurchaseHearts = async () => {
    if (coins < 50) {
      setErrorMsg('Not enough coins to buy hearts! Complete more quests first.');
      return;
    }

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/assignments/quests/wallet/refill', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins);
        setHearts(data.hearts);
        setSuccessMsg('❤️ Hearts successfully refilled to maximum!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      setCoins(prev => prev - 50);
      setHearts(5);
      setSuccessMsg('❤️ Hearts successfully refilled locally (Demo)!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Puzzle pairing helper
  const selectPuzzleItem = (left: string, right: string) => {
    if (puzzleSelectedLeft === left) {
      setPuzzleSelectedLeft('');
      return;
    }
    
    // Auto pair logic
    const nextMatches = [...puzzleMatches, { left, right }];
    setPuzzleMatches(nextMatches);
    setPuzzleSelectedLeft('');
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      
      {/* Dynamic Status Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        
        {/* Profile Details */}
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-100">
            {level}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              Level {level} Explorer <Sparkles className="h-4 w-4 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {/* Progress bar */}
              <div className="w-40 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-150">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(xp % 100)}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-450 uppercase font-mono">{xp % 100} / 100 XP</span>
            </div>
          </div>
        </div>

        {/* Currency status trackers */}
        <div className="flex items-center gap-4 sm:border-l sm:pl-6 border-slate-100">
          
          {/* Daily Streak Flame */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm text-amber-700">
            <Flame className="h-5 w-5 fill-amber-500 text-amber-500 animate-bounce" />
            <div className="text-left leading-none">
              <span className="text-xs font-black block">{streak} Days</span>
              <span className="text-[8px] uppercase font-bold text-amber-600 tracking-wider block mt-0.5">Daily Streak</span>
            </div>
          </div>

          {/* Coins purse */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-yellow-50 border border-yellow-200 shadow-sm text-yellow-700">
            <Coins className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <div className="text-left leading-none">
              <span className="text-xs font-black block">{coins}</span>
              <span className="text-[8px] uppercase font-bold text-yellow-600 tracking-wider block mt-0.5">Coins</span>
            </div>
          </div>

          {/* Hearts counters */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-red-50 border border-red-250 shadow-sm text-red-700">
            <Heart className="h-5 w-5 fill-red-500 text-red-500 animate-pulse" />
            <div className="text-left leading-none">
              <span className="text-xs font-black block">{hearts} / 5</span>
              <span className="text-[8px] uppercase font-bold text-red-600 tracking-wider block mt-0.5">Hearts</span>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation tabs */}
      <div className="flex justify-between items-center bg-slate-50 p-1.5 border border-slate-200 rounded-2xl">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="h-4 w-4" /> Quest Map
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="h-4 w-4" /> Weekly Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Hearts Shop
          </button>
        </div>

        {/* Course Filter */}
        {activeTab === 'map' && (
          <div className="flex gap-2">
            {defaultSubjects.map(subj => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(subj)}
                className={`h-9 w-9 text-base rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  selectedSubject.id === subj.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                }`}
                title={subj.name}
              >
                {subj.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content viewport */}
      <div>
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Super Mario World Map Scroll */}
          {activeTab === 'map' && (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              
              {/* Adventure Map details */}
              <div className="relative rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner h-[500px] flex items-center justify-center p-8 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px]">
                
                {/* Subject theme card floating */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-left">
                  <div className="text-[10px] font-bold text-blue-650 uppercase tracking-widest">Active Realm</div>
                  <h3 className="text-sm font-black text-slate-950 mt-0.5 flex items-center gap-1.5">
                    <span>{selectedSubject.icon}</span> {selectedSubject.name}
                  </h3>
                </div>

                {/* Adventure Path Map Render */}
                <div className="w-full max-w-md relative flex flex-col items-center justify-around h-full">
                  
                  {/* Drawing connecting path lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path
                      d="M 192 400 Q 256 300 128 200 T 224 80"
                      fill="none"
                      stroke="#CBD5E1"
                      strokeWidth="6"
                      strokeDasharray="10, 10"
                    />
                  </svg>

                  {/* Chapter 1 Levels mapped along paths */}
                  {chapters.map((chap) => (
                    <div key={chap.id} className="w-full relative flex flex-col items-center h-full justify-around z-10">
                      
                      {chap.levels.map((lvl, index) => {
                        // Position coordinates for Mario World layout
                        const xOffset = index % 2 === 0 ? 'translate-x-12' : '-translate-x-12';
                        
                        return (
                          <div 
                            key={lvl.id} 
                            className={`relative flex flex-col items-center ${xOffset}`}
                          >
                            
                            {/* Star indicator overlays */}
                            {lvl.is_unlocked && (
                              <div className="flex gap-0.5 justify-center mb-1">
                                {[1, 2, 3].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`h-3 w-3 ${
                                      s <= lvl.stars_earned 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-slate-350 fill-slate-200'
                                    }`} 
                                  />
                                ))}
                              </div>
                            )}

                            {/* Node Button */}
                            <button
                              onClick={() => handleOpenLevel(lvl)}
                              disabled={!lvl.is_unlocked}
                              className={`h-16 w-16 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md relative group ${
                                lvl.is_completed
                                  ? 'bg-gradient-to-b from-yellow-400 to-amber-500 text-white hover:scale-105 border-4 border-yellow-200'
                                  : lvl.is_current
                                  ? 'bg-blue-600 text-white animate-pulse hover:scale-110 border-4 border-blue-200 shadow-blue-200 shadow-xl'
                                  : 'bg-slate-300 text-slate-500 border-4 border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              {lvl.is_completed ? (
                                <Check className="h-7 w-7 stroke-[3px]" />
                              ) : lvl.is_unlocked ? (
                                <Play className="h-6 w-6 fill-white ml-0.5" />
                              ) : (
                                <Lock className="h-5 w-5 text-slate-400" />
                              )}

                              {/* Hover level labels popups */}
                              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all tracking-wide whitespace-nowrap">
                                {lvl.title} ({lvl.difficulty})
                              </div>
                            </button>

                            <span className="text-[10px] font-black text-slate-700 mt-1 uppercase">
                              Level {lvl.level_number}
                            </span>

                          </div>
                        );
                      })}
                    </div>
                  ))}

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-250 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-bounce" /> Weekly Champions Arena
                </h3>
                <p className="text-xs text-slate-450 font-light mt-0.5">Top performing student wizards ranked globally by earned XP.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {leaderboard.map((row, idx) => {
                  const isUser = row.student_name === user?.name || row.student_name === 'Your Profile';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex justify-between items-center py-4 px-4 transition-all rounded-2xl ${
                        isUser ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        
                        {/* Rank Position Ring */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0 
                            ? 'bg-yellow-400 text-white border-2 border-yellow-200' 
                            : idx === 1 
                            ? 'bg-slate-300 text-white' 
                            : idx === 2 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-slate-100 text-slate-650'
                        }`}>
                          {row.rank}
                        </div>

                        <div>
                          <h4 className={`text-xs font-bold ${isUser ? 'text-indigo-950 font-black' : 'text-slate-900'}`}>
                            {row.student_name}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{row.roll_number}</span>
                        </div>

                      </div>

                      <div className="flex items-center gap-6">
                        
                        {/* Streak fire count */}
                        {row.streak > 0 && (
                          <div className="flex items-center gap-1 text-orange-650 text-xs font-bold font-mono">
                            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" /> {row.streak}d
                          </div>
                        )}

                        <div className="text-right">
                          <span className="text-xs font-black text-blue-650 font-mono block">{row.xp} XP</span>
                          <span className="text-[8px] uppercase tracking-wider text-slate-450 block mt-0.5">Total Score</span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Shop Refills */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              
              {/* Refills details */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-200 animate-pulse">
                    <Heart className="h-6 w-6 fill-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">Refill Hearts (To Full 5)</h3>
                    <p className="text-xs text-slate-400 font-light mt-1">
                      Restore all hearts to continue playing and submitting learning quests without locking out!
                    </p>
                  </div>
                </div>

                {successMsg && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <Check className="h-4.5 w-4.5" /> {successMsg}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                    Cost: <Coins className="h-4 w-4 fill-yellow-500 text-yellow-500" /> 50 Coins
                  </div>
                  <button
                    onClick={handlePurchaseHearts}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Buy Heart Refill
                  </button>
                </div>
              </div>

              {/* Avatar cosmetics card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 opacity-75">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
                  <Award className="h-6 w-6 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Avatar Cosmetics (Lock)</h3>
                  <p className="text-xs text-slate-450 font-light mt-1">
                    Unlock exclusive golden skins, profile glowing badges, and victory sounds to display on leaderboards. (Coming soon!)
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-right">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Unlock at lvl 5</span>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Quest Gameplay Modal */}
      <AnimatePresence>
        {activeLevel && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left"
            >
              
              {/* Modal header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">Quest Level {activeLevel.level_number}</h3>
                    <h2 className="text-sm font-bold text-white leading-tight truncate max-w-xs">{activeLevel.title}</h2>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveLevel(null)}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal content body */}
              <div className="p-6 space-y-6">
                
                {/* Celebrations success block */}
                {celebration ? (
                  <div className="text-center py-6 space-y-5">
                    <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 fill-yellow-500 mx-auto border-2 border-yellow-300">
                      <Star className="h-9 w-9" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900">LEVEL COMPLETED!</h3>
                      <p className="text-xs text-slate-500">You earned {celebration.stars} Stars out of 3!</p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <div className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl">
                        <span className="text-xs font-mono font-black block">+{celebration.xp} XP</span>
                        <span className="text-[9px] uppercase tracking-wider block mt-0.5">Wizards Score</span>
                      </div>
                      <div className="px-4 py-2 bg-yellow-50 border border-yellow-250 text-yellow-700 rounded-xl">
                        <span className="text-xs font-mono font-black block">+{celebration.coins} Coins</span>
                        <span className="text-[9px] uppercase tracking-wider block mt-0.5">Purse reward</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setActiveLevel(null)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                      >
                        Continue Journey
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    
                    {/* Error Alerts */}
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <Heart className="h-4.5 w-4.5 fill-red-500 text-red-500 shrink-0" /> {errorMsg}
                      </div>
                    )}

                    {/* Mode 1: MCQ Options Question */}
                    {(activeLevel.activity_type === 'MCQ' || activeLevel.activity_type === 'Boss') && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs text-slate-800 leading-relaxed font-semibold">
                          {JSON.parse(activeLevel.quest_content).question}
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {JSON.parse(activeLevel.quest_content).options.map((opt: string, oIdx: number) => (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedAnswer(opt)}
                              className={`p-3 text-xs text-left font-bold rounded-xl border transition-all cursor-pointer ${
                                selectedAnswer === opt
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <span className="inline-block w-5 h-5 bg-slate-100 border text-[10px] text-slate-500 rounded-md text-center leading-5 mr-2">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Coding Sandbox */}
                    {activeLevel.activity_type === 'Coding' && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-700 font-semibold">
                          {JSON.parse(activeLevel.quest_content).instruction}
                        </div>
                        
                        {/* Editor mockup */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-950 font-mono text-[11px] text-emerald-400 p-4">
                          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-sans flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <Code className="h-3.5 w-3.5 text-blue-500" /> Python Code Editor
                          </div>
                          <pre className="text-slate-300 leading-relaxed">{JSON.parse(activeLevel.quest_content).skeleton.split('_______')[0]}</pre>
                          <textarea
                            rows={3}
                            placeholder="Type return code logic here..."
                            value={codeAnswer}
                            onChange={(e) => setCodeAnswer(e.target.value)}
                            className="w-full bg-slate-950 text-emerald-300 border border-slate-800 rounded-lg p-2.5 outline-none font-mono text-[11px] my-2 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Scale Puzzle Matcher */}
                    {activeLevel.activity_type === 'Puzzle' && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-700 font-semibold mb-2">
                          {JSON.parse(activeLevel.quest_content).instruction}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          
                          {/* Left Column matching expressions */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-450 uppercase font-mono tracking-wider">Left Scale</h4>
                            {JSON.parse(activeLevel.quest_content).pairs.map((p: any, pIdx: number) => {
                              const isMatched = puzzleMatches.some((m: any) => m.left === p.left);
                              
                              return (
                                <button
                                  key={pIdx}
                                  onClick={() => setPuzzleSelectedLeft(p.left)}
                                  disabled={isMatched}
                                  className={`w-full p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                    isMatched
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-50'
                                      : puzzleSelectedLeft === p.left
                                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                                  }`}
                                >
                                  {p.left}
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Column matching matches */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-450 uppercase font-mono tracking-wider">Right Scale</h4>
                            {JSON.parse(activeLevel.quest_content).pairs.map((p: any, pIdx: number) => {
                              const isMatched = puzzleMatches.some((m: any) => m.right === p.right);
                              
                              return (
                                <button
                                  key={pIdx}
                                  onClick={() => selectPuzzleItem(puzzleSelectedLeft, p.right)}
                                  disabled={isMatched || !puzzleSelectedLeft}
                                  className={`w-full p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                    isMatched
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-50'
                                      : !puzzleSelectedLeft
                                      ? 'bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed'
                                      : 'bg-white border-indigo-200 hover:bg-indigo-50/50 text-indigo-750'
                                  }`}
                                >
                                  {p.right}
                                </button>
                              );
                            })}
                          </div>

                        </div>

                        {/* Completed Match count */}
                        <div className="text-[10px] text-slate-450 font-bold uppercase mt-2">
                          Matched Scales: {puzzleMatches.length} / {JSON.parse(activeLevel.quest_content).pairs.length}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                      <button
                        onClick={() => setActiveLevel(null)}
                        className="px-4 py-2 border border-slate-200 text-slate-650 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyQuestAttempt}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Check Answer</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
