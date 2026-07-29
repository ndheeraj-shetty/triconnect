'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  MapPin, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Compass, 
  CheckCircle2, 
  ArrowLeft,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Smartphone
} from 'lucide-react';

interface RecordItem {
  id: string;
  name: string;
  roll: string;
  time: string;
  status: 'Present' | 'Late' | 'Absent';
  matchScore: string;
  livenessScore: string;
  distance: string;
  device: string;
}

interface ViolationItem {
  id: string;
  name: string;
  roll: string;
  time: string;
  lat: number;
  lng: number;
  distance: string;
}

const mockRecords: RecordItem[] = [
  { id: '1', name: 'Liam Sterling', roll: '24B-CS9', time: '08:22 AM', status: 'Present', matchScore: '95%', livenessScore: '0.94', distance: '12m', device: 'iOS 15 / Safari' },
  { id: '2', name: 'Sophia Loren', roll: '24B-CS4', time: '08:27 AM', status: 'Present', matchScore: '92%', livenessScore: '0.88', distance: '34m', device: 'Android 12 / Chrome' },
  { id: '3', name: 'Ethan Hunt', roll: '24B-CS1', time: '08:44 AM', status: 'Late', matchScore: '96%', livenessScore: '0.92', distance: '54m', device: 'Windows 11 / Edge' },
  { id: '4', name: 'Marcus Aurelius', roll: '24B-CS8', time: '08:19 AM', status: 'Present', matchScore: '94%', livenessScore: '0.91', distance: '8m', device: 'Apple Face ID' },
  { id: '5', name: 'Clara Oswald', roll: '24B-CS2', time: '—', status: 'Absent', matchScore: '—', livenessScore: '—', distance: '—', device: '—' },
];

const mockViolations: ViolationItem[] = [
  { id: '1', name: 'Bruce Wayne', roll: '24B-CS7', time: '08:14 AM', lat: 37.8922, lng: -122.3114, distance: '12.4 km' },
  { id: '2', name: 'Peter Parker', roll: '24B-CS5', time: '08:35 AM', lat: 37.7611, lng: -122.4644, distance: '1.8 km' },
];

