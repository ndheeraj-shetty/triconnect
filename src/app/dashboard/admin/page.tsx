'use client';

import React, { useState, useEffect } from 'react';
import { autoInitializeSchoolGps } from '@/lib/auto-school-gps';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  GraduationCap,
  MapPin,
  AlertTriangle,
  QrCode,
  PlusCircle,
  Send,
  Sliders,
  CheckCircle,
  FileCheck,
  X,
  Heart
} from 'lucide-react';

interface ClassGroup {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  advisor: string;
  attendanceRate: number;
  aiFlags: number;
}

const initialClasses: ClassGroup[] = [
  { id: '1', name: 'Science & Chemistry 10B', grade: 'Grade 10', studentCount: 24, advisor: 'Sarah Jenkins', attendanceRate: 96.2, aiFlags: 1 },
  { id: '2', name: 'Mathematics Calculus 10A', grade: 'Grade 10', studentCount: 28, advisor: 'David Chen', attendanceRate: 94.8, aiFlags: 2 },
  { id: '3', name: 'Physics Mechanics 11A', grade: 'Grade 11', studentCount: 22, advisor: 'Sarah Jenkins', attendanceRate: 92.0, aiFlags: 0 },
  { id: '4', name: 'English Literature 10B', grade: 'Grade 10', studentCount: 26, advisor: 'Emma Watson', attendanceRate: 98.0, aiFlags: 0 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassGroup[]>(initialClasses);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassAdvisor, setNewClassAdvisor] = useState('Sarah Jenkins');
  const [newClassGrade, setNewClassGrade] = useState('Grade 10');
  const [newClassStudents, setNewClassStudents] = useState(25);
  
  const [successMsg, setSuccessMsg] = useState('');

  // Hackathon Requirement: Auto-initialize School GPS on Admin first login
  React.useEffect(() => {
    autoInitializeSchoolGps();
  }, []);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const newClass: ClassGroup = {
      id: (classes.length + 1).toString(),
      name: newClassName,
      grade: newClassGrade,
      studentCount: newClassStudents,
      advisor: newClassAdvisor,
      attendanceRate: 100,
      aiFlags: 0
    };

    setClasses([...classes, newClass]);
    setClassModalOpen(false);
    setNewClassName('');
    setSuccessMsg('Successfully registered new class group!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-105 text-left shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            School Administration Portal <Sparkles className="h-5 w-5 text-blue-650 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-light">Westside Academy High system administrator. Real-time school telemetry overview.</p>
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Students</span>
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">1,420</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">↑ 4% registration growth</p>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Faculty Headcount</span>
            <Users className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">84</h3>
            <p className="text-[10px] text-indigo-650 mt-1 font-semibold font-sans">Across 6 academic divisions</p>
          </div>
        </div>

        {/* Total Parents */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Parents Registered</span>
            <Users className="h-5 w-5 text-emerald-555" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">1,180</h3>
            <p className="text-[10px] text-emerald-650 mt-1 font-semibold">92% Weekly Digest read rate</p>
          </div>
        </div>

        {/* Today's Overall Attendance */}
        <div className="bg-white border border-slate-205 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm bg-gradient-to-tr from-white to-pink-50/10 text-left">
          <div className="flex justify-between items-start">
            <span className="text-slate-455 text-[10px] font-bold uppercase tracking-widest">Overall Attendance</span>
            <QrCode className="h-5 w-5 text-pink-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-pink-600">95.8%</h3>
            <p className="text-[10px] text-slate-450 mt-1 font-light">Today check-in sweeps: 1,360/1,420</p>
          </div>
        </div>
      </div>

      {/* Class management directory table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Classrooms Management</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Track classroom attendance telemetry, class size, and warnings</p>
          </div>
          
          <button
            onClick={() => setClassModalOpen(true)}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="h-4 w-4 text-white" />
            <span>Add Class Group</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                <th className="py-3 px-4 font-extrabold">Class Group</th>
                <th className="py-3 px-4 font-extrabold">Grade</th>
                <th className="py-3 px-4 font-extrabold">Student Count</th>
                <th className="py-3 px-4 font-extrabold">Faculty Advisor</th>
                <th className="py-3 px-4 font-extrabold">Attendance Rate</th>
                <th className="py-3 px-4 font-extrabold">Active AI Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{cls.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{cls.grade}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{cls.studentCount} students</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{cls.advisor}</td>
                  <td className="py-3.5 px-4 text-slate-705 font-medium font-mono">{cls.attendanceRate}%</td>
                  <td className="py-3.5 px-4">
                    {cls.aiFlags > 0 ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-650" /> {cls.aiFlags} Flags
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500 text-[8px] font-bold uppercase tracking-wider">
                        None
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>      {/* Administration controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">

        {/* Quick action 1: Student Registration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="h-4.5 w-4.5 text-blue-655" /> Register Students
            </h4>
            <p className="text-xs text-slate-505 mt-1 font-light">Create new student records, link parent guardians, and generate credentials handouts.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/register-student')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
          >
            Open student registration
          </button>
        </div>

        {/* Quick action 2: Attendance Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="h-4.5 w-4.5 text-slate-600" /> Attendance &amp; Settings
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-light font-sans">Configure biometric thresholds, session hours, and review today&apos;s attendance logs.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/attendance')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
          >
            Open attendance settings
          </button>
        </div>

        {/* Quick action 4: Student Wellbeing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Heart className="h-4.5 w-4.5 text-rose-500 animate-pulse fill-rose-100" /> School Wellbeing
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-light font-sans">Monitor school-wide anonymity analytics, student risk categories, and counselling bookings.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/teacher/wellbeing')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-sm"
          >
            Open wellbeing index
          </button>
        </div>

      </div>

      {/* Add Class Modal */}
      <AnimatePresence>
        {classModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setClassModalOpen(false)}
              className="fixed inset-0 bg-slate-955"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10 space-y-5 text-left animate-fade-in"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Add Class Group</h4>
                <button 
                  onClick={() => setClassModalOpen(false)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddClass} className="space-y-4 text-left font-sans">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Class / Course Name</label>
                  <input 
                    type="text" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Modern Literature 10A" 
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block font-mono">Grade Level</label>
                    <select 
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                    >
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block font-mono">Advisor Teacher</label>
                    <select 
                      value={newClassAdvisor}
                      onChange={(e) => setNewClassAdvisor(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                    >
                      <option>Sarah Jenkins</option>
                      <option>David Chen</option>
                      <option>Emma Watson</option>
                      <option>Arthur Pendragon</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Initial Student Count</label>
                  <input 
                    type="number" 
                    value={newClassStudents}
                    onChange={(e) => setNewClassStudents(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-505 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create & Initialize Class Group
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
            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
              <FileCheck className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Class Registered!</h5>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-light">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
