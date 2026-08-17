'use client';

import { MessageCircle } from 'lucide-react';
import { useEnquiryModal } from '@/context/EnquiryModalContext';

export default function FloatingEnquiryButton() {
  const { openModal } = useEnquiryModal();

  return (
    <button
      onClick={() => openModal()}
      className='fixed bottom-6 right-6 z-[80] w-14 h-14 bg-ec-gold rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(244,185,66,0.4)] hover:scale-110 hover:shadow-[0_6px_30px_rgba(244,185,66,0.5)] transition-all duration-200 group'
      aria-label='Enquire Now'
    >
      <MessageCircle className='w-6 h-6 text-ec-indigo-dark group-hover:scale-110 transition-transform' />
    </button>
  );
}
