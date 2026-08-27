import { cn } from '@/lib/utils';
import { Constellation, GradientMesh } from '../graphics/DecorativeSystems';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
  /** 'light' (default) or 'indigo' */
  variant?: 'light' | 'indigo';
  align?: 'left' | 'center';
}

/**
 * Shared page hero for interior routes (Stage 3) — consistent opening
 * moment so every page starts from the same visual language.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
  variant = 'light',
  align = 'left',
}: PageHeroProps) {
  const indigo = variant === 'indigo';

  return (
    <header
      className={cn(
        'relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden',
        indigo ? 'bg-ec-indigo' : 'bg-ec-canvas-deep/60 dark:bg-ec-canvas-deep'
      )}
    >
      {indigo ? (
        <>
          <GradientMesh className='opacity-60' colorClassName='text-white' />
          <Constellation className='opacity-40' colorClassName='text-ec-teal-light' />
        </>
      ) : (
        <Constellation className='opacity-60' colorClassName='text-ec-teal' />
      )}
      <div
        className={cn(
          'container-site relative max-w-3xl',
          align === 'center' && 'mx-auto text-center'
        )}
      >
        <span
          className={cn(
            'eyebrow eyebrow-rule mb-4',
            align === 'center' && 'justify-center',
            indigo ? 'text-ec-gold' : 'text-ec-teal'
          )}
        >
          {eyebrow}
        </span>
        <h1 className={cn('type-display-l text-balance', indigo ? 'text-white' : 'text-ec-indigo dark:text-white')}>
          {title}
        </h1>
        {lead && (
          <p
            className={cn(
              'type-body-l mt-5 text-pretty',
              indigo ? 'text-white/70' : 'text-ec-slate'
            )}
          >
            {lead}
          </p>
        )}
        {children && <div className='mt-8'>{children}</div>}
      </div>
    </header>
  );
}
