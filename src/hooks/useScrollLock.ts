'use client';

import { useEffect } from 'react';

/**
 * Centralized body scroll lock (plan §68 — consolidates the duplicated
 * scroll management that lived in the Navbar and EnquiryModalContext).
 * Reference-counted so multiple lockers (mobile menu + modal) compose
 * safely: scroll unlocks only when the last one releases.
 */
let lockCount = 0;

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = '';
      }
    };
  }, [locked]);
}
