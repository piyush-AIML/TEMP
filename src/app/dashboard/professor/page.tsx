import type { Metadata } from 'next';
import { BookOpen, CalendarDays, CalendarClock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Overview' };

/**
 * Professor overview (Stage 0 shell — real data lands in Stages 2–3). Honest
 * cards: they say what arrives and when, no invented numbers.
 */
export default async function ProfessorOverviewPage() {
  const session = await getCurrentUser();
  const firstName = session.name.split(' ')[0];

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <p className='eyebrow'>Professor dashboard</p>
      <h1 className='type-display-m mt-3'>Welcome back, {firstName}.</h1>
      <p className='mt-3 max-w-2xl text-foreground/70'>
        This overview will aggregate your courses, upcoming classes and meetings.
        Each screen below arrives with its owning implementation stage.
      </p>

      <div className='mt-10 grid gap-5 sm:grid-cols-2'>
        <OverviewCard
          href='/dashboard/professor/courses'
          icon={BookOpen}
          title='My Courses'
          stage='Stage 2'
          copy='Course roster, class scheduling and the materials/remarks composer for each course you teach.'
        />
        <OverviewCard
          href='/dashboard/professor/schedule'
          icon={CalendarDays}
          title='Schedule'
          stage='Stage 2'
          copy='Every class across your courses — create, move or cancel, and students see it immediately.'
        />
        <OverviewCard
          href='/dashboard/professor/meetings'
          icon={CalendarClock}
          title='Meetings'
          stage='Stage 3'
          copy='One-on-ones with students or parents, plus the coursework planner and completion monitor.'
        />
      </div>
    </section>
  );
}

function OverviewCard({
  href,
  icon: Icon,
  title,
  stage,
  copy,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  stage: string;
  copy: string;
}) {
  return (
    <Link
      href={href}
      className='card-surface group flex flex-col gap-4 rounded-3xl p-6 transition-all duration-150 hover:-translate-y-0.5'
    >
      <div className='flex items-center justify-between'>
        <div className='flex size-11 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          <Icon className='size-5' aria-hidden='true' />
        </div>
        <span className='rounded-full bg-ec-sky/70 px-3 py-1 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {stage}
        </span>
      </div>
      <div>
        <p className='flex items-center gap-1.5 font-semibold'>
          {title}
          <ArrowRight className='size-4 transition-transform duration-150 group-hover:translate-x-0.5' aria-hidden='true' />
        </p>
        <p className='mt-1.5 text-sm leading-relaxed text-foreground/70'>{copy}</p>
      </div>
    </Link>
  );
}
