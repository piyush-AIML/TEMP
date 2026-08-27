'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Element-relative parallax (plan §25 layer 2). The element drifts by
 * `speed * distanceFromViewportCenter` pixels — background layers move
 * slower than the page, artwork gains depth. Returns a ref and the
 * translateY style. Disabled under reduced motion.
 */
export function useParallax<T extends HTMLElement>(speed = 0.12, maxShift = 80) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const frame = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setOffset(0);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const update = () => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const delta = elementCenter - viewportCenter;
      const shift = Math.max(-maxShift, Math.min(maxShift, delta * -speed));
      setOffset(shift);
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
  }, [speed, maxShift, reducedMotion]);

  return { ref, offset };
}
