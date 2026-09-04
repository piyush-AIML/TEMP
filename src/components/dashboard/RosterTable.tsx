import { Users } from 'lucide-react';
import type { RosterRowDTO } from '@/lib/dashboard/professor';
import { EmptyState } from '@/components/dashboard/EmptyState';

/**
 * Student roster for one course (Stage 2) — server-rendered table of ACTIVE
 * enrollments. Row-level actions (e.g. unenroll) are deliberately out of v1
 * scope; the roster is informational for professors.
 */
export function RosterTable({ roster }: { roster: RosterRowDTO[] }) {
  if (roster.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title='No enrolled students yet'
        description='When students are enrolled in this course, they will appear here.'
      />
    );
  }

  return (
    <div className='card-surface overflow-hidden rounded-3xl'>
      <table className='w-full text-left text-sm'>
        <caption className='sr-only'>Students enrolled in this course</caption>
        <thead>
          <tr className='border-b border-ec-sky text-xs uppercase tracking-widest text-foreground/50 dark:border-ec-canvas-deep'>
            <th scope='col' className='px-6 py-3.5 font-semibold'>
              Student
            </th>
            <th scope='col' className='hidden px-6 py-3.5 font-semibold sm:table-cell'>
              Email
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
          {roster.map((row) => (
            <tr key={row.studentId}>
              <td className='px-6 py-3.5 font-medium'>{row.name}</td>
              <td className='hidden px-6 py-3.5 text-foreground/60 sm:table-cell'>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
