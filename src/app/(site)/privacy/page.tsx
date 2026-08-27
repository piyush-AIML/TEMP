import type { Metadata } from 'next';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';

export const metadata: Metadata = {
  title: 'Privacy Policy — Educraft',
  description: 'How Educraft collects, uses, and protects personal information.',
  alternates: { canonical: '/privacy' },
};

const sections = [
  {
    title: '1. Who we are',
    paragraphs: [
      'Educraft ("we", "us") operates the Educraft website and the education programmes described on it. This policy explains how we handle personal information when you use the website, submit an enquiry, or engage with our programmes.',
    ],
  },
  {
    title: '2. Information we collect',
    paragraphs: [
      'Enquiries: when you submit an enquiry, we collect the information you provide — typically your name, contact details (email and phone), the programme or topic you are interested in, your preferred contact time, and any message you include.',
      'Programme participation: if you or your child enrol in a programme, we collect the information needed to deliver it — learning plans, assessments, progress records, and communications with families. Where a programme involves wellbeing counselling, that information is held under stricter confidentiality rules, described separately at the start of the engagement.',
      'Website usage: we may collect basic technical information (browser type, device, pages visited) to keep the site working and understand how it is used. We do not sell any personal information, ever.',
    ],
  },
  {
    title: '3. How we use information',
    paragraphs: [
      'We use personal information to: respond to enquiries and provide requested information; deliver and improve our programmes; meet safeguarding and regulatory obligations; and send you updates you have asked for.',
      'We do not use personal information for advertising or share it with third parties for their own marketing.',
    ],
  },
  {
    title: '4. Sharing information',
    paragraphs: [
      'We share information only where needed to deliver a service (for example, with programme educators working with your family) or where required by law. Service providers that process data on our behalf (such as email or hosting providers) are bound by data-processing terms.',
      'Within our programmes, families are told in advance which staff have access to which records — especially for counselling and inclusive-education plans.',
    ],
  },
  {
    title: '5. Retention',
    paragraphs: [
      'Enquiry details are kept only as long as needed to respond and follow up appropriately. Programme records are retained for the duration of the engagement and for a reasonable period afterwards to support transitions and references, after which they are securely deleted or anonymised.',
    ],
  },
  {
    title: '6. Children’s privacy',
    paragraphs: [
      'Where a learner is a minor, we engage with the family and rely on parental consent for any data collection. Children’s records are shared only with their families, relevant educators, and — with consent — their school.',
    ],
  },
  {
    title: '7. Your rights',
    paragraphs: [
      'You may request access to, correction of, or deletion of your personal information at any time by writing to hello@educraft.com. We respond to such requests within the timeframes required by applicable law.',
    ],
  },
  {
    title: '8. Security',
    paragraphs: [
      'We apply reasonable technical and organisational measures to protect personal information — access controls, encryption in transit, and restricted access to sensitive records such as counselling notes and individualised learning plans.',
    ],
  },
  {
    title: '9. Changes to this policy',
    paragraphs: [
      'If this policy changes materially, we will post the updated version on this page and update the date below. Continued use of the site after changes constitutes acceptance of the revised policy.',
      'Last updated: August 2026.',
    ],
  },
  {
    title: '10. Contact',
    paragraphs: [
      'Questions about this policy can be sent to hello@educraft.com or to our office in Bangalore, India.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        eyebrow='Legal'
        title='Privacy Policy'
        lead='Plain-language commitments about how we collect, use, and protect personal information.'
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
