'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import Button, { ButtonNextLink } from '../ui/Button';
import { Constellation, GradientMesh } from '../graphics/DecorativeSystems';

const EcosystemScene = dynamic(() => import('../three/scenes/EcosystemScene'), { ssr: false });

/**
 * Hero V2 (plan §4) — the signature experience. Editorial two-column
 * composition with a staged entrance sequence (atmosphere → nodes →
 * headline → copy → CTA) and a scroll-linked transformation: the scene
 * pulls back, the headline rises, and the hero hands over to the
 * ecosystem section. Reduced motion renders the static composition
 * instantly (CSS handles the animation removal). FC-06 (gate G1 — Option B):
 * the hero is the proof section for the cinematic anchor zone — dark-anchor
 * makes it theme-independent dark (same composition in both themes).
 */
export default function Hero() {
  const { ref, progress } = useScrollProgress<HTMLElement>();
  const { openModal } = useEnquiryModal();

  const contentShift = progress * -48;
  const contentOpacity = 1 - Math.min(1, progress * 1.6);
  const sceneOpacity = 1 - Math.min(1, progress * 1.1);

  const heroDelay = (ms: number) => ({ '--hero-delay': `${ms}ms` }) as CSSProperties;

  return (
    <section
      ref={ref}
      className='dark-anchor relative min-h-[100svh] flex items-center overflow-hidden bg-gradient-to-b from-ec-sky via-background to-background'
    >
      {/* Atmosphere — enters first (plan §4.2) */}
      <div className='hero-enter-fade absolute inset-0 pointer-events-none' style={heroDelay(0)}>
        <GradientMesh className='opacity-80' colorClassName='text-ec-indigo' />
      </div>

      {/* Ecosystem visual — desktop (plan §34: SVG atmosphere on mobile) */}
      <div
        className='hero-enter-fade hidden lg:block absolute inset-y-0 right-0 w-[58%] pointer-events-none'
        style={{ ...heroDelay(300), opacity: sceneOpacity }}
      >
        <EcosystemScene progress={progress} />
      </div>

      {/* Mobile atmosphere */}
      <div className='hero-enter-fade lg:hidden absolute inset-0 pointer-events-none' style={heroDelay(300)}>
        <Constellation className='opacity-80' colorClassName='text-ec-teal' />
      </div>

      {/* Content */}
      <div className='container-site relative z-10 pt-32 pb-28 md:pt-36'>
        <div
          className='max-w-2xl'
          style={{
            transform: `translateY(${contentShift}px)`,
            opacity: contentOpacity,
          }}
        >
          {/* Eyebrow — 900ms */}
          <span
            className='hero-enter eyebrow eyebrow-rule text-ec-teal mb-6'
            style={heroDelay(900)}
          >
            Global Digital Education Platform
          </span>

          {/* Headline — 900ms */}
          <h1
            className='hero-enter type-display-xl text-ec-indigo dark:text-white text-balance'
            style={heroDelay(900)}
          >
            Five paths.
            <br />
            One learning <span className='text-ec-teal-dark dark:text-ec-teal-light'>ecosystem</span>.
          </h1>

          {/* Supporting copy — 1200ms */}
          <p
            className='hero-enter type-body-l text-ec-slate max-w-xl mt-6 text-pretty'
            style={heroDelay(1200)}
          >
            From language and inclusion to wellbeing, AI literacy, and competitive exam
            preparation — Educraft connects the pieces that help students move forward.
          </p>

          {/* CTAs — 1500ms */}
          <div
            className='hero-enter mt-9 flex flex-col sm:flex-row gap-4'
            style={heroDelay(1500)}
          >
            <Button size='lg' onClick={() => openModal()} className='group'>
              Explore Programmes
              <ArrowRight className='w-5 h-5 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
            </Button>
            <ButtonNextLink href='/programmes' variant='secondary' size='lg'>
              View all programmes
            </ButtonNextLink>
          </div>

          {/* Quiet trust line — 1700ms */}
          <p className='hero-enter type-caption text-ec-slate mt-7' style={heroDelay(1700)}>
            Five verticals · One trust umbrella · Built for schools, families, and students
          </p>
        </div>
      </div>

      {/* Bottom fade into the ecosystem section */}
      <div className='absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-[5] pointer-events-none' />

      {/* Scroll cue */}
      <div
        className='hero-enter hidden md:flex flex-col items-center gap-2 absolute bottom-7 left-1/2 -translate-x-1/2 z-10'
        style={{ ...heroDelay(1900), opacity: 1 - Math.min(1, progress * 2) }}
        aria-hidden='true'
      >
        <span className='type-caption uppercase tracking-[0.14em] text-ec-slate'>Scroll</span>
        <span className='relative w-px h-10 bg-ec-border overflow-hidden'>
          <span className='absolute inset-x-0 top-0 h-4 bg-ec-teal ambient-drift' />
        </span>
      </div>
    </section>
  );
}
