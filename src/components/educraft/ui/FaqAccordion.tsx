'use client';

import { useState, useId } from 'react';
import { Plus } from 'lucide-react';
import type { FAQ } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Accessible FAQ accordion (plan §33) — button + aria-expanded + region
 * labelling, no focus trap needed. One item open at a time.
 */
export default function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className='space-y-3'>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.question}
            className={cn(
              'card-surface overflow-hidden transition-colors duration-150',
              isOpen && 'border-ec-teal/40'
            )}
          >
            <button
              className='w-full flex items-center justify-between gap-4 text-left px-6 py-5'
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`${baseId}-panel-${i}`}
            >
              <span className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink type-body-s md:text-base'>
                {faq.question}
              </span>
              <Plus
                className={cn(
                  'w-5 h-5 flex-shrink-0 text-ec-teal transition-transform duration-200 ease-out-soft',
                  isOpen && 'rotate-45'
                )}
                aria-hidden='true'
              />
            </button>
            <div
              id={`${baseId}-panel-${i}`}
              role='region'
              aria-label={faq.question}
              className={cn(
                'grid transition-all duration-200 ease-out-soft',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className='overflow-hidden'>
                <p className='px-6 pb-5 type-body-s text-ec-slate'>{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
