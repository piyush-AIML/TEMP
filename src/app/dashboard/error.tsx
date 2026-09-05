'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

/**
 * Dashboard error boundary (Stage 4 — the first error.tsx in the repo).
 * Catches render/query errors below the dashboard layout. Because the role
 * layouts sit below this file, the shell may be gone when this shows, so the
 * UI is standalone and branded. No telemetry exists anywhere yet (§17) — the
 * copy stays honest about what the user can do.
 */
export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground'>
      <div className='w-full max-w-md'>
        <div className='card-surface rounded-3xl p-8 text-center'>
          <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <AlertTriangle className='size-6' aria-hidden='true' />
          </div>
          <h1 className='type-display-m mt-5'>Something went wrong</h1>
          <p className='mt-2 text-sm leading-relaxed text-foreground/70'>
            This part of the dashboard hit an error. Try again — if it keeps happening, refresh the
            page and sign back in.
          </p>
          <div className='mt-6 flex flex-col justify-center gap-2 sm:flex-row'>
            <button
              type='button'
              onClick={reset}
              className='rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 dark:bg-white dark:text-ec-indigo'
            >
              Try again
            </button>
            <Link
              href='/dashboard'
              className='rounded-xl bg-ec-sky/70 px-5 py-2.5 text-sm font-semibold text-ec-indigo transition-colors duration-150 hover:bg-ec-sky dark:bg-ec-canvas-deep dark:text-white'
            >
              Back to your dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
