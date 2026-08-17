'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import EnquiryForm from './EnquiryForm';

export default function EnquiryModal() {
  const { isOpen, closeModal, lockedCourseSlug } = useEnquiryModal();
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save & restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeBtnRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeModal]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) closeModal();
    },
    [closeModal]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ec-indigo/40 backdrop-blur-sm animate-in fade-in duration-200'
      role='dialog'
      aria-modal='true'
      aria-label='Enquiry form'
    >
      <div
        ref={modalRef}
        className='bg-card rounded-3xl shadow-[0_8px_30px_rgba(30,42,120,0.08)] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='font-[family-name:var(--font-sora)] font-bold text-xl text-ec-indigo dark:text-white'>
              {lockedCourseSlug ? 'Course Enquiry' : 'Get in Touch'}
            </h2>
            <p className='text-ec-slate text-sm mt-1'>
              {lockedCourseSlug
                ? 'Fill in your details and we\'ll reach out.'
                : 'Tell us what you\'re looking for and we\'ll connect you with the right team.'}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeModal}
            className='p-2 rounded-xl hover:bg-ec-sky transition-colors text-ec-slate hover:text-ec-indigo dark:hover:text-white'
            aria-label='Close enquiry form'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <EnquiryForm mode={lockedCourseSlug ? 'locked' : 'general'} courseSlug={lockedCourseSlug || undefined} />
      </div>
    </div>
  );
}
