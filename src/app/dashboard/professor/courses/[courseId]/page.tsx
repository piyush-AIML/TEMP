import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Files,
  LayoutDashboard,
  Plus,
  ClipboardList,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import {
  getProfessorCourseWithAccess,
  getProfessorCourseSessions,
  getCourseRoster,
} from '@/lib/dashboard/professor';
import { getCourseMaterials } from '@/lib/dashboard/materials';
import { getCourseCompletion, getCourseTasks } from '@/lib/dashboard/tasks';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { CourseTabs } from '@/components/dashboard/CourseTabs';
import { RosterTable } from '@/components/dashboard/RosterTable';
import { SessionsManager } from '@/components/dashboard/SessionsManager';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { MaterialComposer } from '@/components/dashboard/MaterialComposer';
import { MaterialFeed } from '@/components/dashboard/student/MaterialFeed';
import { SessionForm } from '@/components/dashboard/SessionForm';
import { TaskForm } from '@/components/dashboard/TaskForm';
import { TaskBoard } from '@/components/dashboard/TaskBoard';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { CompletionMonitor } from '@/components/dashboard/CompletionMonitor';
import { EnrollStudentForm } from '@/components/dashboard/EnrollStudentForm';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * Professor course management page (Stage 2, Planner tab Stage 3):
 * Overview / Roster / Sessions / Materials / Planner tabs. The cache()
 * wrapper shares one ownership-checked lookup between generateMetadata and
 * the page; every panel is server-rendered once and CourseTabs only switches
 * visibility client-side.
 */
