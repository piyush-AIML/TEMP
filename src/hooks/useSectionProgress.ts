'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver-based section tracking: reports whether the section
 * is in view and how much of it is visible. Used for nav section highlighting
 * and scene activation (plan §25, §35 — render 3D only when visible).
 */
export function useSectionProgress<T extends HTMLElement>(steps: number = 10) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const thresholds: number[] = [];
    for (let i = 0; i <= steps; i++) thresholds.push(i / steps);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
          setRatio(entry.intersectionRatio);
        }
      },
      { threshold: thresholds }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [steps]);

  return { ref, inView, ratio };
}
