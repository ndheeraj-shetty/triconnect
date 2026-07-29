'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Lock, 
  Fingerprint, 
  CheckCircle2, 
  Loader2, 
  User, 
  Mail, 
  Phone,
  BookOpen
} from 'lucide-react';

export default function OnboardingWizard() {
  const { user, completeOnboarding, registerPasskey, logout } = useAuth();
  const router = useRouter();

  // Role fallback for mock previewing if no user is signed in
  const resolvedRole = user?.role || 'student';
  const resolvedUsername = user?.email?.split('@')[0] || 'STU1024';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('Grade 10');
  const [section, setSection] = useState('A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  
  // Teacher-specific fields
  const [department, setDepartment] = useState('Sciences');
  const [subjects, setSubjects] = useState('Chemistry Lab, AP Calculus');
  const [classTeacherOf, setClassTeacherOf] = useState('Grade 10-A');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');

  // Parent-specific fields
  const [relationship, setRelationship] = useState('Mother');
  const [parentContactPhone, setParentContactPhone] = useState('');
  const [parentContactEmail, setParentContactEmail] = useState('');

  // Security Credentials Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);
  const [registeringPasskey, setRegisteringPasskey] = useState(false);

  // Biometric Face Capture simulation states
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning_center' | 'scanning_left' | 'scanning_right' | 'completed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-fill mock email based on username
  useEffect(() => {
    if (user) {
      if (resolvedRole === 'student') {
        setStudentEmail(user.email || '');
      } else if (resolvedRole === 'teacher') {
        setTeacherEmail(user.email || '');
      } else if (resolvedRole === 'parent') {
        setParentContactEmail(user.email || '');
      }
    }
  }, [user, resolvedRole]);

  // Face Scan Simulator logic
  const startFaceScan = () => {
    if (scanStatus !== 'idle') return;
    setScanStatus('scanning_center');
    setScanProgress(0);
  };

  useEffect(() => {
    if (scanStatus === 'scanning_center') {
      scanInterval.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(scanInterval.current!);
            setScanStatus('scanning_left');
            return 0;
          }
          return prev + 10;
        });
      }, 150);
    } else if (scanStatus === 'scanning_left') {
      scanInterval.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(scanInterval.current!);
            setScanStatus('scanning_right');
            return 0;
          }
          return prev + 10;
        });
      }, 150);
    } else if (scanStatus === 'scanning_right') {
      scanInterval.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(scanInterval.current!);
            setScanStatus('completed');
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }

    return () => {
      if (scanInterval.current) clearInterval(scanInterval.current);
    };
  }, [scanStatus]);

  // FIDO2 Passkey trigger simulation
  const handlePasskeyRegistration = async () => {
    setRegisteringPasskey(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate device prompt delay
    try {
      await registerPasskey(resolvedUsername, 'Personal Authenticator');
      setPasskeyRegistered(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRegisteringPasskey(false);
    }
  };

  // Submit profile to backend API
  const handleOnboardSubmit = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    
    // Structure payload based on active user role
    let payload = {};
    if (resolvedRole === 'student') {
      payload = {
        full_name: fullName || 'Liam Sterling',
        roll_number: rollNumber || '24B-CS9',
        class_name: className,
        section,
        parent_name: parentName || 'Elizabeth Sterling',
        parent_phone: parentPhone || '+1-555-0988',
        student_email: studentEmail || 'liam@triconnect.com',
        parent_email: parentEmail || 'elizabeth@triconnect.com',
        new_password: newPassword || 'new_password1234',
        confirm_password: confirmPassword || 'new_password1234',
        face_embedding: 'ENCRYPTED_FACE_VECTOR_DATA_3D_XYZ',
        captured_angles: 3,
      };
    } else if (resolvedRole === 'teacher') {
      payload = {
        full_name: fullName || 'Sarah Jenkins',
        department,
        subjects: subjects.split(',').map((s) => s.trim()),
        class_teacher_of: classTeacherOf,
        phone: teacherPhone || '+1-555-3344',
        email: teacherEmail || 'sarah@triconnect.com',
        new_password: newPassword || 'new_password1234',
        confirm_password: confirmPassword || 'new_password1234',
        face_embedding: scanStatus === 'completed' ? 'ENCRYPTED_TEACHER_FACE_MESH' : null,
      };
    } else if (resolvedRole === 'parent') {
      payload = {
        full_name: fullName || 'Robert Mercer',
        relationship,
        phone: parentContactPhone || '+1-555-7788',
        email: parentContactEmail || 'robert@triconnect.com',
        new_password: newPassword || 'new_password1234',
        confirm_password: confirmPassword || 'new_password1234',
      };
    }

    try {
      await completeOnboarding(resolvedRole, payload);
      setOnboardSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/${resolvedRole}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Onboarding failed. Please review values and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsCount = resolvedRole === 'student' ? 4 : resolvedRole === 'teacher' ? 3 : 2;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Premium Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">TriConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-mono">Onboarding Wizard v1.2</span>
          <button 
            onClick={logout} 
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel & Exit
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        
        {onboardSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-6 shadow-sm"
          >
            <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-950">Onboarding Completed!</h2>
              <p className="text-slate-500 text-sm font-light">
                Your credentials and profile biometric data have been registered securely. Initializing dashboard...
              </p>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 text-left">
            
            {/* Title & Progress Tracker */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">First Login Onboarding</h1>
                  <p className="text-slate-500 text-xs mt-1.5 font-light">
                    Complete this wizard to configure your profile parameters and enable biometric security credentials.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-650 bg-blue-50 px-2.5 py-1 rounded-full">
                  Step {step} of {stepsCount}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${(step / stepsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps Container */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Generic Profile Inputs */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: -15, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">Please update your official name and coordinate details.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Liam Sterling"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          required
                        />
                      </div>

                      {resolvedRole === 'student' ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Roll Number</label>
                          <input
                            type="text"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 24B-CS9"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      ) : resolvedRole === 'teacher' ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Department</label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Relationship to Student</label>
                          <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option>Father</option>
                            <option>Mother</option>
                            <option>Guardian</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {resolvedRole === 'student' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Grade Level</label>
                          <select
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          >
                            <option>Grade 9</option>
                            <option>Grade 10</option>
                            <option>Grade 11</option>
                            <option>Grade 12</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Section</label>
                          <input
                            type="text"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            placeholder="e.g. A"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    )}

                    {resolvedRole === 'teacher' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Specialty Subjects</label>
                          <input
                            type="text"
                            value={subjects}
                            onChange={(e) => setSubjects(e.target.value)}
                            placeholder="Chemistry Lab, Physics"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Class Advisor Of (Optional)</label>
                          <input
                            type="text"
                            value={classTeacherOf}
                            onChange={(e) => setClassTeacherOf(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Contact Phone</label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={resolvedRole === 'student' ? parentPhone : resolvedRole === 'teacher' ? teacherPhone : parentContactPhone}
                            onChange={(e) => {
                              if (resolvedRole === 'student') setParentPhone(e.target.value);
                              else if (resolvedRole === 'teacher') setTeacherPhone(e.target.value);
                              else setParentContactPhone(e.target.value);
                            }}
                            placeholder="+1-555-0000"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Personal Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={resolvedRole === 'student' ? studentEmail : resolvedRole === 'teacher' ? teacherEmail : parentContactEmail}
                            onChange={(e) => {
                              if (resolvedRole === 'student') setStudentEmail(e.target.value);
                              else if (resolvedRole === 'teacher') setTeacherEmail(e.target.value);
                              else setParentContactEmail(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* STUDENT STEP 2: Emergency & Parent Info */}
                {step === 2 && resolvedRole === 'student' && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: -15, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Parent & Emergency Contact Coordinates</h3>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">Please specify credentials for linking parent portals.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Parent/Guardian Name</label>
                          <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="e.g. Elizabeth Sterling"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Parent/Guardian Email</label>
                          <input
                            type="email"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="e.g. elizabeth@family.com"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* BIOMETRIC FACE MESH SCANNING (Student step 3, Teacher step 2) */}
                {((step === 3 && resolvedRole === 'student') || (step === 2 && resolvedRole === 'teacher')) && (
                  <motion.div
                    key="step-biometrics"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: -15, x: 0 }}
                    className="space-y-6 flex flex-col items-center text-center"
                  >
                    <div className="max-w-md">
                      <h3 className="text-sm font-bold text-slate-900">Encrypted Face Biometrics Mesh Capture</h3>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">
                        TriConnect requires a secure 3D face mesh scan for GPS attendance validation. Biometric coordinates are encrypted locally.
                      </p>
                    </div>

                    {/* Camera Scanner Simulation */}
                    <div className="relative h-56 w-56 rounded-full border-4 border-slate-100 bg-slate-900/5 overflow-hidden flex items-center justify-center shadow-sm">
                      <div className="absolute inset-4 rounded-full border border-dashed border-blue-400 animate-spin" style={{ animationDuration: '12s' }} />
                      
                      {scanStatus === 'idle' ? (
                        <div className="flex flex-col items-center gap-1">
                          <Camera className="h-8 w-8 text-blue-600 animate-pulse" />
                          <span className="text-[10px] font-bold text-slate-400">Scanner Ready</span>
                        </div>
                      ) : scanStatus === 'completed' ? (
                        <div className="flex flex-col items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-10 w-10" />
                          <span className="text-[10px] font-bold">Mesh Enrolled</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Simulated scan green line */}
                          <div 
                            className="absolute left-0 right-0 h-0.5 bg-green-500/80 shadow-md animate-bounce"
                            style={{ top: `${scanProgress}%` }}
                          />
                          <p className="text-xs font-bold text-blue-650 tracking-wide uppercase mt-1">
                            {scanStatus === 'scanning_center' ? 'Look Center' : scanStatus === 'scanning_left' ? 'Tilt Head Left' : 'Tilt Head Right'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">{scanProgress}% Captured</p>
                        </div>
                      )}
                    </div>

                    {scanStatus === 'idle' && (
                      <button
                        type="button"
                        onClick={startFaceScan}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                      >
                        Start Face Enrollment
                      </button>
                    )}
                  </motion.div>
                )}

                {/* SECURITY RESET & PASSKEY (Student step 4, Teacher step 3, Parent step 2) */}
                {((step === 4 && resolvedRole === 'student') || 
                  (step === 3 && resolvedRole === 'teacher') || 
                  (step === 2 && resolvedRole === 'parent')) && (
                  <motion.div
                    key="step-security"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: -15, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Security Credentials & FIDO2 Passkey Setup</h3>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">Please reset your temporary password and register your browser passkey.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    {/* FIDO2 Biometric Enrollment Panel */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-between gap-6">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Fingerprint className="h-4 w-4 text-blue-600" />
                          <span>Register Browser Passkey</span>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-light">
                          Enables passwordless logins. Windows Hello, Apple Face ID / Touch ID, or security keys are supported via WebAuthn API.
                        </p>
                      </div>
                      
                      {passkeyRegistered ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <CheckCircle2 className="h-4 w-4" /> Enrolled
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePasskeyRegistration}
                          disabled={registeringPasskey}
                          className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          {registeringPasskey ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" /> Registering...
                            </>
                          ) : (
                            <>Register Passkey</>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setStep((p) => Math.max(1, p - 1))}
                disabled={step === 1 || isSubmitting}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {step < stepsCount ? (
                <button
                  type="button"
                  onClick={() => setStep((p) => Math.min(stepsCount, p + 1))}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOnboardSubmit}
                  disabled={isSubmitting || (resolvedRole === 'student' && scanStatus !== 'completed')}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" /> Saving Data...
                    </>
                  ) : resolvedRole === 'student' && scanStatus !== 'completed' ? (
                    'Face Scan Required'
                  ) : (
                    <>
                      Complete Setup & Enter Dashboard <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
