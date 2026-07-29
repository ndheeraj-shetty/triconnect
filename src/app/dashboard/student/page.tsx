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
  FileText, 
  Download, 
  Bot, 
  ArrowRight,
  Smile,
  Frown,
  Meh,
  Activity,
  Award
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

// Mock Chart Data
const performanceData = [
  { term: 'Term 1', math: 78, science: 82, english: 85 },
  { term: 'Term 2', math: 82, science: 85, english: 88 },
  { term: 'Term 3', math: 85, science: 89, english: 87 },
  { term: 'Term 4', math: 89, science: 92, english: 90 },
];

const attendanceData = [
  { day: 'Mon', hours: 6 },
  { day: 'Tue', hours: 6.5 },
  { day: 'Wed', hours: 7 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 6 },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mood, setMood] = useState(7);
  const [showMoodResponse, setShowMoodResponse] = useState(false);
  const [moodFeedback, setMoodFeedback] = useState('');

  // Hydration safety for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoodSubmit = () => {
    setShowMoodResponse(true);
    if (mood <= 4) {
      setMoodFeedback(
        "Syncy AI Alert: Hey Alex, it looks like you are feeling down or fatigued today. I have noted this in your stress budget and recommended that your Science teacher grant a 1-day extension on your pending Chemistry lab. Be sure to check the Wellbeing AI tab for self-care exercises!"
      );
    } else if (mood <= 7) {
      setMoodFeedback(
        "Syncy AI Analysis: You're doing okay, but there's room to improve your focus. Make sure to schedule a 15-minute screen break between study sessions. Keeping your momentum steady is key!"
      );
    } else {
      setMoodFeedback(
        "Syncy AI Update: Fantastic! You are in peak mental readiness. Your chemistry homework streak is active (+50 XP). Tonight is a great night to tackle your physics modules while your focus score is high!"
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100 text-left">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Welcome back, Alex! <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Your academic score is up 1.2% this week. Keep up the great streak!</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
          <Award className="h-4 w-4 text-amber-500" />
          <span className="font-bold text-slate-800">Rank #4</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-650 font-bold">1,240 XP</span>
        </div>
      </div>

      {/* Grid of Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Attendance */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Attendance Rate</span>
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">94.8%</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">↑ 2% compared to last term</p>
          </div>
        </div>

        {/* Card 2: Performance */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">GPA Score</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">88.5 / 100</h3>
            <p className="text-[10px] text-blue-500 mt-1 font-semibold">Class Average: 81.2</p>
          </div>
        </div>

        {/* Card 3: Homework completion */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Homework Quests</span>
            <BookOpen className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">9 / 10</h3>
            <p className="text-[10px] text-indigo-650 mt-1 font-semibold">1 homework due tomorrow</p>
          </div>
        </div>

        {/* Card 4: Wellbeing Score */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm bg-gradient-to-tr from-white to-pink-50/10 text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-450 text-[10px] font-bold uppercase tracking-widest">Wellbeing Index</span>
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-pink-600">Stable</h3>
            <p className="text-[10px] text-slate-450 mt-1">AI-counselor active check-in</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Wellbeing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Wellbeing AI check-in slider */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-650" /> Daily Wellbeing Slider
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">How is your mental load, fatigue, or stress today?</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-450 uppercase tracking-wider">
              <span className="flex items-center gap-1"><Frown className="h-4 w-4 text-red-500" /> Stressed</span>
              <span className="flex items-center gap-1"><Meh className="h-4 w-4 text-amber-500" /> Tired</span>
              <span className="flex items-center gap-1"><Smile className="h-4 w-4 text-emerald-500" /> Energetic</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={mood}
              onChange={(e) => {
                setMood(Number(e.target.value));
                setShowMoodResponse(false);
              }}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-center font-extrabold text-slate-800 text-base">
              Score: <span className="text-blue-650">{mood} / 10</span>
            </div>
          </div>

          <button
            onClick={handleMoodSubmit}
            className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            Submit mood score
          </button>

          {/* AI Response Card */}
          <AnimatePresence>
            {showMoodResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs leading-relaxed font-light"
              >
                {moodFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Academic Progress</h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Grades trend over the current academic year</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Math</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Science</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="math" stroke="#2563eb" fillOpacity={1} fill="url(#colorMath)" strokeWidth={2} />
                  <Area type="monotone" dataKey="science" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScience)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Attendance Weekly & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Attendance weekly bar chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Daily Study Attendance Logs</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Class study log hours captured by QR Badge sweeps</p>
          </div>

          <div className="h-64 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Instant triggers for active coursework</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/student/assignments')}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-all flex justify-between items-center cursor-pointer group text-left shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4.5 w-4.5 text-indigo-650" />
                <span className="text-xs font-bold text-slate-700">Open Gamified Quests</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/dashboard/student/wellbeing')}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-all flex justify-between items-center cursor-pointer group text-left shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Chat with Syncy AI</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/dashboard/student/reports')}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-all flex justify-between items-center cursor-pointer group text-left shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4.5 w-4.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700">Academic Analytics Report</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard/student/attendance')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Scan Class Attendance QR
          </button>
        </div>
      </div>

    </div>
  );
}
