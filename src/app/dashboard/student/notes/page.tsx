'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  Video, 
  Download, 
  Sparkles, 
  Play, 
  Layers, 
  Award, 
  ChevronRight,
  ExternalLink,
  Bot,
  X
} from 'lucide-react';

interface NoteResource {
  id: string;
  title: string;
  course: string;
  author: string;
  size: string;
  downloads: number;
  description: string;
}

interface VideoLecture {
  id: string;
  title: string;
  course: string;
  duration: string;
  author: string;
  views: number;
  thumbnailGradient: string;
}

const mockNotes: NoteResource[] = [
  { id: '1', title: 'Organic Chemistry: Carbon Chains', course: 'Chemistry', author: 'Ms. Sarah Jenkins', size: '2.4 MB', downloads: 142, description: 'Notes covering alkanes, alkenes, functional groups, and structural formulas.' },
  { id: '2', title: 'Calculus: Derivatives & Limits', course: 'Mathematics', author: 'Mr. David Chen', size: '1.8 MB', downloads: 210, description: 'Cheat sheet of derivatives rules, quotient rule, and trigonometric boundaries.' },
  { id: '3', title: 'Hamlet Act 3: Analytical Essay Guide', course: 'English Literature', author: 'Mrs. Emma Watson', size: '980 KB', downloads: 88, description: 'Structure guidelines for draft essays regarding Hamlet’s soliloquy.' },
  { id: '4', title: 'Physics: Kinetic Energy Equations', course: 'Physics', author: 'Ms. Sarah Jenkins', size: '3.1 MB', downloads: 115, description: 'Lab preparation theory notes on potential and kinetic energy vectors.' }
];

const mockVideos: VideoLecture[] = [
  { id: 'v1', title: 'Intro to Chemical Reactions & Bonds', course: 'Chemistry', duration: '14:20', author: 'Ms. Sarah Jenkins', views: 320, thumbnailGradient: 'from-blue-500/20 to-indigo-500/20' },
  { id: 'v2', title: 'Limits and Continuity Masterclass', course: 'Mathematics', duration: '22:15', author: 'Mr. David Chen', views: 412, thumbnailGradient: 'from-indigo-500/20 to-pink-500/20' },
  { id: 'v3', title: 'Analyzing Hamlet’s Soliloquy', course: 'English Literature', duration: '18:05', author: 'Mrs. Emma Watson', views: 184, thumbnailGradient: 'from-emerald-500/20 to-blue-500/20' }
];

