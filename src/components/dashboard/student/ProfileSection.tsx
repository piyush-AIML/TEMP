'use client';

import { UserProfile } from '@clerk/nextjs';

/**
 * Embedded Clerk account portal (Stage 1). Identity is Clerk-owned, so all
 * editing happens here — the DB row is a mirror that refreshes on the next
 * dashboard hit. routing="hash": the default path routing navigates to a
 * /user route that does not exist in this app. Clerk's own theme is used for
 * Stage 1 (visual polish deferred to Stage 4); the wrapper only constrains
 * width and rounds the card into the dashboard's language.
 */
export function ProfileSection() {
  return (
    <UserProfile
      routing='hash'
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'shadow-none rounded-3xl border border-ec-sky dark:border-ec-canvas-deep',
        },
      }}
    />
  );
}
