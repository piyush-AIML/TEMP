import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { INVITE_ROLES_BY_INVITER } from '@/lib/validators/auth';
import { InviteUserForm } from '@/components/dashboard/InviteUserForm';

export const metadata: Metadata = { title: 'Invite a student' };

/** Professor invite (2026-09-05) — professors invite only students; the role
 *  policy lives in INVITE_ROLES_BY_INVITER and the server action re-checks it. */
export default async function ProfessorInvitePage() {
  await getCurrentUser(); // layout already gates role; cheap + cached per request
  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Invitations</p>
        <h1 className='type-display-m mt-3'>Invite a student</h1>
        <p className='mt-3 text-foreground/70'>
          Send an email invitation to join Educraft as a student. Once they accept, they can sign in and see the
          courses they are enrolled in.
        </p>
      </div>

      <section className='card-surface mt-8 max-w-2xl rounded-3xl p-5 sm:p-6'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <UserPlus className='size-5 text-foreground/50' aria-hidden='true' />
          New invitation
        </h2>
        <div className='mt-4'>
          <InviteUserForm allowedRoles={INVITE_ROLES_BY_INVITER.professor} />
        </div>
      </section>
    </section>
  );
}
