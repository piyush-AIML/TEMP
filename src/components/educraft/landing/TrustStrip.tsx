'use client';

import { useReveal } from '@/hooks/useReveal';
import { Globe, Award, Users, BookOpen } from 'lucide-react';

const signals = [
  { icon: Globe, label: '30+ Countries', sub: 'Global reach' },
  { icon: Users, label: '50,000+', sub: 'Students supported' },
  { icon: Award, label: '200+', sub: 'Partner schools' },
  { icon: BookOpen, label: '5 Verticals', sub: 'One ecosystem' },
];

export default function TrustStrip() {
  const { ref, revealed } = useReveal();

  return (
    <section ref={ref} className='py-12 md:py-16 bg-white border-b border-ec-border'>
      <div className={`max-w-[1200px] mx-auto px-6 reveal-on-scroll ${revealed ? 'revealed' : ''}`}>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
          {signals.map(({ icon: Icon, label, sub }) => (
            <div key={label} className='text-center'>
              <Icon className='w-6 h-6 text-ec-teal mx-auto mb-2' />
              <div className='font-[family-name:var(--font-sora)] font-bold text-xl md:text-2xl text-ec-indigo'>
                {label}
              </div>
              <div className='text-ec-slate text-sm mt-0.5'>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
