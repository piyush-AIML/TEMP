import type { Metadata } from 'next';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';

export const metadata: Metadata = {
  title: 'Terms of Service — Educraft',
  description: 'The terms that govern use of the Educraft website and services.',
  alternates: { canonical: '/terms' },
};

const sections = [
  {
    title: '1. About these terms',
    paragraphs: [
      'These terms govern your use of the Educraft website and the services described on it. By using the site or submitting an enquiry, you agree to these terms. Programme-specific terms (enrolment, fees, schedules) are provided separately when you engage our services.',
    ],
  },
  {
    title: '2. Use of the website',
    paragraphs: [
      'The website is provided for information about Educraft and its programmes. You may use it for lawful purposes only. You may not attempt to disrupt, scrape at scale, or misuse the site in any way that harms its operation or other users.',
      'Content on this site — text, illustrations, and branding — belongs to Educraft unless stated otherwise. You may share links and quote briefly with attribution; you may not reproduce substantial parts for commercial use without permission.',
    ],
  },
  {
    title: '3. Enquiries',
    paragraphs: [
      'Submitting an enquiry creates no contractual obligation on either side. We aim to respond within one business day; the information we provide in response is general unless and until you enter a specific agreement with us.',
      'You agree to provide accurate contact details when submitting an enquiry, and you consent to being contacted about it — by email or phone — per our privacy policy.',
    ],
  },
  {
    title: '4. Programme services',
    paragraphs: [
      'Programme delivery is governed by written agreements and programme terms agreed with families or institutions before commencement — covering scope, schedule, fees, progress reporting, and safeguarding. Where this website and a signed agreement conflict, the signed agreement prevails.',
    ],
  },
  {
    title: '5. No professional guarantees',
    paragraphs: [
      'Educraft describes its methods and expected outcomes honestly, but education outcomes depend on many factors, including learner engagement and circumstances. Nothing on this site constitutes a guarantee of specific results — exam ranks, grades, or otherwise.',
      'Content in the Insights section is general educational guidance, not medical, psychological, or legal advice. For concerns about a child’s wellbeing or learning, consult a qualified professional.',
    ],
  },
  {
    title: '6. Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, Educraft is not liable for indirect or consequential losses arising from use of the website or reliance on its content. Nothing in these terms limits liability that cannot be limited under applicable law.',
    ],
  },
  {
    title: '7. Governing law',
    paragraphs: [
      'These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts of Bangalore, Karnataka.',
    ],
  },
  {
    title: '8. Changes',
    paragraphs: [
      'We may update these terms from time to time. The current version is always published on this page.',
      'Last updated: August 2026.',
    ],
  },
  {
    title: '9. Contact',
    paragraphs: [
      'Questions about these terms can be sent to hello@educraft.com.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow='Legal'
        title='Terms of Service'
        lead='The rules of the road for using the Educraft website and services.'
      />
      <section className='py-16 md:py-20 bg-background'>
        <div className='container-site max-w-3xl space-y-10'>
          {sections.map((s) => (
            <Reveal key={s.title}>
              <h2 className='type-heading-m text-ec-indigo dark:text-white mb-3'>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className='type-body-s text-ec-slate leading-relaxed mt-2'>
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