const getCourseAccess = cache(async (userId: string, courseId: string) =>
  getProfessorCourseWithAccess(userId, courseId)
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

export default async function ProfessorCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getCurrentUser();

  const access = await getCourseAccess(session.userId, courseId);
  if (!access) notFound();
  const { course } = access;

  const [sessions, roster, materials, tasks, completion] = await Promise.all([
    getProfessorCourseSessions(session.userId, courseId, { limit: 60 }),
    getCourseRoster(session.userId, courseId),
    getCourseMaterials(courseId),
    getCourseTasks(session.userId, courseId),
    getCourseCompletion(session.userId, courseId),
  ]);

  const accent = getPillarAccentForVertical(course.vertical);
  const professors = course.professorNames.join(', ');
  const upcomingCount = sessions.filter((s) => s.status === 'SCHEDULED' && s.startsAt > new Date().toISOString()).length;

  // Server-rendered display rows keyed by session id (RSC payloads — the
  // client SessionsManager toggles edit/cancel around them).
  const sessionNodes: Record<string, React.ReactNode> = {};
  for (const session of sessions) {
    const statusLabel =
      session.status === 'CANCELLED'
        ? 'Cancelled'
        : session.status === 'DONE'
          ? 'Completed'
          : session.startsAt < new Date().toISOString()
            ? 'Happened earlier'
            : null;
    sessionNodes[session.id] = (
      <div>
        {statusLabel && (
          <span className='mb-1 mt-3 inline-block rounded-full bg-ec-sky/70 px-2.5 py-0.5 text-[11px] font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            {statusLabel}
          </span>
        )}
        <SessionItem session={session} />
      </div>
    );
  }

  // Server-rendered task content keyed by task id — the client TaskBoard
  // groups them into columns and adds the status/edit/delete actions.
  const taskNodes: Record<string, React.ReactNode> = {};
  for (const task of tasks) {
    taskNodes[task.id] = <TaskItem task={task} />;
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      panel: (
        <div className='space-y-6'>
          <div className='grid gap-5 sm:grid-cols-3'>
            <FactTile label='Enrolled students' value={course.activeStudents} />
            <FactTile label='Upcoming classes' value={upcomingCount} />
            <FactTile label='Materials posted' value={course.materials} />
          </div>
          <div className='card-surface rounded-3xl p-6'>
            <h2 className='font-semibold'>About this course</h2>
            <p className='mt-2 text-sm leading-relaxed text-foreground/70'>
              {course.description ?? 'No description added yet.'}
            </p>
            <p className='mt-4 text-sm text-foreground/60'>Taught by {professors}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'roster',
      label: 'Roster',
      panel: (
        <div className='space-y-8'>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Plus className='size-5 text-foreground/50' aria-hidden='true' />
              Enroll a student
            </h2>
            <p className='mt-1 text-sm text-foreground/60'>
              Enrolment is by account email — the student must have signed in to Educraft once.
            </p>
            <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5'>
              <EnrollStudentForm courseId={courseId} />
            </div>
          </section>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Users className='size-5 text-foreground/50' aria-hidden='true' />
              Enrolled students
            </h2>
            <div className='mt-4'>
              <RosterTable roster={roster} />
            </div>
          </section>
        </div>
      ),
    },
    {
      id: 'sessions',
      label: 'Sessions',
      panel: (
        <div className='space-y-8'>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Plus className='size-5 text-foreground/50' aria-hidden='true' />
              Schedule a class
            </h2>
            <div className='card-surface mt-4 rounded-3xl p-5 sm:p-6'>
              <SessionForm courseId={courseId} />
            </div>
          </section>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <CalendarDays className='size-5 text-foreground/50' aria-hidden='true' />
              All classes
            </h2>
            <div className='card-surface mt-4 rounded-3xl px-6'>
              <SessionsManager sessions={sessions} sessionNodes={sessionNodes} />
            </div>
          </section>
        </div>
      ),
    },
    {
      id: 'materials',
      label: 'Materials & remarks',
      panel: (
        <div className='space-y-8'>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Plus className='size-5 text-foreground/50' aria-hidden='true' />
              Post to the course
            </h2>
            <div className='mt-4'>
              <MaterialComposer courseId={courseId} />
            </div>
          </section>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Files className='size-5 text-foreground/50' aria-hidden='true' />
              Everything posted
            </h2>
            {materials.length === 0 ? (
              <div className='mt-4'>
                <EmptyState
                  icon={Files}
                  title='Nothing posted yet'
                  description='Notes, remarks, links and files you share with students will be listed here.'
                />
              </div>
            ) : (
              <div className='card-surface mt-4 rounded-3xl px-6 py-5'>
                <MaterialFeed materials={materials} />
              </div>
            )}
          </section>
        </div>
      ),
    },
    {
      id: 'planner',
      label: 'Planner',
      panel: (
        <div className='space-y-8'>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <Plus className='size-5 text-foreground/50' aria-hidden='true' />
              Add a task
            </h2>
            <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5 sm:p-6'>
              <TaskForm courseId={courseId} />
            </div>
          </section>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <ListChecks className='size-5 text-foreground/50' aria-hidden='true' />
              Completion
            </h2>
            <div className='card-surface mt-4 rounded-3xl p-5 sm:p-6'>
              <CompletionMonitor completion={completion} />
            </div>
          </section>
          <section>
            <h2 className='flex items-center gap-2 text-lg font-semibold'>
              <ClipboardList className='size-5 text-foreground/50' aria-hidden='true' />
              Task board
            </h2>
            {tasks.length === 0 ? (
              <div className='mt-4'>
                <EmptyState
                  icon={ClipboardList}
                  title='No tasks yet'
                  description='Tasks you plan for this course will appear here — the whole class works the same plan.'
                />
              </div>
            ) : (
              <div className='card-surface mt-4 rounded-3xl p-4 sm:p-5'>
                <TaskBoard courseId={courseId} tasks={tasks} taskNodes={taskNodes} />
              </div>
            )}
          </section>
        </div>
      ),
    },
  ];

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <Link
        href='/dashboard/professor/courses'
        className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        All courses
      </Link>

      <div className='mt-6 flex flex-wrap items-start justify-between gap-4'>
        <div>
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
        </div>
        <span className="hidden items-center gap-2 rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo sm:inline-flex dark:bg-ec-canvas-deep dark:text-white">
          <Users className='size-3.5' aria-hidden='true' />
          {course.activeStudents} enrolled
        </span>
      </div>

      <div className='mt-8'>
        <CourseTabs tabs={tabs} />
      </div>
    </section>
  );
}

function FactTile({ label, value }: { label: string; value: number }) {
  return (
    <div className='card-surface rounded-3xl p-5'>
      <p className='font-display text-3xl font-bold tracking-tight text-foreground'>{value}</p>
      <p className='mt-1 text-sm font-medium text-foreground/60'>{label}</p>
    </div>
  );
}
