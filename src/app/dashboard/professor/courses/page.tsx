import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getProfessorCourses } from '@/lib/dashboard/professor';
import { ProfessorCourseCard } from '@/components/dashboard/ProfessorCourseCard';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'My Courses' };

/** Professor's teaching load (Stage 2) — real DB counts per course. */
export default async function ProfessorCoursesPage() {
  const session = await getCurrentUser();
  const courses = await getProfessorCourses(session.userId);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>My Courses</p>
        <h1 className='type-display-m mt-3'>Courses you teach</h1>
        <p className='mt-3 text-foreground/70'>
          Open a course to manage its roster, schedule classes, and post materials and remarks.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className='mt-10'>
          <EmptyState
            icon={BookOpen}
            title='No courses assigned yet'
            description='Courses you teach will appear here once you are linked to them.'
          />
        </div>
      ) : (
        <div className='mt-10 grid gap-5 sm:grid-cols-2'>
          {courses.map((course) => (
            <ProfessorCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
