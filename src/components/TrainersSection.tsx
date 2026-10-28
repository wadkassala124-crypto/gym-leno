'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { Trainer } from '@/lib/types';
import { Star, Award, Calendar, X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TrainersSection() {
  const { trainers, isRTL, openBookingModal } = useGym();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="trainers" className="py-24 bg-gym-900/60 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'نخبة المدربين' : 'Elite Coaches'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'فريق التدريب الاحترافي' : 'Meet Your Personal Mentors'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3">
            {isRTL
              ? 'مدربون معتمدون دولياً بإنجازات حقيقية يقودونك لتحقيق هدفك البدني بأعلى كفاءة.'
              : 'Certified international champions dedicated to elevating your physique and performance.'}
          </p>
        </div>

        {/* Trainers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((t) => (
            <div
              key={t.id}
              className="bg-gym-950 rounded-2xl overflow-hidden border border-white/10 hover:border-gym-lime/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative h-80 w-full overflow-hidden bg-gym-850">
                <img
                  src={t.image}
                  alt={isRTL ? t.nameAr : t.nameEn}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gym-950 via-transparent to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-bold text-white">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span>{t.rating.toFixed(1)}</span>
                </div>

                {/* Experience Badge */}
                <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-lg bg-gym-lime text-black flex items-center gap-1 text-[11px] font-black uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>{t.experienceYears}+ {isRTL ? 'سنوات خبرة' : 'Yrs Exp'}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-white font-display uppercase tracking-wide group-hover:text-gym-lime transition-colors">
                    {isRTL ? t.nameAr : t.nameEn}
                  </h3>
                  <p className="text-gym-lime text-xs font-bold tracking-wide mt-1 uppercase">
                    {isRTL ? t.specialtyAr : t.specialtyEn}
                  </p>
                  {t.priceEGP && t.priceEGP > 0 ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gym-lime/10 border border-gym-lime/30 text-gym-lime font-mono font-bold text-xs">
                      <span>{isRTL ? 'رسوم تدريب خاص:' : 'Personal Training:'}</span>
                      <span className="font-black">+{t.priceEGP.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">{isRTL ? 'ج.م' : 'EGP'}</span>
                    </div>
                  ) : null}
                  <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mt-3 leading-relaxed">
                    {isRTL ? t.bioAr : t.bioEn}
                  </p>
                </div>

                {/* Buttons: View Profile + Book */}
                <div className="pt-6 mt-4 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTrainer(t)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gym-800 hover:bg-gym-700 text-gray-200 text-xs font-bold transition-colors border border-white/5 text-center"
                  >
                    {isRTL ? 'عرض الملف' : 'Profile'}
                  </button>
                  <button
                    onClick={() => openBookingModal(undefined, t.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black text-xs font-black uppercase tracking-wider transition-colors text-center"
                  >
                    {isRTL ? 'حجز جلسة' : 'Book'}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Trainer Profile Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-gym-950 border border-gym-lime/40 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="relative h-48 sm:h-64 w-full shrink-0">
              <img
                src={selectedTrainer.image}
                alt={selectedTrainer.nameEn}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gym-950 via-gym-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-md bg-gym-lime text-black font-black text-xs uppercase tracking-wider">
                  {selectedTrainer.experienceYears}+ {isRTL ? 'سنوات خبرة واحتراف' : 'Years Experience'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide mt-2">
                  {isRTL ? selectedTrainer.nameAr : selectedTrainer.nameEn}
                </h3>
                <p className="text-gym-lime text-xs font-bold uppercase mt-1">
                  {isRTL ? selectedTrainer.specialtyAr : selectedTrainer.specialtyEn}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  {isRTL ? 'السيرة الذاتية والفلسفة التدريبية' : 'Biography & Coaching Philosophy'}
                </h4>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {isRTL ? selectedTrainer.bioAr : selectedTrainer.bioEn}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  {isRTL ? 'البرامج التي يشرف عليها' : 'Programs Supervised'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.programsOffered.map((p, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-gym-900 border border-white/10 text-xs font-semibold text-gray-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gym-lime" />
                  <span>{isRTL ? 'أيام التدريب المتاحة' : 'Available Days'}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrainer.availableDays.map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-gym-lime/10 border border-gym-lime/30 text-gym-lime text-xs font-bold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTrainer.priceEGP && selectedTrainer.priceEGP > 0 ? (
                <div className="p-3 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">
                    {isRTL ? 'رسوم الاشتراك بالتدريب الخاص مع الكابتن:' : 'Personal Training Fee:'}
                  </span>
                  <span className="font-mono font-black text-gym-lime text-sm">
                    +{selectedTrainer.priceEGP.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              ) : null}

              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedTrainer(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trainer = selectedTrainer;
                    setSelectedTrainer(null);
                    openBookingModal(undefined, trainer.id);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/25"
                >
                  <span>{isRTL ? 'احجز جلسة خاصة معه الآن' : 'Book Personal Session'}</span>
                  <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
