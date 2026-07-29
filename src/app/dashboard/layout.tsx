'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  LayoutDashboard,
  QrCode,
  Heart,
  BookOpen,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Sparkles,
  Command,
  Calendar,
  Map,
  Award,
  FileText,
  Flame,
  ShieldCheck,
  Image,
  ShoppingCart,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import { getDemoUser } from '@/lib/demo-mode';

// Nav item structures
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Smart Attendance', href: '/dashboard/student/attendance', icon: QrCode },
    { label: 'Learning Quest', href: '/dashboard/student/assignments', icon: Sparkles },
    { label: 'Homework', href: '/dashboard/student/homework', icon: FileText },
    { label: 'Wellbeing AI', href: '/dashboard/student/wellbeing', icon: Heart },
    { label: 'Academic Reports', href: '/dashboard/student/reports', icon: BarChart3 },
    { label: 'Notes Hub', href: '/dashboard/student/notes', icon: FileText },
    { label: 'Calendar', href: '/dashboard/student/calendar', icon: Calendar },
    { label: 'Campus Blueprint', href: '/dashboard/student/blueprint', icon: Map },
    { label: 'Portfolio', href: '/dashboard/student/portfolio', icon: Award },
  ],
  teacher: [
    { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { label: 'Class Analytics', href: '/dashboard/teacher/students', icon: BarChart3 },
    { label: 'Notes & Syllabus', href: '/dashboard/teacher/notes', icon: BookOpen },
    { label: 'Learning Quest Studio', href: '/dashboard/teacher/quests', icon: Sparkles },
    { label: 'Homework Manager', href: '/dashboard/teacher/homework', icon: FileText },
    { label: 'Well-being companion', href: '/dashboard/teacher/wellbeing', icon: Heart },
    { label: 'Burnout AI', href: '/dashboard/teacher/burnout', icon: Flame },
    { label: 'Protection Hub', href: '/dashboard/teacher/protection', icon: ShieldCheck },
  ],
  parent: [
    { label: 'Overview', href: '/dashboard/parent', icon: LayoutDashboard },
    { label: 'Connect Teacher', href: '/dashboard/parent/communication', icon: MessageSquare },
    { label: 'Bus Tracking', href: '/dashboard/parent/bus-tracking', icon: Navigation },
    { label: 'Photo Album', href: '/dashboard/parent/photo-album', icon: Image },
    { label: 'Marketplace', href: '/dashboard/parent/marketplace', icon: ShoppingCart },
    { label: 'Notices & Feedback', href: '/dashboard/parent/notices', icon: FileText },
    { label: 'Alumni Portal', href: '/dashboard/parent/alumni', icon: Users },
  ],
  admin: [
    { label: 'Platform Stats', href: '/dashboard/admin', icon: LayoutDashboard },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed] = useState(false);

  // Auto-detect role from path if user session is loading or missing
  const detectRoleFromPath = (): UserRole => {
    if (pathname.includes('/teacher')) return 'teacher';
    if (pathname.includes('/student')) return 'student';
    if (pathname.includes('/parent')) return 'parent';
    if (pathname.includes('/admin')) return 'admin';
    return 'student'; // Fallback
  };

  const activeRole = detectRoleFromPath();
  const portalUser = activeRole === 'student' ? user : getDemoUser(activeRole);

  useEffect(() => {
    if (!loading && activeRole === 'student') {
      if (!user) {
        router.replace('/login');
        return;
      }

      // Check if student has completed first-time Face Enrollment
      if (!pathname.includes('/dashboard/student/enroll-face')) {
        const checkEnrollment = async () => {
          try {
            const token = localStorage.getItem('triconnect_token');
            if (!token) return;
            const res = await fetch('http://localhost:8000/api/v1/attendance/enrollment-status', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.face_enrolled === false) {
                router.replace('/dashboard/student/enroll-face');
              }
            }
          } catch (e) {
            console.warn('Face enrollment check error:', e);
          }
        };
        checkEnrollment();
      }
    }
  }, [activeRole, loading, pathname, router, user]);

  // Mock Notifications
  const mockNotifications = [
    { id: 1, title: 'AI Anomaly Detected', desc: 'Robert Mercer (Student) mood score dropped by 18% today.', time: '2 mins ago', unread: true, type: 'alert' },
    { id: 2, title: 'Attendance QR Generated', desc: 'Class 10B Chemistry attendance QR is live.', time: '1 hr ago', unread: false, type: 'info' },
    { id: 3, title: 'Term Report Ready', desc: 'TriConnect AI synthesized Science comments.', time: '4 hrs ago', unread: false, type: 'report' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 border-t-2 border-blue-600 rounded-full"
        />
        <p className="text-slate-500 text-xs mt-4 font-semibold font-sans">Syncing workspace sessions...</p>
      </div>
    );
  }

  if (activeRole === 'student' && !user) return null;

  // Active navigation items based on resolved role
  const menuItems = navItemsByRole[activeRole] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-5 flex flex-col gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
                <Layers className="h-4.5 w-4.5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-base font-extrabold text-slate-900 tracking-tight">TriConnect</span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isActive 
                      ? 'bg-blue-50/80 border-l-2 border-blue-600 text-blue-600' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo portal exit */}
        <div className="p-4 border-t border-slate-200 space-y-4">
          {!sidebarCollapsed && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Hackathon demo</span>
                <Sparkles className="h-3 w-3 text-blue-600 animate-pulse" />
              </div>
              <Link href="/" className="block rounded-lg bg-white border border-slate-200 px-2 py-2 text-center text-[10px] font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600">Switch portal</Link>
            </div>
          )}

          {/* Logout Action */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-605 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm shadow-slate-100">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-650 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="hidden sm:block text-left">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {activeRole} PORTAL
              </span>
              <h2 className="text-xs font-bold text-slate-800 mt-0.5">
                {portalUser?.schoolName || 'Westside Academy High'}
              </h2>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            {/* Mock Search Action */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 px-3 py-1.5 rounded-xl text-xs text-slate-500 transition-all cursor-pointer max-w-40 sm:max-w-none"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search insights...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[8px] text-slate-400 shadow-sm">
                <Command className="h-2 w-2" />K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 relative transition-all cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 overflow-hidden text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">AI Notifications</h4>
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full font-bold">3 alerts</span>
                    </div>
                    <div className="space-y-3">
                      {mockNotifications.map((notif) => (
                        <div key={notif.id} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/60 transition-all border border-slate-100 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                            <span className="text-[8px] text-slate-500 font-mono">{notif.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">{notif.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 transition-all cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={portalUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                  alt={portalUser?.name || 'Alex Mercer'} 
                  className="h-6.5 w-6.5 rounded-lg object-cover"
                />
                <span className="text-xs font-bold text-slate-705 hidden sm:block pr-1">
                  {portalUser?.name || 'Alex Mercer'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-left"
                  >
                    <div className="p-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{portalUser?.name || 'Alex Mercer'}</p>
                      <p className="text-[9px] text-slate-500 capitalize">{activeRole} Profile</p>
                    </div>
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/dashboard/settings');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-left mt-1 cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Profile Settings
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-605 hover:bg-red-50 rounded-xl transition-all text-left mt-1 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 z-10 text-left"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight font-mono">TriConnect</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-blue-50 border-l-2 border-blue-600 text-blue-600' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile demo portal exit */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 uppercase text-[9px] font-bold block mb-2">Hackathon demo</span>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg bg-white border border-slate-200 px-2 py-2 text-center text-[10px] font-bold text-slate-700">Switch portal</Link>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-650 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-slate-450" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mock Search Palette Dialog */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-slate-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 overflow-hidden z-10 text-left"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student alerts, attendance stats, classes..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400"
                  autoFocus
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="px-2 py-1 rounded bg-slate-50 text-slate-500 hover:text-slate-800 text-[10px] font-mono border border-slate-200"
                >
                  ESC
                </button>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">Recent Searches / AI Alerts</span>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs text-slate-650">
                  <span className="font-semibold">Calculus homework Completion Rate</span>
                  <span className="text-[9px] text-slate-400 font-mono">View statistics</span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs text-slate-650">
                  <span className="font-semibold">Robert Mercer wellbeing trend details</span>
                  <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded text-[8px] font-bold">AI Anomaly</span>
                </div>
                <div className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs text-slate-650">
                  <span className="font-semibold">Chemistry 10B QR Scanner logs</span>
                  <span className="text-[9px] text-slate-400 font-mono">View attendance</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Link href="/" className="fixed bottom-5 right-5 z-30 rounded-full bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-slate-400/30 transition hover:-translate-y-0.5 hover:bg-indigo-600">
        Switch Portal
      </Link>

    </div>
  );
}
