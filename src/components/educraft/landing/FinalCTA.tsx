'use client';

import dynamic from 'next/dynamic';
import { useReveal } from '@/hooks/useReveal';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import Button from '../ui/Button';

const FloatingParticles = dynamic(() => import('../three/FloatingParticles'), { ssr: false });

export default function FinalCTA() {
  const { ref, revealed } = useReveal();
  const { openModal } = useEnquiryModal();

  return (
    <section ref={ref} className='py-14 md:py-24 bg-ec-indigo relative overflow-hidden'>
      <FloatingParticles />
      <div className={`max-w-[1200px] mx-auto px-6 text-center relative z-10 reveal-on-scroll ${revealed ? 'revealed' : ''}`}>
        <h2
          className='font-[family-name:var(--font-sora)] font-bold text-white leading-tight mb-4'
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
        >
          Ready to find the right path?
        </h2>
        <p className='text-white/70 text-base md:text-lg max-w-xl mx-auto mb-8'>
          Whether you are a school leader exploring partnerships, a parent evaluating options, or a student
          ready to start — we are here to help you decide with confidence.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button size='lg' onClick={() => openModal()}>
            Start a Conversation
          </Button>
          <Button
            variant='ghost'
            size='lg'
            className='!text-white/80 hover:!text-white hover:!bg-white/10'
            onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse Courses
          </Button>
        </div>
      </div>
    </section>
  );
}
