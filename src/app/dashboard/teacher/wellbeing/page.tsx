'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Flame, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  Brain,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TeacherWellbeingDashboard() {
  const router = useRouter();
  
  // Dashboard states
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Overall School Wellness Index mock
  const schoolWellnessIndex = 84.5;

  useEffect(() => {
    fetchWellnessDashboard();
  }, []);

  const fetchWellnessDashboard = async () => {
    setLoading(true);
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/wellbeing/teacher/dashboard', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentsNeedingAttention(data.students_needing_attention);
        setUpcomingSessions(data.upcoming_counselling_sessions);
      }
    } catch (e) {
      // Mock fallback data
      setStudentsNeedingAttention([
        {
          id: 's1',
          student_name: 'Harry Potter',
          risk_level: 'Red',
          overall_score: 52.4,
          reason: { reason_explanation: 'Conclusion reached because: Attendance dropped to 64.0%, Assignment completion rate is below passing limits, Student reported high stress in 4 of their recent check-ins.' }
        },
        {
          id: 's2',
          student_name: 'Ron Weasley',
          risk_level: 'Orange',
          overall_score: 68.0,
          reason: { reason_explanation: 'Conclusion reached because: Motivation score dropped, homework completion rate is low.' }
        }
      ]);

      setUpcomingSessions([
        {
          id: 'req1',
          student_name: 'Harry Potter',
          date: new Date().toISOString().split('T')[0],
          time: '11:30 AM',
          reason: 'Severe math test anxiety and peer exclusion concerns',
          risk_level: 'Red',
          ai_summary: 'Consolidated AI Briefing:\n- Attendance: 64%.\n- Homework: 40%.\n- Stress check-ins: High.\n- Suggested focus: Time management and peer counseling.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch(`http://localhost:8000/api/v1/wellbeing/teacher/requests/${sessionId}/status?status_val=${newStatus}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.ok) {
        setSuccessMsg(`Session status successfully marked as ${newStatus}!`);
        fetchWellnessDashboard();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      setUpcomingSessions(prev => prev.filter(s => s.id !== sessionId));
      setSuccessMsg(`[Demo Mode] Session status marked as ${newStatus}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const getRiskStyles = (lvl: string) => {
    switch (lvl) {
      case 'Red': return 'bg-red-50 text-red-700 border-red-200';
      case 'Orange': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Yellow': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getRiskBadge = (lvl: string) => {
    switch (lvl) {
      case 'Red': return '🔴 Red Alert';
      case 'Orange': return '🟠 Orange Risk';
      case 'Yellow': return '🟡 Yellow Warning';
      default: return '🟢 Healthy';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-[10px] font-bold text-blue-650 uppercase tracking-wider shadow-sm">
          <Brain className="h-3.5 w-3.5 text-blue-600 animate-pulse" /> Wellness Dashboard
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">School Well-Being Index</h1>
        <p className="text-slate-500 font-light text-sm mt-1">
          Monitor early anomalies, track students needing psychological attention, and verify booked counseling requests.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="h-4.5 w-4.5" /> {successMsg}
        </div>
      )}

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Global Wellness gauge */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">School Wellness Index</span>
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{schoolWellnessIndex}%</h3>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Healthy average across all divisions</p>
          </div>
        </div>

        {/* Counselling summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Pending Sessions</span>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{upcomingSessions.length}</h3>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Scheduled counseling appointments</p>
          </div>
        </div>

        {/* High Risk students count */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Students At Risk</span>
            <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-rose-600">
              {studentsNeedingAttention.filter(s => s.risk_level === 'Red' || s.risk_level === 'Orange').length}
            </h3>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Categorized as Red or Orange risk</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Students Needing Attention (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Students Needing Attention</h3>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Continuous diagnostics highlights anomalies outside standard thresholds.</p>
            </div>

            <div className="space-y-3.5">
              {studentsNeedingAttention.length > 0 ? (
                studentsNeedingAttention.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-4 border rounded-2xl bg-slate-50/50 flex flex-col gap-3 text-xs text-left"
                  >
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{s.student_name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Wellness score: {s.overall_score.toFixed(1)}%</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getRiskStyles(s.risk_level)}`}>
                        {getRiskBadge(s.risk_level)}
                      </span>
                    </div>

                    {/* AI Diagnosis explanation */}
                    <div className="p-3 bg-white border border-slate-150 rounded-xl text-[10px] text-slate-550 leading-relaxed font-light flex gap-2">
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700 block uppercase tracking-widest text-[8px] mb-0.5">Diagnostics rationale (XAI)</span>
                        {s.reason?.reason_explanation || "Evaluation shows attendance reductions and daily checks warnings."}
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic text-xs">
                  No student wellness anomalies detected. All student indices healthy!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Upcoming Sessions & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Counselling Requests List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Counselling Session Bookings</h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-light">Accept, complete, or reschedule pending psychologist requests.</p>
            </div>

            <div className="space-y-3.5">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 border rounded-2xl bg-slate-50/50 space-y-3 text-xs text-left"
                  >
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-850">{session.student_name}</h4>
                        <div className="flex gap-2 text-[9px] text-slate-400 font-mono mt-1">
                          <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {session.date}</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {session.time}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getRiskStyles(session.risk_level)}`}>
                        {session.risk_level}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-150 font-light">
                      <span className="font-semibold text-slate-800 block mb-0.5">Reason:</span>
                      "{session.reason}"
                    </div>

                    {/* AI Consolidated summary briefing */}
                    {session.ai_summary && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[9px] text-slate-650 leading-relaxed font-mono">
                        <span className="font-bold text-indigo-900 block font-sans uppercase tracking-widest text-[8px] mb-0.5">🧠 AI Briefing for Counselor</span>
                        {session.ai_summary}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-1 flex gap-2 justify-end">
                      <button
                        onClick={() => handleUpdateSessionStatus(session.id, 'CANCELLED')}
                        className="px-2.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateSessionStatus(session.id, 'COMPLETED')}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" /> Complete
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 italic text-[11px]">
                  No upcoming counselling sessions scheduled.
                </div>
              )}
            </div>
          </div>

          {/* Quick Intervention recommendations */}
          <div className="bg-slate-900 border border-slate-950 rounded-3xl p-6 text-white shadow-sm text-left space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5" /> Quick Intervention Guide
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2.5 items-start">
                <div className="h-5 w-5 bg-blue-500 text-white rounded-md flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                <div>
                  <h4 className="font-bold text-white">Academic Workload Adjustment</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed font-light">Reduce assignment weight parameters slightly for students showing high stress indices.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="h-5 w-5 bg-blue-500 text-white rounded-md flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                <div>
                  <h4 className="font-bold text-white">Syllabus-Aligned Quests Review</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed font-light">Sync AI Quest parameters to match notes only, avoiding complex un-introduced patterns.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
