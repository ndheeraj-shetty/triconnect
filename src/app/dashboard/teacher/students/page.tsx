'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Sparkles, 
  Brain, 
  Search, 
  Check, 
  MessageSquare, 
  Activity, 
  BookOpen, 
  TrendingUp,
  FileCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface StudentRosterItem {
  id: string;
  name: string;
  grade: string;
  score: number;
  attendance: number;
  wellbeingStatus: 'Stable' | 'Fatigued' | 'Needs Attention';
  wellbeingScore: number;
  recentComment: string;
}

const initialStudents: StudentRosterItem[] = [
  { id: 's1', name: 'Alex Mercer', grade: 'A-', score: 89, attendance: 94.8, wellbeingStatus: 'Stable', wellbeingScore: 7, recentComment: 'Alex exhibits a strong interest in practical laboratory sessions and writes excellent lab summaries.' },
  { id: 's2', name: 'Emily Watson', grade: 'B', score: 82, attendance: 90.2, wellbeingStatus: 'Fatigued', wellbeingScore: 4, recentComment: 'Good work overall. Dips in physics laboratory focus are sometimes visible during Thursday classes.' },
  { id: 's3', name: 'Jacob Miller', grade: 'C+', score: 78, attendance: 88.5, wellbeingStatus: 'Needs Attention', wellbeingScore: 3, recentComment: 'Calculus homework grade dropped by 15% over last 3 quests. Advised revision.' },
  { id: 's4', name: 'Sophia Loren', grade: 'A', score: 96, attendance: 98.4, wellbeingStatus: 'Stable', wellbeingScore: 9, recentComment: 'Exceptional creativity. Sophia shows high enthusiasm in all science modules.' },
  { id: 's5', name: 'Ryan Reynolds', grade: 'B+', score: 87, attendance: 95.0, wellbeingStatus: 'Stable', wellbeingScore: 8, recentComment: 'Consistent performance. Participates actively and completes assignments on time.' }
];

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentRosterItem[]>(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = useState('s1');
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI comment generator state variables
  const [tone, setTone] = useState<'Encouraging' | 'Constructive' | 'Academic'>('Encouraging');
  const [focusArea, setFocusArea] = useState<'wellbeing' | 'academic' | 'attendance'>('academic');
  const [generating, setGenerating] = useState(false);
  const [generatedComment, setGeneratedComment] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleGenerateAIComment = () => {
    setGenerating(true);
    setGeneratedComment('');

    setTimeout(() => {
      setGenerating(false);
      let comment = '';
      if (focusArea === 'academic') {
        if (tone === 'Encouraging') {
          comment = `${selectedStudent.name} is making wonderful progress in class. With an current score of ${selectedStudent.score}%, they demonstrate solid critical thinking. Keep up the fantastic effort!`;
        } else if (tone === 'Constructive') {
          comment = `${selectedStudent.name} shows potential but needs to focus on steady conceptual execution. Reviewing study guides ahead of midterm quizzes will help elevate their ${selectedStudent.grade} standing.`;
        } else {
          comment = `${selectedStudent.name} exhibits structured analytical work. They have established a stable understanding of the syllabus parameters, matching course benchmarks.`;
        }
      } else if (focusArea === 'wellbeing') {
        comment = `I notice ${selectedStudent.name} has had some fatigue indicators lately (Wellbeing index: ${selectedStudent.wellbeingScore}/10). We are monitoring their stress budgets to keep classroom workloads balanced.`;
      } else {
        comment = `${selectedStudent.name} currently maintains an attendance rate of ${selectedStudent.attendance}%. Consistent class check-ins remain crucial for reinforcing calculus and chemistry modules.`;
      }
      setGeneratedComment(comment);
    }, 1500);
  };

  const handleSaveComment = () => {
    if (!generatedComment) return;
    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, recentComment: generatedComment } : s));
    setGeneratedComment('');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Student Roster & AI Comments</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Inspect student academic scores, wellbeing indexes, and generate AI-powered report card comments.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-205 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm text-left">
        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest font-mono">Class Roster Filters</span>
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name..." 
            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Main Grid: Roster Table & AI Copilot Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Student Roster Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registered Students</h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Click on any student row to load their AI comment generator profile.</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject Score</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-right">Wellbeing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                      selectedStudentId === student.id ? 'bg-blue-50/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{student.name}</div>
                      <div className="text-[10px] text-slate-450 font-normal mt-0.5">ID: WA-90{student.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-705">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{student.score}%</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[8px] font-bold uppercase shrink-0 shadow-sm">{student.grade}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono">
                      {student.attendance}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        student.wellbeingStatus === 'Stable' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : student.wellbeingStatus === 'Fatigued' 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {student.wellbeingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Comment generator side panel (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-blue-105 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-sm text-left">
          
          <div className="space-y-4">
            <div className="border-b border-slate-200/60 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-650" /> AI Comment Generator
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Generate personalized report comments for your students.</p>
            </div>

            {/* Direct Student Selector Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Select Student Roster</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>

            {/* Current Metrics summary */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-[10px] font-mono text-slate-500 shadow-sm">
              <p className="flex justify-between"><span>GRADE STANDING:</span> <span className="text-slate-800 font-bold">{selectedStudent.score}% ({selectedStudent.grade})</span></p>
              <p className="flex justify-between"><span>ATTENDANCE SCAN:</span> <span className="text-slate-800 font-bold">{selectedStudent.attendance}%</span></p>
              <p className="flex justify-between"><span>WELLBEING INDEX:</span> <span className="text-slate-850 font-bold">{selectedStudent.wellbeingStatus} (Score: {selectedStudent.wellbeingScore}/10)</span></p>
            </div>

            {/* Generator parameters */}
            <div className="space-y-3.5">
              
              {/* Focus Area */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Focus Parameter</label>
                <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  {(['academic', 'wellbeing', 'attendance'] as const).map((area) => (
                    <button
                      key={area}
                      onClick={() => setFocusArea(area)}
                      className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        focusArea === area 
                          ? 'bg-blue-600 text-white font-extrabold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block font-mono">Commentary Tone</label>
                <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  {(['Encouraging', 'Constructive', 'Academic'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        tone === t 
                          ? 'bg-blue-650 text-white font-extrabold' 
                          : 'text-slate-505 hover:text-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output block */}
            <div className="space-y-2">
              <button
                onClick={handleGenerateAIComment}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-white" />
                Generate Review Comment
              </button>

              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-500 shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Analyzing student telemetry...</span>
                  </motion.div>
                ) : generatedComment ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3"
                  >
                    <textarea
                      value={generatedComment}
                      onChange={(e) => setGeneratedComment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:border-blue-500 outline-none leading-relaxed shadow-inner"
                      rows={4}
                    />
                    <button
                      onClick={handleSaveComment}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Save comment to Student record
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Current saved comment review */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 italic leading-relaxed shadow-sm">
            <span className="font-bold text-[9px] uppercase tracking-wider text-slate-450 block mb-1 font-mono">Current Saved Comments:</span>
            &ldquo;{selectedStudent.recentComment}&rdquo;
          </div>
        </div>

      </div>

    </div>
  );
}
