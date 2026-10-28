'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { Dumbbell, Phone, Mail, MapPin, Clock, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

function getSafeSocialUrl(platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube', url?: string): string {
  if (!url || typeof url !== 'string') {
    switch (platform) {
      case 'instagram': return 'https://www.instagram.com';
      case 'facebook': return 'https://www.facebook.com';
      case 'tiktok': return 'https://www.tiktok.com';
      case 'youtube': return 'https://www.youtube.com';
    }
  }

  let clean = url.trim();

  // Strip any leading '#' symbols completely (e.g. if pasted after old '#' placeholder)
  while (clean.startsWith('#')) {
    clean = clean.substring(1).trim();
  }

  if (!clean) {
    switch (platform) {
      case 'instagram': return 'https://www.instagram.com';
      case 'facebook': return 'https://www.facebook.com';
      case 'tiktok': return 'https://www.tiktok.com';
      case 'youtube': return 'https://www.youtube.com';
    }
  }

  // If already a valid web URL, return clean
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // If only handle or username was entered
  if (clean.startsWith('@')) clean = clean.substring(1);

  switch (platform) {
    case 'instagram': return `https://www.instagram.com/${clean}`;
    case 'facebook': return `https://www.facebook.com/${clean}`;
    case 'tiktok': return `https://www.tiktok.com/@${clean}`;
    case 'youtube': return `https://www.youtube.com/@${clean}`;
  }
}

