'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Tracks an element's scroll progress through the viewport.
 * Drives the pinned storytelling sequences (plan §25 layer 3, §27).
 * Uses a rAF-throttled scroll listener — no per-frame React state churn.
 *
 * Modes:
 *  - 'full' (default): 0 = element just enters from the bottom,
 *    1 = fully exited at the top. Suits pinned sections.
 *  - 'visible': 0 = element just enters, 1 = the element's bottom edge
 *    reaches the viewport bottom (fully scrolled through while still
 *    visible). Suits path-draw sequences that must complete on screen.
 */
export function useScrollProgress<T extends HTMLElement>(
  offsetTop = 0,
  mode: 'full' | 'visible' = 'full'
) {
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

      if (mode === 'visible') {
        if (rect.height <= 0) {
          current = 0;
        } else {
          current = clamp01((window.innerHeight - rect.top) / rect.height);
        }
      } else {
        const total = rect.height + window.innerHeight - offsetTop;
        if (total <= 0) {
          current = 0;
        } else {
          const raw = (window.innerHeight - offsetTop - rect.top) / total;
          current = clamp01(raw);
        }
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
  }, [offsetTop, mode, reducedMotion]);

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
