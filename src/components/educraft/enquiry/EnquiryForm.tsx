'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { courses, getCourseBySlug } from '@/data/courses';
import Button from '../ui/Button';

interface EnquiryFormProps {
  mode: 'general' | 'locked';
  courseSlug?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  preferredTime: string;
  message: string;
  consent: boolean;
}

interface Errors {
  [key: string]: string;
}

export default function EnquiryForm({ mode, courseSlug }: EnquiryFormProps) {
  const lockedCourse = courseSlug ? getCourseBySlug(courseSlug) : null;

  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    course: courseSlug || '',
    preferredTime: '',
    message: '',
    consent: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email.';
    }
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required.';
    } else if (!/^\d{10,}$/.test(form.phone.replace(/\D/g, ''))) {
      e.phone = 'Please enter at least 10 digits.';
    }
    if (mode === 'general' && !form.course) e.course = 'Please select a course.';
    if (!form.consent) e.consent = 'You must agree to be contacted.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    // Demo: simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className='text-center py-8'>
        <CheckCircle2 className='w-12 h-12 text-ec-teal mx-auto mb-4' />
        <h3 className='font-[family-name:var(--font-sora)] font-bold text-xl text-ec-indigo dark:text-white mb-2'>
          Thank you!
        </h3>
        <p className='text-ec-slate'>
          We&apos;ll be in touch within 1 business day.
        </p>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-2xl border ${errors[field] ? 'border-red-400' : 'border-ec-border'} bg-card text-ec-ink font-[family-name:var(--font-manrope)] text-sm placeholder:text-ec-slate/60 focus:outline-none focus:ring-2 focus:ring-ec-indigo/20 focus:border-ec-indigo transition-colors`;

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-4'>
      {/* Locked course display */}
      {mode === 'locked' && lockedCourse && (
        <div className='bg-ec-sky rounded-2xl px-4 py-3 text-sm text-ec-indigo dark:text-white font-medium'>
          Enquiring about: <strong>{lockedCourse.name}</strong>
          <input type='hidden' name='course' value={lockedCourse.slug} />
        </div>
      )}

      {/* Course select - general mode only */}
      {mode === 'general' && (
        <div>
          <label htmlFor='enq-course' className='block text-sm font-medium text-ec-ink mb-1.5'>
            Which course are you interested in?
          </label>
          <select
            id='enq-course'
            value={form.course}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => update('course', e.target.value)}
            className={inputClass('course')}
            aria-describedby={errors.course ? 'enq-course-err' : undefined}
          >
            <option value=''>Select a course</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          {errors.course && (
            <p id='enq-course-err' className='text-red-500 text-xs mt-1'>{errors.course}</p>
          )}
        </div>
      )}

      {/* Full name */}
      <div>
        <label htmlFor='enq-name' className='block text-sm font-medium text-ec-ink mb-1.5'>
          Full name <span className='text-red-400'>*</span>
        </label>
        <input
          id='enq-name'
          type='text'
          value={form.fullName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => update('fullName', e.target.value)}
          placeholder='Your full name'
          className={inputClass('fullName')}
          aria-describedby={errors.fullName ? 'enq-name-err' : undefined}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p id='enq-name-err' className='text-red-500 text-xs mt-1'>{errors.fullName}</p>
        )}
      </div>

      {/* Email + Phone row */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='enq-email' className='block text-sm font-medium text-ec-ink mb-1.5'>
            Email <span className='text-red-400'>*</span>
          </label>
          <input
            id='enq-email'
            type='email'
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update('email', e.target.value)}
            placeholder='you@email.com'
            className={inputClass('email')}
            aria-describedby={errors.email ? 'enq-email-err' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id='enq-email-err' className='text-red-500 text-xs mt-1'>{errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor='enq-phone' className='block text-sm font-medium text-ec-ink mb-1.5'>
            Phone <span className='text-red-400'>*</span>
          </label>
          <input
            id='enq-phone'
            type='tel'
            value={form.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update('phone', e.target.value)}
            placeholder='10+ digits'
            className={inputClass('phone')}
            aria-describedby={errors.phone ? 'enq-phone-err' : undefined}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p id='enq-phone-err' className='text-red-500 text-xs mt-1'>{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Preferred contact time */}
      <div>
        <label htmlFor='enq-time' className='block text-sm font-medium text-ec-ink mb-1.5'>
          Preferred contact time <span className='text-ec-slate font-normal'>(optional)</span>
        </label>
        <select
          id='enq-time'
          value={form.preferredTime}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => update('preferredTime', e.target.value)}
          className={inputClass('preferredTime')}
        >
          <option value=''>Any time</option>
          <option value='morning'>Morning (9am – 12pm)</option>
          <option value='afternoon'>Afternoon (12pm – 5pm)</option>
          <option value='evening'>Evening (5pm – 8pm)</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor='enq-message' className='block text-sm font-medium text-ec-ink mb-1.5'>
          Message <span className='text-ec-slate font-normal'>(optional)</span>
        </label>
        <textarea
          id='enq-message'
          value={form.message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('message', e.target.value)}
          placeholder='Anything you&apos;d like us to know...'
          rows={3}
          className={`${inputClass('message')} resize-none`}
        />
      </div>

      {/* Consent */}
      <div className='flex items-start gap-3'>
        <input
          id='enq-consent'
          type='checkbox'
          checked={form.consent}
          onChange={(e: ChangeEvent<HTMLInputElement>) => update('consent', e.target.checked)}
          className='mt-1 w-4 h-4 rounded border-ec-border text-ec-indigo focus:ring-ec-indigo/20'
          aria-describedby={errors.consent ? 'enq-consent-err' : undefined}
          aria-invalid={!!errors.consent}
        />
        <label htmlFor='enq-consent' className='text-sm text-ec-slate leading-snug'>
          I agree to be contacted about this enquiry <span className='text-red-400'>*</span>
        </label>
      </div>
      {errors.consent && (
        <p id='enq-consent-err' className='text-red-500 text-xs -mt-2'>{errors.consent}</p>
      )}

      {/* Submit */}
      <Button type='submit' disabled={status === 'loading'} className='w-full'>
        {status === 'loading' ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            Submitting...
          </>
        ) : (
          <>
            <Send className='w-4 h-4 mr-2' />
            Submit Enquiry
          </>
        )}
      </Button>
    </form>
  );
}
