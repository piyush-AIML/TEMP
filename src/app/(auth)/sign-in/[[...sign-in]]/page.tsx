import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign in — Educraft Dashboard',
};

/**
 * Clerk sign-in (Dashboard Stage 0-C). Sign-ups are invite-only (accounts are
 * created in the Clerk dashboard), so there is no sign-up route — test users
 * are created there with their publicMetadata.role set.
 */
export default function SignInPage() {
  return (
    <SignIn
      routing='path'
      path='/sign-in'
      fallbackRedirectUrl='/dashboard'
      appearance={{
        elements: {
          card: 'shadow-none rounded-3xl border border-ec-sky dark:border-ec-canvas-deep',
        },
      }}
    />
  );
}
