'use client';

import { useState } from 'react';
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import { useReveal } from '@/hooks/useReveal';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import SectionHeading from '../ui/SectionHeading';
import EnquiryForm from '../enquiry/EnquiryForm';
import dynamic from 'next/dynamic';

const CourseOrbit3D = dynamic(() => import('../three/CourseOrbit3D'), { ssr: false });

export default function CoursesOverview() {
  const { ref, revealed } = useReveal();
  const { openModal } = useEnquiryModal();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <>
      <section id='courses' ref={ref} className='py-14 md:py-24 bg-ec-sky relative overflow-hidden'>
        <div className='max-w-[1200px] mx-auto px-6 relative z-10'>
          <SectionHeading
            eyebrow='Programmes'
            title='Explore Our Courses'
            subtext='Each programme is designed by domain specialists and delivered with the same commitment to individual progress and institutional trust.'
          />

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center reveal-on-scroll ${revealed ? 'revealed' : ''}`}>
            {/* 3D Orbit */}
            <div className='order-2 lg:order-1 flex justify-center'>
              <CourseOrbit3D />
            </div>

            {/* Course cards - scrollable on mobile */}
            <div className='order-1 lg:order-2 space-y-4'>
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <button
                    key={course.slug}
                    onClick={() => setSelectedCourse(course)}
                    className='w-full text-left bg-card rounded-2xl p-5 border border-ec-border hover:shadow-[0_8px_30px_rgba(30,42,120,0.08)] hover:-translate-y-1 transition-all duration-150 group'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='w-11 h-11 rounded-xl bg-ec-sky flex items-center justify-center flex-shrink-0 group-hover:bg-ec-teal/10 transition-colors'>
                        <Icon className='w-5 h-5 text-ec-teal' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-xs font-semibold uppercase tracking-[0.08em] text-ec-gold'>
                            {course.pillar}
                          </span>
                        </div>
                        <h3 className='font-[family-name:var(--font-sora)] font-bold text-base text-ec-indigo dark:text-white mb-1'>
                          {course.name}
                        </h3>
                        <p className='text-ec-slate text-sm leading-relaxed line-clamp-2'>
                          {course.shortIntro}
                        </p>
                      </div>
                      <ArrowRight className='w-5 h-5 text-ec-slate group-hover:text-ec-teal group-hover:translate-x-1 transition-all flex-shrink-0 mt-1' />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Course Detail Overlay */}
      {selectedCourse && (
        <CourseDetailOverlay
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnquire={() => {
            setSelectedCourse(null);
            openModal(selectedCourse.slug);
          }}
        />
      )}
    </>
  );
}

function CourseDetailOverlay({
  course,
  onClose,
  onEnquire,
}: {
  course: Course;
  onClose: () => void;
  onEnquire: () => void;
}) {
  const Icon = course.icon;

  return (
    <div
      className='fixed inset-0 z-[90] bg-ec-indigo/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4 animate-in fade-in duration-200'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role='dialog'
      aria-modal='true'
      aria-label={`${course.name} details`}
    >
      <div className='bg-card rounded-3xl shadow-[0_8px_30px_rgba(30,42,120,0.08)] w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden'>
        {/* Hero band */}
        <div className='bg-gradient-to-r from-ec-indigo to-ec-indigo-light px-6 md:px-10 py-8 md:py-10 relative'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors'
            aria-label='Close'
          >
            <X className='w-5 h-5' />
          </button>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center'>
              <Icon className='w-5 h-5 text-white' />
            </div>
            <span className='text-xs font-semibold uppercase tracking-[0.08em] text-ec-gold'>
              {course.pillar}
            </span>
          </div>
          <h2 className='font-[family-name:var(--font-sora)] font-bold text-2xl md:text-3xl text-white leading-tight'>
            {course.name}
          </h2>
        </div>

        <div className='px-6 md:px-10 py-8'>
          {/* Description */}
          <p className='text-ec-ink text-base leading-relaxed mb-8'>
            {course.longDescription}
          </p>

          {/* Highlights */}
          <h3 className='font-[family-name:var(--font-sora)] font-bold text-lg text-ec-indigo dark:text-white mb-4'>
            Programme Highlights
          </h3>
          <ul className='space-y-3 mb-8'>
            {course.highlights.map((h) => (
              <li key={h} className='flex items-start gap-3'>
                <CheckCircle2 className='w-5 h-5 text-ec-teal flex-shrink-0 mt-0.5' />
                <span className='text-ec-ink text-sm leading-relaxed'>{h}</span>
              </li>
            ))}
          </ul>

          {/* Inline enquiry form */}
          <div className='border-t border-ec-border pt-8'>
            <h3 className='font-[family-name:var(--font-sora)] font-bold text-lg text-ec-indigo dark:text-white mb-4'>
              Enquire about {course.name}
            </h3>
            <EnquiryForm mode='locked' courseSlug={course.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
