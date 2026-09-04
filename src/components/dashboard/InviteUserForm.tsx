'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { LoaderCircle, Send } from 'lucide-react';
import { createInvitation } from '@/lib/actions/invitations';
import type { ActionResult } from '@/lib/actions/types';
import type { DashboardRole } from '@/lib/validators/auth';
import { cn } from '@/lib/utils';

/**
 * Invite-user form (2026-09-05). Renders only the roles the signed-in user is
 * allowed to hand out (server page passes `allowedRoles` from
 * INVITE_ROLES_BY_INVITER — professor page: [student]; admin page:
 * [professor, student]). The server action re-validates the role anyway.
 * Accepting the invitation copies the role into the new user's Clerk
 * publicMetadata — no other onboarding step needed.
 */

const ROLE_COPY: Record<string, { label: string; description: string }> = {
  professor: {
    label: 'Professor',
    description: 'Creates and manages courses, classes and materials.',
  },
  student: {
    label: 'Student',
    description: 'Joins enrolled courses and sees posted materials.',
  },
};

export function InviteUserForm({ allowedRoles }: { allowedRoles: readonly DashboardRole[] }) {
  const [state, formAction] = useActionState(createInvitation, { ok: true } as ActionResult);
  // One allowed role → fixed; more than one → selectable cards.
  const [selectedRole, setSelectedRole] = useState<DashboardRole>(allowedRoles[0]);

  const errors = state.ok ? {} : (state.fieldErrors ?? {});
  const roleError = errors['role'];

  return (
    <form action={formAction} className='space-y-5'>
      {allowedRoles.length === 1 && <input type='hidden' name='role' value={allowedRoles[0]} />}

      {allowedRoles.length > 1 && (
        <fieldset>
          <legend className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
            Invite as
          </legend>
          <div className='grid gap-3 sm:grid-cols-2'>
            {allowedRoles.map((role) => {
              const copy = ROLE_COPY[role];
              const selected = selectedRole === role;
              return (
                <label
                  key={role}
                  className={cn(
                    'block cursor-pointer rounded-2xl border p-4 transition-colors duration-150',
                    selected
                      ? 'border-ec-indigo bg-ec-sky/60 dark:border-white/40 dark:bg-ec-canvas-deep'
                      : 'border-ec-sky hover:border-ec-indigo/60 dark:border-ec-canvas-deep dark:hover:border-white/30'
                  )}
                >
                  <input
                    type='radio'
                    name='role'
                    value={role}
                    checked={selected}
                    onChange={() => setSelectedRole(role)}
                    className='sr-only'
                  />
                  <span className='block text-sm font-semibold'>{copy?.label ?? role}</span>
                  <span className='mt-1 block text-xs text-foreground/60'>{copy?.description}</span>
                </label>
              );
            })}
          </div>
          {roleError && <p className='mt-2 text-sm text-red-600 dark:text-red-400'>{roleError}</p>}
        </fieldset>
      )}

      <label className='block'>
        <span className='mb-1.5 block text-xs font-semibold uppercase tracking-widest text-foreground/50'>
          Email address
        </span>
        <input
          type='email'
          name='email'
          required
          autoComplete='off'
          maxLength={200}
          placeholder='name@example.com'
          className='w-full rounded-xl border border-ec-sky bg-background px-3.5 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-foreground/40 focus:border-ec-indigo dark:border-ec-canvas-deep dark:focus:border-white/40'
        />
        {errors['email'] && <p className='mt-2 text-sm text-red-600 dark:text-red-400'>{errors['email']}</p>}
      </label>

      {!state.ok && state.formError && (
        <p role='alert' className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'>
          {state.formError}
        </p>
      )}
      {state.ok && state.message && (
        <p className='rounded-2xl bg-ec-sky/70 px-4 py-3 text-sm font-medium text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center gap-2 rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-ec-indigo'
    >
      {pending ? (
        <>
          <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />
          Sending…
        </>
      ) : (
        <Send className='size-4' aria-hidden='true' />
      )}
      Send invitation
    </button>
  );
}
