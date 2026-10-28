'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Smartphone,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

function calculateDaysRemaining(endDateStr?: string): number | null {
  if (!endDateStr || endDateStr === '—') return null;
  try {
    const end = new Date(endDateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (isNaN(end.getTime())) return null;
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export default function TrackSection() {
  const { isRTL, plans = [], trainers = [] } = useGym();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const performSearch = async (searchTerm: string) => {
    const cleanTerm = (searchTerm || '').trim();
    if (!cleanTerm) {
      setErrorMsg(isRTL ? 'يرجى كتابة رقم الهاتف أو كود العضوية/الطلب أولاً' : 'Please enter a phone number or code');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      const res = await fetch(`/api/bookings?lookup=${encodeURIComponent(cleanTerm)}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
        if (data?.error) setErrorMsg(data.error);
      }
    } catch {
      setResults([]);
      setErrorMsg(isRTL ? 'حدث خطأ في الاتصال بالسيرفر، يرجى المحاولة مرة أخرى' : 'Network error during search');
    } finally {
      setLoading(false);
    }
  };

  // Check URL query parameters or hash on mount (e.g. from booking confirmation or shared link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        let codeFromUrl = '';
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code')) {
          codeFromUrl = urlParams.get('code') || '';
        } else if (window.location.hash.includes('code=')) {
          const splitHash = window.location.hash.split('?')[1];
          if (splitHash) {
            const hashParams = new URLSearchParams(splitHash);
            codeFromUrl = hashParams.get('code') || '';
          }
        }
        if (codeFromUrl) {
          setQuery(codeFromUrl);
          performSearch(codeFromUrl);
        }
      } catch (e) {
        console.warn('Failed parsing URL code parameter:', e);
      }
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputVal = (query || (form.elements.namedItem('searchQuery') as HTMLInputElement)?.value || '').trim();
    performSearch(inputVal);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="track" className="py-24 bg-gym-950 relative border-t border-white/5 scroll-mt-20">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gym-lime/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'نظام الاستعلام المباشر المدمج' : 'Integrated Live Status Checker'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'الاستعلام عن حالة العضوية والاشتراك' : 'Check Membership & Order Status'}
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? 'تابع حالة اشتراكك وتاريخ البداية والانتهاء وصلاحيتك مباشرة برقم هاتفك المسجل أو كود العضوية أو كود الطلب دون الحاجة لمغادرة الموقع.'
              : 'Check your real-time membership validity, start & expiry dates directly using your phone number or code.'}
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-gym-900 border border-white/10 shadow-2xl focus-within:border-gym-lime transition-all">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-gym-lime shrink-0" />
                <input
                  type="text"
                  name="searchQuery"
                  autoComplete="off"
                  placeholder={
                    isRTL
                      ? 'اكتب رقم هاتفك (010...) أو كود العضوية (LENO-...) أو كود الطلب...'
                      : 'Enter registered phone or code...'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gym-lime/20"
              >
                <span>{loading ? (isRTL ? 'جاري الاستعلام...' : 'Searching...') : (isRTL ? 'استعلام الآن' : 'Search')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-bold">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Guide Cards (Visible before search) */}
        {!searched && (
          <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-gym-900/50 border border-white/5 space-y-4">
            <h4 className="text-xs font-black text-gray-300 text-center uppercase tracking-wider">
              {isRTL ? 'طرق الاستعلام الفوري المتاحة:' : 'Supported Search Methods:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white block">{isRTL ? 'برقم الهاتف' : 'By Phone'}</span>
                  <span className="text-[11px] text-gray-400 block">{isRTL ? 'مثال: 01012345678' : 'e.g. 01012345678'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-gym-lime/10 text-gym-lime shrink-0">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white block">{isRTL ? 'بكود العضوية' : 'By Membership Code'}</span>
                  <span className="text-[11px] text-gray-400 block">{isRTL ? 'مثال: LENO-63451' : 'e.g. LENO-63451'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gym-950 border border-white/5 flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-white block">{isRTL ? 'بكود الطلب' : 'By Order Code'}</span>
                  <span className="text-[11px] text-gray-400 block">{isRTL ? 'مثال: LENO-ORD-8319' : 'e.g. LENO-ORD-8319'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Container */}
        {searched && (
          <div className="max-w-3xl mx-auto space-y-6">
            {results && results.length > 0 ? (
              results.map((item) => {
                const plan = plans.find((p) => p.id === item.planId);
                const trainer = trainers.find((t) => t.id === item.trainerId);
                const daysLeft = calculateDaysRemaining(item.endDate);

                const isApprovedOrActive = item.status === 'approved' || item.status === 'active';
                const isPending = item.status === 'pending';
                const isExpiringSoon = item.status === 'expiring_soon';
                const isExpired = item.status === 'expired';
                const isRejected = item.status === 'rejected';

                return (
                  <div
                    key={item.id}
                    className="bg-gym-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in"
                  >
                    {/* Top Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                      <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
                          {item.isMember
                            ? isRTL
                              ? 'كود العضوية الرسمية'
                              : 'Official Membership Code'
                            : isRTL
                            ? 'كود الطلب / الحجز'
                            : 'Order Reference'}
                        </span>
                        <span className="text-2xl font-mono font-black text-gym-lime mt-1 block">
                          {item.membershipCode || item.orderCode}
                        </span>
                      </div>

                      <div>
                        {isApprovedOrActive && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs sm:text-sm font-black uppercase">
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            <span>{isRTL ? 'العضوية نَشِطة ومُعتمدة' : 'Active & Verified'}</span>
                          </div>
                        )}
                        {isExpiringSoon && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-black uppercase">
                            <Clock className="w-4 h-4" />
                            <span>{isRTL ? 'الاشتراك ينتهي قريباً' : 'Expiring Soon'}</span>
                          </div>
                        )}
                        {isPending && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs sm:text-sm font-black uppercase">
                            <Clock className="w-4 h-4 animate-pulse" />
                            <span>{isRTL ? 'قيد المراجعة والاعتماد' : 'Pending Verification'}</span>
                          </div>
                        )}
                        {isExpired && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-black uppercase">
                            <XCircle className="w-4 h-4" />
                            <span>{isRTL ? 'الاشتراك منتهي' : 'Expired'}</span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-black uppercase">
                            <XCircle className="w-4 h-4" />
                            <span>{isRTL ? 'تم إلغاء أو رفض الطلب' : 'Rejected / Canceled'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6 border-b border-white/10 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'اسم المشترك:' : 'Member Name:'}</span>
                        <span className="font-bold text-white text-base block">{item.customerName}</span>
                        {item.gender && (
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              item.gender === 'female'
                                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {item.gender === 'female' ? (isRTL ? 'أنثى (سيدات) 👩' : 'Female') : isRTL ? 'ذكر (رجال) 👨' : 'Male'}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                        <span className="font-mono text-gray-200 text-base">{item.phone}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'الباقة المشترك بها:' : 'Plan:'}</span>
                        <span className="font-bold text-gym-lime text-base">
                          {item.planNameAr || (plan ? (isRTL ? plan.nameAr : plan.name) : item.planId)}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'تاريخ بداية الاشتراك:' : 'Start Date:'}</span>
                        <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{item.startDate || '—'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'تاريخ انتهاء الاشتراك:' : 'End Date:'}</span>
                        <div className="flex items-center gap-2 text-gym-lime font-mono font-bold text-sm">
                          <Calendar className="w-4 h-4 text-gym-lime" />
                          <span>{item.endDate || '—'}</span>
                        </div>
                        {daysLeft !== null && isApprovedOrActive && (
                          <span
                            className={`text-[11px] block mt-1 font-bold ${
                              daysLeft <= 4 ? 'text-orange-400' : daysLeft < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}
                          >
                            {daysLeft > 0
                              ? `(متبقي ${daysLeft} يوم)`
                              : daysLeft === 0
                              ? '(ينتهي اليوم)'
                              : `(منتهي منذ ${Math.abs(daysLeft)} يوم)`}
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[11px] text-yellow-400/90 block mt-1 font-semibold">
                            (يبدأ عند اعتماد الإدارة للطلب)
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                        <span className="font-black text-white text-base">
                          {item.totalAmountEGP ? Number(item.totalAmountEGP).toLocaleString() : '0'} {isRTL ? 'ج.م' : 'EGP'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-1">{isRTL ? 'المدرب المشرف:' : 'Assigned Coach:'}</span>
                        <span className="font-semibold text-gray-200">
                          {item.trainerNameAr || (trainer ? (isRTL ? trainer.nameAr : trainer.nameEn) : isRTL ? 'عام (بدون مدرب خاص)' : 'General')}
                        </span>
                      </div>

                      {item.preferredShift && (
                        <div>
                          <span className="text-gray-400 block mb-1">{isRTL ? 'فترة التدريب المفضلة:' : 'Shift:'}</span>
                          <span className="text-gray-200 text-xs font-semibold">{item.preferredShift}</span>
                        </div>
                      )}
                    </div>

                    {/* Screenshot Receipt if available */}
                    {item.proofImageUrl && (
                      <div className="mt-4 p-4 rounded-2xl bg-gym-850/80 border border-gym-lime/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.proofImageUrl}
                            alt="Payment proof screenshot"
                            className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gym-lime" />
                              <span>{isRTL ? 'إشعار / سكرين شوت التحويل المرفق' : 'Uploaded Payment Proof'}</span>
                            </span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {isRTL ? 'تم حفظ صورة الإشعار بنجاح في قاعدة البيانات' : 'Screenshot safely archived'}
                            </span>
                          </div>
                        </div>

                        <a
                          href={item.proofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-gym-800 hover:bg-gym-700 text-xs font-bold text-gym-lime border border-white/10 transition-colors whitespace-nowrap"
                        >
                          {isRTL ? 'عرض الصورة بالحجم الكامل ↗' : 'View Full Image ↗'}
                        </a>
                      </div>
                    )}

                    {/* Admin feedback note */}
                    {item.adminNotes && (
                      <div className="mt-4 p-4 rounded-xl bg-gym-850 border border-white/5 text-xs text-gray-300">
                        <span className="text-gym-lime font-bold block mb-1">
                          {isRTL ? 'ملاحظة إدارة الجيم:' : 'Gym Admin Note:'}
                        </span>
                        <p>{item.adminNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-gym-900/60 rounded-3xl border border-white/10 p-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  {isRTL
                    ? 'لم يتم العثور على أي اشتراك أو عضوية بهذا الرقم أو الكود'
                    : 'No records found for this query'}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  {isRTL
                    ? 'يرجى التأكد من كتابة رقم الهاتف المسجل بالجيم بشكل صحيح (مثل: 01012345678) أو كود العضوية (مثل: LENO-63451) أو كود الطلب (مثل: LENO-ORD-8319).'
                    : 'Please verify the phone number, membership code, or order code you entered.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearched(false);
                      setResults(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-gym-800 hover:bg-gym-700 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    {isRTL ? 'إعادة المحاولة والبحث مجدداً' : 'Try Again'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
