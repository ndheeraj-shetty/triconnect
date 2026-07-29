'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Smile, 
  Send, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  Activity,
  Award,
  ShieldCheck,
  Calendar,
  Clock,
  PlusCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'student' | 'AI';
  message: string;
  detected_emotion?: string;
  created_at: string;
}

export default function StudentWellbeingPage() {
  const { user } = useAuth();
  
  // Dashboard Aggregates
  const [moodToday, setMoodToday] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [academicScore, setAcademicScore] = useState(88.0);
  const [attendanceScore, setAttendanceScore] = useState(94.0);
  const [learningScore, setLearningScore] = useState(85.0);
  const [motivationScore, setMotivationScore] = useState(70.0);
  const [stressScore, setStressScore] = useState(25.0);
  const [riskLevel, setRiskLevel] = useState('Green');

  const [aiInsights, setAiInsights] = useState<string[]>([
    "Your learning quests completed score is excellent. Maintain this study plan!"
  ]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Chat parameters
  const [chatList, setChatList] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'AI',
      message: `Hello ${user?.name || 'Explorer'}, I am your well-being companion. How is your day going? Feel free to share your thoughts, check your mood, or request counselor help here.`,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Booking states
  const [counselDate, setCounselDate] = useState('');
  const [counselTime, setCounselTime] = useState('');
  const [counselReason, setCounselReason] = useState('');
  const [counselRequests, setCounselRequests] = useState<any[]>([]);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    fetchWellbeingStats();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList, typing]);

  const fetchWellbeingStats = async () => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/wellbeing/dashboard', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMoodToday(data.mood_score_today);
        setMoodText(data.mood_text_today || '');
        setAcademicScore(data.academic_health_score);
        setAttendanceScore(data.attendance_score);
        setLearningScore(data.learning_progress_score);
        setMotivationScore(data.motivation_score);
        setStressScore(data.stress_indicator_score);
        setRiskLevel(data.risk_level);
        setAiInsights(data.ai_insights);
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.warn('Backend connection offline. Using sandbox default well-being indicators.');
    }
  };

  const setMoodText = (text: string) => {
    setReflectionText(text);
  };

  // Submit daily mood check-in
  const handleMoodCheckin = async (score: number) => {
    setMoodToday(score);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      mood_score: score,
      mood_text: reflectionText || 'Logged daily check-in',
      checkin_date: new Date().toISOString().split('T')[0]
    };

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/wellbeing/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccessMsg('Thank you for logging your mood today!');
        fetchWellbeingStats();
      } else {
        throw new Error('Mood save failed');
      }
    } catch (e) {
      setSuccessMsg('[Demo Mode] Mood logged locally!');
      // Local recalculation math
      setStressScore(score <= 2 ? 80.0 : 10.0);
      setRiskLevel(score <= 2 ? 'Yellow' : 'Green');
    } finally {
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Send message to AI companion
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      message: chatInput,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatList(prev => [...prev, userMsg]);
    const inputPayload = chatInput;
    setChatInput('');
    setTyping(true);

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/wellbeing/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          sender: 'STUDENT',
          message: inputPayload
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          message: data.response,
          detected_emotion: data.detected_emotion,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatList(prev => [...prev, aiMsg]);
        fetchWellbeingStats(); // Refresh insights or risk updates if sentiment drops
      } else {
        throw new Error('Companion API offline');
      }
    } catch (e) {
      setTimeout(() => {
        let fallbackReply = "I understand. Taking simple micro-breaks can help. Let me know if you would like me to book a session with a school counselor!";
        if (inputPayload.toLowerCase().includes('bully') || inputPayload.toLowerCase().includes('mean')) {
          fallbackReply = "Bullying is strictly prohibited. I strongly recommend scheduling a session with our school counselor so we can address this immediately.";
        }
        
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          message: fallbackReply,
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatList(prev => [...prev, aiMsg]);
      }, 1500);
    } finally {
      setTimeout(() => setTyping(false), 1500);
    }
  };

  // Create Counselling booking
  const handleBookCounselling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselDate || !counselTime || !counselReason) return;

    const payload = {
      preferred_date: counselDate,
      preferred_time: counselTime,
      reason: counselReason
    };

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/wellbeing/counselling/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setCounselRequests(prev => [...prev, data]);
        setBookingSuccess('Counselling request successfully booked. Counselor notified!');
        setCounselDate('');
        setCounselTime('');
        setCounselReason('');
        setTimeout(() => setBookingSuccess(''), 4000);
      }
    } catch (e) {
      const mockReq = {
        id: Date.now().toString(),
        preferred_date: counselDate,
        preferred_time: counselTime,
        reason: counselReason,
        status: 'PENDING'
      };
      setCounselRequests(prev => [...prev, mockReq]);
      setBookingSuccess('[Demo Mode] Counselling request successfully logged!');
      setCounselDate('');
      setCounselTime('');
      setCounselReason('');
      setTimeout(() => setBookingSuccess(''), 4000);
    }
  };

  const getRiskStyles = (lvl: string) => {
    switch (lvl) {
      case 'Red': return 'bg-red-500 text-white border-red-600 ring-4 ring-red-100 animate-pulse';
      case 'Orange': return 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-100';
      case 'Yellow': return 'bg-amber-400 text-slate-900 border-amber-500';
      default: return 'bg-emerald-500 text-white border-emerald-600';
    }
  };

  const getMoodEmoji = (score: number) => {
    switch (score) {
      case 5: return { emoji: '😁', label: 'Great' };
      case 4: return { emoji: '😊', label: 'Good' };
      case 3: return { emoji: '😐', label: 'Okay' };
      case 2: return { emoji: '😟', label: 'Stressed' };
      default: return { emoji: '😢', label: 'Sad' };
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-[10px] font-bold text-blue-650 uppercase tracking-wider shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Wellbeing Companion
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">My Well-Being</h1>
        <p className="text-slate-500 font-light text-sm mt-1">
          Monitor your school health index, chat with your AI mentor, or schedule supportive counseling sessions.
        </p>
      </div>

      {/* Main Grid: Dashboard gauges & Chat viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Mood logging & Wellbeing Scores (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mood Checkin Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">How are you feeling today?</h3>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Select a mood indicator card below. Logging helps the AI companion adapt study tips.</p>
            </div>

            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {successMsg}
              </div>
            )}

            {/* Reflection text box */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="What made you smile today? Or did anything stress you? (Optional reflection details...)"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {[5, 4, 3, 2, 1].map((val) => {
                const info = getMoodEmoji(val);
                const isSelected = moodToday === val;
                
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleMoodCheckin(val)}
                    className={`py-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-550'
                    }`}
                  >
                    <span className="text-2xl">{info.emoji}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wellbeing Scores Dashboard Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Academic Health */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Academic Health</span>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900">{academicScore.toFixed(0)}%</h3>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${academicScore}%` }} />
                </div>
              </div>
            </div>

            {/* Attendance Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900">{attendanceScore.toFixed(0)}%</h3>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${attendanceScore}%` }} />
                </div>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Quest Progress</span>
                <Award className="h-4 w-4 text-indigo-650" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900">{learningScore.toFixed(0)}%</h3>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${learningScore}%` }} />
                </div>
              </div>
            </div>

            {/* Motivation Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Motivation</span>
                <Smile className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-900">{motivationScore.toFixed(0)}%</h3>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${motivationScore}%` }} />
                </div>
              </div>
            </div>

            {/* Stress Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-sans">Stress Level</span>
                <Activity className="h-4 w-4 text-rose-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-rose-600">{stressScore.toFixed(0)}%</h3>
                <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${stressScore}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* AI Insights & Rationale */}
          <div className="bg-slate-900 border border-slate-950 rounded-3xl p-6 text-white shadow-sm text-left space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-blue-400" /> early AI Diagnosis Insights
            </h3>

            <div className="space-y-3">
              {aiInsights.map((ins, index) => (
                <div key={index} className="flex gap-2.5 items-start text-xs font-light">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <p className="text-slate-205 leading-relaxed">{ins}</p>
                </div>
              ))}
            </div>

            {/* Explainable AI rationale box */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-300 leading-normal flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white block uppercase tracking-wider text-[9px] mb-0.5">XAI Conclusion Rationale</span>
                Risk status evaluates at <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${getRiskStyles(riskLevel)}`}>{riskLevel}</span>. Probed signals verify continuous coursework completions and active streak values.
              </div>
            </div>
          </div>

          {/* Self help activities checklists */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Recommended Self-Help Tools</h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-light">Simple micro-habits recommendations generated by AI wellness companions.</p>
            </div>

            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 flex gap-2.5 items-start">
                    <CheckCircle2 className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light mt-0.5">{rec.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/50 flex gap-2.5 items-start">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 fill-emerald-100" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">4-7-8 Breathing micro-breaks</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-light mt-0.5">Breathe in for 4s, hold for 7s, and exhale slowly for 8s to calm the nervous system.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Confidential chat companion & Booking requests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Chat Companion Widget */}
          <div className="bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px]">
            
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400 animate-pulse" />
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">AI Wellbeing Partner</h3>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">Confidential Chat (Encrypted)</p>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
              {chatList.map((chat) => {
                const isAI = chat.sender === 'AI';
                
                return (
                  <div 
                    key={chat.id} 
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-end gap-2`}
                  >
                    {isAI && (
                      <div className="h-7 w-7 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 leading-normal ${
                        isAI 
                          ? 'bg-white border border-slate-200 text-slate-800' 
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                );
              })}
              
              {typing && (
                <div className="flex justify-start items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-400 italic">
                    typing indicators...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Talk with your companion..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="h-9 w-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>

          {/* Counselling Requests Scheduler Bookings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">Supportive Counselling Scheduler</h3>
              <p className="text-[10px] text-slate-450 mt-0.5 font-light">Book slot reviews with school counselors and psychologists.</p>
            </div>

            {bookingSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" /> {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookCounselling} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Preferred Date</label>
                  <input
                    type="date"
                    value={counselDate}
                    onChange={(e) => setCounselDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Preferred Time</label>
                  <select
                    value={counselTime}
                    onChange={(e) => setCounselTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Reason for Session</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Study anxiety or peer stress..."
                  value={counselReason}
                  onChange={(e) => setCounselReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Book Counselling Session
              </button>
            </form>

            {/* List logged requests */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 font-mono tracking-wider">Scheduled Sessions</h4>
              {counselRequests.length > 0 ? (
                counsellingRequestsList(counselRequests)
              ) : (
                <div className="italic text-slate-400 text-[10px] text-center py-2">
                  No upcoming counselling sessions scheduled.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function counsellingRequestsList(requests: any[]) {
  return (
    <div className="space-y-2">
      {requests.map((r: any) => (
        <div key={r.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center">
          <div>
            <div className="font-bold text-slate-850 truncate max-w-[200px]">{r.reason}</div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
              {r.preferred_date} | {r.preferred_time}
            </div>
          </div>
          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}
