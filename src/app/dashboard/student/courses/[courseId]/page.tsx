import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, CalendarDays, ClipboardList, Files, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { getStudentCourseWithAccess } from '@/lib/dashboard/courses';
import { getStudentUpcomingSessions } from '@/lib/dashboard/sessions';
import { getCourseMaterials } from '@/lib/dashboard/materials';
import { getStudentCourseTasks } from '@/lib/dashboard/tasks';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { MaterialFeed } from '@/components/dashboard/student/MaterialFeed';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * One enrolled course for a student (Stage 1, Coursework Stage 3): its
 * upcoming classes, its read-only coursework plan, and its read-only
 * materials & remarks. Access rule: the student must hold an ACTIVE
 * enrollment — anything else is notFound() (no existence oracle). The cache()
 * wrapper shares one access-checked lookup between generateMetadata and the
 * page within a request.
 */
const getCourseAccess = cache(async (userId: string, courseId: string) =>
  getStudentCourseWithAccess(userId, courseId)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const session = await getCurrentUser();
  const result = await getCourseAccess(session.userId, courseId);
  return { title: result ? `${result.course.code} — ${result.course.title}` : 'Course not found' };
}

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getCurrentUser();

  const access = await getCourseAccess(session.userId, courseId);
  if (!access) notFound();
  const { course } = access;

  const [sessions, tasks, materials] = await Promise.all([
    getStudentUpcomingSessions(session.userId, { courseId }),
    getStudentCourseTasks(session.userId, course.id),
    getCourseMaterials(course.id),
  ]);

  const accent = getPillarAccentForVertical(course.vertical);
  const professors = course.professorNames.join(', ');

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <Link
        href='/dashboard/student/courses'
        className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        All courses
      </Link>

      <div className='mt-6'>
        <p
          className={cn(
            'eyebrow',
            accent ? accent.text : 'text-ec-indigo dark:text-white'
          )}
        >
          {accent ? accent.name : 'Programme'}
        </p>
        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
          <h1 className='type-display-m'>{course.title}</h1>
          <span className='rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            {course.code}
          </span>
        </div>
        {course.description && (
          <p className='mt-3 max-w-2xl leading-relaxed text-foreground/70'>{course.description}</p>
        )}
        <p className='mt-2 text-sm text-foreground/60'>With {professors}</p>
      </div>

      <div className='mt-10 space-y-10'>
        <section>
          <h2 className='flex items-center gap-2 text-lg font-semibold'>
            <CalendarDays className='size-5 text-foreground/50' aria-hidden='true' />
            Upcoming classes
          </h2>
          {sessions.length === 0 ? (
            <div className='mt-5'>
              <EmptyState
                icon={CalendarDays}
                title='No upcoming classes'
                description='Classes for this course will show up here as soon as your professor schedules one.'
              />
            </div>
          ) : (
            <ul className='card-surface mt-5 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
              {sessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className='flex items-center gap-2 text-lg font-semibold'>
            <ClipboardList className='size-5 text-foreground/50' aria-hidden='true' />
            Coursework
          </h2>
          {tasks.length === 0 ? (
            <div className='mt-5'>
              <EmptyState
                icon={ClipboardList}
                title='No coursework yet'
                description='Tasks with due dates your professor plans for this course will appear here.'
              />
            </div>
          ) : (
            <ul className='card-surface mt-5 divide-y divide-ec-sky rounded-3xl px-6 dark:divide-ec-canvas-deep'>
              {tasks.map((task) => (
                <li key={task.id} className='py-4'>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className='flex items-center gap-2 text-lg font-semibold'>
            <Files className='size-5 text-foreground/50' aria-hidden='true' />
            Materials &amp; remarks
          </h2>
          {materials.length === 0 ? (
            <div className='mt-5'>
              <EmptyState
                icon={FolderOpen}
                title='Nothing posted yet'
                description='Notes, remarks and links from your professor will appear here.'
              />
            </div>
          ) : (
            <div className='card-surface mt-5 rounded-3xl px-6 py-5'>
              <MaterialFeed materials={materials} />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
