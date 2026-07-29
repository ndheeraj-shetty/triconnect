'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Brain, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  Printer, 
  BookOpen,
  X
} from 'lucide-react';

interface SubjectGrade {
  code: string;
  name: string;
  grade: string;
  score: number;
  attendance: number;
  teacher: string;
  teacherComment: string;
}

const mockGrades: SubjectGrade[] = [
  { code: 'SCI-10B', name: 'Chemistry (Science)', grade: 'A', score: 92, attendance: 98, teacher: 'Sarah Jenkins', teacherComment: 'Alex exhibits a strong interest in practical laboratory sessions and writes excellent lab summaries. Keep it up!' },
  { code: 'MATH-CAL', name: 'Mathematics (Calculus)', grade: 'B+', score: 85, attendance: 95, teacher: 'David Chen', teacherComment: 'Derivatives concept comprehension is good, although homework submissions are sometimes finished near the deadline.' },
  { code: 'ENG-LIT', name: 'English Literature', grade: 'A-', score: 89, attendance: 96, teacher: 'Emma Watson', teacherComment: 'Alex writes very detailed analytical essays. Class participation is constructive and engaging.' },
  { code: 'PHY-LAB', name: 'Physics (Mechanics)', grade: 'B', score: 82, attendance: 90, teacher: 'Sarah Jenkins', teacherComment: 'Good work overall. Dips in physics laboratory focus are sometimes visible during Thursday morning classes.' },
  { code: 'ART-MOD', name: 'Arts (Modern Art)', grade: 'A', score: 95, attendance: 95, teacher: 'Arthur Pendragon', teacherComment: 'Exceptional sketching and conceptual creativity. Alex shows high enthusiasm in all art modules.' },
];

export default function StudentReportsPage() {
  const [printModalOpen, setPrintModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Academic Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Review term transcripts, teacher comments, and AI study recommendations.</p>
        </div>
        <button
          onClick={() => setPrintModalOpen(true)}
          className="px-4 py-2.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="h-4 w-4 text-blue-600" />
          <span>Print Official Report Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: AI Synapse Analysis (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5 text-blue-650" /> AI Synapse Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Continuous study engine review report</p>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-sm">
              <h5 className="text-[9px] text-blue-600 font-bold uppercase tracking-wider font-mono">Academic Strengths</h5>
              <p className="text-xs text-slate-700 leading-normal font-light">Exceptional reasoning and concept grasp in chemistry laboratory models and literature analyses.</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-sm">
              <h5 className="text-[9px] text-amber-600 font-bold uppercase tracking-wider font-mono">Growth Focus</h5>
              <p className="text-xs text-slate-700 leading-normal font-light">Late night study trends impact morning attention, causing minor score dips in Thursday Physics Lab quizzes.</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1 shadow-sm">
              <h5 className="text-[9px] text-indigo-650 font-bold uppercase tracking-wider font-mono">Study Suggestions</h5>
              <p className="text-xs text-slate-700 leading-normal font-light">Setup study lockouts past 10 PM. Target physics equations quests earlier in the week while focus indexes are peaking.</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-550 font-bold">
              <Award className="h-4 w-4 text-blue-605" />
              <span>Overall Standing</span>
            </div>
            <span className="font-extrabold text-slate-800">Excellent (A-)</span>
          </div>
        </div>

        {/* Right Side: Course list breakdown (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Course Grades & Remarks</h3>
            <p className="text-xs text-slate-550 mt-1 font-light">Active class transcript details</p>
          </div>

          <div className="space-y-4 pt-2">
            {mockGrades.map((subject, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 hover:bg-slate-50 hover:border-slate-350 transition-all space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-800">{subject.name}</h5>
                    <p className="text-[10px] text-slate-450 font-mono">{subject.code} • Taught by {subject.teacher}</p>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Attendance</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{subject.attendance}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Score</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{subject.score} / 100</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xs font-bold uppercase shrink-0 shadow-sm">
                      {subject.grade}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100 font-light leading-relaxed">
                  &ldquo;{subject.teacherComment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Official Printable Report Card Modal */}
      <AnimatePresence>
        {printModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrintModalOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-250 shadow-2xl p-8 overflow-hidden z-10 text-slate-900 space-y-6 my-8 text-left"
            >
              {/* Modal controls */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 font-sans">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">TriConnect Transcript Services</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                  <button 
                    onClick={() => setPrintModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-105 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Report Card content */}
              <div className="space-y-6 text-left font-serif p-4 border border-slate-200 rounded-2xl shadow-sm bg-slate-50/50">
                <div className="text-center space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-800">Westside Academy High School</h2>
                  <p className="text-[10px] font-sans text-slate-400 tracking-widest font-bold">OFFICIAL ACADEMIC TRANSCRIPT</p>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans text-xs border-y border-slate-200 py-4">
                  <div>
                    <p className="text-slate-450 font-bold uppercase tracking-wider text-[9px]">Student Name:</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">Alex Mercer</p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-bold uppercase tracking-wider text-[9px]">Academic Period:</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-0.5">2025 - 2026 Term 4</p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-bold uppercase tracking-wider text-[9px]">Student ID:</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">WA-992-MERC</p>
                  </div>
                  <div>
                    <p className="text-slate-455 font-bold uppercase tracking-wider text-[9px]">Cumulative GPA:</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">3.75 / 4.00 (A-)</p>
                  </div>
                </div>

                {/* Subject table */}
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-slate-350 text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                      <th className="py-2.5 px-2">Course Code</th>
                      <th className="py-2.5 px-2">Course Name</th>
                      <th className="py-2.5 px-2 text-center">Attendance</th>
                      <th className="py-2.5 px-2 text-right">Score</th>
                      <th className="py-2.5 px-2 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {mockGrades.map((subject, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-2 font-mono text-slate-500">{subject.code}</td>
                        <td className="py-3 px-2 font-bold text-slate-800">{subject.name}</td>
                        <td className="py-3 px-2 text-center">{subject.attendance}%</td>
                        <td className="py-3 px-2 text-right">{subject.score} / 100</td>
                        <td className="py-3 px-2 text-right font-black text-slate-900">{subject.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer signoffs */}
                <div className="grid grid-cols-2 gap-12 font-sans pt-8 text-[10px] text-slate-450 font-bold">
                  <div className="border-t border-slate-200 pt-3 text-center">
                    <p>SARAH JENKINS</p>
                    <p className="mt-0.5 font-light text-slate-400">Academic Dean</p>
                  </div>
                  <div className="border-t border-slate-200 pt-3 text-center">
                    <p>PRINCIPAL DAVIS</p>
                    <p className="mt-0.5 font-light text-slate-400">School Principal Signature</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
