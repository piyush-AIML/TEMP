import type { Metadata } from 'next';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquireButton from '@/components/educraft/ui/EnquireButton';

export const metadata: Metadata = {
  title: 'Careers — Educraft',
  description:
    'Join Educraft: specialist educators, counsellors, technologists, and operators building a connected learning ecosystem.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return (
    <div>
      <PageHero
        eyebrow='Careers'
        title='Do your best work in a system that makes sense.'
        lead='Educraft is a place for people who believe specialist teaching, visible progress, and whole-learner care belong together.'
      />

      {/* Who we are */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>The work</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white text-balance'>
              Five fields, one culture
            </h2>
          </Reveal>
          <div className='space-y-5'>
            <Reveal delay={80}>
              <p className='type-body-l text-ec-ink dark:text-ec-ink/90 text-pretty'>
                Our teams span language education, special education, counselling,
                technology, and exam preparation — and they talk to each other. That is
                rare in education, and it is the whole point of Educraft.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className='type-body-m text-ec-slate text-pretty'>
                People join for the coherence: one method, one reporting standard, and
                colleagues who take your field as seriously as you do. They stay because
                the work is visible — you can watch a learner move through the stages
                and know exactly what your part was.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className='py-16 md:py-24 bg-ec-canvas-soft dark:bg-ec-canvas-deep border-y border-ec-border/60'>
        <div className='container-site'>
          <Reveal>
            <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Roles</span>
            <h2 className='type-heading-l text-ec-indigo dark:text-white mb-10'>
              We are always glad to hear from
            </h2>
          </Reveal>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                title: 'Special educators',
                body: 'Certified professionals who design individualised plans and adapt teaching to the learner.',
              },
              {
                title: 'Counsellors',
                body: 'Licensed school counsellors who build steady learners and safer classrooms.',
              },
              {
                title: 'Language specialists',
                body: 'Educators trained in second-language teaching who teach fluency, not just grammar.',
              },
              {
                title: 'Technology mentors',
                body: 'Builders who can teach AI literacy and coding foundations through real projects.',
              },
              {
                title: 'Exam mentors',
                body: 'Subject specialists who coach concept-first preparation with weekly evidence.',
              },
              {
                title: 'Operations & partnerships',
                body: 'People who make complex programmes run smoothly and partners feel cared for.',
              },
              {
                title: 'Design & content',
                body: 'Designers and writers who explain learning clearly and beautifully.',
              },
              {
                title: 'Engineering',
                body: 'Engineers building the platforms, dashboards, and systems the ecosystem runs on.',
              },
            ].map((r, i) => (
              <Reveal key={r.title} delay={i * 60}>
                <div className='card-surface h-full p-5'>
                  <h3 className='type-heading-s text-ec-indigo dark:text-white'>{r.title}</h3>
                  <p className='type-body-s text-ec-slate mt-2'>{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className='mt-10 card-surface p-6'>
            <p className='type-body-s text-ec-slate'>
              Open positions are shared with our network and on{' '}
              <span className='font-semibold text-ec-ink'>hello@educraft.com</span> enquiries.
              If your field is above and your standards match ours, introduce yourself —
              specific roles come and go, but strong people are always worth the conversation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site text-center max-w-2xl mx-auto'>
          <Reveal>
            <h2 className='type-display-m text-ec-indigo dark:text-white text-balance'>
              Introduce yourself.
            </h2>
            <p className='type-body-m text-ec-slate mt-4'>
              Tell us what you do, where you have done it, and why the ecosystem idea
              matters to you.
            </p>
            <div className='mt-8 flex justify-center'>
              <EnquireButton size='lg'>Write to the team</EnquireButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
