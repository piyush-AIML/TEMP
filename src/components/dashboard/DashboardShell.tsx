'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { UserButton } from '@clerk/nextjs';
import { Sun, Moon } from 'lucide-react';
import SkipLink from '@/components/educraft/layout/SkipLink';
import { STUDENT_NAV, PROFESSOR_NAV, type DashboardNavItem } from '@/components/dashboard/navItems';
import { cn } from '@/lib/utils';

/**
 * Role-aware dashboard shell (Stage 0-D). Hand-rolled in the site's visual
 * language — same tokens, same light/dark art direction (root ThemeProvider
 * covers these routes). Desktop: fixed sidebar. Small screens: top bar with a
 * horizontally scrollable nav — the real drawer/bottom-nav pass is Stage 4.
 */
export default function DashboardShell({
  role,
  user,
  children,
}: {
  role: 'student' | 'professor';
  user: { name: string; email: string; imageUrl: string | null };
  children: React.ReactNode;
}) {
  const nav = role === 'student' ? STUDENT_NAV : PROFESSOR_NAV;

  return (
    <div className='min-h-dvh bg-background text-foreground'>
      <SkipLink />

      {/* Desktop sidebar */}
      <aside className='fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ec-sky dark:border-ec-canvas-deep bg-background lg:flex'>
        <div className='flex h-16 items-center border-b border-ec-sky px-6 dark:border-ec-canvas-deep'>
          <Link href='/' aria-label='Educraft homepage' className='flex'>
            <Image src='/logo.png' alt='' width={150} height={52} className='h-8 w-auto dark:hidden' />
            <Image src='/logo-dark.png' alt='' width={150} height={52} className='hidden h-8 w-auto dark:block' />
          </Link>
        </div>

        <nav aria-label='Dashboard' className='flex-1 overflow-y-auto px-4 py-6'>
          <p className='px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-foreground/40'>
            {role}
          </p>
          <ul className='space-y-1'>
            {nav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </ul>
        </nav>

        <div className='flex items-center gap-3 border-t border-ec-sky px-6 py-4 dark:border-ec-canvas-deep'>
          <Avatar user={user} />
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold'>{user.name}</p>
            <p className='truncate text-xs text-foreground/50'>{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Content column */}
      <div className='lg:pl-64'>
        <header className='sticky top-0 z-30 border-b border-ec-sky bg-background/85 backdrop-blur dark:border-ec-canvas-deep'>
          <div className='flex h-16 items-center justify-between gap-4 px-4 sm:px-6'>
            <Link href='/' aria-label='Educraft homepage' className='flex lg:hidden'>
              <Image src='/logo.png' alt='' width={150} height={52} className='h-8 w-auto dark:hidden' />
              <Image src='/logo-dark.png' alt='' width={150} height={52} className='hidden h-8 w-auto dark:block' />
            </Link>
            <div className='ml-auto flex items-center gap-2'>
              <ThemeToggle />
              <UserButton appearance={{ elements: { avatarBox: 'size-9' } }} />
            </div>
          </div>
          {/* Mobile nav */}
          <nav aria-label='Dashboard' className='flex overflow-x-auto border-t border-ec-sky px-3 py-2 dark:border-ec-canvas-deep lg:hidden'>
            {nav.map((item) => (
              <MobileNavLink key={item.href} item={item} />
            ))}
          </nav>
        </header>

        <main id='main-content' className='px-4 py-8 sm:px-6 lg:px-10'>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ item }: { item: DashboardNavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
          active
            ? 'bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'
            : 'text-foreground/70 hover:bg-ec-sky/50 hover:text-foreground dark:hover:bg-ec-canvas-deep/50'
        )}
      >
        <Icon className='size-4.5 shrink-0' aria-hidden='true' />
        {item.label}
      </Link>
    </li>
  );
}

function MobileNavLink({ item }: { item: DashboardNavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-ec-indigo text-white'
          : 'text-foreground/70 hover:bg-ec-sky/50 hover:text-foreground dark:hover:bg-ec-canvas-deep/50'
      )}
    >
      {item.label}
    </Link>
  );
}

function Avatar({ user }: { user: { name: string; imageUrl: string | null } }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ec-sky text-xs font-bold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
      {user.imageUrl ? (
        // Clerk-hosted avatar URL (remote, not a local asset) — plain img is intended
        <img src={user.imageUrl} alt='' className='size-full object-cover' />
      ) : (
        <span aria-hidden='true'>{initials}</span>
      )}
    </div>
  );
}

/**
 * Theme toggle — mounted-gated: anything derived from next-themes' theme must
 * not render before mount (hydration rule, master §18).
 */
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      className='inline-flex size-9 items-center justify-center rounded-2xl text-foreground/70 transition-colors duration-150 hover:bg-ec-sky/60 hover:text-foreground dark:hover:bg-ec-canvas-deep/60'
    >
      {mounted && (isDark ? <Sun className='size-4.5' aria-hidden='true' /> : <Moon className='size-4.5' aria-hidden='true' />)}
    </button>
  );
}
