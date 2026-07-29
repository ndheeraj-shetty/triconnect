'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Sparkles, 
  CalendarCheck, 
  FileCheck, 
  AlertTriangle, 
  Brain, 
  ArrowRight,
  TrendingUp,
  PlusCircle,
  FolderOpen,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock performance distribution
const classPerformanceData = [
  { range: 'A (90-100)', count: 28 },
  { range: 'B (80-89)', count: 42 },
  { range: 'C (70-79)', count: 18 },
  { range: 'D (60-69)', count: 8 },
  { range: 'F (<60)', count: 2 },
];

interface TeacherAlert {
  id: string;
  student: string;
  category: 'Wellbeing' | 'Attendance' | 'Academic';
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  time: string;
}

const initialAlerts: TeacherAlert[] = [
  { id: '1', student: 'Alex Mercer', category: 'Wellbeing', message: 'Daily mood index fell to 3/10. Indicated high sleep fatigue.', severity: 'Critical', time: '10 mins ago' },
  { id: '2', student: 'Emily Watson', category: 'Attendance', message: 'Missed Chemistry 10B lectures twice in a row.', severity: 'Warning', time: '1 hr ago' },
  { id: '3', student: 'Jacob Miller', category: 'Academic', message: 'Calculus homework grade dropped by 15% over last 3 quests.', severity: 'Warning', time: '3 hrs ago' },
];

