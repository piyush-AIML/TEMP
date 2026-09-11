'use client';

import Link from 'next/link';
import { Quote } from 'lucide-react';
import { testimonials } from '@/data/testimonials';
import { programmes } from '@/data/programmes';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';
import { useParallax } from '@/hooks/useParallax';

/**
 * Testimonials (plan §20) — editorial, not carousel-like: one large
 * primary quote with context, supported by quieter secondary quotes.
 * No autoplay, no pagination dots.
 */
export default function TestimonialsSection() {
  const [primary, ...supporting] = testimonials;
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>(0.06, 30);

  const primaryProgramme = primary?.programmeSlug
    ? programmes.find((p) => p.slug === primary.programmeSlug)
    : undefined;

  return (
    <section className='relative py-20 md:py-28 bg-background border-t border-ec-border/60 overflow-hidden'>
      <div className='container-site'>
        <SectionHeading
          eyebrow='Voices'
          title='What families say'
          subtext='Real experiences from students and parents across the ecosystem.'
          align='left'
        />

        <div className='grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16'>
          {/* Primary quote */}
          {primary && (
            <div ref={parallaxRef}>
              <Reveal direction='scale'>
                <figure className='relative card-surface p-9 md:p-12'>
                  <Quote className='w-10 h-10 text-ec-teal/30 mb-6' aria-hidden='true' />
                  <blockquote
                    className='type-heading-l font-[family-name:var(--font-manrope)] font-medium text-ec-indigo dark:text-white text-pretty'
                    style={{ transform: `translateY(${offset}px)` }}
                  >
                    &ldquo;{primary.quote}&rdquo;
                  </blockquote>
                  <figcaption className='mt-8 flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-ec-sky dark:bg-ec-canvas-deep flex items-center justify-center font-[family-name:var(--font-clash)] font-bold text-ec-indigo dark:text-white'>
                      {primary.name.charAt(0)}
                    </div>
                    <div>
                      <div className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink'>
                        {primary.name}
                      </div>
                      <div className='type-body-s text-ec-slate'>
                        {primary.role} · {primary.context}
                      </div>
                    </div>
                    {primaryProgramme && (
                      <Link
                        href={`/programmes/${primaryProgramme.slug}`}
                        className='ml-auto hidden sm:inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-ec-teal-dark dark:text-ec-teal hover:opacity-80 transition-opacity'
                      >
                        {primaryProgramme.name}
                      </Link>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          )}

          {/* Supporting quotes */}
          <div className='flex flex-col gap-5'>
            {supporting.map((t, i) => {
              const programme = t.programmeSlug
                ? programmes.find((p) => p.slug === t.programmeSlug)
                : undefined;
              return (
                <Reveal key={t.quote} delay={i * 120}>
                  <figure className='card-surface p-7'>
                    <blockquote className='type-body-m text-ec-ink dark:text-ec-ink/90 text-pretty'>
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className='mt-5 flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-ec-sky dark:bg-ec-canvas-deep flex items-center justify-center font-[family-name:var(--font-clash)] font-bold text-sm text-ec-indigo dark:text-white'>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className='text-sm font-semibold text-ec-ink'>{t.name}</div>
                        <div className='type-caption text-ec-slate'>
                          {t.role}
                          {programme && ` · ${programme.name}`}
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
