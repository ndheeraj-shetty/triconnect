'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Calendar, 
  Download, 
  Share2, 
  Eye, 
  FolderOpen, 
  ChevronRight,
  Filter,
  Layers,
  X
} from 'lucide-react';

interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'sports' | 'science' | 'art' | 'classroom';
  date: string;
  description: string;
}

const mockPhotos: PhotoItem[] = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=400', title: 'Chemistry Lab Demonstration', category: 'science', date: 'Jul 22, 2026', description: 'Students observing chemical reaction models and organic compound formulations.' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=400', title: 'AP Calculus BC Workgroups', category: 'classroom', date: 'Jul 20, 2026', description: 'Calculus derivatives review study sessions using peer feedback cards.' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=400', title: 'Athletic Track Qualifiers', category: 'sports', date: 'Jul 15, 2026', description: 'Student physical fitness performance checks on the 100m sprint vector track.' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=400', title: 'Year-End Modern Art Exhibit', category: 'art', date: 'Jul 10, 2026', description: 'Display cabinet of sketches, canvas portfolios, and conceptual art designs.' }
];

export default function ParentPhotoAlbumPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const filteredPhotos = mockPhotos.filter(p => 
    activeCategory === 'all' || p.category === activeCategory
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Campus Photo Album</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Explore photos from school events, laboratory projects, and sports activities.</p>
      </div>

      {/* Album Filters header */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm text-left">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-blue-650" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">School Album categories</h3>
        </div>

        {/* Category button options */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {['all', 'sports', 'science', 'art', 'classroom'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border capitalize cursor-pointer transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-600 border-blue-500 text-white font-extrabold' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedPhoto(photo)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer flex flex-col justify-between shadow-sm hover:border-slate-350 hover:shadow transition-all"
          >
            {/* Image Thumbnail viewport */}
            <div className="aspect-video relative overflow-hidden group border-b border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-2.5 rounded-full bg-white border border-slate-200 text-blue-650 shadow-md">
                  <Eye className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Description info below photo */}
            <div className="p-4 space-y-2 text-left">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-650 border border-blue-200 text-[8px] font-bold uppercase tracking-wider">{photo.category}</span>
              <h4 className="text-xs font-bold text-slate-800 truncate">{photo.title}</h4>
              <div className="flex items-center gap-1 text-[9px] text-slate-450 font-mono">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span>{photo.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col"
            >
              {/* Photo Box */}
              <div className="aspect-video relative overflow-hidden bg-slate-900 flex items-center justify-center border-b border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title} 
                  className="max-h-full max-w-full object-contain"
                />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-405 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Details card below */}
              <div className="p-6 text-left space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-650 border border-blue-200 text-[9px] font-bold uppercase tracking-wider">{selectedPhoto.category}</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">{selectedPhoto.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm"><Download className="h-4 w-4" /></button>
                    <button className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm"><Share2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <p className="text-xs text-slate-655 leading-relaxed font-light">{selectedPhoto.description}</p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-mono border-t border-slate-100 pt-3">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Activity date: {selectedPhoto.date}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
