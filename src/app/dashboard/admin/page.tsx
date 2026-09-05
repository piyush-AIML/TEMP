import type { Metadata } from 'next';
import Link from 'next/link';
import { BookPlus, BookOpen, GraduationCap, UserPlus, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAdminCourseList } from '@/lib/dashboard/admin';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { CourseForm } from '@/components/dashboard/CourseForm';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Overview' };

/** Admin home (2026-09-05, course slice) — invitations, course creation with
 *  professor assignment, and the course list. Further admin tooling
 *  (users/enrollments consoles) is roadmap (Stage 6). */
export default async function AdminOverviewPage() {
  const session = await getCurrentUser();
  const courses = await getAdminCourseList();

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Admin</p>
        <h1 className='type-display-m mt-3'>Welcome, {session.name.split(' ')[0]}</h1>
        <p className='mt-3 text-foreground/70'>
          Invitations are the single door into Educraft, and courses are created here — every professor and
          student starts from an account you set up.
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

      <section className='mt-12'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <BookPlus className='size-5 text-foreground/50' aria-hidden='true' />
          Create a course
        </h2>
        <p className='mt-1 text-sm text-foreground/60'>
          Assigned professors must have signed in to Educraft once — invitation acceptance alone is not enough.
        </p>
        <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5 sm:p-6'>
          <CourseForm />
        </div>
      </section>

      <section className='mt-12'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <BookOpen className='size-5 text-foreground/50' aria-hidden='true' />
          All courses
        </h2>
        {courses.length === 0 ? (
          <p className='card-surface mt-4 rounded-3xl px-6 py-6 text-sm text-foreground/60'>
            No courses yet — create the first one above.
          </p>
        ) : (
          <div className='card-surface mt-4 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
            {courses.map((course) => {
              const accent = getPillarAccentForVertical(course.vertical);
              return (
                <div key={course.id} className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4'>
                  <div className='min-w-0'>
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-widest',
                        accent ? accent.text : 'text-ec-indigo dark:text-white'
                      )}
                    >
                      {accent ? accent.name : course.vertical}
                    </p>
                    <p className='mt-0.5 font-semibold'>
                      {course.title}
                      <span className='ml-2 text-xs font-semibold text-foreground/50'>{course.code}</span>
                    </p>
                    <p className='mt-0.5 truncate text-sm text-foreground/60'>
                      {course.professorNames.join(', ') || 'No professors assigned'}
                    </p>
                  </div>
                  <p className='shrink-0 text-sm font-semibold text-foreground/70'>
                    {course.activeStudents} enrolled
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
