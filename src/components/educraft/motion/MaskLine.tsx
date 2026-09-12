'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { bezierControlPoints } from '@/lib/gsap';
import { motion as motionTokens } from '@/design/motion';
import { cn } from '@/lib/utils';

export type MaskLineProps = {
  children: ReactNode;
  /** Seconds to hold before this line rises. Spec §4: 80ms per line. */
  delay?: number;
  className?: string;
};

/**
 * One line of a mask reveal: the line translates up inside an `overflow-hidden`
 * box, so it appears to be uncovered rather than to slide in.
 *
 * **Motion owns this property** (`transform` on the inner span) and GSAP never
 * touches it (spec §3.2). The copy block around it — whose `y` and `opacity`
 * GSAP does own, during the pin — is a different element, which is what keeps
 * the rule satisfiable.
 *
 * The easing is the token, not an approximation: `bezierControlPoints` parses
 * `motion.easing.out` into the four numbers Motion wants, so the mask and the
 * strand are eased by the same curve. That parser is GSAP-adjacent but pure,
 * and `gsap.test.ts` already pins it against the tokens.
 *
 * Under reduced motion the line renders in its final position with no
 * transition — the same words, in the same order, already arrived (§9).
 */
export default function MaskLine({ children, delay = 0, className }: MaskLineProps) {
  const reduced = useReducedMotion();
  return (
    <span className={cn('block overflow-hidden', className)}>
      <motion.span
        className='block'
        initial={reduced ? undefined : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{
          duration: motionTokens.duration.reveal,
          ease: bezierControlPoints(motionTokens.easing.out),
          delay: reduced ? 0 : delay,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
