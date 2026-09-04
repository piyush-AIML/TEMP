import {
  BookOpen,
  CalendarDays,
  Bell,
  UserRound,
  LayoutDashboard,
  CalendarClock,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

/**
 * Dashboard sidebar navigation (Stage 0-D). One literal list per role — the
 * hrefs point at stub routes until their owning stage ships. Icons are kept
 * here (not per-page) so the shell can mark active state by pathname alone.
 */
export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const STUDENT_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
  { label: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { label: 'Schedule', href: '/dashboard/student/schedule', icon: CalendarDays },
  { label: 'Notifications', href: '/dashboard/student/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/student/profile', icon: UserRound },
];

export const PROFESSOR_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/professor', icon: LayoutDashboard },
  { label: 'My Courses', href: '/dashboard/professor/courses', icon: BookOpen },
  { label: 'Schedule', href: '/dashboard/professor/schedule', icon: CalendarDays },
  { label: 'Invite', href: '/dashboard/professor/invite', icon: UserPlus },
  { label: 'Notifications', href: '/dashboard/professor/notifications', icon: Bell },
  { label: 'Meetings', href: '/dashboard/professor/meetings', icon: CalendarClock },
  { label: 'Profile', href: '/dashboard/professor/profile', icon: UserRound },
];

export const ADMIN_NAV: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Invite', href: '/dashboard/admin/invite', icon: UserPlus },
];
