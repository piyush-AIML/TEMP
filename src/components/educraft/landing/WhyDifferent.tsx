'use client';

import Reveal from '../motion/Reveal';
import Eyebrow from '../ui/Eyebrow';

const differentiators = [
  {
    title: 'One ecosystem, not five silos',
    description:
      'Programmes are designed to work together. A student building language confidence can also access wellbeing support; an exam aspirant can pause for counselling without leaving the system. Learners move between paths without starting over.',
  },
  {
    title: 'Specialists in every room',
    description:
      'Each vertical is led by people trained for it — language specialists, certified special educators, licensed counsellors, technologists, and exam mentors. Nobody is improvising outside their field.',
  },
  {
    title: 'Families are partners, not spectators',
    description:
      'Goals are agreed with families, not announced to them. Structured check-ins, plain-language reports, and home strategies keep parents genuinely part of the journey.',
  },
  {
    title: 'Progress you can actually see',
    description:
      'Portfolios, dashboards, and benchmarked checkpoints replace vague reassurance. Every programme answers the same question with evidence: what can the student do now that they could not do before?',
  },
  {
    title: 'Wellbeing woven in, not bolted on',
    description:
      'Steadiness is designed into every programme — realistic targets, study-rest cycles, and access to counselling. We treat sustainable learning as a performance advantage, not a soft option.',
  },
];

/**
 * "What makes Educraft different" (plan §3.05) — an asymmetric editorial
 * module: sticky left statement, numbered differentiators on the right.
 */
export default function WhyDifferent() {
  return (
    <section className='relative py-20 md:py-28 bg-background border-t border-ec-border/60'>
      <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20'>
        {/* Sticky statement */}
        <div className='lg:sticky lg:top-32 lg:self-start'>
          <Reveal>
            <Eyebrow className='text-ec-teal mb-4'>Why Educraft</Eyebrow>
            <h2 className='type-display-m text-ec-indigo dark:text-white text-balance'>
              A different kind of education company.
            </h2>
            <p className='type-body-m text-ec-slate mt-5 max-w-md text-pretty'>
              Most education offerings are collections of courses. Educraft is a connected
              system — five specialist verticals sharing one philosophy, one standard of
              evidence, and one view of the learner.
            </p>
          </Reveal>
        </div>

        {/* Numbered differentiators */}
        <div>
          {differentiators.map((d, i) => (
            <Reveal
              key={d.title}
              delay={i * 90}
              className='group grid grid-cols-[3.5rem_1fr] gap-5 py-7 border-b border-ec-border last:border-b-0'
            >
              <span className='font-[family-name:var(--font-sora)] font-bold text-2xl text-ec-border dark:text-ec-border/50 group-hover:text-ec-teal transition-colors'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className='type-heading-s text-ec-indigo dark:text-white'>{d.title}</h3>
                <p className='type-body-s text-ec-slate mt-2 max-w-xl'>{d.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
