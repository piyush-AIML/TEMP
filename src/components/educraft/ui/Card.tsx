import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation + border highlight (plan §24 cards). */
  interactive?: boolean;
}

/**
 * Token-driven card surface (plan Stage 1 — card system). Restrained:
 * subtle elevation and border highlight only; internal artwork may move.
 */
export default function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'card-surface',
        interactive &&
          'transition-all duration-150 ease-out-soft hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] hover:border-ec-teal/40',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