export default function AdminAttendanceManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  
  // Settings Form State
  const [settings, setSettings] = useState({
    school_name: 'Westside Academy High',
    campus_name: 'Main Campus Center',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 100, // meters
    start_time: '08:15 AM',
    end_time: '09:00 AM',
    late_threshold: '08:30 AM',
    face_match_threshold: 0.80,
    max_face_attempts: 3,
    liveness_sensitivity: 0.70
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  
  // Database records
  const [records, setRecords] = useState<RecordItem[]>(mockRecords);
  const [violations, setViolations] = useState<ViolationItem[]>(mockViolations);
  
  // Analytics totals
  const [analytics, setAnalytics] = useState({
    present: 324,
    late: 42,
    absent: 14,
    gpsViolations: 2,
    failures: 4,
    enrolled: 380,
    rate: 96.3
  });

  // Pull settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/attendance/settings', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (e) {
      console.warn('Backend offline. Settings fall back to default dashboard state.', e);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccessMsg('');

    try {
      const activeToken = localStorage.getItem('triconnect_token');
      const response = await fetch('http://localhost:8000/api/v1/attendance/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSaveSuccessMsg('Attendance settings successfully updated in database!');
      } else {
        alert('Failed to update settings');
      }
    } catch (err) {
      console.warn('FastAPI backend offline, settings update simulated locally.');
      setSaveSuccessMsg('Mock settings saved successfully locally.');
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  // Compile mock downloads for reports (PDF, CSV, Excel formats)
  const triggerReportDownload = (reportType: string, format: 'csv' | 'excel' | 'pdf') => {
    const filename = `${reportType.toLowerCase().replace(/\s+/g, '_')}_report.${format}`;
    let content = '';

    if (format === 'csv') {
      content = `Report Name,${reportType}\nGenerated At,${new Date().toLocaleString()}\nSchool,${settings.school_name}\n\nStudent Name,Roll Number,Date,Time,Status,Distance,Confidence\n`;
      records.forEach(r => {
        content += `"${r.name}","${r.roll}","Jul 28, 2026","${r.time}","${r.status}","${r.distance}","${r.matchScore}"\n`;
      });
    } else {
      // Simulate binary excel/pdf format representation
      content = `--- TriConnect Intelligence Report ---\nName: ${reportType}\nFormat: ${format.toUpperCase()}\nGenerated Date: ${new Date().toLocaleString()}\n---\n`;
      records.forEach(r => {
        content += `[Record] ${r.name} (${r.roll}) - Status: ${r.status} at ${r.time} (Mesh Match: ${r.matchScore})\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      
      {/* Back to admin portal */}
      <button 
        onClick={() => router.push('/dashboard/admin')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin Panel
      </button>

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-[10px] font-bold text-blue-650 uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> School Campus Verification
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Smart Attendance Management</h1>
          <p className="text-slate-500 font-light text-sm mt-1">Configure campus boundaries, verify geofenced attendance logs, and generate reports.</p>
        </div>
      </div>

      {/* Menu Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-all cursor-pointer ${
            activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Today&apos;s Dashboard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 transition-all cursor-pointer ${
            activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Reports &amp; Export
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: Live Analytics & Dashboard Logs */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Present Ratio</span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{analytics.rate}%</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-light">Sweeps: {analytics.present + analytics.late}/{analytics.enrolled}</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Late Markers</span>
                <h3 className="text-2xl font-black text-amber-600 mt-2">{analytics.late}</h3>
                <p className="text-[10px] text-slate-450 mt-1 font-light">Registered after {settings.late_threshold}</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">GPS Proximity Violations</span>
                <h3 className="text-2xl font-black text-red-600 mt-2">{analytics.gpsViolations}</h3>
                <p className="text-[10px] text-slate-450 mt-1 font-light">Attempts outside {settings.radius}m boundary</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Biometric Failures</span>
                <h3 className="text-2xl font-black text-red-600 mt-2">{analytics.failures}</h3>
                <p className="text-[10px] text-slate-455 mt-1 font-light">Liveness or mismatch rejections</p>
              </div>
            </div>

            {/* Today's scan table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Check-in Registry</h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">Students who marked attendance today through geofence face verification.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-bold text-[9px] bg-slate-50/50">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Roll Code</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Mesh Match</th>
                      <th className="py-3 px-4">GPS Proximity</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{r.name}</td>
                        <td className="py-3.5 px-4 font-mono">{r.roll}</td>
                        <td className="py-3.5 px-4 font-mono">{r.time}</td>
                        <td className="py-3.5 px-4">{r.matchScore}</td>
                        <td className="py-3.5 px-4">{r.distance}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            r.status === 'Present' ? 'bg-green-50 text-green-700' :
                            r.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GPS Violations Log table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Proximity Violations */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">GPS Proximity Violations</h3>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">Attempted scans far outside school campus premises.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-bold text-[9px]">
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Proximity Probed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {violations.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-bold text-slate-800">{v.name}</td>
                          <td className="py-3 px-3 font-mono">{v.time}</td>
                          <td className="py-3 px-3 text-red-650 font-semibold">{v.distance} away</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Biometric Alert table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <Lock className="h-5 w-5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Attempt Mismatch Lockouts</h3>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">Students locked out of verification due to 3 face mismatches.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 tracking-widest uppercase font-bold text-[9px]">
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Session Date</th>
                        <th className="py-2.5 px-3">Log Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 font-bold text-slate-800">Peter Parker</td>
                        <td className="py-3.5 px-3 font-mono">Today</td>
                        <td className="py-3.5 px-3 text-amber-700 font-medium">3 Mismatch failures</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 font-bold text-slate-800">Diana Prince</td>
                        <td className="py-3.5 px-3 font-mono">Jul 26, 2026</td>
                        <td className="py-3.5 px-3 text-slate-500">Liveness verification rejection</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </motion.div>
        )}



        {/* TAB 3: Reports & Export */}
        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { title: 'Daily Attendance Report', desc: 'Detailed log check-in list of present, late, and absent students.' },
              { title: 'Monthly Attendance Report', desc: 'Aggregated attendance rate trend logs over the active calendar month.' },
              { title: 'Student Attendance Report', desc: 'Individual student checkpoint attendance rate history logs.' },
              { title: 'Class Attendance Report', desc: 'Aggregated attendance averages filterable by class groups.' },
              { title: 'Late Mark Report', desc: 'Comprehensive list of students matching the Late marking status.' },
              { title: 'Absentee Report', desc: 'Auto-compiled list of absent students for emergency parent notification reviews.' },
              { title: 'GPS Radius Violations', desc: 'Logs capturing geofencing outliers attempting checks outside boundaries.' },
              { title: 'Biometric Face Failures', desc: 'Security logs tracking mismatches, blink failures, or lockout warnings.' },
            ].map((report, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm space-y-4 hover:border-slate-350 transition-all text-left"
              >
                <div className="space-y-1.5">
                  <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-600">
                    <FileCheck className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-2">{report.title}</h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-light">{report.desc}</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-[10px] font-bold">
                  <button
                    onClick={() => triggerReportDownload(report.title, 'csv')}
                    className="py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-0.5 cursor-pointer border border-slate-150"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <button
                    onClick={() => triggerReportDownload(report.title, 'excel')}
                    className="py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-0.5 cursor-pointer border border-slate-150"
                  >
                    <Download className="h-3 w-3" /> EXCEL
                  </button>
                  <button
                    onClick={() => triggerReportDownload(report.title, 'pdf')}
                    className="py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center gap-0.5 cursor-pointer border border-slate-150"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
