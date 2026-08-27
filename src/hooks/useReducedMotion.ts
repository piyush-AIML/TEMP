'use client';

import { useEffect, useState } from 'react';

/**
 * Single source of truth for reduced-motion state (plan §33, §68).
 * Consolidates the duplicated matchMedia logic that previously lived in
 * every 3D scene. SSR-safe: returns false until mounted.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
