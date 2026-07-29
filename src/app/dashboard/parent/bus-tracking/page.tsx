'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Users, 
  Sparkles,
  Compass,
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';

interface RouteStop {
  name: string;
  eta: string;
  status: 'passed' | 'active' | 'pending';
}

const initialStops: RouteStop[] = [
  { name: 'Bus Depot North', eta: '08:00 AM', status: 'passed' },
  { name: 'Alex Pick-up (Oak Ave)', eta: '08:12 AM', status: 'passed' },
  { name: 'Subway Station Stop', eta: '08:22 AM', status: 'passed' },
  { name: 'Elm St Intersection', eta: '08:31 AM', status: 'active' },
  { name: 'Westside Academy Campus', eta: '08:40 AM', status: 'pending' }
];

export default function ParentBusTrackingPage() {
  const [stops, setStops] = useState<RouteStop[]>(initialStops);
  const [currentSpeed, setCurrentSpeed] = useState(34); // mph
  const [passengerOnboard, setPassengerOnboard] = useState(true); // Alex scanned
  const [refreshing, setRefreshing] = useState(false);

  const triggerManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setCurrentSpeed(Math.floor(Math.random() * 15) + 25);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Live School Bus Tracker</h1>
          <p className="text-xs text-slate-500 mt-1 font-light">Real-time GPS coordinate telemetry and boarding scans for Alex.</p>
        </div>
        
        <button
          onClick={triggerManualRefresh}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <RefreshCw className="h-4 w-4 text-blue-600" />
          )}
          <span>Pings GPS coords</span>
        </button>
      </div>

      {/* Bus status summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Bus className="h-4.5 w-4.5 text-blue-600 animate-pulse" /> School Bus Route 4 North
          </h3>
          <p className="text-xs text-slate-700 font-medium">Currently near Elm St Intersection. Estimated arrival at campus: <span className="text-blue-650 font-bold">08:40 AM (On Time)</span></p>
          <p className="text-[10px] text-slate-450 font-mono">Last GPS report: 10 seconds ago | Driver: Robert Miller</p>
        </div>

        <div className="flex items-center gap-2">
          {passengerOnboard ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Alex Boarded
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-250 text-amber-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 animate-pulse" /> Not Boarded
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Map & Stops Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Mock (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-205 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5"><Compass className="h-4.5 w-4.5 text-blue-605" /> GPS Location Map</h3>
            <span className="text-[9px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">SPEED: {currentSpeed} MPH</span>
          </div>

          {/* Map canvas mock */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl aspect-video overflow-hidden shadow-inner relative flex justify-center items-center">
            {/* Draw road network */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
            
            {/* Mock road curves */}
            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
              <path d="M 0 100 Q 150 120 200 200 T 450 180 T 800 220" fill="none" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
              <path d="M 200 0 V 400" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <path d="M 0 100 Q 150 120 200 200 T 450 180" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
            </svg>

            {/* Stop points placards */}
            <div className="absolute top-[80px] left-[10%] text-slate-550 flex flex-col items-center">
              <MapPin className="h-4.5 w-4.5 text-slate-400" />
              <span className="text-[8px] font-bold font-sans mt-0.5 uppercase">Oak Ave Pick-up</span>
            </div>

            <div className="absolute top-[170px] left-[45%] text-slate-800 flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.15, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="p-1 rounded-full bg-blue-100 border border-blue-500 text-blue-650 shadow-md"
              >
                <Bus className="h-4.5 w-4.5" />
              </motion.div>
              <span className="text-[8px] font-bold font-sans mt-1 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm text-blue-650 uppercase">Route 4 active</span>
            </div>

            <div className="absolute top-[160px] left-[80%] text-slate-550 flex flex-col items-center">
              <MapPin className="h-4.5 w-4.5 text-red-500 animate-bounce" />
              <span className="text-[8px] font-bold font-sans mt-0.5 uppercase text-red-600">Academy Campus</span>
            </div>
          </div>
        </div>

        {/* Stops timeline check (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-205 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-sm text-left">
          
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-650" /> Stops timeline check
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Calculated eta values matching traffic index logs</p>
            </div>

            {/* Stops vertical timeline */}
            <div className="relative pl-6 space-y-5 border-l-2 border-slate-150 ml-3">
              {stops.map((stop, idx) => (
                <div key={idx} className="relative text-xs">
                  {/* Status node dot overlay */}
                  <span className={`absolute -left-[30px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center bg-white ${
                    stop.status === 'passed' 
                      ? 'border-blue-500 text-blue-600' 
                      : stop.status === 'active' 
                        ? 'border-indigo-600 text-indigo-650 animate-pulse' 
                        : 'border-slate-205 text-slate-400'
                  }`}>
                    {stop.status === 'passed' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                    {stop.status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-indigo-650 animate-ping" />}
                  </span>

                  <div className="flex justify-between items-start font-sans">
                    <div>
                      <h5 className={`font-bold ${stop.status === 'active' ? 'text-indigo-650 font-black' : 'text-slate-805'}`}>{stop.name}</h5>
                      <p className="text-[9px] text-slate-450 mt-0.5">Checked ETA: {stop.eta}</p>
                    </div>

                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                      stop.status === 'passed' 
                        ? 'bg-blue-50 border border-blue-200 text-blue-650' 
                        : stop.status === 'active' 
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-705 font-black' 
                          : 'bg-slate-50 border border-slate-150 text-slate-405'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-2 items-center text-[10px] text-slate-500 shadow-sm">
            <Info className="h-4.5 w-4.5 text-blue-600 shrink-0" />
            <p>Students must scan their QR code boarding badges at the bus door sweeps.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