export default function StudentNotesHubPage() {
  const [syllabusPercent, setSyllabusPercent] = useState(78);
  const [selectedNote, setSelectedNote] = useState<NoteResource | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const triggerDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Academic Notes Hub</h1>
        <p className="text-xs text-slate-500 mt-1">Access teacher notes, course syllabus maps, grading schemes, and video lectures.</p>
      </div>

      {/* Syllabus & Evaluation Schemes Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Syllabus Progress */}
        <div className="md:col-span-7 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm text-left">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Syllabus Mapping</span>
            <h3 className="text-base font-extrabold text-slate-900">Term 4 Science Department</h3>
            <p className="text-xs text-slate-550 font-light">15 modules completed out of 19. Next unit: Inorganic structures.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Syllabus Completion</span>
              <span className="text-blue-650">{syllabusPercent}%</span>
            </div>
            <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
              <motion.div 
                animate={{ width: `${syllabusPercent}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-650 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Evaluation scheme */}
        <div className="md:col-span-5 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm text-left">
          <div>
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Evaluation Grading Scheme</span>
            <h3 className="text-base font-extrabold text-slate-900">Calculus & Science Weights</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[9px] text-slate-500 font-bold uppercase">Quests</p>
              <p className="text-xs font-extrabold text-blue-600 mt-1">40%</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[9px] text-slate-500 font-bold uppercase">Midterm</p>
              <p className="text-xs font-extrabold text-indigo-650 mt-1">20%</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-[9px] text-slate-500 font-bold uppercase">Finals</p>
              <p className="text-xs font-extrabold text-emerald-600 mt-1">40%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Notes Directory & Video Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Notes repository (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" /> Lesson Notes Repository
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Download and read study files provided by teachers.</p>
          </div>

          <div className="space-y-3 pt-2">
            {mockNotes.map((note) => (
              <div 
                key={note.id}
                className="p-4 rounded-xl border border-slate-150 bg-slate-50/20 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{note.title}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-650 border border-blue-200 text-[8px] font-bold uppercase tracking-wider">{note.course}</span>
                  </div>
                  <p className="text-[11px] text-slate-550 leading-normal font-light">{note.description}</p>
                  <p className="text-[9px] text-slate-450 font-mono">By {note.author} • Size: {note.size} • {note.downloads} Downloads</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100/60 border border-slate-205 text-slate-700 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Read Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Lectures (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-650 animate-pulse" /> Video Lectures Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Review lecture recordings on core topics.</p>
          </div>

          <div className="space-y-4 pt-2">
            {mockVideos.map((video) => (
              <div 
                key={video.id}
                onClick={() => setPlayingVideo(video)}
                className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-3 hover:border-slate-350 hover:bg-slate-50 transition-all flex gap-4 cursor-pointer items-center text-left shadow-sm"
              >
                {/* Thumbnail gradient mock */}
                <div className={`h-16 w-24 shrink-0 rounded-lg bg-gradient-to-tr ${video.thumbnailGradient} flex items-center justify-center border border-slate-200 relative group-hover:scale-[1.02] transition-all`}>
                  <Play className="h-5 w-5 text-slate-800 fill-slate-800/10 group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-1 right-1 bg-slate-900/90 px-1 py-0.5 rounded text-[8px] font-mono text-white">{video.duration}</span>
                </div>
                
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-bold text-blue-650 uppercase tracking-widest block">{video.course}</span>
                  <h4 className="text-xs font-bold text-slate-800 mt-0.5 group-hover:text-blue-650 transition-colors truncate">{video.title}</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Taught by {video.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Note Document Viewer Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10 flex flex-col justify-between h-[600px] text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedNote.title}</h4>
                    <p className="text-[9px] text-slate-500">Document Reader • Size: {selectedNote.size}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={triggerDownload}
                    className="p-1.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setSelectedNote(null)} 
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Note Content viewer mock */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1 text-slate-700 text-xs leading-relaxed font-sans font-light">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">{selectedNote.title}</h3>
                  <p className="text-[9px] text-slate-450 font-mono">Faculty author: {selectedNote.author} | Lecture notes curriculum v3</p>
                </div>
                
                <p className="font-bold text-slate-900 text-xs">1. Core Concepts & Definitions</p>
                <p>
                  Organic compounds represent carbon-based molecules that are structurally vital to chemical and biological processes. 
                  Carbon atoms are uniquely capable of forming stable covalent configurations, yielding straight chain networks, branched structures, and molecular rings.
                </p>
                
                <p className="font-bold text-slate-900 text-xs">2. Functional Group Telemetry</p>
                <p>
                  Functional groups dictate chemical reactions velocities and thermodynamic properties. Carbonyl groupings feature a carbon atom double-bonded to oxygen (C=O). 
                  In aldehydes, this carbon is bonded to at least one hydrogen. In ketones, it is bonded to two carbon-based radicals. Esters combine carbonyl vectors with an ether link.
                </p>

                <div className="border-l-4 border-blue-500 bg-slate-50 p-4 rounded-r-xl space-y-1.5">
                  <p className="font-bold text-slate-900">3. IUPAC Nomenclature guidelines</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-650 pl-2">
                    <li>Identify the longest continuous carbon chain as the parent compound.</li>
                    <li>Number the chain starting from the terminal end closest to substituents.</li>
                    <li>Assemble substituents in alphabetical order prefixed by position integers.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlayingVideo(null)}
              className="fixed inset-0 bg-slate-955"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 z-10 space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[8px] font-bold text-blue-650 uppercase tracking-widest">{playingVideo.course}</span>
                  <h4 className="text-xs font-bold text-slate-800 mt-0.5">{playingVideo.title}</h4>
                </div>
                <button 
                  onClick={() => setPlayingVideo(null)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Renders a video player container mockup */}
              <div className="bg-slate-950 aspect-video rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200 shadow-inner">
                <Play className="h-12 w-12 text-white fill-white/20 animate-pulse cursor-pointer hover:scale-115 transition-transform" />
                <span className="absolute bottom-3 left-3 bg-slate-900/90 px-2 py-1 rounded text-[10px] font-mono text-white/80">0:00 / {playingVideo.duration}</span>
                <span className="absolute bottom-3 right-3 bg-slate-900/90 px-2 py-1 rounded text-[9px] font-mono text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles className="h-3 w-3 text-blue-400 animate-spin" /> Auto-Captions Online</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xl flex gap-3 items-center max-w-sm text-left"
          >
            <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Play className="h-4.5 w-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Download Initiated!</h5>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-light">
                Notes PDF successfully compiled and dispatched to downloads folder.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
