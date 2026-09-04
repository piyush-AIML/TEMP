import Image from 'next/image';
import { ClerkProvider } from '@clerk/nextjs';
import SkipLink from '@/components/educraft/layout/SkipLink';

/**
 * Auth shell (Dashboard Stage 0-C) — centered brand lockup + Clerk card.
 * Theming (fonts, light/dark classes, ThemeProvider) comes from the root
 * layout; this group deliberately does NOT include the marketing Navbar/Footer.
 * Clerk UI itself keeps its own appearance in Stage 0 — visual polish is QA'd
 * later once real keys are in.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <div className='min-h-dvh flex flex-col items-center justify-center gap-10 px-4 py-16 bg-background text-foreground'>
        <SkipLink />
        <a href='/' aria-label='Educraft — back to homepage' className='flex justify-center'>
          <Image
            src='/logo.png'
            alt=''
            width={240}
            height={82}
            priority
            className='h-11 w-auto dark:hidden'
          />
          <Image
            src='/logo-dark.png'
            alt=''
            width={240}
            height={82}
            priority
            className='hidden h-11 w-auto dark:block'
          />
        </a>
        <main id='main-content'>{children}</main>
      </div>
    </ClerkProvider>
  );
}
