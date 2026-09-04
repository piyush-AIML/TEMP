import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getStudentEnrolledCourses } from '@/lib/dashboard/courses';
import { EnrolledCourseCard } from '@/components/dashboard/student/EnrolledCourseCard';
import { EmptyState } from '@/components/dashboard/EmptyState';

export const metadata: Metadata = { title: 'My Courses' };

/** Stage 1: the student's ACTIVE enrollments, straight from the DB. */
export default async function StudentCoursesPage() {
  const session = await getCurrentUser();
  const courses = await getStudentEnrolledCourses(session.userId);

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>My Courses</p>
        <h1 className='type-display-m mt-3'>Your enrolled courses</h1>
        <p className='mt-3 text-foreground/70'>
          Each course opens its schedule, and the materials and remarks your professors post for it.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className='mt-10'>
          <EmptyState
            icon={BookOpen}
            title='No courses yet'
            description='Courses appear here as soon as your enrolment is active. Enrolments are set up by your teachers.'
          />
        </div>
      ) : (
        <div className='mt-10 grid gap-5 sm:grid-cols-2'>
          {courses.map((course) => (
            <EnrolledCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
