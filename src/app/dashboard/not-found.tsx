import Link from 'next/link';
import { Compass } from 'lucide-react';

/**
 * Dashboard 404 (Stage 4 — the first not-found.tsx in the repo). Catches
 * notFound() from the course-detail pages and unmatched /dashboard/* URLs.
 * Standalone and branded: the role shell may not wrap it (a not-found at the
 * group root replaces the role subtrees below), so it centres itself and
 * sends signed-in users back through the /dashboard role dispatch in proxy.ts.
 */
export default function DashboardNotFound() {
  return (
    <div className='flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground'>
      <div className='w-full max-w-md'>
        <div className='card-surface rounded-3xl p-8 text-center'>
          <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
            <Compass className='size-6' aria-hidden='true' />
          </div>
          <p className='eyebrow mt-5'>404</p>
          <h1 className='type-display-m mt-2'>That page isn&apos;t here</h1>
          <p className='mt-2 text-sm leading-relaxed text-foreground/70'>
            The link may be old, or the course may not exist (or may not be yours to view) — this
            dashboard never says which.
          </p>
          <Link
            href='/dashboard'
            className='mt-6 inline-flex rounded-xl bg-ec-indigo px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ec-indigo/90 dark:bg-white dark:text-ec-indigo'
          >
            Back to your dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
