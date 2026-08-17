'use client';

import dynamic from 'next/dynamic';
import { useReveal } from '@/hooks/useReveal';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import Button from '../ui/Button';

const HeroScene = dynamic(() => import('../three/HeroScene'), { ssr: false });

export default function Hero() {
  const { ref, revealed } = useReveal(0.1);
  const { openModal } = useEnquiryModal();

  return (
    <section
      id='hero'
      ref={ref}
      className='relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-ec-sky via-background to-background'
    >
      {/* 3D Background */}
      <div className='absolute inset-0 md:inset-0 pointer-events-none hidden md:block'>
        <HeroScene />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 max-w-[1200px] mx-auto px-6 text-center pt-24 pb-16 reveal-on-scroll ${revealed ? 'revealed' : ''}`}
      >
        {/* Eyebrow */}
        <span className='inline-block font-[family-name:var(--font-manrope)] font-semibold uppercase text-ec-teal text-xs tracking-[0.08em] mb-4'>
          Global Digital Education Platform
        </span>

        {/* Headline */}
        <h1
          className='font-[family-name:var(--font-sora)] font-bold text-ec-indigo dark:text-white leading-[1.1] mb-6'
          style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
        >
          Empowering Schools,
          <br />
          Empowering Students
        </h1>

        {/* Subhead */}
        <p className='text-ec-slate text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10'>
          Five interconnected learning verticals — from linguistics and inclusive education
          to AI literacy and exam preparation — unified under one trusted platform.
          Every student deserves a learning path that understands their strengths.
        </p>

        {/* CTAs */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button size='lg' onClick={() => openModal()}>
            Explore Programmes
          </Button>
          <Button variant='secondary' size='lg' onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>
            View Courses
          </Button>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]' />
    </section>
  );
}