export default function Footer() {
  const { settings, isRTL } = useGym();
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer id="contact" className="bg-gym-950 border-t border-white/10 pt-20 pb-12 text-gray-400 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black">
                <Dumbbell className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-wider text-xl text-white uppercase font-display leading-tight">
                GYM <span className="text-gym-lime">&</span> LENO
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {isRTL
                ? 'النادي الرياضي الأول في مصر المخصص للأبطال والباحثين عن تحول بدني حقيقي، بأحدث الأجهزة والمدربين المعتمدين دولياً.'
                : 'Egypt’s premier fitness destination built for champions and serious physical transformation.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                {
                  id: 'instagram' as const,
                  name: 'Instagram',
                  url: settings.social.instagram,
                  color: 'hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10',
                  icon: (
                    <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  ),
                },
                {
                  id: 'facebook' as const,
                  name: 'Facebook',
                  url: settings.social.facebook,
                  color: 'hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10',
                  icon: (
                    <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  ),
                },
                {
                  id: 'tiktok' as const,
                  name: 'TikTok',
                  url: settings.social.tiktok,
                  color: 'hover:text-[#00f2fe] hover:border-[#00f2fe]/50 hover:bg-[#00f2fe]/10',
                  icon: (
                    <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.05.86.15V9.42a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.28 8.28 0 0 0 4.77 1.48V7.08a4.84 4.84 0 0 1-1-.39z"/>
                    </svg>
                  ),
                },
                {
                  id: 'youtube' as const,
                  name: 'YouTube',
                  url: settings.social.youtube,
                  color: 'hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:bg-[#FF0000]/10',
                  icon: (
                    <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ),
                },
              ].map((s) => {
                const targetUrl = getSafeSocialUrl(s.id, s.url);
                return (
                  <a
                    key={s.name}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    aria-label={s.name}
                    className={`w-10 h-10 rounded-xl bg-gym-900 border border-white/10 text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-md ${s.color}`}
                  >
                    {s.icon}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-black font-display uppercase tracking-wider mb-4">
              {isRTL ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#home" className="hover:text-gym-lime transition-colors">
                  {isRTL ? 'الصفحة الرئيسية' : 'Home'}
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-gym-lime transition-colors">
                  {isRTL ? 'البرامج التدريبية' : 'Workout Programs'}
                </a>
              </li>
              <li>
                <a href="#trainers" className="hover:text-gym-lime transition-colors">
                  {isRTL ? 'المدربون المعتمدون' : 'Certified Coaches'}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-gym-lime transition-colors">
                  {isRTL ? 'باقات الاشتراك والأسعار' : 'Membership Plans'}
                </a>
              </li>
              <li>
                <a href="#track" className="hover:text-gym-lime transition-colors text-gym-lime font-bold">
                  {isRTL ? 'الاستعلام عن حالة الاشتراك والعضوية' : 'Track Membership Order'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Location */}
          <div>
            <h4 className="text-white text-sm font-black font-display uppercase tracking-wider mb-4">
              {isRTL ? 'بيانات التواصل' : 'Contact Us'}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <a
                  href={settings.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  {isRTL ? settings.addressAr : settings.addressEn}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gym-lime shrink-0" />
                <a href={`tel:${settings.primaryPhone}`} className="hover:text-white transition-colors font-mono">
                  {settings.primaryPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-green-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors text-green-400 font-bold"
                >
                  {isRTL ? 'محادثة مباشرة عبر واتساب' : 'Chat on WhatsApp'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gym-lime shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Working Hours */}
          <div>
            <h4 className="text-white text-sm font-black font-display uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gym-lime" />
              <span>{isRTL ? 'مواعيد العمل' : 'Opening Hours'}</span>
            </h4>
            <div className="space-y-3 text-xs sm:text-sm bg-gym-900/60 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="block font-bold text-white">
                  {isRTL ? 'السبت إلى الخميس' : 'Saturday – Thursday'}
                </span>
                <span className="text-gray-400">
                  {isRTL ? settings.workingHoursAr.weekdays : settings.workingHoursEn.weekdays}
                </span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="block font-bold text-white">
                  {isRTL ? 'يوم الجمعة' : 'Friday'}
                </span>
                <span className="text-gray-400">
                  {isRTL ? settings.workingHoursAr.friday : settings.workingHoursEn.friday}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & legal modals */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Gym & Leno. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-white transition-colors"
            >
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-white transition-colors"
            >
              {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </button>
          </div>
        </div>

      </div>

      {/* Privacy & Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-gym-950 border border-white/10 rounded-3xl p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white font-display uppercase mb-4">
              {modalType === 'privacy'
                ? (isRTL ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy & Data Policy')
                : (isRTL ? 'الشروط والأحكام وقواعد الجيم' : 'Terms & Conditions of Membership')}
            </h3>

            <div className="text-xs sm:text-sm text-gray-300 space-y-3 leading-relaxed">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    {isRTL
                      ? 'يلتزم جيم آند لينو بالحفاظ على سرية بيانات كافة الأعضاء والمشتركين، ولا تتم مشاركة أرقام الهواتف أو البيانات الشخصية مع أي طرف ثالث لأي أغراض دعائية.'
                      : 'Gym & Leno is fully committed to member privacy. We never sell, lease, or share personal phone numbers, emails, or fitness records with third parties.'}
                  </p>
                  <p>
                    {isRTL
                      ? 'تُستخدم بيانات الدفع وإشعارات التحويل البنكي أو المحافظ الإلكترونية حصراً لمطابقة المعاملات وتفعيل اشتراكك بأمان.'
                      : 'Payment proofs and transaction numbers are strictly used to verify membership activation against gym financial ledgers.'}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    {isRTL
                      ? '1. يرجى الالتزام بالزي الرياضي المناسب واستخدام المنشفة الخاصة بك في جميع صالات الأجهزة حفاظاً على النظافة العامة.'
                      : '1. Appropriate athletic attire and a personal gym towel are mandatory on the workout floor at all times.'}
                  </p>
                  <p>
                    {isRTL
                      ? '2. تجميد الاشتراك متاح للأعضاء وفقاً لمدد الباقات الرسمية، ويتم تقديمه من خلال خدمة العملاء قبل موعد السفر أو التوقف.'
                      : '2. Membership freezing is available per package guidelines and must be requested prior to departure.'}
                  </p>
                  <p>
                    {isRTL
                      ? '3. الدخول إلى صالات السيدات مقتصر بنسبة 100% على السيدات والمدربات المعتمدات.'
                      : '3. Ladies-only zones are strictly confidential and exclusive to female members and trainers.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
