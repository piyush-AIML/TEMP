'use client';

import Link from 'next/link';
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'solid';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Shared button styling (plan §24) — token-driven, with a consistent
 * micro-interaction language: tiny lift on hover, icon movement via
 * `group-hover` classes on children, clear press state.
 */
export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-[family-name:var(--font-manrope)] font-semibold rounded-2xl cursor-pointer transition-all duration-150 ease-out-soft ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-indigo dark:focus-visible:outline-ec-teal ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-ec-gold text-ec-indigo-dark hover:bg-ec-gold-dark shadow-[0_4px_20px_rgba(244,185,66,0.3)] hover:shadow-[0_8px_28px_rgba(244,185,66,0.4)]',
    secondary:
      'border-2 border-ec-teal text-ec-teal-dark dark:text-ec-teal hover:bg-ec-teal hover:text-white hover:border-ec-teal',
    ghost:
      'text-ec-teal-dark dark:text-ec-teal hover:bg-ec-sky dark:hover:bg-ec-canvas-deep',
    solid:
      'bg-ec-indigo text-white hover:bg-ec-indigo-light shadow-[0_4px_20px_rgba(30,42,120,0.25)]',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className='w-4 h-4 animate-spin' aria-hidden='true' />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

/** Anchor styled as a button — for CTAs that navigate (plan §38). */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <a className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </a>
  );
}

/** Next.js Link styled as a button — for internal route CTAs. */
export function ButtonNextLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonVariants({ variant, size, className })}>
      {children}
    </Link>
  );
}

export default Button;
