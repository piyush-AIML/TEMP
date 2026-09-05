/**
 * Generic dashboard page skeleton (Stage 4) — the first loading.tsx files in
 * the repo. Rendered inside the role shell while a segment's async pages
 * stream. Deliberately role-agnostic (heading bars + tiles + cards) so one
 * component serves every route; page shapes converge enough that this reads
 * as "the dashboard is loading" rather than mimicking any exact layout.
 */

function Bar({ className }: { className?: string }) {
  return <div className={className ?? 'h-4 rounded-full bg-ec-sky/70 dark:bg-ec-canvas-deep/70'} />;
}

export function DashboardSkeleton({ narrow = false }: { narrow?: boolean }) {
  const container = narrow ? 'mx-auto w-full max-w-3xl' : 'mx-auto w-full max-w-5xl';
  return (
    <section aria-busy='true' aria-label='Loading' className={container}>
      <div className='animate-pulse space-y-4'>
        <Bar className='h-3 w-24 rounded-full bg-ec-sky/70 dark:bg-ec-canvas-deep/70' />
        <Bar className='h-8 w-2/3 rounded-xl bg-ec-sky/70 dark:bg-ec-canvas-deep/70' />
        <Bar className='h-4 w-1/2 rounded-full bg-ec-sky/60 dark:bg-ec-canvas-deep/60' />
      </div>

      <div className='mt-10 animate-pulse space-y-5'>
        <div className='grid gap-5 sm:grid-cols-3'>
          <div className='h-24 rounded-3xl bg-ec-sky/50 dark:bg-ec-canvas-deep/50' />
          <div className='h-24 rounded-3xl bg-ec-sky/50 dark:bg-ec-canvas-deep/50' />
          <div className='h-24 rounded-3xl bg-ec-sky/50 dark:bg-ec-canvas-deep/50' />
        </div>
        <div className='h-44 rounded-3xl bg-ec-sky/40 dark:bg-ec-canvas-deep/40' />
        <div className='h-56 rounded-3xl bg-ec-sky/40 dark:bg-ec-canvas-deep/40' />
      </div>
    </section>
  );
}
