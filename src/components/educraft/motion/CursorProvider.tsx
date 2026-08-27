'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Desktop cursor enhancement (plan §29) — a subtle ring that follows the
 * pointer and grows over interactive elements, with optional contextual
 * labels via `data-cursor-label`. The native cursor stays visible; this
 * is an accent, not a replacement. Fine pointers only, disabled under
 * reduced motion and on touch devices.
 */
export default function CursorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const position = useRef({ x: -100, y: -100 });
  const hovered = useRef(false);
  const label = useRef('');
  const frame = useRef(0);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduced.matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(tick);
    };

    const onOver = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        'a, button, input, select, textarea, [role="button"], [data-cursor-label]'
      ) as HTMLElement | null;
      hovered.current = !!el;
      label.current = el?.dataset.cursorLabel ?? '';
      applyRing();
    };

    const onLeaveDocument = () => {
      hovered.current = false;
      label.current = '';
      applyRing();
    };

    const tick = () => {
      frame.current = 0;
      position.current.x += (target.current.x - position.current.x) * 0.16;
      position.current.y += (target.current.y - position.current.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
      }
      if (Math.abs(target.current.x - position.current.x) > 0.1 || Math.abs(target.current.y - position.current.y) > 0.1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    const applyRing = () => {
      const ring = ringRef.current;
      if (!ring) return;
      const labelled = label.current.length > 0;
      ring.style.width = labelled ? 'auto' : hovered.current ? '44px' : '26px';
      ring.style.height = labelled ? 'auto' : hovered.current ? '44px' : '26px';
      ring.style.background = labelled ? 'rgba(20, 29, 87, 0.92)' : 'transparent';
      if (labelRef.current) {
        labelRef.current.style.display = labelled ? 'block' : 'none';
        if (labelled) labelRef.current.textContent = label.current;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveDocument);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeaveDocument);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <>
      {children}
      <div
        ref={ringRef}
        aria-hidden='true'
        className='pointer-events-none fixed top-0 left-0 z-[120] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ec-indigo/50 dark:border-white/50 flex items-center justify-center px-4 py-2 transition-[width,height,background] duration-200 ease-out-soft'
        style={{ width: '26px', height: '26px' }}
      >
        <span
          ref={labelRef}
          className='text-white text-xs font-semibold whitespace-nowrap'
          style={{ display: 'none' }}
        />
      </div>
    </>
  );
}
