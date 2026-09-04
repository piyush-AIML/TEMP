import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getProfileRecord } from '@/lib/dashboard/profile';
import { formatFullDate } from '@/lib/dashboard/format';
import { ProfileSection } from '@/components/dashboard/student/ProfileSection';

export const metadata: Metadata = { title: 'Profile' };

/**
 * Stage 1 profile: a view mirror of the Clerk identity (name/email/photo) with
 * honest labels — the DB row's createdAt is the first dashboard visit, not
 * account signup — plus the embedded Clerk portal for actual edits. Clerk is
 * the single source of truth; the mirror refreshes on the next dashboard hit.
 */
export default async function StudentProfilePage() {
  const session = await getCurrentUser();
  const record = await getProfileRecord(session.userId);
  const initials = session.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Profile</p>
        <h1 className='type-display-m mt-3'>Your account</h1>
        <p className='mt-3 text-foreground/70'>
          Your name, email and photo are managed in Educraft&apos;s account portal — changes there reflect here on
          your next visit.
        </p>
      </div>

      <div className='mt-10 grid items-start gap-6 lg:grid-cols-2'>
        <div className='card-surface rounded-3xl p-6 sm:p-8'>
          <div className='flex items-center gap-4'>
            <div className='flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ec-sky text-lg font-bold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
              {session.imageUrl ? (
                // Clerk-hosted avatar URL (remote, not a local asset) — plain img is intended
                <img src={session.imageUrl} alt='' className='size-full object-cover' />
              ) : (
                <span aria-hidden='true'>{initials}</span>
              )}
            </div>
            <div className='min-w-0'>
              <p className='truncate font-semibold'>{session.name}</p>
              <p className='truncate text-sm text-foreground/60'>{session.email}</p>
              <span className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-ec-sky/70 px-3 py-0.5 text-xs font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                <UserRound className='size-3.5' aria-hidden='true' />
                Student
              </span>
            </div>
          </div>

          <dl className='mt-8 space-y-4 border-t border-ec-sky pt-6 text-sm dark:border-ec-canvas-deep'>
            <div className='flex items-start justify-between gap-6'>
              <dt className='font-medium text-foreground/60'>Dashboard member since</dt>
              <dd className='text-right'>{record ? formatFullDate(record.createdAt) : '—'}</dd>
            </div>
          </dl>
        </div>

        <ProfileSection />
      </div>
    </section>
  );
}
