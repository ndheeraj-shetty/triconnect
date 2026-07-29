'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Brain, 
  Bot,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';

interface ClassNote {
  id: string;
  title: string;
  course: string;
  uploadedDate: string;
  size: string;
  readers: number;
}

interface StudentSubmission {
  id: string;
  student: string;
  assignment: string;
  submittedTime: string;
  fileSize: string;
  status: 'Waiting Review' | 'Graded';
}

const initialNotes: ClassNote[] = [
  { id: '1', title: 'Organic Chemistry: Carbon Chains', course: 'Chemistry 10B', uploadedDate: 'Jul 22, 2026', size: '2.4 MB', readers: 48 },
  { id: '2', title: 'Calculus Review: Derivative Rules', course: 'Calculus BC', uploadedDate: 'Jul 20, 2026', size: '1.8 MB', readers: 64 }
];

const initialSubmissions: StudentSubmission[] = [
  { id: 's1', student: 'Alex Mercer', assignment: 'Chemistry Lab Writeup', submittedTime: 'Today, 10:15 AM', fileSize: '1.2 MB', status: 'Waiting Review' },
  { id: 's2', student: 'Emily Watson', assignment: 'Derivatives Homework Quest', submittedTime: 'Yesterday, 04:30 PM', fileSize: '980 KB', status: 'Waiting Review' },
  { id: 's3', student: 'Jacob Miller', assignment: 'Calculus Derivatives Module', submittedTime: 'Jul 21, 2026', fileSize: '2.1 MB', status: 'Graded' }
];

export default function TeacherNotesPage() {
  const [notes, setNotes] = useState<ClassNote[]>(initialNotes);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [activeAnalysisNote, setActiveAnalysisNote] = useState<ClassNote | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(false);
  
  // File upload state variables
  const [uploadProgress, setUploadProgress] = useState(false);

  const handleLaunchAnalysis = (note: ClassNote) => {
    setActiveAnalysisNote(note);
    setAnalyzing(true);
    setAnalysisResult(false);

    // Simulate AI scanning notes and generating MCQs
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult(true);
    }, 2000);
  };

  const handleGradeSubmission = (id: string) => {
    setSubmissions(submissions.map(sub => sub.id === id ? { ...sub, status: 'Graded' } : sub));
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Notes Upload & Grading Queue</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Upload lectures resources, trigger AI quiz conversions, and grade student quest files.</p>
      </div>

      {/* Main Grid: Upload Center & Student Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Notes Center (6 Cols) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Uploader Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Course Resource Uploader</h3>
              <p className="text-xs text-slate-505 mt-1 font-light">Upload PDF lessons notes to sync with student portals.</p>
            </div>

            <div className="border border-dashed border-slate-300 bg-slate-50/50 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-400">
              <UploadCloud className="h-8 w-8 text-slate-400 mb-3" />
              <p className="text-xs font-bold text-slate-700">Drag files here, or click to upload</p>
              <p className="text-[10px] text-slate-450 mt-1">Supports PDF, DOCX, TXT files up to 20MB</p>
            </div>
          </div>

          {/* Active Note Library */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Uploaded Lecture Notes</h3>
              <p className="text-xs text-slate-505 mt-1 font-light">Notes currently active in Student notes portals</p>
            </div>

            <div className="space-y-3 pt-2">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{note.title}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-650 border border-blue-200 text-[8px] font-bold uppercase tracking-wider">{note.course}</span>
                    </div>
                    <p className="text-[9px] text-slate-450 font-mono">Uploaded: {note.uploadedDate} • Size: {note.size} • {note.readers} Student views</p>
                  </div>

                  <button
                    onClick={() => handleLaunchAnalysis(note)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 rounded-lg text-xs font-bold cursor-pointer shrink-0 shadow-sm flex items-center gap-1"
                  >
                    <Brain className="h-3.5 w-3.5 text-blue-600" />
                    AI Analyze
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Submission Queue (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Student Submission Queue</h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Grade completed homework quest files uploaded by students.</p>
          </div>

          <div className="space-y-4 pt-2">
            {submissions.map((sub) => (
              <div 
                key={sub.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
                  sub.status === 'Graded'
                    ? 'bg-slate-50/50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-350'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-850">{sub.student}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">{sub.assignment}</span>
                  </div>
                  <p className="text-[9px] text-slate-450 font-mono">Uploaded: {sub.submittedTime} • Size: {sub.fileSize}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                  {sub.status === 'Waiting Review' ? (
                    <button
                      onClick={() => handleGradeSubmission(sub.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                    >
                      Acknowledge & Grade
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5" /> Graded & Synced
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI NOTES ANALYSIS OVERLAY MODAL */}
      <AnimatePresence>
        {activeAnalysisNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAnalysisNote(null)}
              className="fixed inset-0 bg-slate-955"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10 space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4.5 w-4.5 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Syncy Notes scanner</h4>
                </div>
                <button 
                  onClick={() => setActiveAnalysisNote(null)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {analyzing && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <RefreshCw className="h-7 w-7 text-blue-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">AI is scanning text structures & creating MCQs...</p>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-5 text-left">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-650">
                      <Bot className="h-8 w-8 animate-bounce" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-sm font-bold text-slate-900">Analysis Complete!</h4>
                    <p className="text-[11px] text-slate-505 mt-1 leading-relaxed font-light">
                      Successfully read organic carbon chemistry definitions. Synthesized 3 multiple-choice study quiz questions.
                    </p>
                  </div>

                  {/* MCQ Preview */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 shadow-inner">
                    <span className="text-[9px] font-bold text-blue-650 uppercase tracking-widest block font-mono">generated question preview:</span>
                    <p className="text-xs font-bold text-slate-805 leading-relaxed">
                      &ldquo;What functional group contains a carbonyl carbon bonded to two alkyl groups?&rdquo;
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 pl-2 space-y-1 font-light">
                      <li>Option A: Aldehyde</li>
                      <li className="font-extrabold text-blue-650">Option B: Ketone (Correct Answer)</li>
                      <li>Option C: Ester</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveAnalysisNote(null)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Deploy AI Game Quest to Students
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
