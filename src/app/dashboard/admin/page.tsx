import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, UserPlus, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAdminCourseList } from '@/lib/dashboard/admin';

export const metadata: Metadata = { title: 'Overview' };

/** Admin home (2026-09-05; course surfaces moved to /dashboard/admin/courses
 *  in the course-allocation rework the same day) — invitations, the courses
 *  entry point with live totals, and the roles explainer. */
export default async function AdminOverviewPage() {
  const session = await getCurrentUser();
  const courses = await getAdminCourseList();
  const enrolledStudents = courses.reduce((sum, course) => sum + course.activeStudents, 0);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Admin</p>
        <h1 className='type-display-m mt-3'>Welcome, {session.name.split(' ')[0]}</h1>
        <p className='mt-3 text-foreground/70'>
          Invitations are the single door into Educraft, and courses start here — every professor and student
          begins as an account you set up, then joins the courses you create.
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
          <span className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ec-indigo dark:text-white'>
            Invite
            <ArrowRight className='size-4 transition-transform duration-150 group-hover:translate-x-0.5' aria-hidden='true' />
          </span>
        </Link>

        <Link
          href='/dashboard/admin/courses'
          className='card-surface group rounded-3xl p-6 transition-colors duration-150 hover:border-ec-indigo/60 dark:hover:border-white/30'
        >
          <span className='flex size-11 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <BookOpen className='size-5' aria-hidden='true' />
          </span>
          <span className='mt-4 block text-lg font-semibold'>Courses</span>
          <span className='mt-1 block text-sm text-foreground/60'>
            {courses.length === 0
              ? 'No courses yet — create the first one and assign its professors.'
              : `${courses.length} course${courses.length === 1 ? '' : 's'} · ${enrolledStudents} student${enrolledStudents === 1 ? '' : 's'} enrolled across them.`}
          </span>
          <span className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ec-indigo dark:text-white'>
            Create and manage
            <ArrowRight className='size-4 transition-transform duration-150 group-hover:translate-x-0.5' aria-hidden='true' />
          </span>
        </Link>

        <div className='card-surface rounded-3xl p-6 sm:col-span-2'>
          <span className='flex size-11 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <GraduationCap className='size-5' aria-hidden='true' />
          </span>
          <span className='mt-4 block text-lg font-semibold'>How roles work</span>
          <ul className='mt-2 space-y-2 text-sm text-foreground/60'>
            <li className='flex gap-2'>
              <Users className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
              Professors manage the courses assigned to them — classes, materials, coursework and enrolments.
            </li>
            <li className='flex gap-2'>
              <GraduationCap className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
              Students see their enrolled courses and everything posted to them.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
