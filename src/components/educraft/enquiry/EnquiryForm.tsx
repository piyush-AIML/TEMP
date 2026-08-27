'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react';
import { programmes, getProgrammeBySlug } from '@/data/programmes';
import {
  stepAboutYouSchema,
  stepLookingForSchema,
  stepContactPreferencesSchema,
  enquirySchema,
  flattenZodErrors,
  enquiryRoles,
  type EnquiryRole,
  type StepErrors,
} from '@/lib/validation';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

const STEPS = ['About you', 'What you are looking for', 'Contact preferences'] as const;

interface EnquiryFormProps {
  mode: 'general' | 'locked';
  courseSlug?: string;
  /** Renders without the modal chrome context (contact page). */
  inline?: boolean;
}

interface FormState {
  role: '' | EnquiryRole;
  fullName: string;
  email: string;
  phone: string;
  programmeSlug: string;
  contactTime: string;
  message: string;
  consent: boolean;
}

const INITIAL_FORM: FormState = {
  role: '',
  fullName: '',
  email: '',
  phone: '',
  programmeSlug: '',
  contactTime: '',
  message: '',
  consent: false,
};

const ROLE_LABELS: Record<EnquiryRole, string> = {
  parent: 'Parent or family member',
  student: 'Student',
  school: 'School leader or institution',
  partner: 'Partner or organisation',
  other: 'Something else',
};

/**
 * Staged enquiry flow (plan §30, §32) — three short steps with inline
 * validation, autocomplete, accessible announcements, and real POST to
 * /api/enquiry. Server errors, retry, and success states are all real.
 */
