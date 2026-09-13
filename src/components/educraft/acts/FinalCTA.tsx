'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import MagneticButton from '../motion/MagneticButton';
import Reveal from '../motion/Reveal';
import { ButtonNextLink } from '../ui/Button';
import { Constellation, GradientMesh } from '../graphics/DecorativeSystems';

export type FinalCTAProps = {
  /**
   * The strand's terminal node, rendered inside the primary CTA's row — the
   * row is the `relative` wrapper that positions it. Everything else about
   * this section is unchanged: the node is the only thing Act 4 adds to it.
   */
  children?: ReactNode;
};

/**
 * Final conversion section (plan §3.13) — a closing brand moment with
 * SVG atmosphere (no second WebGL context; one scene serves the page,
 * plan §35) and a magnetic primary CTA.
 *
 * Carried over from `landing/FinalCTA.tsx` for Act 4 (§5: "kept, strand
 * terminates in it"), with two changes and no others: the `children` slot
 * above, and the `relative` wrapper around the CTA row that gives it a
 * positioning context. The dark full-bleed band and its `py-24 md:py-36` are
 * deliberately kept — §4 calls it "the only card-free closer, and it works".
 *
 * **Not redesigned here.** §11.3's `MagneticButton` rework — Motion springs
 * replacing the hand-rolled physics — is Stage 3's; this stage only terminates
 * the strand in it.
 */
export default function FinalCTA({ children }: FinalCTAProps = {}) {
  const { openModal } = useEnquiryModal();

  return (
    <section className='relative py-24 md:py-36 bg-ec-indigo overflow-hidden'>
      <GradientMesh className='opacity-60' colorClassName='text-white' />
      <Constellation className='opacity-50' colorClassName='text-ec-teal-light' />
      <div
        className='absolute inset-0 bg-gradient-to-t from-ec-indigo-dark/60 via-transparent to-transparent'
        aria-hidden='true'
      />

      <div className='container-site relative text-center max-w-3xl mx-auto'>
        <Reveal>
          <span className='eyebrow eyebrow-rule text-ec-gold mb-5 justify-center'>Begin here</span>
          <h2 className='type-display-l text-white text-balance'>
            The next step is a conversation.
          </h2>
          <p className='type-body-l text-white/70 mt-5 max-w-xl mx-auto text-pretty'>
            Whether you are a school leader exploring partnerships, a parent evaluating
            options, or a student ready to start — tell us where you are, and we will
            help you find the path that fits.
          </p>
          <div className='mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center relative'>
            <MagneticButton onClick={() => openModal()} className='group'>
              Start a Conversation
              <ArrowRight className='w-5 h-5 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
            </MagneticButton>
            <ButtonNextLink
              href='/programmes'
              variant='ghost'
              size='lg'
              className='!text-white/80 hover:!text-white hover:!bg-white/10'
            >
              Browse Programmes
            </ButtonNextLink>
            {children}
          </div>
          <p className='type-caption text-white/50 mt-8'>
            No commitment — just a conversation about where a learner could go.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
