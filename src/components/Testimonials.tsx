'use client';

import React from 'react';
import { useGym } from '@/context/GymContext';
import { Star, Quote, User } from 'lucide-react';

export default function Testimonials() {
  const { isRTL, testimonials } = useGym();

  return (
    <section id="testimonials" className="py-24 bg-gym-900/50 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'شهادات التحول والنجاح' : 'Success Stories & Transformations'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'آراء المشتركين والتحولات البدنية' : 'Member Stories & Transformations'}
          </h2>
          <p className="text-sm text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed">
            {isRTL
              ? 'تجارب حقيقية لأعضاء عاشوا تجربة التحول البدني وصنعوا الفارق في جيم آند لينو.'
              : 'Real experiences from members who transformed their physique and lives at Gym & Leno.'}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((rev) => (
            <div
              key={rev.id}
              className="bg-gym-950 p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-gym-lime/30 transition-all duration-300 relative flex flex-col justify-between shadow-xl group hover:-translate-y-1"
            >
              <Quote className="w-10 h-10 text-white/5 group-hover:text-gym-lime/10 transition-colors absolute top-6 right-6" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 text-yellow-400">
                  {[...Array(Math.min(Math.max(rev.rating || 5, 1), 5))].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                  "{isRTL ? (rev.commentAr || rev.commentEn) : (rev.commentEn || rev.commentAr)}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                {rev.image ? (
                  <img
                    src={rev.image}
                    alt={isRTL ? rev.nameAr : rev.nameEn}
                    className="w-12 h-12 rounded-full object-cover border border-gym-lime/40 group-hover:scale-105 transition-transform shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gym-800 border border-gym-lime/40 flex items-center justify-center text-gym-lime shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-white font-display uppercase tracking-wide group-hover:text-gym-lime transition-colors">
                    {isRTL ? (rev.nameAr || rev.nameEn) : (rev.nameEn || rev.nameAr)}
                  </h4>
                  <span className="text-xs text-gym-lime font-semibold block mt-0.5">
                    {isRTL ? (rev.roleAr || rev.roleEn) : (rev.roleEn || rev.roleAr)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
