'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CreditCard, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Info,
  Send,
  Loader2,
  X
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  type: 'billing' | 'meeting' | 'announcement';
  date: string;
  details: string;
  cost?: number;
  dueDate?: string;
  status?: 'Paid' | 'Pending';
}

const mockNotices: NoticeItem[] = [
  { id: 'n1', title: 'Term 4 Tuition Balance Invoice', type: 'billing', date: 'Jul 23, 2026', details: 'Chemistry lab materials fee and classroom activity funds outstanding statement.', cost: 120.00, dueDate: 'Jul 30, 2026', status: 'Pending' },
  { id: 'n2', title: 'Parent-Teacher Consultations Schedule', type: 'meeting', date: 'Jul 28, 2026', details: 'Term 4 performance assessment alignment. Located in Science Library Wing.', dueDate: '03:00 PM' },
  { id: 'n3', title: 'Campus Facility Safety Drills notice', type: 'announcement', date: 'Jul 19, 2026', details: 'Administrative evacuation drills schedules. Review emergency blueprint routes.' }
];

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>(mockNotices);
  
  // Feedback Form state
  const [selectedTeacher, setSelectedTeacher] = useState('Jenkins');
  const [feedbackType, setFeedbackType] = useState<'praise' | 'complaint' | 'suggestion'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  
  // Billing checkouts
  const [selectedInvoice, setSelectedInvoice] = useState<NoticeItem | null>(null);
  const [payingInvoice, setPayingInvoice] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  
  // Form success feedback
  const [formSuccess, setFormSuccess] = useState(false);

  const handlePayInvoice = (invoice: NoticeItem) => {
    setSelectedInvoice(invoice);
    setPayingInvoice(true);
    setPaySuccess(false);

    // Simulate payment clearing
    setTimeout(() => {
      setPayingInvoice(false);
      setPaySuccess(true);
      
      // Update local notice status
      setNotices(notices.map(n => n.id === invoice.id ? { ...n, status: 'Paid' } : n));

      setTimeout(() => {
        setSelectedInvoice(null);
      }, 2000);
    }, 1800);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFormSuccess(true);
    setFeedbackText('');

    setTimeout(() => {
      setFormSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Notices & School Feedback</h1>
        <p className="text-xs text-slate-500 mt-1 font-light">Review school billing statements, parent notices, and submit teacher feedback surveys.</p>
      </div>

      {/* Main Grid: Administrative Notices & Teacher Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Administrative Notices (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-605" /> Administrative Notice Board
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-light">Tuition bills, events, and important notices</p>
          </div>

          <div className="space-y-4 pt-2">
            {notices.map((notice) => (
              <div 
                key={notice.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 flex flex-col justify-between gap-4 text-left shadow-sm hover:border-slate-350 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{notice.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                        notice.type === 'billing' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : notice.type === 'meeting' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>{notice.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-505 leading-normal font-light">{notice.details}</p>
                    <p className="text-[9px] text-slate-450 font-mono">Date posted: {notice.date}</p>
                  </div>

                  {notice.type === 'billing' && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Balance Due</span>
                        <p className="text-xs font-black text-slate-800 mt-0.5">${notice.cost?.toFixed(2)}</p>
                      </div>
                      
                      {notice.status === 'Pending' ? (
                        <button
                          onClick={() => handlePayInvoice(notice)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                        >
                          Pay Invoice
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                          Invoice Paid
                        </span>
                      )}
                    </div>
                  )}

                  {notice.type === 'meeting' && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono shrink-0">
                      <Calendar className="h-4 w-4 text-indigo-650 animate-pulse" />
                      <span>{notice.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Feedback Form (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-blue-50 to-indigo-50/50 border border-blue-105 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm text-left">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5 text-blue-650" /> Teacher Evaluation
            </h3>
            <p className="text-xs text-slate-505 mt-1 font-light">Submit feedback or complaints anonymously to school supervisors.</p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Select Instructor</label>
                <select 
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="Jenkins">Sarah Jenkins</option>
                  <option value="Chen">David Chen</option>
                  <option value="Watson">Emma Watson</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block font-mono">Feedback Type</label>
                <select 
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="praise">Praise / Merit</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Feedback Remarks</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your comments regarding class workload, support velocity, or lessons quality..."
                rows={4}
                required
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3.5 text-xs outline-none text-slate-800 leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-blue-50 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-505 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" /> Submit Evaluation Report
            </button>
          </form>
        </div>

      </div>

      {/* Credit Card Processing checkout modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="fixed inset-0 bg-slate-955"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden z-10 text-center space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Invoice Payment Gateway</span>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-205 text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {payingInvoice ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Clearing Tuition Invoice</h4>
                    <p className="text-[10px] text-slate-450 mt-1 font-mono">Dispatches banking authorization requests...</p>
                  </div>
                </div>
              ) : paySuccess ? (
                <div className="space-y-5">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-700">
                      <CheckCircle className="h-8 w-8 animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-slate-900">Invoice Cleared!</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                      Thank you! Tuition invoice balance successfully resolved. Financial registries updated.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1.5 font-mono text-[9px] text-slate-550 shadow-inner">
                    <p className="flex justify-between"><span>INVOICE VALUE:</span> <span className="text-slate-800 font-bold">$120.00</span></p>
                    <p className="flex justify-between"><span>RECEIPT NO:</span> <span className="text-slate-800 font-bold">RC-7781-TC</span></p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Success Notification Alert */}
      <AnimatePresence>
        {formSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xl flex gap-3 items-center max-w-sm text-left animate-float"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Evaluation Saved!</h5>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-light">
                Feedback safely archived and dispatched to school administrators. Thank you!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
