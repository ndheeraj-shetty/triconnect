'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';

interface SchoolEvent {
  id: string;
  title: string;
  type: 'holiday' | 'event' | 'homework' | 'exam';
  date: number; // Day of July 2026
  time: string;
  location: string;
  description: string;
}

const mockEvents: SchoolEvent[] = [
  { id: '1', title: 'Calculus Module 4 Derivatives', type: 'homework', date: 24, time: '11:59 PM', location: 'TriConnect Homework Portal', description: 'Differential coefficients lab submission deadline.' },
  { id: '2', title: 'Chemistry Lab Writeup Due', type: 'homework', date: 26, time: '11:59 PM', location: 'TriConnect Homework Portal', description: 'Review organic compound structural equations notes.' },
  { id: '3', title: 'Mid-Term Mathematics Exam', type: 'exam', date: 25, time: '09:00 AM', location: 'Main Examination Hall', description: 'Covers limit continuity and derivatives rules.' },
  { id: '4', title: 'Parent-Teacher Consultations', type: 'event', date: 28, time: '03:00 PM', location: 'Science Wing Library', description: 'Review student wellbeing sliders and term analytics.' },
  { id: '5', title: 'Independence Day Holiday', type: 'holiday', date: 4, time: 'All Day', location: 'Campus Closed', description: 'Official national holiday. Campus operations suspended.' },
  { id: '6', title: 'Annual Sports Meet & Athletic trials', type: 'event', date: 15, time: '08:00 AM', location: 'High School Field', description: 'Participation results logged to physical fitness profiles.' }
];

export default function StudentCalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const daysInMonth = 31;
  const startOffset = 2; // July 2026 starts on Wednesday (so offset is 2 days: Mon=0, Tue=1, Wed=2)
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...Array(startOffset).fill(null), ...days];

  const eventsForSelectedDay = mockEvents.filter(e => e.date === selectedDay);

  const getEventBadgeClass = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'holiday': return 'bg-red-50 border-red-200 text-red-700';
      case 'event': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'homework': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'exam': return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const getCellEventDotClass = (type: SchoolEvent['type']) => {
    switch (type) {
      case 'holiday': return 'bg-red-500';
      case 'event': return 'bg-blue-500';
      case 'homework': return 'bg-indigo-550';
      case 'exam': return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Academic Calendar</h1>
        <p className="text-xs text-slate-500 mt-1">Track classroom deadlines, examination schedules, holidays, and school activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Calendar Grid (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm text-left">
          
          {/* Calendar Header controls */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">July 2026</h3>
            </div>
            
            <div className="flex gap-2">
              <button disabled className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-sm"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                if (cell === null) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-transparent" />;
                }

                const dayEvents = mockEvents.filter(e => e.date === cell);
                const isSelected = selectedDay === cell;
                
                return (
                  <button
                    key={`day-${cell}`}
                    onClick={() => setSelectedDay(cell)}
                    className={`aspect-square rounded-xl border p-2 flex flex-col justify-between items-start transition-all relative cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm shadow-blue-500/5' 
                        : 'bg-slate-50/30 border-slate-150 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-550'}`}>{cell}</span>
                    
                    {/* Event indicators dots row */}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`h-1.5 w-1.5 rounded-full ${getCellEventDotClass(event.type)}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Holiday</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> School Event</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Homework Deadline</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Exam Date</span>
          </div>

        </div>

        {/* Right Side: Event Details sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Daily Agenda</h3>
            <p className="text-xs text-slate-550 mt-1">Agenda list details for Selected Day: <span className="font-bold text-blue-650">July {selectedDay}</span></p>
          </div>

          <div className="space-y-3 pt-2">
            <AnimatePresence mode="wait">
              {eventsForSelectedDay.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center text-slate-400"
                >
                  <CalendarCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No agenda alerts logged</p>
                  <p className="text-[10px] mt-0.5">Alex can use this time to focus on pending quests.</p>
                </motion.div>
              ) : (
                eventsForSelectedDay.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-left shadow-sm ${getEventBadgeClass(e.type)}`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="capitalize">{e.type} Checkpoint</span>
                        <span className="font-mono flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1.5">{e.title}</h4>
                      <p className="text-[10px] text-slate-700 mt-1 leading-relaxed font-light">{e.description}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono border-t border-slate-200/50 pt-2">
                      <MapPin className="h-3 w-3 text-red-500" />
                      <span>{e.location}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
}
