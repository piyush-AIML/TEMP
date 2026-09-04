import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { INVITE_ROLES_BY_INVITER } from '@/lib/validators/auth';
import { InviteUserForm } from '@/components/dashboard/InviteUserForm';

export const metadata: Metadata = { title: 'Invite' };

/** Admin invite (2026-09-05) — admins may invite professors and students; the
 *  role policy lives in INVITE_ROLES_BY_INVITER and the server action
 *  re-checks it. */
export default async function AdminInvitePage() {
  await getCurrentUser(); // layout already gates role; cheap + cached per request
  return (
    <section className='mx-auto w-full max-w-5xl'>
      <div className='max-w-2xl'>
        <p className='eyebrow'>Invitations</p>
        <h1 className='type-display-m mt-3'>Invite someone to Educraft</h1>
        <p className='mt-3 text-foreground/70'>
          Send an email invitation and pick the role — professor or student. When they accept, their role is set
          automatically and they can sign in right away.
        </p>
      </div>

      <section className='card-surface mt-8 max-w-2xl rounded-3xl p-5 sm:p-6'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <UserPlus className='size-5 text-foreground/50' aria-hidden='true' />
          New invitation
        </h2>
        <div className='mt-4'>
          <InviteUserForm allowedRoles={INVITE_ROLES_BY_INVITER.admin} />
        </div>
      </section>
    </section>
  );
}
