import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { footerProgrammes, footerAudiences, footerCompany, footerLegal } from '@/data/navigation';
import { Constellation, PathLines } from '../graphics/DecorativeSystems';
import { ButtonNextLink } from '../ui/Button';

/**
 * Footer V2 (plan §45) — a closing brand moment: large statement,
 * primary CTA, navigation clusters, and a quiet pathway background.
 * Server component — no client interactivity required.
 */
export default function Footer() {
  return (
    <footer className='relative bg-ec-indigo-dark text-white overflow-hidden'>
      {/* Quiet pathway background (plan §45) */}
      <Constellation className='opacity-30' colorClassName='text-ec-teal' />
      <PathLines className='opacity-40' colorClassName='text-ec-teal' />
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20' aria-hidden='true' />

      <div className='relative container-site pt-20 md:pt-28 pb-10'>
        {/* Closing statement */}
        <div className='max-w-3xl'>
          <p className='eyebrow eyebrow-rule text-ec-gold mb-5'>Educraft</p>
          <h2 className='type-display-l text-white text-balance'>
            Build learning journeys that last.
          </h2>
          <p className='mt-5 type-body-l text-white/60 max-w-xl text-pretty'>
            Five paths. One connected ecosystem. Whatever a learner needs next, there is a
            route that starts here.
          </p>
          <div className='mt-8 flex flex-col sm:flex-row gap-4'>
            <ButtonNextLink href='/contact' size='lg'>
              Start a Conversation
            </ButtonNextLink>
            <ButtonNextLink
              href='/programmes'
              variant='ghost'
              size='lg'
              className='!text-white/80 hover:!text-white hover:!bg-white/10'
            >
              Explore Programmes
            </ButtonNextLink>
          </div>
        </div>

        {/* Navigation clusters */}
        <div className='mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 border-t border-white/10 pt-12'>
          {/* Brand */}
          <div className='lg:col-span-2'>
            <Link href='/' className='flex items-center mb-4' aria-label='Educraft Home'>
              {/* Logo — light mode uses logo.png, dark mode swaps to logo-dark.png via CSS */}
              <Image src='/logo.png' alt='Educraft' width={2135} height={736} className='h-14 md:h-16 w-auto dark:hidden' />
              <Image src='/logo-dark.png' alt='Educraft' width={2172} height={724} className='hidden h-14 md:h-16 w-auto dark:block' />
            </Link>
            <p className='text-white/60 text-sm leading-relaxed max-w-sm'>
              A global digital education platform with five interconnected learning
              verticals — linguistics, inclusive education, wellbeing, AI & digital
              technologies, and NEET/JEE preparation.
            </p>
            <ul className='mt-6 space-y-3'>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <Mail className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' aria-hidden='true' />
                hello@educraft.com
              </li>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <Phone className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' aria-hidden='true' />
                +91 80 4567 8900
              </li>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' aria-hidden='true' />
                Bangalore, India
              </li>
            </ul>
          </div>

          {/* Programmes */}
          <nav aria-label='Programmes'>
            <h3 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Programmes
            </h3>
            <ul className='space-y-2.5'>
              {footerProgrammes.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'>
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Audiences + company */}
          <nav aria-label='Audiences and company'>
            <h3 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Audiences
            </h3>
            <ul className='space-y-2.5 mb-6'>
              {footerAudiences.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'>
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Company
            </h3>
            <ul className='space-y-2.5'>
              {footerCompany.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label='Legal'>
            <h3 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Legal
            </h3>
            <ul className='space-y-2.5'>
              {footerLegal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className='mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-white/40 text-xs'>© {new Date().getFullYear()} Educraft. All rights reserved.</p>
          <div className='flex items-center gap-6'>
            {/* Dashboard entry — /dashboard dispatches by role when signed in and
                lands signed-out visitors on the Clerk sign-in page (proxy.ts). */}
            <Link
              href='/dashboard'
              className='text-white/60 hover:text-ec-teal-light transition-colors text-xs'
            >
              Sign in
            </Link>
            <p className='text-white/40 text-xs'>One ecosystem. Many paths.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
