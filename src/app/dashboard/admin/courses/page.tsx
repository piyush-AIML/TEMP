import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, BookPlus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAdminCourseList } from '@/lib/dashboard/admin';
import { formatShortDate } from '@/lib/dashboard/format';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { CourseForm } from '@/components/dashboard/CourseForm';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Courses' };

/** Admin course index (course-allocation rework 2026-09-05) — create a
 *  course with professor assignment, then manage any course from its row. */
export default async function AdminCoursesPage() {
  await getCurrentUser(); // layout already gates role; cheap + cached per request
  const courses = await getAdminCourseList();

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Courses</p>
        <h1 className='type-display-m mt-3'>Courses</h1>
        <p className='mt-3 text-foreground/70'>
          Courses are where teaching happens — create one, assign its professors, and open any course to
          manage its details, its professors, or remove it entirely.
        </p>
      </div>

      <section className='mt-8'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <BookPlus className='size-5 text-foreground/50' aria-hidden='true' />
          Create a course
        </h2>
        <p className='mt-1 text-sm text-foreground/60'>
          Assigned professors must be Educraft professor accounts — signed in once, not just invited. Their
          emails are resolved one by one, and nothing is created if any cannot be assigned.
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
          <div className='card-surface mt-4 divide-y divide-ec-sky rounded-3xl px-2 dark:divide-ec-canvas-deep'>
            {courses.map((course) => {
              const accent = getPillarAccentForVertical(course.vertical);
              return (
                <Link
                  key={course.id}
                  href={`/dashboard/admin/courses/${course.id}`}
                  className='group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl px-4 py-4 transition-colors duration-150 hover:bg-ec-sky/40 dark:hover:bg-ec-canvas-deep/40'
                >
                  <div className='min-w-0'>
                    <p
                      className={cn(
                        'text-xs font-semibold uppercase tracking-widest',
                        accent ? accent.text : 'text-ec-indigo dark:text-white'
                      )}
                    >
                      {accent ? accent.name : course.vertical}
                      <span className='ml-2 font-medium normal-case tracking-normal text-foreground/40'>
                        Created {formatShortDate(course.createdAt)}
                      </span>
                    </p>
                    <p className='mt-0.5 font-semibold'>
                      {course.title}
                      <span className='ml-2 text-xs font-semibold text-foreground/50'>{course.code}</span>
                    </p>
                    <p className='mt-0.5 truncate text-sm text-foreground/60'>
                      {course.professorNames.join(', ') || 'No professors assigned'}
                    </p>
                  </div>
                  <p className='flex shrink-0 items-center gap-3 text-sm'>
                    <span className='font-semibold text-foreground/70'>{course.activeStudents} enrolled</span>
                    <span className='inline-flex items-center gap-1 font-semibold text-ec-indigo dark:text-white'>
                      Manage
                      <ArrowRight className='size-4 transition-transform duration-150 group-hover:translate-x-0.5' aria-hidden='true' />
                    </span>
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