export default function TeacherDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<TeacherAlert[]>(initialAlerts);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Quest Creator Form States
  const [questSubject, setQuestSubject] = useState('math-kingdom');
  const [chapterNum, setChapterNum] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('Algebra Valley');
  const [levelNum, setLevelNum] = useState(1);
  const [levelTitle, setLevelTitle] = useState('Prime Numbers Quest');
  const [activityType, setActivityType] = useState<'MCQ' | 'Coding' | 'Puzzle' | 'Boss'>('MCQ');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Boss'>('Easy');
  const [xpReward, setXpReward] = useState(100);
  const [coinsReward, setCoinsReward] = useState(10);
  const [passingPct, setPassingPct] = useState(60);
  const [hintsAllowed, setHintsAllowed] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState(true);
  
  // MCQ parameters
  const [mcqQuestion, setMcqQuestion] = useState('What is the smallest prime number?');
  const [mcqOptions, setMcqOptions] = useState('1, 2, 3, 4');
  const [mcqAnswer, setMcqAnswer] = useState('2');

  // Coding parameters
  const [codeSkeleton, setCodeSkeleton] = useState('def square_number(n):\n    _______');
  const [codeAnswer, setCodeAnswer] = useState('return n * n');

  // Puzzle parameters
  const [puzzleLeft, setPuzzleLeft] = useState('2x+2x, 3x-x');
  const [puzzleRight, setPuzzleRight] = useState('4x, 2x');

  const [savingQuest, setSavingQuest] = useState(false);
  const [questError, setQuestError] = useState('');

  // Syllabus notes parameters
  const [notesList, setNotesList] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [generatingFromNotes, setGeneratingFromNotes] = useState(false);

  useEffect(() => {
    fetchNotesList();
  }, []);

  const fetchNotesList = async () => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/assignments/notes', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotesList(data);
        if (data.length > 0) setSelectedNoteId(data[0].id);
      } else {
        throw new Error('Notes API error');
      }
    } catch (e) {
      // Mock notes
      const mockNotes = [
        { id: '11111111-1111-1111-1111-111111111111', title: 'Calculus derivatives note' },
        { id: '22222222-2222-2222-2222-222222222222', title: 'Chemistry saturated compounds worksheet' }
      ];
      setNotesList(mockNotes);
      setSelectedNoteId(mockNotes[0].id);
    }
  };

  const handleGenerateQuestFromNotes = async () => {
    if (!selectedNoteId) {
      setQuestError('Please select a syllabus note source first!');
      return;
    }
    setGeneratingFromNotes(true);
    setQuestError('');

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/assignments/quests/generate-from-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          note_id: selectedNoteId,
          activity_type: activityType,
          difficulty: difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (activityType === 'MCQ' || activityType === 'Boss') {
          setMcqQuestion(data.question || '');
          setMcqOptions(data.options ? data.options.join(', ') : '');
          setMcqAnswer(data.answer || '');
        } else if (activityType === 'Coding') {
          setCodeSkeleton(data.skeleton || '');
          setCodeAnswer(data.answer || '');
        } else if (activityType === 'Puzzle') {
          const lefts = data.pairs ? data.pairs.map((p: any) => p.left).join(', ') : '';
          const rights = data.pairs ? data.pairs.map((p: any) => p.right).join(', ') : '';
          setPuzzleLeft(lefts);
          setPuzzleRight(rights);
        }
        setSuccessMsg('Quest details generated from teacher notes successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error('Quest generator failed');
      }
    } catch (e) {
      // Mock generation fallback
      let data: any = {};
      const noteTitle = notesList.find(n => n.id === selectedNoteId)?.title?.toLowerCase() || '';
      
      if (noteTitle.includes('chem')) {
        if (activityType === 'MCQ' || activityType === 'Boss') {
          data = {
            question: "Based on the organic chemistry lecture notes, which functional group has a carbonyl carbon bonded to two alkyl groups?",
            options: ["Aldehyde", "Ketone", "Ester", "Ether"],
            answer: "Ketone"
          };
        } else if (activityType === 'Puzzle') {
          data = {
            pairs: [
              { left: "CH3-CH2-OH", right: "Ethanol" },
              { left: "CH3-COOH", right: "Ethanoic Acid" }
            ]
          };
        } else {
          data = {
            skeleton: "def organic_class(is_saturated):\n    _______",
            answer: "return 'Saturated' if is_saturated else 'Unsaturated'"
          };
        }
      } else {
        // calculus
        if (activityType === 'MCQ' || activityType === 'Boss') {
          data = {
            question: "Referring to the derivatives worksheet, what is the derivative of sin(x)?",
            options: ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"],
            answer: "cos(x)"
          };
        } else if (activityType === 'Puzzle') {
          data = {
            pairs: [
              { left: "x^2", right: "2x" },
              { left: "sin(x)", right: "cos(x)" }
            ]
          };
        } else {
          data = {
            skeleton: "def power_rule(c, p):\n    _______",
            answer: "return f'{c*p}x^{p-1}'"
          };
        }
      }

      if (activityType === 'MCQ' || activityType === 'Boss') {
        setMcqQuestion(data.question || '');
        setMcqOptions(data.options ? data.options.join(', ') : '');
        setMcqAnswer(data.answer || '');
      } else if (activityType === 'Coding') {
        setCodeSkeleton(data.skeleton || '');
        setCodeAnswer(data.answer || '');
      } else if (activityType === 'Puzzle') {
        const lefts = data.pairs ? data.pairs.map((p: any) => p.left).join(', ') : '';
        const rights = data.pairs ? data.pairs.map((p: any) => p.right).join(', ') : '';
        setPuzzleLeft(lefts);
        setPuzzleRight(rights);
      }

      setSuccessMsg('[Demo Mode] Quest details generated from notes!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setGeneratingFromNotes(false);
    }
  };

  // Hydration guard for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQuest(true);
    setQuestError('');

    // Construct quest content payload
    let questContent = '';
    if (activityType === 'MCQ' || activityType === 'Boss') {
      const opts = mcqOptions.split(',').map(s => s.trim());
      questContent = JSON.stringify({
        question: mcqQuestion,
        options: opts,
        answer: mcqAnswer
      });
    } else if (activityType === 'Coding') {
      questContent = JSON.stringify({
        instruction: 'Complete the skeleton to solve the challenge:',
        skeleton: codeSkeleton,
        answer: codeAnswer
      });
    } else if (activityType === 'Puzzle') {
      const lefts = puzzleLeft.split(',').map(s => s.trim());
      const rights = puzzleRight.split(',').map(s => s.trim());
      const pairs = lefts.map((l, i) => ({ left: l, right: rights[i] || '' }));
      questContent = JSON.stringify({
        instruction: 'Match equivalent expressions:',
        pairs: pairs
      });
    }

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      
      // Step 1: Create or fetch Chapter
      const chapResp = await fetch('http://localhost:8000/api/v1/assignments/quests/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          subject_id: 'adbedea1-3979-4e76-81b9-ec89f2cda4da', // Seed placeholder or standard course ID
          chapter_number: chapterNum,
          title: chapterTitle,
          description: 'Custom learning adventure chapter.'
        })
      });

      if (!chapResp.ok) throw new Error('Failed to register chapter');
      const chapData = await chapResp.json();

      // Step 2: Create Level
      const lvlResp = await fetch('http://localhost:8000/api/v1/assignments/quests/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          chapter_id: chapData.id,
          level_number: levelNum,
          title: levelTitle,
          activity_type: activityType,
          difficulty: difficulty,
          xp_reward: xpReward,
          coins_reward: coinsReward,
          passing_percentage: passingPct,
          hints_allowed: hintsAllowed,
          ai_difficulty_adjust: aiDifficulty,
          quest_content: questContent
        })
      });

      if (!lvlResp.ok) throw new Error('Failed to register level node');

      setSuccessMsg(`Successfully deployed Quest: "${levelTitle}"!`);
      setAssignmentModal(false);
    } catch (err) {
      console.warn('Backend connection offline. Mocking Quest deployment parameters.');
      setSuccessMsg(`[Demo Mode] Successfully deployed Quest: "${levelTitle}"!`);
      setAssignmentModal(false);
    } finally {
      setSavingQuest(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-55 to-indigo-50/50 p-6 rounded-2xl border border-blue-100 text-left">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Welcome back, Ms. Sarah! <Sparkles className="h-5 w-5 text-blue-605" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Science Department Coordinator. You have {alerts.length} pending AI flags to resolve today.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Students */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Active Students</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">124</h3>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Across Chemistry 10A, 10B & Physics Lab</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Today Attendance</span>
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">96.2%</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Classroom QR sync resolved: 119/124</p>
          </div>
        </div>

        {/* Homework Queue */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Review Queue</span>
            <FileCheck className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">12 Quests</h3>
            <p className="text-[10px] text-indigo-650 mt-1 font-semibold">Submissions waiting validation</p>
          </div>
        </div>

        {/* AI Alerts counts */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm bg-gradient-to-tr from-white to-red-50/10 text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">AI Flags</span>
            <AlertTriangle className="h-5 w-5 text-red-550 animate-pulse" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-red-600">{alerts.length} Active</h3>
            <p className="text-[10px] text-slate-450 mt-1">Requires wellbeing or academic review</p>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Alerts & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI alerts panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <Brain className="h-5 w-5 text-indigo-655" /> AI Anomaly Flags
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Real-time alerts generated by student telemetry</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
            <AnimatePresence mode="popLayout">
              {alerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400"
                >
                  <FileCheck className="h-10 w-10 text-slate-305 mb-2" />
                  <p className="text-xs font-bold">Zero AI flags today!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-light">All student stats are within healthy thresholds.</p>
                </motion.div>
              ) : (
                alerts.map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 shadow-sm ${
                      a.severity === 'Critical' 
                        ? 'bg-red-50 border-red-200 text-slate-805' 
                        : 'bg-slate-50/50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-900 font-extrabold">{a.student}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                          a.severity === 'Critical' ? 'bg-red-200/50 text-red-700 border border-red-300/40' : 'bg-amber-100 text-amber-700 border border-amber-205'
                        }`}>{a.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-550 mt-1.5 leading-normal font-light">{a.message}</p>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px]">
                      <span className="text-slate-450 font-mono">{a.time}</span>
                      <button
                        onClick={() => handleResolveAlert(a.id)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded font-bold cursor-pointer shadow-sm text-[10px]"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recharts Grades Distribution Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Chemistry 10B Performance Spread</h3>
            <p className="text-xs text-slate-505 mt-1 font-light">Student counts grouped by score tier levels</p>
          </div>

          <div className="h-72 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Quick action 1: Assignment creation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <PlusCircle className="h-4.5 w-4.5 text-indigo-650" /> Create Homework Quest
            </h4>
            <p className="text-xs text-slate-505 mt-1 font-light font-sans">Deploy gamified assignments to student logs instantly.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/teacher/quests')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
          >
            Open quest configurator
          </button>
        </div>

        {/* Quick action 2: AI Student Analytics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Brain className="h-4.5 w-4.5 text-blue-650" /> AI Report Generator
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-light">Write term reviews automatically based on student grades & scans.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/teacher/students')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
          >
            Launch report comments engine
          </button>
        </div>
      </div>

      {/* Create Quest Modal */}
      <AnimatePresence>
        {assignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-205 shadow-2xl p-6 z-10 space-y-4 my-8 max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="h-4.5 w-4.5 text-blue-600 animate-pulse" /> Create Gamified Quest Node
                </h4>
                <button 
                  onClick={() => setAssignmentModal(false)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {questError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
                  {questError}
                </div>
              )}

              <form onSubmit={handleCreateQuest} className="space-y-4 text-left">
                
                {/* AI Syllabus notes generation connector */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-blue-750 tracking-wider"> Sourced Lecture Notes (Syllabus Lock)</span>
                    <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">AI Sync</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedNoteId}
                      onChange={(e) => setSelectedNoteId(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    >
                      {notesList.map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleGenerateQuestFromNotes}
                      disabled={generatingFromNotes || notesList.length === 0}
                      className="px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {generatingFromNotes ? 'Generating...' : 'Auto-Generate'}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-450 font-light leading-normal">
                    ⚠️ Restricts the quest content strictly to the concepts inside the selected teacher note. Out-of-syllabus is prohibited.
                  </p>
                </div>

                {/* Subject & Chapters */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Subject Realm</label>
                    <select 
                      value={questSubject} 
                      onChange={(e) => setQuestSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    >
                      <option value="math-kingdom">📐 Mathematics Kingdom</option>
                      <option value="science-galaxy">🌌 Science Galaxy</option>
                      <option value="cs-lab">💻 Computer Science Lab</option>
                      <option value="history-timeline">⏳ History Timeline</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Chapter Title</label>
                    <input 
                      type="text" 
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Level Title & Number */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Level #</label>
                    <input 
                      type="number" 
                      value={levelNum}
                      onChange={(e) => setLevelNum(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-semibold"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Level Node Title</label>
                    <input 
                      type="text" 
                      value={levelTitle}
                      onChange={(e) => setLevelTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Activity & Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Quest Mode</label>
                    <select 
                      value={activityType} 
                      onChange={(e) => setActivityType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    >
                      <option value="MCQ">Multiple Choice Quiz</option>
                      <option value="Coding">Python Code Sandbox</option>
                      <option value="Puzzle">Equivalent Scale Match</option>
                      <option value="Boss">Boss Fight Level</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Difficulty Tier</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    >
                      <option value="Easy">🟢 Easy (50 XP)</option>
                      <option value="Medium">🟡 Medium (100 XP)</option>
                      <option value="Hard">🔴 Hard (150 XP)</option>
                      <option value="Boss">💀 Boss Overlord (300 XP)</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Quest Setup forms */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">Interactive Setup Parameters</h5>
                  
                  {/* MCQ Setup */}
                  {(activityType === 'MCQ' || activityType === 'Boss') && (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase block">Question Prompt</label>
                        <textarea 
                          rows={2}
                          value={mcqQuestion}
                          onChange={(e) => setMcqQuestion(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase block">Options (Comma separated)</label>
                          <input 
                            type="text"
                            value={mcqOptions}
                            onChange={(e) => setMcqOptions(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase block">Correct Answer</label>
                          <input 
                            type="text"
                            value={mcqAnswer}
                            onChange={(e) => setMcqAnswer(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coding Setup */}
                  {activityType === 'Coding' && (
                    <div className="space-y-2.5 font-mono text-[11px]">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase block font-sans">Python Starter Template</label>
                        <textarea 
                          rows={2}
                          value={codeSkeleton}
                          onChange={(e) => setCodeSkeleton(e.target.value)}
                          className="w-full bg-slate-900 text-slate-300 border border-slate-950 rounded-xl px-3 py-2 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase block font-sans">Verification Solution Code</label>
                        <input 
                          type="text"
                          value={codeAnswer}
                          onChange={(e) => setCodeAnswer(e.target.value)}
                          className="w-full bg-slate-900 text-emerald-300 border border-slate-950 rounded-xl px-3 py-2 outline-none font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Puzzle Setup */}
                  {activityType === 'Puzzle' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase block">Left Scales (Comma separated)</label>
                          <input 
                            type="text"
                            value={puzzleLeft}
                            onChange={(e) => setPuzzleLeft(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase block">Right Matches (Comma separated)</label>
                          <input 
                            type="text"
                            value={puzzleRight}
                            onChange={(e) => setPuzzleRight(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Rewards and Adjustments settings */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Coins Reward</label>
                    <input 
                      type="number" 
                      value={coinsReward}
                      onChange={(e) => setCoinsReward(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Pass Limit %</label>
                    <input 
                      type="number" 
                      value={passingPct}
                      onChange={(e) => setPassingPct(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Max Hints</label>
                    <input 
                      type="number" 
                      value={hintsAllowed}
                      onChange={(e) => setHintsAllowed(parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase font-mono">AI Adaptive Difficulty</span>
                  <button
                    type="button"
                    onClick={() => setAiDifficulty(!aiDifficulty)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      aiDifficulty ? 'bg-blue-650' : 'bg-slate-350'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      aiDifficulty ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={savingQuest}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  {savingQuest ? 'Deploying Level Node...' : 'Deploy Gamified Quest to Map'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xl flex gap-3 items-center max-w-sm text-left animate-float"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
              <FileCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Quest Deployed!</h5>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-light">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
