'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  Info,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ProtectedStudent {
  id: string;
  name: string;
  course: string;
  currentOverloadScore: number;
  graceStatus: string;
  daysGranted: number;
}

const initialProtected: ProtectedStudent[] = [
  { id: '1', name: 'Emily Watson', course: 'Physics Mechanics Lab', currentOverloadScore: 8.4, graceStatus: '2-Day grace period granted on Kinematics assignment', daysGranted: 2 },
  { id: '2', name: 'Jacob Miller', course: 'Calculus Derivatives Module', currentOverloadScore: 7.9, graceStatus: 'Midterm quiz rescheduled to July 28', daysGranted: 3 },
  { id: '3', name: 'Alex Mercer', course: 'Chemistry Lab Writeup', currentOverloadScore: 6.8, graceStatus: '1-Day grace period granted on organic compound notes', daysGranted: 1 }
];

export default function TeacherProtectionPage() {
  const [protectedStudents, setProtectedStudents] = useState<ProtectedStudent[]>(initialProtected);
  const [shieldActive, setShieldActive] = useState(true);
  const [grantName, setGrantName] = useState('Emily Watson');
  const [grantCourse, setGrantCourse] = useState('Physics Mechanics Lab');
  const [grantDays, setGrantDays] = useState(2);
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleGrantGrace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantName || !grantCourse) return;

    const newProtected: ProtectedStudent = {
      id: (protectedStudents.length + 1).toString(),
      name: grantName,
      course: grantCourse,
      currentOverloadScore: 7.2,
      graceStatus: `${grantDays}-Day grace period granted on assignment quest`,
      daysGranted: grantDays
    };

    setProtectedStudents([newProtected, ...protectedStudents]);
    setSuccessMsg(`Successfully granted ${grantDays}-day extension!`);
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Teacher Protection Shield</h1>
        <p className="text-xs text-slate-550 mt-1 font-light">Enables automatic workloads extensions and quiz scheduling modifications when AI fatigue markers are triggered.</p>
      </div>

      {/* Shield status controller */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Shield Toggle box */}
        <div className="md:col-span-8 bg-white border border-slate-205 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm text-left">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              {shieldActive ? (
                <>
                  <ShieldCheck className="h-4.5 w-4.5 text-blue-600 animate-pulse" /> Protection Shield is Active
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4.5 w-4.5 text-red-600" /> Protection Shield Suspended
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-light">When active, students flagged with stress &gt; 7.5 are automatically recommended for grace extensions.</p>
          </div>

          <button
            onClick={() => setShieldActive(!shieldActive)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm text-center border-none ${
              shieldActive 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {shieldActive ? 'Disable Shield' : 'Activate Shield'}
          </button>
        </div>

        {/* Protected metrics summary */}
        <div className="md:col-span-4 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-2 font-mono">Shield Statistics</span>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[8px] text-slate-500 font-bold uppercase">Students</p>
              <p className="text-sm font-extrabold text-blue-600 mt-0.5">{protectedStudents.length}</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[8px] text-slate-500 font-bold uppercase">Status</p>
              <p className="text-sm font-extrabold text-emerald-700 mt-0.5">HEALTHY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Grace form & active list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Grant extension form (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-blue-105 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
          
          <div className="space-y-4">
            <div className="border-b border-slate-200/60 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-650" /> Schedule Grace Period
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Deploy classroom extensions directly to selected student homework quests.</p>
            </div>

            <form onSubmit={handleGrantGrace} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Student Name</label>
                <select 
                  value={grantName}
                  onChange={(e) => setGrantName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option>Emily Watson</option>
                  <option>Jacob Miller</option>
                  <option>Alex Mercer</option>
                  <option>Sophia Loren</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Course Assignment Target</label>
                <select
                  value={grantCourse}
                  onChange={(e) => setGrantCourse(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option>Physics Mechanics Lab</option>
                  <option>Chemistry Lab Writeup</option>
                  <option>Calculus Derivatives Module</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Grace Days Granted</label>
                <input 
                  type="number" 
                  min="1" 
                  max="7"
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Grant Workload extension
              </button>
            </form>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl flex gap-2 items-center text-[10px] text-slate-500 shadow-sm">
            <Info className="h-4.5 w-4.5 text-blue-650 shrink-0" />
            <p>Protected extensions push real-time notifications to the Parent Portal.</p>
          </div>
        </div>

        {/* Active protected student registry (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Active Protection Registry</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">List of active classroom workload protections deployed.</p>
          </div>

          <div className="overflow-x-auto w-full pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                  <th className="py-3 px-4">Student / Course</th>
                  <th className="py-3 px-4">Overload risk</th>
                  <th className="py-3 px-4 text-right font-extrabold">Active Protection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {protectedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-450 font-normal mt-0.5">{s.course}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-bold">
                      {s.currentOverloadScore} / 10
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                        {s.graceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xl flex gap-3 items-center max-w-sm text-left animate-float"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-605 shrink-0 shadow-inner">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Workload Protection Active!</h5>
              <p className="text-[10px] text-slate-505 mt-0.5 leading-normal font-light">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
