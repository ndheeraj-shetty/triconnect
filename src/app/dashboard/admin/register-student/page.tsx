'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Check,
  Copy,
  Printer,
  ArrowLeft,
  GraduationCap,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function RegisterStudentPage() {
  const router = useRouter();

  // ── Form fields ──────────────────────────────────────────────────────────────
  const [studentName,  setStudentName]  = useState('');
  const [studentId,    setStudentId]    = useState('');
  const [rollNumber,   setRollNumber]   = useState('');
  const [email,        setEmail]        = useState('');
  const [className,    setClassName]    = useState('10');
  const [section,      setSection]      = useState('A');
  const [parentName,   setParentName]   = useState('');
  const [parentPhone,  setParentPhone]  = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isActive,     setIsActive]     = useState(true);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [errorMsg,        setErrorMsg]        = useState('');
  const [generatedCreds,  setGeneratedCreds]  = useState<{
    name: string; id: string; roll: string; email: string;
    pass: string; class: string; section: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setTempPassword(pass);
  };

  React.useEffect(() => { generatePassword(); }, []);

  // ── Admin token helper ────────────────────────────────────────────────────
  // The admin portal is accessed directly in demo mode without a login step,
  // so localStorage may have no JWT.  This helper transparently obtains one
  // using the seeded admin account before any write operation.
  const getAdminToken = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem('triconnect_token');
    if (stored) return stored;

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@triconnect.com',
          password: 'admin123',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('triconnect_token', data.access_token);
        return data.access_token as string;
      }
    } catch {
      // backend offline
    }
    return null;
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Obtain admin JWT (auto-login if the portal was opened in demo mode).
      const token = await getAdminToken();

      if (!token) {
        setErrorMsg('Could not authenticate as admin. Please ensure the backend is running at http://localhost:8000.');
        setIsSubmitting(false);
        return;
      }

      // Use the dedicated admin-only endpoint that creates User + Student atomically.
      const res = await fetch('http://localhost:8000/api/v1/auth/register-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_name:       studentName,
          student_id:         studentId,
          roll_number:        rollNumber,
          email:              email,
          class_name:         className,
          section:            section,
          parent_name:        parentName,
          parent_phone:       parentPhone,
          temporary_password: tempPassword,
          is_active:          isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // If the stored token expired, clear it so next attempt re-authenticates.
        if (res.status === 401) {
          localStorage.removeItem('triconnect_token');
        }
        const msg = data?.detail || data?.message || 'Registration failed. Please try again.';
        setErrorMsg(msg);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      setErrorMsg('Unable to reach the backend. Please ensure the server is running at http://localhost:8000.');
      setIsSubmitting(false);
      return;
    }

    setGeneratedCreds({
      name:    studentName,
      id:      studentId,
      roll:    rollNumber,
      email:   email,
      pass:    tempPassword,
      class:   className,
      section: section,
    });
    setIsSubmitting(false);
  };

  const copyCredentials = () => {
    if (!generatedCreds) return;
    navigator.clipboard.writeText(
      `TriConnect Student Credentials\n` +
      `Student Name: ${generatedCreds.name}\n` +
      `Student ID:   ${generatedCreds.id}\n` +
      `Roll Number:  ${generatedCreds.roll}\n` +
      `Class:        ${generatedCreds.class} - ${generatedCreds.section}\n` +
      `Email:        ${generatedCreds.email}\n` +
      `Password:     ${generatedCreds.pass}\n`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setStudentName(''); setStudentId(''); setRollNumber('');
    setEmail(''); setParentName(''); setParentPhone('');
    setGeneratedCreds(null); setErrorMsg('');
    generatePassword();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-left">

      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/admin')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-blue-600" /> Student Registration
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Only students registered here can access the Student Portal. Students cannot create their own accounts.
        </p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
        <span>
          <strong>Admin-Only Access Control</strong> — Student accounts can only be created from this panel.
          Students who attempt to log in without an account registered here will see an
          &ldquo;Account Not Registered&rdquo; error and be directed to contact the administrator.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Registration form ─────────────────────────────────────────────── */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Registry Form</h3>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {!generatedCreds ? (
            <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">

              {/* Row 1: Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Row 2: Student ID + Roll Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
                    placeholder="e.g. STU2025001"
                    required
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)}
                    placeholder="e.g. 42"
                    required
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  required
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Row 4: Class + Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={className} onChange={e => setClassName(e.target.value)}
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    {['6','7','8','9','10','11','12'].map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={section} onChange={e => setSection(e.target.value)}
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none"
                  >
                    {['A','B','C','D','E'].map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Parent Name + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Parent / Guardian Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" value={parentName} onChange={e => setParentName(e.target.value)}
                    placeholder="e.g. Suresh Sharma"
                    required
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Parent Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Temp Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Temporary Password <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text" value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                    required minLength={8}
                    className="flex-1 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none"
                  />
                  <button
                    type="button" onClick={generatePassword}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-[9px] text-slate-400">Minimum 8 characters. Student must change this on first login.</p>
              </div>

              {/* Row 7: Account Status */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Account Status</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Inactive accounts cannot log in until re-enabled.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Registering Student Account...' : 'Register Student'}
              </button>
            </form>

          ) : (
            /* ── Success state ────────────────────────────────────────────────── */
            <div className="space-y-5 py-4 text-center font-sans">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Student Account Created!</h4>
                <p className="text-xs text-slate-500 mt-1 font-light">
                  The student can now log in to the Student Portal using their Student ID or email and the temporary password.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Register Another Student
                </button>
                <button
                  onClick={() => router.push('/dashboard/admin')}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Credentials card preview ──────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner text-left space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px] opacity-25 pointer-events-none" />

            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Student Credentials Card</span>
              {generatedCreds && (
                <div className="flex gap-1.5">
                  <button onClick={copyCredentials}
                    className="p-1.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer shadow-sm"
                    title="Copy credentials"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => window.print()}
                    className="p-1.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer shadow-sm"
                    title="Print card"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-center relative z-10 flex flex-col justify-between min-h-72">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">EduSync</span>
                </div>
                <p className="text-[8px] text-slate-400 uppercase font-mono font-bold tracking-widest mt-1">Student Access Card</p>
              </div>

              {generatedCreds ? (
                <div className="space-y-3 my-auto text-left font-mono">
                  {[
                    ['Student Name',  generatedCreds.name],
                    ['Student ID',    generatedCreds.id],
                    ['Roll Number',   generatedCreds.roll],
                    ['Class / Section', `${generatedCreds.class} - ${generatedCreds.section}`],
                    ['Login Email',   generatedCreds.email],
                    ['Temp Password', generatedCreds.pass],
                  ].map(([label, val]) => (
                    <div key={label} className="border-b border-slate-100 pb-2">
                      <span className="text-[8px] text-slate-400 uppercase block">{label}</span>
                      <span className="text-xs font-bold text-slate-800 break-all select-all">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="my-auto py-8 text-center text-slate-400 space-y-2">
                  <Info className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-light">Fill the registration form to generate the credentials card.</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 space-y-1">
                <p className="text-[8px] text-slate-400 leading-normal font-sans">
                  Log in at <strong>http://localhost:3000/login</strong> and change your password immediately.
                </p>
                <p className="text-[7px] text-slate-300 font-mono">EDUSYNC · ADMIN PROVISIONED ACCOUNT</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
