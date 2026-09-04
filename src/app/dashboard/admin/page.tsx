import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, UserPlus, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Overview' };

/** Admin home (2026-09-05) — the admin area exists for invitations today;
 *  further admin tooling (users/courses/enrollments) is roadmap (Stage 6). */
export default async function AdminOverviewPage() {
  const session = await getCurrentUser();
  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Admin</p>
        <h1 className='type-display-m mt-3'>Welcome, {session.name.split(' ')[0]}</h1>
        <p className='mt-3 text-foreground/70'>
          Invitations are the single door into Educraft — everyone signs up by invitation, and roles are set when you
          send one.
        </p>
      </div>

      <div className='mt-8 grid gap-5 sm:grid-cols-2'>
        <Link
          href='/dashboard/admin/invite'
          className='card-surface group rounded-3xl p-6 transition-colors duration-150 hover:border-ec-indigo/60 dark:hover:border-white/30'
        >
          <span className='flex size-11 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <UserPlus className='size-5' aria-hidden='true' />
          </span>
          <span className='mt-4 block text-lg font-semibold'>Invite someone</span>
          <span className='mt-1 block text-sm text-foreground/60'>
            Send an email invitation for a professor or a student account.
          </span>
        </Link>

        <div className='card-surface rounded-3xl p-6'>
          <span className='flex size-11 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <GraduationCap className='size-5' aria-hidden='true' />
          </span>
          <span className='mt-4 block text-lg font-semibold'>How roles work</span>
          <ul className='mt-2 space-y-2 text-sm text-foreground/60'>
            <li className='flex gap-2'>
              <Users className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
              Professors manage courses, classes and materials.
            </li>
            <li className='flex gap-2'>
              <GraduationCap className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
              Students see enrolled courses and posted materials.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
