'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Award, 
  BookOpen, 
  GraduationCap, 
  ExternalLink, 
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface AlumnusProfile {
  id: string;
  name: string;
  avatar: string;
  gradYear: string;
  profession: string;
  company: string;
  achievement: string;
  bio: string;
}

const mockAlumni: AlumnusProfile[] = [
  { id: 'a1', name: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', gradYear: 'Class of 2015', profession: 'Principal Software Architect', company: 'Vercel Inc.', achievement: 'Co-creator of open-source framework modules.', bio: "TriConnect's early math curriculum and coding modules gave me the confidence to pursue computer science. The peer quests made studying feel like a game." },
  { id: 'a2', name: 'Dr. Clara Oswald', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', gradYear: 'Class of 2012', profession: 'Neurological Surgeon', company: 'General Hospital', achievement: 'Pioneered robotic neuro-navigation systems.', bio: "My chemistry labs with Ms. Sarah Jenkins laid the groundwork for my research in neurochemistry. The intensive science tracks teach you actual methodology." },
  { id: 'a3', name: 'Devon Harris', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', gradYear: 'Class of 2018', profession: 'Energy Systems Founder', company: 'AeroGrid Tech', achievement: 'Raised $15M for carbon-offset grid telemetry.', bio: "The physics lab vector projects taught me the fundamentals of mechanical structures and turbine design. The school calendar tracking was instrumental." }
];

export default function ParentAlumniPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<AlumnusProfile | null>(null);

  const filteredAlumni = mockAlumni.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Alumni Directory Portal</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Connect with notable graduates and read their career success stories.</p>
      </div>

      {/* Directory filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-605 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Notable Graduates</h3>
        </div>

        <div className="relative w-full sm:max-w-64">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alumni names or jobs..." 
            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none"
          />
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAlumni.map((alumnus) => (
          <motion.div
            key={alumnus.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedAlumni(alumnus)}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 cursor-pointer flex flex-col justify-between space-y-5 text-left shadow-sm hover:border-slate-350 hover:shadow transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={alumnus.avatar} alt={alumnus.name} className="h-10 w-10 rounded-full object-cover shadow-inner" />
                <div>
                  <h4 className="text-xs font-bold text-slate-805">{alumnus.name}</h4>
                  <p className="text-[9px] text-blue-650 font-bold font-mono">{alumnus.gradYear}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block font-mono">{alumnus.company}</span>
                <h5 className="text-xs font-extrabold text-slate-700">{alumnus.profession}</h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-light">{alumnus.achievement}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedAlumni(alumnus)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
            >
              Read Success Story <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Success Story Lightbox Modal */}
      <AnimatePresence>
        {selectedAlumni && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlumni(null)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 z-10 text-center space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-650" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">{selectedAlumni.name}</h4>
                </div>
                <button 
                  onClick={() => setSelectedAlumni(null)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedAlumni.avatar} alt={selectedAlumni.name} className="h-12 w-12 rounded-full object-cover shadow-inner" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{selectedAlumni.profession}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">{selectedAlumni.company} | {selectedAlumni.gradYear}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 italic text-xs text-slate-700 leading-relaxed relative font-light shadow-inner">
                  <span className="absolute top-1 left-2 text-3xl text-blue-500/20 font-serif font-bold">&ldquo;</span>
                  {selectedAlumni.bio}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
