'use client';

import { useReveal } from '@/hooks/useReveal';
import { courses } from '@/data/courses';
import SectionHeading from '../ui/SectionHeading';

const pillarDescriptions: Record<string, string> = {
  Learn: 'Building fluency, comprehension, and global communication skills through personalised language pathways.',
  Include: 'Adaptive, individualised support so every learner — regardless of need — can access opportunity.',
  Thrive: 'Confidential counselling and resilience toolkits that keep students steady and focused.',
  Achieve: 'Practical AI literacy and digital readiness for the careers of tomorrow.',
  Excel: 'Concept-first, disciplined exam coaching with measurable progress.',
};

export default function PillarsSection() {
  const { ref, revealed } = useReveal();

  return (
    <section id='pillars' ref={ref} className='py-14 md:py-24 bg-white'>
      <div className='max-w-[1200px] mx-auto px-6'>
        <SectionHeading
          eyebrow='Our Pillars'
          title='Five Ways to Grow'
          subtext='Each vertical is a complete programme in its own right — not a module within a course. Together, they form one interconnected learning ecosystem.'
        />

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal-on-scroll ${revealed ? 'revealed' : ''}`}>
          {courses.map((course, i) => {
            const Icon = course.icon;
            return (
              <div
                key={course.slug}
                className='group relative bg-white border border-ec-border rounded-2xl p-6 hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] hover:-translate-y-1 transition-all duration-150'
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className='w-10 h-10 rounded-xl bg-ec-sky flex items-center justify-center mb-3 group-hover:bg-ec-teal/10 transition-colors'>
                  <Icon className='w-5 h-5 text-ec-teal' />
                </div>
                <span className='inline-block text-xs font-semibold uppercase tracking-[0.08em] text-ec-gold mb-1'>
                  {course.pillar}
                </span>
                <h3 className='font-[family-name:var(--font-sora)] font-bold text-base text-ec-indigo mb-2'>
                  {course.name}
                </h3>
                <p className='text-ec-slate text-sm leading-relaxed'>
                  {pillarDescriptions[course.pillar]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}