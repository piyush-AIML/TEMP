import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import PageHero from '@/components/educraft/layout/PageHero';
import Reveal from '@/components/educraft/motion/Reveal';
import EnquiryForm from '@/components/educraft/enquiry/EnquiryForm';

export const metadata: Metadata = {
  title: 'Contact — Educraft',
  description:
    'Talk to Educraft: enquiries for schools, families, students, and partners — by form, email, or phone.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow='Contact'
        title='Start where you are.'
        lead='Whether you are a school leader, a parent, a student, or a partner — tell us what you are looking for and the right team will reply.'
      />

      <section className='py-16 md:py-24 bg-background'>
        <div className='container-site grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12'>
          {/* Channels */}
          <div>
            <Reveal>
              <span className='eyebrow eyebrow-rule text-ec-teal mb-4'>Channels</span>
              <h2 className='type-heading-l text-ec-indigo dark:text-white mb-8'>
                Reach us directly
              </h2>
            </Reveal>
            <div className='space-y-4'>
              {[
                { icon: Mail, label: 'Email', value: 'hello@educraft.com', sub: 'General enquiries and partnerships' },
                { icon: Phone, label: 'Phone', value: '+91 80 4567 8900', sub: 'Weekdays, 9am – 6pm IST' },
                { icon: MapPin, label: 'Office', value: 'Bangalore, India', sub: 'Visits by appointment' },
                { icon: Clock, label: 'Response time', value: 'Within 1 business day', sub: 'For enquiries submitted here' },
              ].map((c, i) => (
                <Reveal key={c.label} delay={i * 80}>
                  <div className='flex items-start gap-4 card-surface p-5'>
                    <span className='w-10 h-10 rounded-xl bg-ec-sky dark:bg-ec-canvas-deep flex items-center justify-center flex-shrink-0'>
                      <c.icon className='w-5 h-5 text-ec-teal' aria-hidden='true' />
                    </span>
                    <div>
                      <div className='type-caption uppercase tracking-[0.08em] text-ec-slate'>{c.label}</div>
                      <div className='font-[family-name:var(--font-manrope)] font-semibold text-ec-ink mt-0.5'>
                        {c.value}
                      </div>
                      <div className='type-body-s text-ec-slate'>{c.sub}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Form */}
          <Reveal delay={120} className='card-surface p-8 md:p-10 h-fit'>
            <h2 className='type-heading-m text-ec-indigo dark:text-white mb-2'>Send an enquiry</h2>
            <p className='type-body-s text-ec-slate mb-6'>
              Fields marked * are required. Your details are used only to respond to this
              enquiry — see our privacy policy.
            </p>
            <EnquiryForm mode='general' inline />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
