'use client';

import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { courses } from '@/data/courses';

export default function Footer() {
  return (
    <footer className='relative bg-ec-indigo-dark text-white overflow-hidden'>
      {/* Subtle pathway motif background */}
      <svg
        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.04]'
        viewBox='0 0 400 400'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
      >
        <circle cx='200' cy='200' r='180' stroke='#00B3B8' strokeWidth='1' />
        <circle cx='200' cy='200' r='120' stroke='#F4B942' strokeWidth='0.5' />
        <circle cx='200' cy='200' r='60' stroke='#3B4896' strokeWidth='0.5' />
      </svg>

      <div className='relative max-w-[1200px] mx-auto px-6 py-16 md:py-20'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8'>
          {/* Brand column */}
          <div className='lg:col-span-1'>
            <a href='#hero' className='flex items-center gap-2 mb-4' aria-label='Educraft Home'>
              <div className='w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center'>
                <GraduationCap className='w-5 h-5 text-ec-gold' />
              </div>
              <span className='font-[family-name:var(--font-sora)] font-bold text-xl'>
                Edu<span className='text-ec-teal-light'>craft</span>
              </span>
            </a>
            <p className='text-white/60 text-sm leading-relaxed'>
              Empowering schools, empowering students. A global digital education platform
              with five interconnected learning verticals.
            </p>
          </div>

          {/* Courses column */}
          <div>
            <h4 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Courses
            </h4>
            <ul className='space-y-2.5'>
              {courses.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`#courses`}
                    className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Company
            </h4>
            <ul className='space-y-2.5'>
              {['About Us', 'Careers', 'Partnerships', 'Blog'].map((item) => (
                <li key={item}>
                  <a
                    href='#'
                    className='text-white/60 hover:text-ec-teal-light transition-colors text-sm'
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className='font-[family-name:var(--font-sora)] font-semibold text-sm uppercase tracking-wider text-ec-gold mb-4'>
              Contact
            </h4>
            <ul className='space-y-3'>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <Mail className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' />
                hello@educraft.com
              </li>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <Phone className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' />
                +91 80 4567 8900
              </li>
              <li className='flex items-start gap-2.5 text-white/60 text-sm'>
                <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0 text-ec-teal-light' />
                Bangalore, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-white/40 text-xs'>
            © {new Date().getFullYear()} Educraft. All rights reserved.
          </p>
          <div className='flex gap-6'>
            {['Privacy Policy', 'Terms of Service'].map((item) => (
              <a key={item} href='#' className='text-white/40 hover:text-white/70 text-xs transition-colors'>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
