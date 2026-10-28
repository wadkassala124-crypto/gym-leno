'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGym } from '@/context/GymContext';
import { Dumbbell, Menu, X, Shield, Globe, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { lang, setLang, isRTL, openBookingModal } = useGym();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if current user is logged in as Admin
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  // Secret keyboard shortcut for Yassin: Alt + A or Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش'))
      ) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Secret Logo 3-click trigger
  const handleLogoClick = (e: React.MouseEvent) => {
    const next = logoClickCount + 1;
    if (next >= 3) {
      e.preventDefault();
      setLogoClickCount(0);
      router.push('/admin');
    } else {
      setLogoClickCount(next);
      setTimeout(() => setLogoClickCount(0), 1500);
    }
  };

  const navLinks = [
    { href: '#home', labelEn: 'Home', labelAr: 'الرئيسية' },
    { href: '#programs', labelEn: 'Programs', labelAr: 'البرامج التدريبية' },
    { href: '#trainers', labelEn: 'Trainers', labelAr: 'المدربون' },
    { href: '#pricing', labelEn: 'Memberships', labelAr: 'الاشتراكات والأسعار' },
    { href: '#track', labelEn: 'Check Status', labelAr: 'استعلام عن الاشتراك' },
    { href: '#contact', labelEn: 'Contact', labelAr: 'تواصل معنا' },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gym-950/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with secret triple-tap for admin */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 sm:gap-3 group select-none min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black shadow-lg shadow-gym-lime/20 group-hover:scale-105 transition-transform shrink-0">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-wider text-base sm:text-xl text-white uppercase font-display leading-tight flex items-center gap-1 truncate">
                GYM <span className="text-gym-lime">&</span> LENO
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-gray-400 uppercase font-semibold truncate">
                {isRTL ? 'نادي اللياقة الفاخر' : 'Elite Athletic Club'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-300 hover:text-gym-lime transition-colors tracking-wide"
              >
                {isRTL ? link.labelAr : link.labelEn}
              </a>
            ))}
          </nav>

          {/* Actions: Lang toggle, Secret Admin (if logged in), CTA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:border-gym-lime transition-all"
              title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-gym-lime" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Admin Dashboard Link - Only visible when Yassin is logged in */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gym-lime/15 hover:bg-gym-lime/25 text-xs font-black text-gym-lime transition-all border border-gym-lime/40 shadow-sm shadow-gym-lime/10 animate-fade-in"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isRTL ? 'لوحة الإدارة' : 'Admin'}</span>
              </Link>
            )}

            {/* CTA Button */}
            <button
              onClick={() => openBookingModal()}
              className="flex items-center gap-2 bg-gym-lime hover:bg-gym-accent-hover text-black px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/25 hover:shadow-gym-lime/40 hover:-translate-y-0.5"
            >
              <span>{isRTL ? 'احجز الآن' : 'Join Now'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1.5 text-xs font-black text-gym-lime border border-white/10 hover:border-gym-lime/40 rounded-lg transition-colors"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7 text-gym-lime" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gym-950/98 backdrop-blur-2xl border-b border-white/10 px-5 sm:px-6 py-6 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-gray-200 hover:text-gym-lime transition-colors py-2.5 border-b border-white/5 flex items-center justify-between"
              >
                <span>{isRTL ? link.labelAr : link.labelEn}</span>
                <ArrowIcon className="w-4 h-4 text-gym-lime/60" />
              </a>
            ))}

            <div className="flex flex-col gap-3 pt-3">
              {/* Only visible in mobile menu if logged in */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-gym-lime/15 text-gym-lime py-3 rounded-xl text-sm font-bold border border-gym-lime/40"
                >
                  <Shield className="w-4 h-4 text-gym-lime" />
                  <span>{isRTL ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}</span>
                </Link>
              )}
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gym-lime text-black py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-gym-lime/25"
              >
                <span>{isRTL ? 'ابدأ رحلتك واحجز الآن' : 'Start Journey & Join Now'}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
