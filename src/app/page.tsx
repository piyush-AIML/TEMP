'use client';

import { EnquiryModalProvider, useEnquiryModal } from '@/context/EnquiryModalContext';
import Navbar from '@/components/educraft/layout/Navbar';
import Footer from '@/components/educraft/layout/Footer';
import Hero from '@/components/educraft/landing/Hero';
import TrustStrip from '@/components/educraft/landing/TrustStrip';
import PillarsSection from '@/components/educraft/landing/PillarsSection';
import CoursesOverview from '@/components/educraft/landing/CoursesOverview';
import FinalCTA from '@/components/educraft/landing/FinalCTA';
import EnquiryModal from '@/components/educraft/enquiry/EnquiryModal';
import FloatingEnquiryButton from '@/components/educraft/ui/FloatingEnquiryButton';

function AppContent() {
  const { openModal } = useEnquiryModal();
  return (
    <div className='min-h-screen flex flex-col font-[family-name:var(--font-manrope)]'>
      <Navbar onEnquire={() => openModal()} />
      <main className='flex-1'>
        <Hero />
        <TrustStrip />
        <PillarsSection />
        <CoursesOverview />
        <FinalCTA />
      </main>
      <Footer />
      <EnquiryModal />
      <FloatingEnquiryButton />
    </div>
  );
}

export default function Home() {
  return (
    <EnquiryModalProvider>
      <AppContent />
    </EnquiryModalProvider>
  );
}
