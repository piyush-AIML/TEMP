import type { Metadata } from 'next';
import { Building2, Users, GraduationCap } from 'lucide-react';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquireButton from '@/components/educraft/ui/EnquireButton';

export const metadata: Metadata = {
  title: 'Partnerships — Educraft',
  description:
    'Partner with Educraft: school partnerships across five verticals, specialist educators joining the ecosystem, and organisations working in education.',
  alternates: { canonical: '/partnerships' },
};

export default function PartnershipsPage() {
  return (
    <div>
      <PageHero
        eyebrow='Partnerships'
        title='Build with us.'
        lead='Educraft grows through partners who care about the same things: specialist teaching, visible progress, and learners who are treated as whole people.'
      />

      {/* Partnership types */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[
            {
              icon: Building2,
              title: 'Schools & institutions',
              body: 'One partner across five verticals: linguistics, inclusive education, wellbeing, AI & digital literacy, and NEET/JEE preparation. In-school, after-school, or blended — with shared reporting and safeguarding.',
              cta: 'Talk to the Education Team',
            },
            {
              icon: GraduationCap,
              title: 'Specialist educators',
              body: 'We work with certified special educators, licensed counsellors, language specialists, technologists, and exam mentors who want structure, support, and serious colleagues.',
              cta: 'Join the educator network',
            },
            {
              icon: Users,
              title: 'Organisations',
              body: 'Foundations, NGOs, and education organisations working on access, inclusion, or digital readiness — we partner on programmes, content, and community initiatives.',
              cta: 'Propose a collaboration',
            },
          ].map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className='card-surface h-full p-8 flex flex-col'>
                <span className='w-12 h-12 rounded-2xl bg-ec-sky dark:bg-ec-canvas-deep flex items-center justify-center'>
                  <p.icon className='w-6 h-6 text-ec-teal' aria-hidden='true' />
                </span>
                <h2 className='type-heading-m text-ec-indigo dark:text-white mt-5'>{p.title}</h2>
                <p className='type-body-s text-ec-slate mt-3 flex-1'>{p.body}</p>
                <div className='mt-6'>
                  <EnquireButton variant='secondary'>{p.cta}</EnquireButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What we look for */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-t border-ec-border/60'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Fit</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              What a good partnership looks like
            </h2>
          </Reveal>
          <div className='space-y-4'>
            {[
              'Alignment on evidence: partners willing to measure honestly and review on cadence.',
              'Respect for specialisation: verticals led by trained specialists, never improvised.',
              'Family inclusion: plans agreed with families and reported in plain language.',
              'Safeguarding as a shared standard: documented protocols on both sides.',
              'A long view: partnerships designed for terms and years, not events.',
            ].map((item, i) => (
              <Reveal key={item} delay={i * 80}>
                <p className='flex items-start gap-3 type-body-m text-ec-ink dark:text-ec-ink/90'>
                  <span className='mt-2.5 w-1.5 h-1.5 rounded-full bg-ec-teal flex-shrink-0' aria-hidden='true' />
                  {item}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 md:py-24 bg-ec-indigo overflow-hidden'>
        <div className='container-site text-center max-w-2xl mx-auto'>
          <Reveal>
            <h2 className='type-display-m text-white text-balance'>Start the conversation.</h2>
            <p className='type-body-m text-white/70 mt-4'>
              Tell us what you are trying to do — we will tell you honestly whether and
              how Educraft fits.
            </p>
            <div className='mt-8 flex justify-center'>
              <EnquireButton size='lg'>Partner with Educraft</EnquireButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
