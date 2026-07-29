'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Users, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Radio, 
  Sparkles,
  Award,
  Video,
  Info
} from 'lucide-react';

interface SweepCheckIn {
  id: string;
  name: string;
  time: string;
  location: string;
  status: 'Matched' | 'Bypassed';
}

const initialSweeps: SweepCheckIn[] = [
  { id: '1', name: 'Alex Mercer', time: '09:05 AM', location: 'GPS Match: Room 304', status: 'Matched' },
  { id: '2', name: 'Sophia Loren', time: '09:03 AM', location: 'GPS Match: Room 304', status: 'Matched' },
  { id: '3', name: 'Jacob Miller', time: '09:02 AM', location: 'GPS Match: Room 304', status: 'Matched' }
];

export default function TeacherAttendancePage() {
  const [sessionActive, setSessionActive] = useState(true);
  const [sweeps, setSweeps] = useState<SweepCheckIn[]>(initialSweeps);
  const [timer, setTimer] = useState(180); // 3 minutes countdown
  const [totalStudents, setTotalStudents] = useState(24);

  // Countdown timer simulation
  useEffect(() => {
    if (!sessionActive || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, timer]);

  // Simulate incoming sweeps checkins
  useEffect(() => {
    if (!sessionActive) return;
    
    const interval = setInterval(() => {
      if (sweeps.length >= 8) return;
      
      const newNames = ['Emily Watson', 'Ryan Reynolds', 'Emma Watson', 'Dave Grohl', 'James Hetfield'];
      const pickName = newNames[Math.floor(Math.random() * newNames.length)];
      
      // Avoid duplicates
      if (sweeps.some(s => s.name === pickName)) return;

      const newSweep: SweepCheckIn = {
        id: (sweeps.length + 1).toString(),
        name: pickName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        location: 'GPS Match: Room 304',
        status: 'Matched'
      };

      setSweeps(prev => [newSweep, ...prev]);
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionActive, sweeps]);

  const handleResetSession = () => {
    setSweeps(initialSweeps);
    setTimer(180);
    setSessionActive(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Projector Attendance checkpoint</h1>
          <p className="text-xs text-slate-505 mt-1 font-light font-sans">Project this dashboard onto the classroom whiteboard. Students scan the QR code to lock attendance logs.</p>
        </div>
        <button
          onClick={handleResetSession}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <span>Reset Scan Session</span>
        </button>
      </div>

      {/* Main Grid: Projector QR & sweeps activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Projector Code Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm text-left">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Live Broadcast Scan Node</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Clock className="h-4.5 w-4.5 text-slate-455" />
              <span>TIMER LOCKOUT: <span className="font-mono text-red-550">{formatTime(timer)}</span></span>
            </div>
          </div>

          {/* Large Projector QR */}
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner aspect-square max-w-sm mx-auto">
            {/* Live radar overlay sweep */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.03)_10%,transparent_100%)] animate-pulse" />

            <div className="border-2 border-blue-500 bg-white p-6 rounded-2xl shadow-md z-10 transition-transform hover:scale-[1.01]">
              <QrCode className="h-44 w-44 text-slate-900" />
            </div>

            <p className="text-[10px] text-slate-455 font-bold uppercase tracking-widest font-mono mt-4 z-10">Chemistry 10B Room 304 node</p>
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-slate-100 text-slate-500">
            <span>ID: CHEM-10B-304</span>
            <span className="text-emerald-705 font-bold flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> SECURE GPS SIGNATURE ACTIVE</span>
          </div>

        </div>

        {/* Real-time Sweeps Activity sidebar (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-sm text-left">
          
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-650" /> Live Sweeps Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">As students scan the whiteboard, their status ticks present automatically.</p>
            </div>

            {/* Attendance Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Classroom Attendance</span>
                <span className="text-blue-650 font-black">{sweeps.length} / {totalStudents} present</span>
              </div>
              <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
                <motion.div 
                  animate={{ width: `${(sweeps.length / totalStudents) * 100}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-650 rounded-full"
                />
              </div>
            </div>

            {/* Sweep logs */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence>
                {sweeps.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs shadow-sm"
                  >
                    <div>
                      <h5 className="font-bold text-slate-800">{s.name}</h5>
                      <p className="text-[10px] text-slate-450 mt-0.5">{s.location}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">{s.time}</span>
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[8px] mt-0.5 font-mono uppercase">
                        {s.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2 items-center text-[10px] text-slate-500 shadow-sm">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0" />
            <p>Students must be within 15 meters of Room 304 to complete telemetry scans.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
