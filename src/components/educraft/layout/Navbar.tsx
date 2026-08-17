'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, ChevronDown, GraduationCap } from 'lucide-react';
import { courses } from '@/data/courses';
import Button from '../ui/Button';

interface NavbarProps {
  onEnquire: () => void;
}

export default function Navbar({ onEnquire }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown();
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [dropdownOpen, closeDropdown]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Courses', href: '#courses', hasDropdown: true },
    { label: 'About', href: '#pillars' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(30,42,120,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <nav className='max-w-[1200px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between'>
        {/* Logo */}
        <a href='#hero' className='flex items-center gap-2 group' aria-label='Educraft Home'>
          <div className='w-9 h-9 rounded-xl bg-ec-indigo flex items-center justify-center group-hover:bg-ec-indigo-light transition-colors'>
            <GraduationCap className='w-5 h-5 text-white' />
          </div>
          <span className='font-[family-name:var(--font-sora)] font-bold text-xl text-ec-indigo'>
            Edu<span className='text-ec-teal'>craft</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className='hidden md:flex items-center gap-8'>
          {navLinks.map((link) =>
            link.hasDropdown ? (
              <div key={link.label} ref={dropdownRef} className='relative'>
                <button
                  ref={dropdownBtnRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDropdownOpen(!dropdownOpen);
                    }
                  }}
                  className='flex items-center gap-1 text-ec-ink hover:text-ec-teal transition-colors font-medium text-sm'
                  aria-expanded={dropdownOpen}
                  aria-haspopup='true'
                >
                  {link.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div
                    className='absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgba(30,42,120,0.12)] border border-ec-border py-2 animate-in fade-in slide-in-from-top-2 duration-200'
                    role='menu'
                  >
                    {courses.map((course) => {
                      const Icon = course.icon;
                      return (
                        <a
                          key={course.slug}
                          href={`#courses`}
                          onClick={closeDropdown}
                          className='flex items-center gap-3 px-4 py-3 hover:bg-ec-sky transition-colors'
                          role='menuitem'
                        >
                          <div className='w-9 h-9 rounded-xl bg-ec-sky flex items-center justify-center flex-shrink-0'>
                            <Icon className='w-4 h-4 text-ec-teal' />
                          </div>
                          <div>
                            <div className='text-sm font-medium text-ec-ink'>{course.name}</div>
                            <div className='text-xs text-ec-slate'>{course.pillar}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className='text-ec-ink hover:text-ec-teal transition-colors font-medium text-sm'
              >
                {link.label}
              </a>
            )
          )}
          <Button size='sm' onClick={onEnquire}>
            Enquire Now
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className='md:hidden p-2 text-ec-indigo'
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className='md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto'>
          <div className='px-6 py-6 space-y-1'>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className='block px-4 py-3 rounded-xl text-ec-ink font-medium hover:bg-ec-sky transition-colors'
              >
                {link.label}
              </a>
            ))}
            <div className='pt-2'>
              <p className='px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-ec-slate'>
                Our Courses
              </p>
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <a
                    key={course.slug}
                    href={`#courses`}
                    onClick={() => setMobileOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ec-sky transition-colors'
                  >
                    <Icon className='w-4 h-4 text-ec-teal' />
                    <span className='text-sm font-medium text-ec-ink'>{course.name}</span>
                  </a>
                );
              })}
            </div>
            <div className='pt-4'>
              <Button className='w-full' onClick={() => { setMobileOpen(false); onEnquire(); }}>
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
