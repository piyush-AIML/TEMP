'use client';

import { useReveal } from '@/hooks/useReveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtext?: string;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, subtext, className = '' }: SectionHeadingProps) {
  const { ref, revealed } = useReveal();

  return (
    <div
      ref={ref}
      className={`text-center max-w-3xl mx-auto mb-12 md:mb-16 ${className} reveal-on-scroll ${revealed ? 'revealed' : ''}`}
    >
      <span className='inline-block font-[family-name:var(--font-manrope)] font-semibold uppercase text-ec-teal text-xs tracking-[0.08em] mb-3'>
        {eyebrow}
      </span>
      <h2
        className='font-[family-name:var(--font-sora)] font-bold text-ec-indigo dark:text-white leading-tight'
        style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
      >
        {title}
      </h2>
      {subtext && (
        <p className='mt-4 text-ec-slate text-base md:text-lg leading-relaxed max-w-2xl mx-auto'>
          {subtext}
        </p>
      )}
    </div>
  );
}
