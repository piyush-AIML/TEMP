'use client';

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type PointerEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { buttonVariants, type ButtonSize, type ButtonVariant } from '../ui/Button';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Max translation in px. */
  strength?: number;
}

/**
 * Magnetic CTA (plan §29 — "over CTA: subtle magnetic pull").
 * Desktop-pointer only, disabled under reduced motion and on touch
 * devices; critical forms never use this effect (plan §24).
 */
export default function MagneticButton({
  variant = 'primary',
  size = 'lg',
  strength = 8,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  // Enable only on fine pointers (mouse/trackpad), never touch.
  useEffect(() => {
    if (reducedMotion) return;
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
  }, [reducedMotion]);

  const handleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const factor = strength / 44; // strength 8 → gentle 0.18 pull
    const clamp = (v: number) => Math.max(-strength, Math.min(strength, v));
    ref.current.style.transform = `translate(${clamp(dx * factor)}px, ${clamp(dy * factor)}px)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      style={{
        transition: enabled
          ? 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)'
          : undefined,
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </button>
  );
}
