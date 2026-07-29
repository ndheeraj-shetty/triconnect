import type { User, UserRole } from '@/context/AuthContext';

export type DemoRole = Exclude<UserRole, 'student'>;

// Set NEXT_PUBLIC_DEMO_MODE=false to restore role authentication in a production build.
export const demoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

export const demoPortals: Array<{ role: UserRole; title: string; description: string; href: string }> = [
  { role: 'student', title: 'Student Portal', description: 'Sign in to access your personal learning journey.', href: '/login' },
  { role: 'teacher', title: 'Teacher Portal', description: 'Review learning, homework, attendance, and AI insights.', href: '/dashboard/teacher' },
  { role: 'admin', title: 'Admin Portal', description: 'Explore school-wide analytics and operations.', href: '/dashboard/admin' },
  { role: 'parent', title: 'Parent Portal', description: 'View a child’s progress, wellbeing, and school updates.', href: '/dashboard/parent' },
];

export function getDemoUser(role: DemoRole): User {
  const profiles: Record<DemoRole, Omit<User, 'role'>> = {
    teacher: { name: 'Sarah Jenkins', email: 'teacher.demo@triconnect.local', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', schoolName: 'Westside Academy High' },
    admin: { name: 'Principal Davis', email: 'admin.demo@triconnect.local', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', schoolName: 'Westside Academy High' },
    parent: { name: 'Robert Mercer', email: 'parent.demo@triconnect.local', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', schoolName: 'Westside Academy High' },
  };
  return { ...profiles[role], role };
}
