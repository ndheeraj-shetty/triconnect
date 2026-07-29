'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Sparkles, 
  Bot, 
  UserCheck, 
  Phone, 
  Video, 
  Info,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';

interface DirectMessage {
  id: string;
  sender: 'parent' | 'teacher';
  text: string;
  time: string;
}

interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  role: string;
  status: 'online' | 'offline';
  messages: DirectMessage[];
}

const initialContacts: TeacherContact[] = [
  {
    id: 't1',
    name: 'Ms. Sarah Jenkins',
    subject: 'Chemistry (Science)',
    role: '10B Advisor',
    status: 'online',
    messages: [
      { id: '1', sender: 'teacher', text: "Hello Robert, I wanted to discuss Alex's recent Chemistry lab write-up. They did an excellent job, and I've awarded them +100 XP!", time: '10:00 AM' },
      { id: '2', sender: 'parent', text: "Thank you Ms. Sarah! That's wonderful to hear. Alex has been studying chemistry late into the evening.", time: '10:15 AM' },
      { id: '3', sender: 'teacher', text: "That explains their high score! However, we did notice some fatigue flags during Thursday morning classes. We've granted Alex a 1-day extension on their next homework so they can rest.", time: '10:20 AM' }
    ]
  },
  {
    id: 't2',
    name: 'Mr. David Chen',
    subject: 'Mathematics (Calculus)',
    role: 'Subject Teacher',
    status: 'offline',
    messages: [
      { id: '1', sender: 'teacher', text: "Hi Robert, just a reminder that the Calculus midterm is scheduled for July 25. Alex is performing well but should review derivative rules.", time: 'Jul 21' }
    ]
  },
  {
    id: 't3',
    name: 'Mrs. Emma Watson',
    subject: 'English Literature',
    role: 'Subject Teacher',
    status: 'online',
    messages: [
      { id: '1', sender: 'teacher', text: "Hello, Alex's essay draft for Hamlet was outstanding. No major edits needed.", time: 'Jul 20' }
    ]
  }
];

export default function ParentCommunicationPage() {
  const [contacts, setContacts] = useState<TeacherContact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState('t1');
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: DirectMessage = {
      id: (activeContact.messages.length + 1).toString(),
      sender: 'parent',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setContacts(contacts.map(c => {
      if (c.id === activeContact.id) {
        return { ...c, messages: [...c.messages, newMsg] };
      }
      return c;
    }));
    
    setChatInput('');
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-900">Direct Teacher Messaging</h1>
        <p className="text-xs text-slate-505 mt-1 font-light font-sans">Secure channels to chat with Alex's subject instructors and advisor staff.</p>
      </div>

      {/* Chat workspace container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[560px]">
        
        {/* Left Side: Roster contacts (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col justify-between bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teacher contacts..." 
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center text-left ${
                  activeContactId === contact.id 
                    ? 'bg-white border border-slate-200 shadow-sm font-semibold' 
                    : 'hover:bg-white/50 border border-transparent'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{contact.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{contact.subject} • {contact.role}</p>
                </div>
                
                <span className={`h-2 w-2 rounded-full ${
                  contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 bg-white text-[10px] text-slate-500 text-left flex gap-1.5 items-center">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <p>Replies are synced to email notification digests.</p>
          </div>
        </div>

        {/* Right Side: Chat box messages (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-white text-left">
          
          {/* Active Contact Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-slate-900">{activeContact.name}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{activeContact.subject} Advisor Coordinator</p>
            </div>
            
            <div className="flex gap-2">
              <button disabled className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-sm"><Phone className="h-4 w-4" /></button>
              <button disabled className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed shadow-sm"><Video className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Active chat logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {activeContact.messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'parent'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm font-light'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[8px] text-right mt-1.5 font-mono ${
                    msg.sender === 'parent' ? 'text-blue-200' : 'text-slate-400'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Chat Send bar */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Send message to ${activeContact.name}...`} 
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-405 outline-none focus:border-blue-500"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-505 text-white rounded-xl cursor-pointer shadow-sm"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
