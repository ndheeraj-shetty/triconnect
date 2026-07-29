'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  Key,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preference state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Status triggers
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate saving profile details
    setUpdateSuccess(true);
    setSuccessMsg('Profile information updated successfully!');
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    // Reset password inputs and trigger success
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setUpdateSuccess(true);
    setSuccessMsg('Security password successfully changed!');
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Profile Settings
        </h1>
        <p className="text-xs text-slate-505 mt-1 font-light">Manage your login credentials, password security, and notification triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: General Profile Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4.5 w-4.5 text-blue-605" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">General Information</h3>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Account Role Type</label>
                <input 
                  type="text"
                  value={user?.role ? `${user.role.toUpperCase()} PROFILE` : 'STUDENT PROFILE'}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Email Address</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border-none"
              >
                <Save className="h-4 w-4" /> Save Profile Details
              </button>
            </form>
          </div>

          {/* Password Security Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="h-4.5 w-4.5 text-indigo-650" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Current Password</label>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Confirm New Password</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex gap-2 items-center">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border-none"
              >
                <Key className="h-4 w-4" /> Update Access Password
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Preference Toggles (1 Col) */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Preferences</h3>
          </div>

          <div className="space-y-4 text-xs font-sans font-light text-slate-500">
            <p>Select what updates you want to receive automatically on your mobile device.</p>
            
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-blue-650 h-4 w-4 cursor-pointer"
                />
                <span className="font-bold text-slate-800">Email Digests summaries</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded text-blue-650 h-4 w-4 cursor-pointer"
                />
                <span className="font-bold text-slate-800">SMS Check-in Alerts</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Success Banner Notification toast */}
      <AnimatePresence>
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xl flex gap-3 items-center max-w-sm"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">Settings Saved!</h5>
              <p className="text-[10px] text-slate-505 mt-0.5 leading-normal font-light">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
