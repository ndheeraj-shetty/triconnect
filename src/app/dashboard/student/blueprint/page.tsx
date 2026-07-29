'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Layers, 
  MapPin, 
  Info, 
  ShieldAlert, 
  Search, 
  Compass, 
  Users,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface RoomLocation {
  id: string;
  name: string;
  code: string;
  floor: 1 | 2;
  type: 'classroom' | 'lab' | 'facility' | 'exit';
  advisor: string;
  capacity: number;
  nearestExit: string;
  currentSession: string;
  coordinates: string; // Visual position helper
}

const mockRooms: RoomLocation[] = [
  { id: 'r1', name: 'Chemistry Lab', code: 'Lab 304', floor: 1, type: 'lab', advisor: 'Ms. Sarah Jenkins', capacity: 24, nearestExit: 'East Fire Exit Stairwell A', currentSession: 'Chemistry 10B Lecture', coordinates: 'col-span-2 row-span-2 bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'r2', name: 'Calculus Classroom', code: 'Room 102', floor: 1, type: 'classroom', advisor: 'Mr. David Chen', capacity: 30, nearestExit: 'Main Entrance Lobby Gate', currentSession: 'AP Calculus BC Study', coordinates: 'col-span-2 row-span-1 bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'r3', name: 'Physics Mechanics Lab', code: 'Lab 2B', floor: 2, type: 'lab', advisor: 'Ms. Sarah Jenkins', capacity: 22, nearestExit: 'West Emergency Fire Exit B', currentSession: 'Vector Dynamics Lab', coordinates: 'col-span-2 row-span-2 bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'r4', name: 'Science Library', code: 'Library Wing', floor: 1, type: 'facility', advisor: 'Mrs. Emma Watson', capacity: 80, nearestExit: 'Main Entrance Lobby Gate', currentSession: 'Quiet study period open', coordinates: 'col-span-3 row-span-2 bg-slate-50 border-slate-200 text-slate-700' },
  { id: 'r5', name: 'Cafeteria & Dining Hall', code: 'Dining Block', floor: 1, type: 'facility', advisor: 'Admin Staff', capacity: 150, nearestExit: 'North Courtyard Exit C', currentSession: 'Lunch service open', coordinates: 'col-span-3 row-span-1 bg-slate-50 border-slate-200 text-slate-700' },
  { id: 'r6', name: 'East Fire Exit', code: 'Exit Stair A', floor: 1, type: 'exit', advisor: 'Safety Marshal', capacity: 999, nearestExit: 'Assembly Area A (East Lawn)', currentSession: 'Emergency Exit Corridor', coordinates: 'col-span-1 row-span-1 bg-red-50 border-red-200 text-red-700 font-extrabold' }
];

export default function StudentBlueprintPage() {
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedRoomId, setSelectedRoomId] = useState('r1');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = mockRooms.filter(r => 
    r.floor === activeFloor && r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRoom = mockRooms.find(r => r.id === selectedRoomId) || mockRooms[0];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Campus Blueprint</h1>
        <p className="text-xs text-slate-500 mt-1">Locate class science labs, study facilities, and emergency assembly zones.</p>
      </div>

      {/* Floor & Search Settings */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Floor Swapper */}
        <div className="md:col-span-6 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block mb-2 font-mono">Select Floor Map</span>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveFloor(1);
                setSelectedRoomId('r1');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                activeFloor === 1 
                  ? 'bg-white border border-slate-200 text-blue-650 shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Floor 1 (Labs & Library)
            </button>
            <button
              onClick={() => {
                setActiveFloor(2);
                setSelectedRoomId('r3');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                activeFloor === 2 
                  ? 'bg-white border border-slate-200 text-blue-650 shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Floor 2 (Mechanics & Wings)
            </button>
          </div>
        </div>

        {/* Search Room */}
        <div className="md:col-span-6 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm text-left">
          <span className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block mb-2 font-mono">Quick Room Lookup</span>
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classrooms, chemistry labs, fire exits..." 
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive map visualization (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5"><Compass className="h-4.5 w-4.5 text-blue-600" /> Interactive Schematic</h3>
            <span className="text-[9px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">SCALE: 1:150</span>
          </div>

          {/* Grid Layout representing classrooms */}
          <div className="grid grid-cols-4 gap-3 aspect-video bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden shadow-inner">
            {/* Background blueprint grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-3 rounded-xl border flex flex-col justify-between items-start text-left transition-all hover:scale-[1.01] shadow-sm ${room.coordinates} ${
                  selectedRoomId === room.id ? 'ring-2 ring-blue-600 border-transparent' : ''
                }`}
              >
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider block opacity-75">{room.code}</span>
                  <h4 className="text-xs font-black mt-1 leading-tight">{room.name}</h4>
                </div>
                <span className="text-[8px] opacity-60 font-mono mt-2 truncate font-bold">{room.currentSession}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Room inspector & emergency exits details (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 flex flex-col justify-between shadow-sm text-left">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-blue-600" /> Room Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-light">Select any schematic block on the left to review metrics.</p>
            </div>

            {/* Room Info details */}
            <div className="space-y-3.5 text-xs text-slate-650 font-light">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center shadow-sm">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold font-mono">
                  {activeRoom.floor}F
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{activeRoom.name} ({activeRoom.code})</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Instructor: {activeRoom.advisor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
                <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-200 shadow-sm">
                  <p>CAPACITY LIMIT:</p>
                  <p className="font-extrabold text-slate-800 mt-1">{activeRoom.capacity} People Max</p>
                </div>
                <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-200 shadow-sm">
                  <p>ACTIVE SESSION:</p>
                  <p className="font-extrabold text-blue-600 mt-1 truncate">{activeRoom.currentSession}</p>
                </div>
              </div>

              {/* Emergency evacuation route directions */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 shadow-sm">
                <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="h-4 w-4 text-red-650 animate-pulse" /> Emergency Evacuation Route
                </h5>
                <p className="text-[11px] text-slate-700 leading-relaxed font-light">
                  In case of evacuation triggers: Please exit {activeRoom.code} and head immediately towards:
                  <strong className="text-red-750 font-extrabold mt-1.5 block flex items-center gap-1 font-mono text-[9px] uppercase">
                    {activeRoom.nearestExit} <ArrowRight className="h-3 w-3" /> Assembly Zone
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2 items-center text-[10px] text-slate-500 text-left shadow-sm">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <p>Classroom coordinates sync dynamically with campus safety marshal logs.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
