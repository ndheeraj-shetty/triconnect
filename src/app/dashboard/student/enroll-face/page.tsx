'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export default function FaceEnrollmentPage() {
  const router = useRouter();

  // Steps: 'intro' | 'camera' | 'success'
  const [step, setStep] = useState<'intro' | 'camera' | 'success'>('intro');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if already enrolled on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('triconnect_token');
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/v1/attendance/enrollment-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.face_enrolled) {
          router.replace('/dashboard/student');
        }
      }
    } catch (e) {
      console.warn('Status check failed:', e);
    }
  };

  // Open webcam
  const startCamera = async () => {
    setErrorMessage('');
    setCameraError('');
    setStep('camera');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera permission denied or camera not found. Please enable camera access.');
      setCameraActive(false);
    }
  };

  // Stop camera helper
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Capture face photo & save to backend
  const captureAndEnrollFace = async () => {
    if (!videoRef.current || !cameraActive) {
      setErrorMessage('Camera must be active to capture face photo.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      // Capture current frame from video onto hidden canvas
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      const capturedBase64 = canvas.toDataURL('image/jpeg', 0.85);

      const token = localStorage.getItem('triconnect_token');
      const res = await fetch('http://localhost:8000/api/v1/attendance/enroll-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          face_image: capturedBase64,
          face_embedding: 'enrolled_face_vector'
        })
      });

      if (res.ok) {
        stopCamera();
        setStep('success');
      } else {
        const errData = await res.json();
        setErrorMessage(errData.detail || 'Failed to save face enrollment. Please try again.');
      }
    } catch (err) {
      console.error('Face enrollment error:', err);
      setErrorMessage('Network error during face enrollment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.replace('/dashboard/student');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 uppercase tracking-widest shadow-sm mx-auto">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Biometric Identification
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Face Enrollment</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-light max-w-md mx-auto leading-relaxed">
            Please capture your face once to enable attendance verification.
          </p>
        </div>

        {/* STEP 1: INTRO */}
        {step === 'intro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-4">
            
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-50/80 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
              <UserCheck className="h-12 w-12" />
            </div>

            <p className="text-xs text-slate-500 font-light">
              Your face photo will be securely linked to your account for daily attendance checks.
            </p>

            <button
              type="button"
              onClick={startCamera}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Face Enrollment <ArrowRight className="h-4.5 w-4.5" />
            </button>

          </motion.div>
        )}

        {/* STEP 2: LIVE CAMERA PREVIEW & CAPTURE */}
        {step === 'camera' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
            
            {cameraError ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Try Camera Permission Again
                </button>
              </div>
            ) : (
              <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-3xl bg-slate-950 overflow-hidden border-4 border-slate-200 shadow-inner flex items-center justify-center">
                
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* On-screen Face Outline Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-64 border-2 border-dashed border-blue-400/80 bg-blue-500/5 rounded-[50%]" />
                </div>

                {!cameraActive && (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    <span>Opening webcam...</span>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMessage}
              </div>
            )}

            {cameraActive && (
              <button
                type="button"
                disabled={submitting}
                onClick={captureAndEnrollFace}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving Face Photo...
                  </>
                ) : (
                  <>Capture Face &amp; Complete Enrollment <Camera className="h-4 w-4" /></>
                )}
              </button>
            )}

          </motion.div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-4">
            
            <div className="mx-auto h-20 w-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-green-600 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Face Enrollment Successful</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-light">Your face has been securely enrolled.</p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>

          </motion.div>
        )}

      </div>

    </div>
  );
}
