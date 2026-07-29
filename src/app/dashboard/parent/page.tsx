'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  CalendarCheck, 
  BookOpen, 
  Heart, 
  Brain, 
  ArrowRight,
  MessageSquare,
  FileText,
  UserCheck,
  Send,
  Bot,
  X,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Child performance data (Alex)
const performanceData = [
  { term: 'Term 1', score: 81 },
  { term: 'Term 2', score: 85 },
  { term: 'Term 3', score: 87 },
  { term: 'Term 4', score: 88.5 },
];

export default function ParentDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [parentChatOpen, setParentChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello Robert! I am TriConnect's Parent Support AI. I analyze Alex's daily performance, school wellbeing logs, and homework speeds. Ask me anything about how Alex is doing or how you can support their homework routines at home." }
  ]);
  const [typing, setTyping] = useState(false);

  // Hydration guard for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setTyping(true);

    setTimeout(() => {
      let reply = "Thanks for your question! Alex is doing great in Science (Chemistry: 92%), but their Calculus homework is sometimes completed very close to the deadline. Encouraging Alex to study for 30 minutes before dinner can help reduce that fatigue trend we spotted on Thursday mornings.";
      if (chatInput.toLowerCase().includes('attendance')) {
        reply = "Alex's attendance is excellent at 94.8%. They checks in using the QR code badges at the classroom door regularly. Their only missed class this term was the Physics lab on Tuesday due to a verified dentist appointment.";
      } else if (chatInput.toLowerCase().includes('wellbeing') || chatInput.toLowerCase().includes('mood') || chatInput.toLowerCase().includes('stress')) {
        reply = "Alex's emotional wellbeing index is currently 'Stable' (82%). Our Daily Wellbeing Slider indicates they were slightly tired mid-week due to staying up late for assignments, but their focus levels recovered well on Friday.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setTyping(false);
    }, 1505);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-105 text-left">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Robert Mercer <span className="text-[10px] text-slate-450 font-mono font-bold uppercase tracking-wider">(Parent Account)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-light">Reviewing academic and wellbeing profiles for child: <span className="text-blue-650 font-bold">Alex Mercer (10th Grade)</span></p>
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Child Attendance */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Attendance Rate</span>
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">94.8%</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Check-in frequency high</p>
          </div>
        </div>

        {/* Child Performance */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Average Score</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">88.5% (A-)</h3>
            <p className="text-[10px] text-blue-500 mt-1 font-semibold">Ranked #4 out of 28 in Class 10B</p>
          </div>
        </div>

        {/* Child homework quests completed */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Quests Completed</span>
            <BookOpen className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">9 / 10</h3>
            <p className="text-[10px] text-indigo-650 mt-1 font-semibold">Active quest: Derivatives review</p>
          </div>
        </div>

        {/* Child wellbeing index */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm bg-gradient-to-tr from-white to-pink-50/10 text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Emotional State</span>
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-pink-600">Stable</h3>
            <p className="text-[10px] text-slate-450 mt-1">Daily slider checked in: 7/10</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Digest & Academic Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Digest (6 Cols) */}
        <div className="lg:col-span-6 bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-blue-105 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-650 animate-pulse" /> Weekly AI Progress Digest
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">School Week ending Jul 23, 2026</p>
          </div>

          <div className="space-y-4 text-left leading-relaxed text-slate-650 text-xs border-y border-slate-200/80 py-4 font-light">
            <p>
              <strong className="text-slate-900 font-extrabold">Academic Summary:</strong> Alex maintains an excellent performance curve, with their Science score peaking at 92%. A chemistry laboratory quest was successfully signed and submitted yesterday (+100 XP).
            </p>
            <p>
              <strong className="text-slate-900 font-extrabold">Wellbeing Telemetry:</strong> Mood logs are generally positive, averaging 7.4/10. Daily wellbeing indexes indicated high fatigue on Wednesday night. Student checks suggest late-night study cycles are impacting morning physics lab attention.
            </p>
            <p>
              <strong className="text-slate-900 font-extrabold">Parent Action Suggestion:</strong> Encourage Alex to complete calculus homework before 8 PM tonight. This will prevent study fatigue overlap and lock in their +5 day assignment quest streak!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setParentChatOpen(true)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bot className="h-4 w-4" /> Ask Parent Counsel AI
            </button>
            <button
              onClick={() => router.push('/dashboard/parent/communication')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Contact Teacher
            </button>
          </div>
        </div>

        {/* Academic Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Alex Academic Growth</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Average grades trend across terms</p>
          </div>

          <div className="h-72 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorAlex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" fillOpacity={1} fill="url(#colorAlex)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Parent AI Counseling Dialog Modal */}
      <AnimatePresence>
        {parentChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setParentChatOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden z-10 flex flex-col justify-between h-[500px] text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-650 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Parent Guidance AI</h4>
                </div>
                <button 
                  onClick={() => setParentChatOpen(false)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 my-2 bg-slate-55 p-3.5 border border-slate-200/80 rounded-2xl shadow-inner">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm font-light'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex gap-3 items-start justify-start">
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-550 flex items-center gap-1.5 shadow-sm">
                      <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                      <span>Syncy is scanning report metrics...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="border-t border-slate-100 pt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about Alex's grades, attendance, or stress logs..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
