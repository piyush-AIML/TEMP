'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { mainNavigation, megaProgrammes, audienceEntries, audiencePageHrefs } from '@/data/navigation';
import { pillarBgClass } from '@/lib/pillarStyles';
import { programmes } from '@/data/programmes';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

/**
 * Global navigation V2 (plan §9, Stage 3) — minimal fixed nav with a
 * programmes mega panel, scroll-aware backdrop, route-aware active states,
 * and an accessible mobile menu.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaBtnRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { openModal } = useEnquiryModal();

  useScrollLock(mobileOpen);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mega menu on route change.
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Outside click + Escape handling for the mega menu.
  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        megaBtnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [megaOpen]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const isActive = (href: string) => {
    if (href === '/programmes') return pathname.startsWith('/programmes');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out-soft',
        scrolled || mobileOpen
          ? 'bg-background/85 backdrop-blur-md border-b border-ec-border shadow-[0_2px_20px_rgba(30,42,120,0.06)]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav
        className={cn(
          'container-site flex items-center justify-between transition-all duration-300 ease-out-soft',
          scrolled ? 'h-14 md:h-16' : 'h-16 md:h-20'
        )}
        aria-label='Main navigation'
      >
        {/* Logo — light mode uses logo.png, dark mode swaps to logo-dark.png via CSS */}
        <Link href='/' className='flex items-center' aria-label='Educraft Home'>
          <Image
            src='/logo.png'
            alt='Educraft'
            width={2135}
            height={736}
            priority
            className='h-11 md:h-14 w-auto dark:hidden'
          />
          <Image
            src='/logo-dark.png'
            alt='Educraft'
            width={2172}
            height={724}
            className='hidden h-11 md:h-14 w-auto dark:block'
          />
        </Link>

        {/* Desktop nav */}
        <div className='hidden md:flex items-center gap-8'>
          {mainNavigation.map((item) => {
            if (item.mega) {
              const active = isActive(item.href);
              return (
                <div
                  key={item.label}
                  ref={megaRef}
                  className='relative'
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button
                    ref={megaBtnRef}
                    onClick={() => setMegaOpen((o) => !o)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setMegaOpen((o) => !o);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium transition-colors py-2',
                      active || megaOpen
                        ? 'text-ec-teal'
                        : 'text-ec-ink hover:text-ec-teal'
                    )}
                    aria-expanded={megaOpen}
                    aria-controls='programmes-mega-menu'
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('w-4 h-4 transition-transform duration-150', megaOpen && 'rotate-180')}
                      aria-hidden='true'
                    />
                  </button>

                  {megaOpen && (
                    <div
                      id='programmes-mega-menu'
                      className='absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(720px,calc(100vw-48px))] card-surface shadow-[0_16px_48px_rgba(14,19,48,0.14)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'
                    >
                      <div className='grid grid-cols-[1fr_240px]'>
                        {/* Programme links */}
                        <ul className='p-3 space-y-1' aria-label='Programmes'>
                          {megaProgrammes.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={p.href}
                                className='group/item flex items-start gap-4 rounded-2xl px-4 py-3 hover:bg-ec-sky dark:hover:bg-ec-canvas-deep transition-colors'
                              >
                                <span
                                  className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${pillarBgClass[programmes.find((pr) => pr.slug === p.slug)!.pillarId]}`}
                                  aria-hidden='true'
                                />
                                <span className='flex-1 min-w-0'>
                                  <span className='block text-xs font-semibold uppercase tracking-[0.08em] text-ec-gold-dark dark:text-ec-gold'>
                                    {p.pillar}
                                  </span>
                                  <span className='block text-sm font-semibold text-ec-ink mt-0.5'>
                                    {p.name}
                                  </span>
                                  <span className='block text-xs text-ec-slate leading-relaxed mt-1'>
                                    {p.short}
                                  </span>
                                </span>
                                <ArrowRight
                                  className='w-4 h-4 text-ec-slate mt-1 group-hover/item:text-ec-teal group-hover/item:translate-x-1 transition-all flex-shrink-0'
                                  aria-hidden='true'
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* Mini ecosystem map + audience links */}
                        <div className='border-l border-ec-border bg-ec-canvas-soft dark:bg-ec-canvas-deep p-5 flex flex-col gap-5'>
                          <MegaMenuMap />
                          <div>
                            <p className='type-caption uppercase tracking-[0.08em] text-ec-slate mb-2'>
                              Who are you?
                            </p>
                            <ul className='space-y-1'>
                              {audienceEntries.map((a) => (
                                <li key={a.slug}>
                                  <Link
                                    href={audiencePageHrefs[a.slug]}
                                    className='text-sm font-medium text-ec-ink hover:text-ec-teal transition-colors'
                                  >
                                    {a.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors py-2',
                  active ? 'text-ec-teal' : 'text-ec-ink hover:text-ec-teal'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <ThemeToggleButton mounted={mounted} theme={theme} onToggle={toggleTheme} />
          {/* Dashboard entry — /dashboard dispatches by role when signed in and
              lands signed-out visitors on the Clerk sign-in page (proxy.ts). */}
          <Link href='/dashboard' className='text-sm font-medium transition-colors py-2 text-ec-ink hover:text-ec-teal'>
            Sign in
          </Link>
          <Button size='sm' onClick={() => openModal()}>
            Enquire
          </Button>
        </div>

        {/* Mobile controls */}
        <div className='md:hidden flex items-center gap-1'>
          <ThemeToggleButton mounted={mounted} theme={theme} onToggle={toggleTheme} />
          <button
            className='p-2 text-ec-indigo dark:text-white rounded-xl'
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='md:hidden fixed inset-x-0 top-14 bottom-0 bg-background z-40 overflow-y-auto border-t border-ec-border'>
          <div className='px-6 py-6 space-y-2'>
            {mainNavigation.map((item) =>
              item.mega ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className='block px-4 py-3 rounded-xl text-ec-ink font-semibold hover:bg-ec-sky transition-colors'
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className='block px-4 py-3 rounded-xl text-ec-ink font-semibold hover:bg-ec-sky transition-colors'
                >
                  {item.label}
                </Link>
              )
            )}

            <p className='px-4 pt-4 pb-1 type-caption uppercase tracking-[0.08em] text-ec-slate'>
              Programmes
            </p>
            {megaProgrammes.map((p) => (
              <Link
                key={p.slug}
                href={p.href}
                className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ec-sky transition-colors'
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${pillarBgClass[programmes.find((pr) => pr.slug === p.slug)!.pillarId]}`}
                  aria-hidden='true'
                />
                <span className='text-sm font-medium text-ec-ink'>{p.name}</span>
              </Link>
            ))}

            <p className='px-4 pt-4 pb-1 type-caption uppercase tracking-[0.08em] text-ec-slate'>
              Audiences
            </p>
            {audienceEntries.map((a) => (
              <Link
                key={a.slug}
                href={audiencePageHrefs[a.slug]}
                className='block px-4 py-3 rounded-xl text-ec-ink font-medium hover:bg-ec-sky transition-colors'
              >
                {a.label}
              </Link>
            ))}

            <Link
              href='/dashboard'
              className='block px-4 py-3 mt-2 rounded-xl text-ec-ink font-semibold hover:bg-ec-sky transition-colors'
            >
              Sign in
            </Link>

            <div className='pt-3'>
              <Button
                className='w-full'
                onClick={() => {
                  setMobileOpen(false);
                  openModal();
                }}
              >
                Enquire
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/** Mini five-node ecosystem map for the mega panel (plan §9 visual strip). */
function MegaMenuMap() {
  const nodes = [
    { x: 60, y: 14, fill: 'var(--ec-p-learn)' },
    { x: 102, y: 38, fill: 'var(--ec-p-include)' },
    { x: 86, y: 76, fill: 'var(--ec-p-thrive)' },
    { x: 34, y: 76, fill: 'var(--ec-p-achieve)' },
    { x: 18, y: 38, fill: 'var(--ec-p-excel)' },
  ];
  return (
    <div>
      <p className='type-caption uppercase tracking-[0.08em] text-ec-slate mb-2'>
        One ecosystem
      </p>
      <svg viewBox='0 0 120 90' className='w-full max-w-[200px]' aria-hidden='true'>
        <circle cx='60' cy='45' r='30' fill='none' stroke='var(--ec-border)' strokeWidth='1' strokeDasharray='3 3' />
        <circle cx='60' cy='45' r='8' fill='none' stroke='var(--ec-teal)' strokeWidth='1' />
        <circle cx='60' cy='45' r='3' fill='var(--ec-teal)' />
        {nodes.map((n, i) => (
          <g key={i}>
            <line x1='60' y1='45' x2={n.x} y2={n.y} stroke='var(--ec-border)' strokeWidth='1' />
            <circle cx={n.x} cy={n.y} r='4.5' fill={n.fill} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function ThemeToggleButton({
  mounted,
  theme,
  onToggle,
}: {
  mounted: boolean;
  theme?: string;
  onToggle: () => void;
}) {
  // Gated on `mounted` so SSR and the first client render agree
  // (next-themes resolves the stored theme only after mount).
  const label = !mounted ? 'Toggle theme' : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      onClick={onToggle}
      className='p-2 rounded-xl text-ec-ink hover:bg-ec-sky dark:hover:bg-ec-canvas-deep transition-colors'
      aria-label={label}
      title={label}
    >
      {mounted && theme === 'dark' ? (
        <Sun className='w-5 h-5' />
      ) : (
        <Moon className='w-5 h-5' />
      )}
    </button>
  );
}
