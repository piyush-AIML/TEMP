'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setRevealed(true);
        }
      });
    },
    []
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(callback, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, threshold]);

  return { ref, revealed };
}
