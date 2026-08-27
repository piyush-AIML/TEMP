import { cn } from '@/lib/utils';

interface StatProps {
  value: string;
  label: string;
  /** Optional supporting line. */
  sub?: string;
  /** Accent class for the value, e.g. text-ec-teal. */
  accentClassName?: string;
  className?: string;
}

/**
 * Display stat (plan §21 — impact/outcomes). Only real, verifiable values
 * should be passed; qualitative labels are used where numbers do not exist.
 */
export default function Stat({ value, label, sub, accentClassName, className }: StatProps) {
  return (
    <div className={cn('text-center', className)}>
      <div
        className={cn(
          'font-[family-name:var(--font-sora)] font-bold type-display-m text-ec-indigo dark:text-white',
          accentClassName
        )}
      >
        {value}
      </div>
      <div className='mt-1 type-body-s font-medium text-ec-ink dark:text-ec-ink'>{label}</div>
      {sub && <div className='mt-0.5 type-caption text-ec-slate'>{sub}</div>}
    </div>
  );
}