export default function EnquiryForm({ mode, courseSlug, inline = false }: EnquiryFormProps) {
  const lockedCourse = courseSlug ? getProgrammeBySlug(courseSlug) : null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    programmeSlug: courseSlug ?? '',
  });
  const [errors, setErrors] = useState<StepErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const announcementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Announce step changes to assistive tech.
  useEffect(() => {
    setAnnouncement(`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`);
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    announcementTimer.current = setTimeout(() => setAnnouncement(''), 1500);
    stepHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    return () => {
      if (announcementTimer.current) clearTimeout(announcementTimer.current);
    };
  }, []);

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const result = stepAboutYouSchema.safeParse(form);
      const stepErrors = flattenZodErrors(result);
      setErrors(stepErrors);
      return result.success;
    }
    if (s === 1) {
      const result = stepLookingForSchema.safeParse({
        programmeSlug: form.programmeSlug,
        contactTime: form.contactTime,
        message: form.message,
      });
      const stepErrors = flattenZodErrors(result);
      setErrors(stepErrors);
      return result.success;
    }
    const result = stepContactPreferencesSchema.safeParse({ consent: form.consent });
    const stepErrors = flattenZodErrors(result);
    setErrors(stepErrors);
    return result.success;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setStatus('loading');
    setServerError(null);

    const payload = {
      role: form.role,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      programmeSlug: form.programmeSlug,
      contactTime: form.contactTime || '',
      message: form.message || '',
      consent: form.consent,
      website: '', // honeypot
    };

    const validation = enquirySchema.safeParse(payload);
    if (!validation.success) {
      setErrors(flattenZodErrors(validation));
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(
          data.error === 'Too many requests. Please try again in 10s.'
            ? 'You have sent several enquiries recently — please wait a few minutes and try again.'
            : 'Something went wrong while sending your enquiry. Please try again.'
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      setAnnouncement('Enquiry sent successfully.');
    } catch {
      setServerError('Network problem — please check your connection and try again.');
      setStatus('error');
    }
  };

  /* ------------------------------------------------------------ success */
  if (status === 'success') {
    return (
      <div className='text-center py-8' role='status'>
        <CheckCircle2 className='w-14 h-14 text-ec-teal mx-auto mb-5' aria-hidden='true' />
        <h3 className='type-heading-m text-ec-indigo dark:text-white'>Thank you{form.fullName ? `, ${form.fullName.split(' ')[0]}` : ''}!</h3>
        <p className='type-body-s text-ec-slate mt-2 max-w-sm mx-auto'>
          Your enquiry has been received. The right team will be in touch within 1
          business day{form.email ? ` at ${form.email}` : ''}.
        </p>
        {inline && (
          <button
            onClick={() => {
              setForm({ ...INITIAL_FORM, programmeSlug: courseSlug ?? '' });
              setStep(0);
              setStatus('idle');
            }}
            className='mt-6 font-[family-name:var(--font-manrope)] font-semibold text-ec-teal-dark dark:text-ec-teal hover:opacity-80 transition-opacity'
          >
            Send another enquiry
          </button>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------ input classes */
  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-2xl border ${errors[field] ? 'border-ec-error' : 'border-ec-border'} bg-card text-ec-ink font-[family-name:var(--font-manrope)] text-sm placeholder:text-ec-slate/60 focus:outline-none focus:ring-2 focus:ring-ec-indigo/20 focus:border-ec-indigo transition-colors`;

  const errorText = (field: string) =>
    errors[field] ? (
      <p id={`enq-${field}-err`} className='text-ec-error text-xs mt-1.5'>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-5'>
      {/* Screen-reader announcements */}
      <p aria-live='polite' className='sr-only'>
        {announcement}
      </p>

      {/* Progress */}
      <ol className='flex items-center gap-2 mb-6' aria-label='Enquiry progress'>
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn('flex-1 h-1 rounded-full transition-colors duration-200', i <= step ? 'bg-ec-teal' : 'bg-ec-border')}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className='sr-only'>
              {label} {i <= step ? '(complete)' : ''}
            </span>
          </li>
        ))}
      </ol>

      <h3 ref={stepHeadingRef} tabIndex={-1} className='sr-only outline-none'>
        {STEPS[step]}
      </h3>

      {/* Locked course display */}
      {mode === 'locked' && lockedCourse && step === 1 && (
        <div className='bg-ec-sky dark:bg-ec-canvas-deep rounded-2xl px-4 py-3 type-body-s text-ec-indigo dark:text-white font-medium'>
          Enquiring about: <strong>{lockedCourse.name}</strong>
        </div>
      )}

      {/* ------------------------------------------------ Step 0: About you */}
      {step === 0 && (
        <div className='space-y-4'>
          <div>
            <label htmlFor='enq-role' className='block text-sm font-medium text-ec-ink mb-1.5'>
              I am a <span className='text-ec-error'>*</span>
            </label>
            <select
              id='enq-role'
              value={form.role}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update('role', e.target.value)}
              className={inputClass('role')}
              autoComplete='off'
              aria-describedby={errors.role ? 'enq-role-err' : undefined}
              aria-invalid={!!errors.role}
            >
              <option value=''>Select who you are</option>
              {enquiryRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            {errorText('role')}
          </div>

          <div>
            <label htmlFor='enq-name' className='block text-sm font-medium text-ec-ink mb-1.5'>
              Full name <span className='text-ec-error'>*</span>
            </label>
            <input
              id='enq-name'
              type='text'
              autoComplete='name'
              value={form.fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update('fullName', e.target.value)}
              placeholder='Your full name'
              className={inputClass('fullName')}
              aria-describedby={errors.fullName ? 'enq-fullName-err' : undefined}
              aria-invalid={!!errors.fullName}
            />
            {errorText('fullName')}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='enq-email' className='block text-sm font-medium text-ec-ink mb-1.5'>
                Email <span className='text-ec-error'>*</span>
              </label>
              <input
                id='enq-email'
                type='email'
                autoComplete='email'
                value={form.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => update('email', e.target.value)}
                placeholder='you@email.com'
                className={inputClass('email')}
                aria-describedby={errors.email ? 'enq-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              {errorText('email')}
            </div>
            <div>
              <label htmlFor='enq-phone' className='block text-sm font-medium text-ec-ink mb-1.5'>
                Phone <span className='text-ec-error'>*</span>
              </label>
              <input
                id='enq-phone'
                type='tel'
                autoComplete='tel'
                value={form.phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => update('phone', e.target.value)}
                placeholder='+91 …'
                className={inputClass('phone')}
                aria-describedby={errors.phone ? 'enq-phone-err' : undefined}
                aria-invalid={!!errors.phone}
              />
              {errorText('phone')}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- Step 1: What you are looking for */}
      {step === 1 && (
        <div className='space-y-4'>
          {mode === 'general' && (
            <div>
              <label htmlFor='enq-course' className='block text-sm font-medium text-ec-ink mb-1.5'>
                Which programme are you interested in? <span className='text-ec-error'>*</span>
              </label>
              <select
                id='enq-course'
                value={form.programmeSlug}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => update('programmeSlug', e.target.value)}
                className={inputClass('programmeSlug')}
                autoComplete='off'
                aria-describedby={errors.programmeSlug ? 'enq-programmeSlug-err' : undefined}
                aria-invalid={!!errors.programmeSlug}
              >
                <option value=''>Select a programme</option>
                {programmes.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
                <option value='general'>Not sure yet — general enquiry</option>
              </select>
              {errorText('programmeSlug')}
            </div>
          )}

          <div>
            <label htmlFor='enq-time' className='block text-sm font-medium text-ec-ink mb-1.5'>
              Preferred contact time <span className='text-ec-slate font-normal'>(optional)</span>
            </label>
            <select
              id='enq-time'
              value={form.contactTime}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update('contactTime', e.target.value)}
              className={inputClass('contactTime')}
              autoComplete='off'
            >
              <option value=''>Any time</option>
              <option value='morning'>Morning (9am – 12pm)</option>
              <option value='afternoon'>Afternoon (12pm – 5pm)</option>
              <option value='evening'>Evening (5pm – 8pm)</option>
            </select>
          </div>

          <div>
            <label htmlFor='enq-message' className='block text-sm font-medium text-ec-ink mb-1.5'>
              Message <span className='text-ec-slate font-normal'>(optional)</span>
            </label>
            <textarea
              id='enq-message'
              value={form.message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update('message', e.target.value)}
              placeholder='Anything you would like us to know…'
              rows={3}
              className={cn(inputClass('message'), 'resize-none')}
              aria-describedby={errors.message ? 'enq-message-err' : undefined}
              aria-invalid={!!errors.message}
            />
            {errorText('message')}
          </div>
        </div>
      )}

      {/* --------------------------- Step 2: Contact preferences + review */}
      {step === 2 && (
        <div className='space-y-5'>
          <div className='bg-ec-canvas-soft dark:bg-ec-canvas-deep rounded-2xl p-5 space-y-3'>
            <h4 className='type-caption uppercase tracking-[0.08em] font-semibold text-ec-slate'>
              Review your enquiry
            </h4>
            <dl className='space-y-2 type-body-s'>
              <div className='flex justify-between gap-4'>
                <dt className='text-ec-slate'>Name</dt>
                <dd className='font-medium text-ec-ink text-right'>{form.fullName}</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-ec-slate'>Contact</dt>
                <dd className='font-medium text-ec-ink text-right'>
                  {form.email} · {form.phone}
                </dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-ec-slate'>Programme</dt>
                <dd className='font-medium text-ec-ink text-right'>
                  {lockedCourse
                    ? lockedCourse.name
                    : form.programmeSlug === 'general'
                      ? 'General enquiry'
                      : (getProgrammeBySlug(form.programmeSlug)?.name ?? '—')}
                </dd>
              </div>
              {form.contactTime && (
                <div className='flex justify-between gap-4'>
                  <dt className='text-ec-slate'>Best time</dt>
                  <dd className='font-medium text-ec-ink text-right'>
                    {form.contactTime === 'morning'
                      ? 'Morning'
                      : form.contactTime === 'afternoon'
                        ? 'Afternoon'
                        : 'Evening'}
                  </dd>
                </div>
              )}
              {form.message && (
                <div>
                  <dt className='text-ec-slate mb-1'>Message</dt>
                  <dd className='font-medium text-ec-ink'>{form.message}</dd>
                </div>
              )}
            </dl>
          </div>

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
            <label htmlFor='enq-consent' className='type-body-s text-ec-slate leading-snug'>
              I agree to be contacted about this enquiry and understand my details are
              used only for that purpose. <span className='text-ec-error'>*</span>
            </label>
          </div>
          {errorText('consent')}
        </div>
      )}

      {/* Honeypot — visually hidden from humans, irresistible to bots */}
      <div className='sr-only' aria-hidden='true'>
        <label htmlFor='enq-website'>Website</label>
        <input
          id='enq-website'
          type='text'
          name='website'
          tabIndex={-1}
          autoComplete='off'
          defaultValue=''
        />
      </div>

      {/* Server error */}
      {serverError && (
        <p role='alert' className='rounded-2xl bg-ec-error/10 border border-ec-error/30 px-4 py-3 type-body-s text-ec-error'>
          {serverError}
        </p>
      )}

      {/* Navigation */}
      <div className='flex items-center justify-between gap-3 pt-2'>
        {step > 0 ? (
          <button
            type='button'
            onClick={back}
            className='inline-flex items-center gap-1.5 font-[family-name:var(--font-manrope)] font-semibold text-sm text-ec-slate hover:text-ec-ink dark:hover:text-white transition-colors px-3 py-2'
          >
            <ArrowLeft className='w-4 h-4' aria-hidden='true' />
            Back
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <Button type='button' onClick={next} className='group'>
            Continue
            <ArrowRight className='w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5' aria-hidden='true' />
          </Button>
        ) : (
          <Button type='submit' loading={status === 'loading'}>
            {status === 'loading' ? (
              'Sending…'
            ) : (
              <>
                <Send className='w-4 h-4' aria-hidden='true' />
                Send Enquiry
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
