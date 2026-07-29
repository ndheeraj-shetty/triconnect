'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Printer, 
  MapPin, 
  Layers, 
  Download, 
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';

export default function AdminQRGeneratorPage() {
  const [location, setLocation] = useState('Main Security Gate');
  const [qrType, setQrType] = useState<'static' | 'dynamic'>('static');

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">QR Code Placard Generator</h1>
        <p className="text-xs text-slate-505 mt-1 font-light">Generate official printable QR check-in posters for buses, entrances, and classrooms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Placard Settings Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <QrCode className="h-4.5 w-4.5 text-blue-650" /> Placard Configurator
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Configure layout details for print</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Select Location Node</label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
              >
                <option>Main Security Gate</option>
                <option>Cafeteria Entrance</option>
                <option>School Library Checkpoint</option>
                <option>School Bus - Route 4 North</option>
                <option>School Bus - Route 9 South</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block font-mono">QR Code Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQrType('static')}
                  className={`py-2 px-2.5 rounded-xl border text-[10px] text-center font-bold capitalize transition-all cursor-pointer shadow-sm ${
                    qrType === 'static' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Static Print
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('dynamic')}
                  className={`py-2 px-2.5 rounded-xl border text-[10px] text-center font-bold capitalize transition-all cursor-pointer shadow-sm ${
                    qrType === 'dynamic' 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Screen Feed
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-655 flex gap-2 items-start text-xs font-light shadow-inner">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-800 font-bold">Static Print:</strong> Best for physical posters. Codes link to facility nodes and verify check-in locations via mobile GPS coordinates checks.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
            >
              <Printer className="h-4 w-4 text-white" />
              Print Official Placard Poster
            </button>
          </div>
        </div>

        {/* Right Side: Placard Preview Page (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          {/* Background grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

          {/* Official poster print preview box */}
          <div className="bg-white border border-slate-200 text-slate-900 w-full max-w-md rounded-2xl p-8 flex flex-col justify-between items-center text-center space-y-6 shadow-xl aspect-[3/4] z-10 print:shadow-none print:border-none">
            
            {/* Header info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Layers className="h-4 w-4" /></div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">TriConnect</span>
              </div>
              <p className="text-[9px] font-sans font-bold text-slate-450 tracking-widest uppercase">OFFICIAL ATTENDANCE CHECKPOINT</p>
            </div>

            {/* Checkpoint Name */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-105 border border-slate-200 text-[10px] font-bold text-slate-655 uppercase tracking-wider shadow-sm">
                <MapPin className="h-3 w-3 text-red-500" /> {location}
              </div>
              <h3 className="text-base font-black text-slate-800 mt-2 font-serif">Westside Academy Facility Node</h3>
            </div>

            {/* Large styled QR checkerboard block */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="grid grid-cols-5 gap-1.5 opacity-90 w-44 h-44">
                <div className="border-[6px] border-slate-900 bg-transparent rounded" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-transparent" />
                <div className="border-[6px] border-slate-900 bg-transparent rounded" />
                
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-transparent" />

                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded flex items-center justify-center text-white"><Layers className="h-4.5 w-4.5" /></div>
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-sm" />

                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" />

                <div className="border-[6px] border-slate-900 bg-transparent rounded" />
                <div className="bg-transparent" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="bg-slate-900 rounded-sm" />
                <div className="border-[6px] border-slate-900 bg-transparent rounded" />
              </div>
            </div>

            {/* User instructions */}
            <div className="space-y-2 font-sans text-xs">
              <h5 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">How to check-in:</h5>
              <ol className="text-[9px] text-slate-505 space-y-1 list-decimal list-inside leading-relaxed max-w-64 mx-auto text-left font-light">
                <li>Open the <strong className="text-slate-805 font-bold">TriConnect app</strong> on your mobile device.</li>
                <li>Go to <strong className="text-slate-805 font-bold">Smart Attendance</strong> tab.</li>
                <li>Select <strong className="text-slate-805 font-bold">Launch QR Camera check-in</strong>.</li>
                <li>Scan this code to automatically record entry.</li>
              </ol>
            </div>

            {/* Footer copyright */}
            <div className="text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-3 w-full">
              SECURE PLACARD SECURITY ID: TC-GEN-2026-N
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
