'use client';

import { createElement, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { motion } from '@/design/motion';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Stagger delay in ms — set the nth item's delay for cascading entrances. */
  delay?: number;
  /** Initial translation distance in px. */
  distance?: number;
  direction?: Direction;
  /** Overrides the default 700ms reveal duration (ms). */
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

const initialTransform = (direction: Direction, distance: number): string => {
  switch (direction) {
    case 'down':
      return `translateY(${-distance}px)`;
    case 'left':
      return `translateX(${distance}px)`;
    case 'right':
      return `translateX(${-distance}px)`;
    case 'scale':
      return `scale(0.96)`;
    case 'none':
      return 'none';
    case 'up':
    default:
      return `translateY(${distance}px)`;
  }
};

/**
 * Declarative reveal wrapper (plan §25 layer 1) — opacity + small translation
 * with the baseline ease-out-soft curve. Falls back to instantly visible
 * under reduced motion. `createElement` keeps the polymorphic `as` prop
 * type-safe.
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  distance = 16,
  direction = 'up',
  duration = Math.round(motion.duration.reveal * 1000),
  threshold,
  once = true,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLElement>({ threshold, once });

  const mergedStyle: CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : initialTransform(direction, distance),
    transition: `opacity ${duration}ms ${motion.easing.out}, transform ${duration}ms ${motion.easing.out}`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
    ...style,
  };

  // Cast is standard practice for polymorphic components — the props are
  // HTMLAttributes<HTMLElement> by contract, whatever element Tag resolves to.
  return createElement(
    Tag,
    { ref, className: cn(className), style: mergedStyle, ...rest } as HTMLAttributes<HTMLElement> & {
      ref: React.Ref<HTMLElement>;
    },
    children
  );
}
