'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Reports whether a scene container is within the viewport (plus margin).
 * Scenes pass this to CanvasShell so off-screen WebGL rendering pauses
 * (plan §35 — render only when needed).
 */
export function useSceneActive<T extends HTMLElement>(margin = '20%') {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: margin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return { ref, active };
}
