import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import Navbar from '@/components/educraft/layout/Navbar';
import Footer from '@/components/educraft/layout/Footer';
import SkipLink from '@/components/educraft/layout/SkipLink';
import EnquiryModal from '@/components/educraft/enquiry/EnquiryModal';
import FloatingEnquiryButton from '@/components/educraft/ui/FloatingEnquiryButton';
import CursorProvider from '@/components/educraft/motion/CursorProvider';

/**
 * Site shell (Stage 3) — every marketing page gets the global frame:
 * skip link, navigation, footer, the enquiry system, and the desktop
 * cursor enhancement (auto-disabled on touch / reduced motion).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnquiryModalProvider>
      <CursorProvider>
        <div className='min-h-screen flex flex-col'>
          <SkipLink />
          <Navbar />
          <main id='main-content' className='flex-1'>
            {children}
          </main>
          <Footer />
          <EnquiryModal />
          <FloatingEnquiryButton />
        </div>
      </CursorProvider>
    </EnquiryModalProvider>
  );
}
