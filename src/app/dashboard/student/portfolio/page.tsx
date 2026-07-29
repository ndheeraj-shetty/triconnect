'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Flame, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Image as ImageIcon, 
  FileText,
  Printer,
  X
} from 'lucide-react';

interface CertificateAward {
  id: string;
  name: string;
  tagline: string;
  date: string;
  criteria: string;
  icon: React.ElementType;
  color: string;
}

const mockCertificates: CertificateAward[] = [
  { id: 'c1', name: 'Early Bird Attendance Scanner', tagline: 'QR Pioneer Check-in', date: 'July 2026', criteria: 'Achieved 100% attendance check-ins before 09:00 AM using the whiteboard QR scanner.', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'c2', name: 'Calculus Quest Conqueror', tagline: 'AP Math Mastery', date: 'June 2026', criteria: 'Completed 10 consecutive AP Calculus homework quests with a score average above 90%.', icon: Trophy, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'c3', name: 'AI Wellbeing Scout', tagline: 'Mind Balance Advocate', date: 'May 2026', criteria: 'Logged daily wellbeing sliders and completed self-care breathing modules for 15 days.', icon: Award, color: 'text-indigo-650 bg-indigo-50 border-indigo-200' }
];

export default function StudentPortfolioPage() {
  const [activeCert, setActiveCert] = useState<CertificateAward | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Portfolio & Certificates</h1>
        <p className="text-xs text-slate-500 mt-1">Review monthly achievements, tagline awards, and your yearly academic digital portfolio.</p>
      </div>

      {/* Main Grid: Taglines Cabinet & Yearly Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Certificates Cabinet (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600 animate-pulse" /> Monthly Taglines & Awards
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light font-sans">Certificates earned from dynamic telemetry activities</p>
          </div>

          <div className="space-y-4 pt-2">
            {mockCertificates.map((cert) => {
              const Icon = cert.icon;
              return (
                <div 
                  key={cert.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-sm"
                >
                  <div className="flex gap-3.5 items-start">
                    <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center border shadow-inner ${cert.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{cert.name}</h4>
                      <p className="text-[10px] text-blue-650 font-bold font-mono mt-0.5">&ldquo;{cert.tagline}&rdquo;</p>
                      <p className="text-[9px] text-slate-450 mt-1">Issued: {cert.date}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCert(cert)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 rounded-lg text-xs font-bold cursor-pointer shrink-0 shadow-sm"
                  >
                    View placard
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yearly Digital Portfolio (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600 animate-pulse" /> Year-End Digital Portfolio
            </h3>
            <p className="text-xs text-slate-505 mt-1 font-light font-sans">Your comprehensive student credential record</p>
          </div>

          {/* Portfolio Sections */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200 flex justify-between items-center shadow-sm hover:bg-slate-50 transition-all">
              <div className="flex gap-2.5">
                <BookOpen className="h-4.5 w-4.5 text-blue-500 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Academic Transcripts</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calculus, Chemistry, English literature grades.</p>
                </div>
              </div>
              <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-500 shadow-sm">5 files</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200 flex justify-between items-center shadow-sm hover:bg-slate-50 transition-all">
              <div className="flex gap-2.5">
                <ImageIcon className="h-4.5 w-4.5 text-emerald-500 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Extracurricular Showcase</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Athletic trials photos, science fair videos.</p>
                </div>
              </div>
              <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-500 shadow-sm">12 files</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/40 border border-slate-200 flex justify-between items-center shadow-sm hover:bg-slate-50 transition-all">
              <div className="flex gap-2.5">
                <FileText className="h-4.5 w-4.5 text-pink-500 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Competency Badges</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Verified certificates issued by administration.</p>
                </div>
              </div>
              <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-500 shadow-sm">3 files</span>
            </div>
          </div>
        </div>

      </div>

      {/* Certificate Print Preview Modal */}
      <AnimatePresence>
        {activeCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCert(null)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-250 shadow-2xl p-8 overflow-hidden z-10 text-slate-900 space-y-6 my-8 text-left"
            >
              {/* Controls */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">TriConnect Verification</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Certificate
                  </button>
                  <button 
                    onClick={() => setActiveCert(null)}
                    className="px-3 py-1.5 bg-slate-105 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Certificate design print layout */}
              <div className="border-8 border-double border-slate-250 p-8 text-center space-y-6 font-serif relative bg-slate-50/50 shadow-inner">
                {/* Gold Seal watermark decoration */}
                <div className="absolute bottom-6 right-6 opacity-10 flex flex-col items-center">
                  <Trophy className="h-20 w-20 text-yellow-600" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-sans font-extrabold text-slate-400 tracking-widest uppercase">Westside Academy High School</span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-800 leading-normal">Certificate of Achievement</h2>
                </div>

                <p className="text-xs font-sans text-slate-550 italic font-light">This tagline award is proudly presented to</p>

                <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2 max-w-xs mx-auto">Alex Mercer</h3>
                
                <p className="text-[11px] font-sans text-slate-655 max-w-md mx-auto leading-relaxed font-light">
                  For outstanding academic telemetry participation, earning the tagline designation of:
                  <br />
                  <strong className="text-blue-650 font-black block text-xs tracking-wider mt-1.5 uppercase font-mono">&ldquo;{activeCert.tagline}&rdquo;</strong>
                  <br />
                  {activeCert.criteria}
                </p>

                <div className="grid grid-cols-2 gap-8 font-sans text-[10px] text-slate-450 pt-8 font-medium">
                  <div className="border-t border-slate-200 pt-2">
                    <p className="font-bold">JULY 23, 2026</p>
                    <p className="font-light text-slate-400">Date of Issue</p>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <p className="font-bold">PRINCIPAL DAVIS</p>
                    <p className="font-light text-slate-400">Westside Academy</p>
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
