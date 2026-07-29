'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock burnout data over past weeks
const burnoutTrendData = [
  { week: 'Wk 1', classAvg: 3.2, highRiskAvg: 6.8 },
  { week: 'Wk 2', classAvg: 3.4, highRiskAvg: 7.2 },
  { week: 'Wk 3', classAvg: 4.1, highRiskAvg: 7.9 },
  { week: 'Wk 4', classAvg: 3.9, highRiskAvg: 8.4 },
];

interface BurnoutStudent {
  id: string;
  name: string;
  riskScore: number; // 1-10
  indicators: string[];
  actionProposed: string;
  status: 'Flagged' | 'Actioned';
}

const initialRiskStudents: BurnoutStudent[] = [
  { id: '1', name: 'Emily Watson', riskScore: 8.4, indicators: ['Attending drops (90%)', 'Late night homework submission (2 AM)', 'Low self-reported mood'], actionProposed: 'Suggest 2-day grace period on Physics Lab, schedule counselling chat.', status: 'Flagged' },
  { id: '2', name: 'Jacob Miller', riskScore: 7.9, indicators: ['Academic score drop (15%)', 'Increased stress score (8/10)', 'Late homework logs'], actionProposed: 'Suggest review session for Calculus Limits module.', status: 'Flagged' },
  { id: '3', name: 'Alex Mercer', riskScore: 6.8, indicators: ['Mood index fell to 3/10', 'Indicated high sleep fatigue'], actionProposed: 'Extend Chemistry Lab quest by 1 day. Counselor sweep initiated.', status: 'Actioned' }
];

export default function TeacherBurnoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<BurnoutStudent[]>(initialRiskStudents);
  const [activeTab, setActiveTab] = useState<'all' | 'flagged' | 'actioned'>('all');

  // Hydration safety for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleActionStudent = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: 'Actioned' } : s));
  };

  const filteredStudents = students.filter(s => {
    if (activeTab === 'flagged') return s.status === 'Flagged';
    if (activeTab === 'actioned') return s.status === 'Actioned';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">AI Student Burnout Prediction</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Analyzes active class study logs, homework submission times, and self-reported mood indexes to predict stress overload.</p>
      </div>

      {/* Burnout Risk prediction banner */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50/50 p-5 sm:p-6 rounded-2xl border border-red-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-red-700 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <AlertTriangle className="h-4.5 w-4.5 text-red-650 animate-pulse" /> Critical Stress Warning
          </h3>
          <p className="text-xs text-slate-700 leading-normal font-light">
            AI has flagged <strong className="text-red-750 font-black">2 students</strong> in Chemistry 10B with critical fatigue levels (Burnout Score &gt; 7.5). Workloads are exceeding stress budget benchmarks.
          </p>
        </div>

        <button 
          onClick={() => router.push('/dashboard/teacher/protection')}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center border-none"
        >
          Enable Protection Shield
        </button>
      </div>

      {/* Main Grid: Risk roster & Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Roster (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Student Risk Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-light">Calculates real-time risk index</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {(['all', 'flagged', 'actioned'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-white border border-slate-200 text-blue-650 shadow-sm font-extrabold' 
                      : 'text-slate-500 hover:text-slate-805'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3.5 pt-2">
            {filteredStudents.map((s) => (
              <div 
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 hover:border-slate-350 hover:bg-slate-50 transition-all flex flex-col justify-between gap-4 shadow-sm text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-850">{s.name}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.indicators.map((ind, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[8px] font-bold text-slate-505 uppercase tracking-wide font-mono shadow-sm">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-455 uppercase font-bold tracking-wider font-mono">Fatigue score:</span>
                    <p className="text-sm font-black text-red-600 font-mono mt-0.5">{s.riskScore} / 10</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-100/80 text-[11px] leading-relaxed text-slate-700 shadow-inner flex justify-between items-center font-light">
                  <p><strong>Proposed Action:</strong> {s.actionProposed}</p>
                  
                  {s.status === 'Flagged' ? (
                    <button
                      onClick={() => handleActionStudent(s.id)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold shrink-0 shadow-sm ml-3 border-none cursor-pointer"
                    >
                      Approve Action
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px] shrink-0 ml-3">
                      <ShieldCheck className="h-3.5 w-3.5" /> Actioned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Burnout prediction Recharts trend (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left flex flex-col justify-between">
          
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-605" /> Fatigue Trajectory
            </h3>
            <p className="text-xs text-slate-500 font-light">Weekly trajectory comparison index bounds</p>
          </div>

          <div className="h-60 w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burnoutTrendData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="highRiskAvg" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="High-Risk Avg" />
                  <Line type="monotone" dataKey="classAvg" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Class Avg" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2 items-center text-[10px] text-slate-500 shadow-sm">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 animate-pulse" />
            <p>Trajectory indexes are updated nightly based on student activity logs.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
