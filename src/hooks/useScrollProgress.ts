'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Tracks an element's scroll progress through the viewport as 0..1
 * (0 = element just enters from the bottom, 1 = fully exited at the top).
 * Drives the pinned storytelling sequences (plan §25 layer 3, §27).
 * Uses a rAF-throttled scroll listener — no per-frame React state churn.
 */
export function useScrollProgress<T extends HTMLElement>(offsetTop = 0) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let current = 0;

    const update = () => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight - offsetTop;
      if (total <= 0) {
        current = 0;
      } else {
        const raw = (window.innerHeight - offsetTop - rect.top) / total;
        current = Math.min(1, Math.max(0, raw));
      }
      setProgress(current);
    };

    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [offsetTop, reducedMotion]);

  return { ref, progress };
}

/** Clamps a value into [0, 1]. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Maps progress to a range, e.g. progress 0..1 → 20..100. */
export function lerp(progress: number, from: number, to: number): number {
  return from + (to - from) * progress;
}
