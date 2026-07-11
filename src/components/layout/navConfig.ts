import { LayoutDashboard, Dumbbell, CalendarDays, LineChart, UserRound } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/generate', label: 'Today', icon: Dumbbell, end: false },
  { to: '/history', label: 'History', icon: CalendarDays, end: false },
  { to: '/progress', label: 'Progress', icon: LineChart, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
] as const;
