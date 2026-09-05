import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen, CalendarDays, ClipboardList, Files, Settings2, Trash2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { getAdminCourseDetail } from '@/lib/dashboard/admin';
import { formatShortDate } from '@/lib/dashboard/format';
import { getPillarAccentForVertical } from '@/components/dashboard/coursePillar';
import { CourseDetailsForm } from '@/components/dashboard/CourseDetailsForm';
import { ProfessorManager } from '@/components/dashboard/ProfessorManager';
import { DeleteCourseZone } from '@/components/dashboard/DeleteCourseZone';

/**
 * Admin course manage page (course-allocation rework 2026-09-05) — the
 * post-creation surface that did not exist before: edit the course identity,
 * assign / remove professors, and delete the course (typed-code gated). The
 * cache() wrapper shares one lookup between generateMetadata and the page;
 * null → the dashboard 404 (never "which course").
 */
const getCourseDetail = cache(async (courseId: string) => getAdminCourseDetail(courseId));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const detail = await getCourseDetail(courseId);
  return { title: detail ? `${detail.code} — ${detail.title}` : 'Course not found' };
}

export default async function AdminCourseManagePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  await getCurrentUser(); // layout already gates role; cheap + cached per request

  const detail = await getCourseDetail(courseId);
  if (!detail) notFound();
  const accent = getPillarAccentForVertical(detail.vertical);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <Link
        href='/dashboard/admin/courses'
        className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/60 transition-colors duration-150 hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        All courses
      </Link>

      <div className='mt-6 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className={cn('eyebrow', accent ? accent.text : 'text-ec-indigo dark:text-white')}>
            {accent ? accent.name : 'Programme'}
          </p>
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
            <h1 className='type-display-m'>{detail.title}</h1>
            <span className='rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
              {detail.code}
            </span>
          </div>
          <p className='mt-2 text-sm text-foreground/60'>Created {formatShortDate(detail.createdAt)}</p>
        </div>
      </div>

      <div className='mt-8 grid gap-5 sm:grid-cols-3'>
        <FactTile icon={UserRound} label='Professors' value={detail.professors.length} />
        <FactTile icon={BookOpen} label='Enrolled students' value={detail.activeStudents} />
        <FactTile icon={CalendarDays} label='Classes scheduled' value={detail.sessions} />
        <FactTile icon={Files} label='Materials posted' value={detail.materials} />
        <FactTile icon={ClipboardList} label='Coursework tasks' value={detail.tasks} />
      </div>

      <section className='mt-10'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <Settings2 className='size-5 text-foreground/50' aria-hidden='true' />
          Course details
        </h2>
        <p className='mt-1 text-sm text-foreground/60'>
          The code, title, vertical and description — students and professors see these exactly as saved.
        </p>
        <div className='card-surface mt-4 max-w-2xl rounded-3xl p-5 sm:p-6'>
          <CourseDetailsForm
            course={{
              id: detail.id,
              code: detail.code,
              title: detail.title,
              vertical: detail.vertical,
              description: detail.description,
            }}
          />
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <UserRound className='size-5 text-foreground/50' aria-hidden='true' />
          Professors
        </h2>
        <p className='mt-1 max-w-2xl text-sm text-foreground/60'>
          Every professor assigned here can schedule classes, post materials, plan coursework and enrol
          students. Removing a professor does not remove them from Educraft — only from this course.
        </p>
        <div className='mt-4'>
          <ProfessorManager courseId={detail.id} professors={detail.professors} />
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <Trash2 className='size-5 text-foreground/50' aria-hidden='true' />
          Remove this course
        </h2>
        <div className='mt-4 max-w-3xl'>
          <DeleteCourseZone course={{ id: detail.id, code: detail.code, title: detail.title }} />
        </div>
      </section>
    </section>
  );
}

function FactTile({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
  return (
    <div className='card-surface rounded-3xl p-5'>
      <div className='flex items-center gap-2.5'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          <Icon className='size-4.5' aria-hidden='true' />
        </span>
        <p className='font-display text-2xl font-bold tracking-tight'>{value}</p>
      </div>
      <p className='mt-2 text-sm font-medium text-foreground/60'>{label}</p>
    </div>
  );
}
