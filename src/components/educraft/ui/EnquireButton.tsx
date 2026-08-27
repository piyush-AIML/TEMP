'use client';

import { useEnquiryModal } from '@/context/EnquiryModalContext';
import Button, { type ButtonSize, type ButtonVariant } from './Button';

interface EnquireButtonProps {
  /** Lock the enquiry form to a programme. */
  slug?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Small client wrapper so server components can open the enquiry modal.
 */
export default function EnquireButton({
  slug,
  variant = 'primary',
  size = 'md',
  className,
  children = 'Enquire',
}: EnquireButtonProps) {
  const { openModal } = useEnquiryModal();
  return (
    <Button variant={variant} size={size} className={className} onClick={() => openModal(slug)}>
      {children}
    </Button>
  );
}
