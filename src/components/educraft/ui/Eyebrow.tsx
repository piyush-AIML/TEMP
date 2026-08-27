import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: React.ReactNode;
  /** Shows the leading rule line (default true). */
  rule?: boolean;
  className?: string;
}

/**
 * Micro-label: all-caps, letter-spaced, restrained (plan §6.3 — all-caps
 * only for micro-labels). Colour via className (text-ec-teal etc.).
 */
export default function Eyebrow({ children, rule = true, className }: EyebrowProps) {
  return (
    <span className={cn('eyebrow', rule && 'eyebrow-rule', className)}>{children}</span>
  );
}
