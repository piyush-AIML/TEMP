'use client';

import Link from 'next/link';
import { ArrowRight, Building2, HeartHandshake, GraduationCap } from 'lucide-react';
import { audienceEntries } from '@/data/navigation';
import { audiencePageHrefs } from '@/data/navigation';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../motion/Reveal';

const AUDIENCE_ICONS = [Building2, HeartHandshake, GraduationCap] as const;

const ACCENTS = [
  { icon: 'bg-ec-indigo/10 text-ec-indigo', hover: 'hover:border-ec-indigo/40' },
  { icon: 'bg-ec-teal/10 text-ec-teal-dark dark:text-ec-teal', hover: 'hover:border-ec-teal/40' },
  { icon: 'bg-ec-gold/15 text-ec-gold-dark dark:text-ec-gold', hover: 'hover:border-ec-gold/50' },
] as const;

/**
 * Audience entry points (plan §22) — three doors with different framing,
 * benefits, and calls to action. Better than speaking to everyone equally.
 */
export default function AudienceEntryPoints() {
  return (
    <section className='relative py-20 md:py-28 bg-background'>
      <div className='container-site'>
        <SectionHeading
          eyebrow='Who are you?'
          title='Every journey starts from somewhere different'
          subtext='Three doors into the same ecosystem — pick the one that describes you, and the conversation starts on your terms.'
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {audienceEntries.map((a, i) => {
            const Icon = AUDIENCE_ICONS[i];
            const accent = ACCENTS[i];
            return (
              <Reveal key={a.slug} delay={i * 110} className='h-full'>
                <div
                  className={`card-surface h-full p-8 flex flex-col transition-all duration-150 ease-out-soft hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] ${accent.hover}`}
                >
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent.icon}`}>
                    <Icon className='w-6 h-6' aria-hidden='true' />
                  </span>
                  <h3 className='type-heading-m text-ec-indigo dark:text-white mt-5'>{a.label}</h3>
                  <p className='type-body-m text-ec-slate mt-3'>{a.description}</p>

                  <ul className='mt-6 space-y-2.5 flex-1'>
                    {a.benefits.map((b) => (
                      <li key={b} className='flex items-start gap-2.5 type-body-s text-ec-slate'>
                        <span className='mt-2 w-1.5 h-1.5 rounded-full bg-ec-teal flex-shrink-0' aria-hidden='true' />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={audiencePageHrefs[a.slug]}
                    className='mt-7 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] font-semibold text-ec-indigo dark:text-white hover:opacity-80 transition-opacity group'
                  >
                    {a.label}
                    <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-1' aria-hidden='true' />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
