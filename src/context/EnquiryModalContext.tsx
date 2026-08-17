'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type EnquiryModalContextType = {
  openModal: (lockedCourseSlug?: string) => void;
  closeModal: () => void;
  isOpen: boolean;
  lockedCourseSlug: string | null;
};

const EnquiryModalContext = createContext<EnquiryModalContextType | null>(null);

export function EnquiryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lockedCourseSlug, setLockedCourseSlug] = useState<string | null>(null);

  const openModal = useCallback((slug?: string) => {
    setLockedCourseSlug(slug ?? null);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setLockedCourseSlug(null);
    document.body.style.overflow = '';
  }, []);

  return (
    <EnquiryModalContext.Provider value={{ openModal, closeModal, isOpen, lockedCourseSlug }}>
      {children}
    </EnquiryModalContext.Provider>
  );
}

export function useEnquiryModal() {
  const ctx = useContext(EnquiryModalContext);
  if (!ctx) throw new Error('useEnquiryModal must be used within EnquiryModalProvider');
  return ctx;
}
