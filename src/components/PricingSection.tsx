'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { Check, Zap, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PricingSection() {
  const { plans, isRTL, openBookingModal } = useGym();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="pricing" className="py-24 bg-gym-950 relative border-t border-white/5">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gym-lime/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'خطط وباقات مرنة' : 'Flexible Memberships'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'باقات الاشتراك والأسعار' : 'Choose Your Commitment'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3">
            {isRTL
              ? 'اختر الخطة المناسبة لك بالجنيه المصري، مع إمكانية التجميد المجاني والدفع بجميع الطرق المصرية.'
              : 'Transparent Egyptian pricing with flexible freezing options and all local payment gateways.'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.filter((p) => p.isActive).map((plan) => {
            const hasDiscount = plan.originalPriceEGP > plan.priceEGP;
            const discountPct = hasDiscount
              ? Math.round(((plan.originalPriceEGP - plan.priceEGP) / plan.originalPriceEGP) * 100)
              : 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-gym-900 to-gym-950 border-2 border-gym-lime shadow-2xl shadow-gym-lime/15 lg:-translate-y-2'
                    : 'bg-gym-900/80 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Tag */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gym-lime text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'الأكثر طلباً' : 'Most Popular'}</span>
                  </div>
                )}

                {/* Plan Header */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black text-white font-display uppercase tracking-wide">
                      {isRTL ? plan.nameAr : plan.name}
                    </h3>
                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-extrabold text-[11px] border border-red-500/30">
                        {isRTL ? `خصم ${discountPct}%` : `Save ${discountPct}%`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    {isRTL ? plan.durationLabelAr : plan.durationLabelEn}
                  </p>

                  {/* Price Box */}
                  <div className="mt-6 mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
                        {plan.priceEGP.toLocaleString()}
                      </span>
                      <span className="text-gym-lime font-extrabold text-sm uppercase">
                        {isRTL ? 'جنيه مصري' : 'EGP'}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="text-xs text-gray-400 line-through mt-1">
                        {plan.originalPriceEGP.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {(isRTL ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-gym-lime/20 text-gym-lime flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subscribe CTA Button */}
                <div>
                  <button
                    onClick={() => openBookingModal(plan.id)}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                      plan.isPopular
                        ? 'bg-gym-lime hover:bg-gym-accent-hover text-black shadow-gym-lime/20 hover:shadow-gym-lime/40'
                        : 'bg-white/10 hover:bg-white text-white hover:text-black border border-white/10'
                    }`}
                  >
                    <span>{isRTL ? 'اشترك الآن' : 'Subscribe Now'}</span>
                    <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    {isRTL ? 'تفعيل فوري مع استلام الكارت الذكي' : 'Instant activation & Smart Keycard'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Egyptian Payment Methods Notice Banner */}
        <div className="mt-16 bg-gym-900/60 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gym-lime/10 text-gym-lime flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                {isRTL ? 'طرق الدفع المعتمدة في جمهورية مصر العربية' : 'Supported Egyptian Payment Gateways'}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {isRTL
                  ? 'ندعم فودافون كاش، إنستاباي، أورنج كاش، اتصالات كاش، وي باي، فيزا/ماستركارد، فوري، والدفع نقداً بالجيم.'
                  : 'Vodafone Cash, InstaPay, Orange Cash, e& cash, WE Pay, Visa/Mastercard, Fawry & Gym Cash.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openBookingModal()}
            className="px-6 py-2.5 rounded-xl bg-gym-800 hover:bg-gym-700 text-gym-lime border border-gym-lime/30 text-xs font-bold whitespace-nowrap transition-all"
          >
            {isRTL ? 'ابدأ حجز اشتراكك' : 'Book Membership'}
          </button>
        </div>

      </div>
    </section>
  );
}
