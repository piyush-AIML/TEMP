import type { Metadata } from 'next';
import PageHero from '@/components/educraft/layout/PageHero';
import InsightsList from '@/components/educraft/insights/InsightsList';

export const metadata: Metadata = {
  title: 'Insights — Educraft',
  description:
    'Practical thinking on learning science, AI literacy, inclusive education, student wellbeing, exam preparation, and parent guidance.',
  alternates: { canonical: '/insights' },
};

export default function InsightsIndex() {
  return (
    <div>
      <PageHero
        eyebrow='Insights'
        title='Ideas from inside the ecosystem'
        lead='Practical thinking for families and educators — written by the people who design and deliver Educraft programmes.'
      />
      <section className='py-14 md:py-20 bg-background'>
        <div className='container-site'>
          <InsightsList />
        </div>
      </section>
    </div>
  );
}
