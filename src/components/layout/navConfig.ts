import { LayoutDashboard, Dumbbell, CalendarDays, LineChart, UserRound, Film, BookOpen } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/generate', label: 'Today', icon: Dumbbell, end: false },
  { to: '/exercises', label: 'Exercises', icon: Film, end: false },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen, end: false },
  { to: '/history', label: 'History', icon: CalendarDays, end: false },
  { to: '/progress', label: 'Progress', icon: LineChart, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
] as const;
