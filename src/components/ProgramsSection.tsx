'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { Program } from '@/lib/types';
import { Clock, Dumbbell, Flame, CheckCircle, X, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ProgramsSection() {
  const { programs, trainers, isRTL, openBookingModal } = useGym();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Programs', labelAr: 'جميع البرامج' },
    { id: 'strength', labelEn: 'Strength & Bodybuilding', labelAr: 'القوة والضخامة' },
    { id: 'fatloss', labelEn: 'Fat Loss', labelAr: 'حرق الدهون' },
    { id: 'cardio', labelEn: 'Cardio & HIIT', labelAr: 'كارديو و لياقة' },
    { id: 'personal', labelEn: 'Personal Training', labelAr: 'تدريب شخصي' },
    { id: 'beginner', labelEn: 'Beginners', labelAr: 'المبتدئين' },
  ];

  const filteredPrograms = activeFilter === 'all'
    ? programs
    : programs.filter((p) => p.category === activeFilter);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="programs" className="py-24 bg-gym-950 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'خطط تدريبية عالمية' : 'World-Class Training'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'البرامج التدريبية الاحترافية' : 'Featured Workout Programs'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-3">
            {isRTL
              ? 'اختر البرنامج المناسب لطموحاتك وجدولك، مصممة بأعلى معايير علم الرياضة الحديث.'
              : 'Choose the blueprint tailored for your goals, crafted with modern sports science.'}
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeFilter === cat.id
                    ? 'bg-gym-lime text-black shadow-lg shadow-gym-lime/20 scale-105'
                    : 'bg-gym-900 text-gray-400 hover:text-white hover:bg-gym-800 border border-white/5'
                }`}
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredPrograms.map((prog) => {
            const assignedCoach = trainers.find((t) => t.id === prog.coachId);
            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgram(prog)}
                className="group relative bg-gym-900 rounded-2xl overflow-hidden border border-white/10 hover:border-gym-lime/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col justify-between shadow-xl"
              >
                {/* Image & Gradient */}
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={prog.image}
                    alt={isRTL ? prog.titleAr : prog.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gym-900 via-gym-900/40 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-gym-lime text-[11px] font-extrabold uppercase border border-gym-lime/30">
                      {isRTL ? prog.difficultyAr : prog.difficulty}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-gray-200 text-[11px] font-bold border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gym-lime" />
                      <span>{prog.durationWeeks} {isRTL ? 'أسابيع' : 'Wks'}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white font-display uppercase tracking-wide group-hover:text-gym-lime transition-colors">
                      {isRTL ? prog.titleAr : prog.titleEn}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed">
                      {isRTL ? prog.descriptionAr : prog.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      <span className="block font-semibold text-gray-300">
                        {assignedCoach ? (isRTL ? assignedCoach.nameAr : assignedCoach.nameEn) : 'Gym & Leno Team'}
                      </span>
                      <span>{prog.sessionsPerWeek} {isRTL ? 'جلسات أسبوعياً' : 'sessions/wk'}</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-gym-800 text-gym-lime flex items-center justify-center group-hover:bg-gym-lime group-hover:text-black transition-all">
                      <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gym-900 border border-gym-lime/30 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header Image */}
            <div className="relative h-48 sm:h-64 w-full shrink-0">
              <img
                src={selectedProgram.image}
                alt={selectedProgram.titleEn}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gym-900 via-gym-900/50 to-transparent" />
              
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-md bg-gym-lime text-black font-black text-xs uppercase tracking-wider">
                  {isRTL ? selectedProgram.difficultyAr : selectedProgram.difficulty}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide mt-2">
                  {isRTL ? selectedProgram.titleAr : selectedProgram.titleEn}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  {isRTL ? 'نبذة عن البرنامج' : 'Program Overview'}
                </h4>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {isRTL ? selectedProgram.descriptionAr : selectedProgram.descriptionEn}
                </p>
              </div>

              {/* Program Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase text-gym-lime tracking-wider mb-3">
                  {isRTL ? 'أهم محتويات ومميزات التدريب' : 'Program Highlights'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(isRTL ? selectedProgram.highlightsAr : selectedProgram.highlightsEn).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-gym-850 p-2.5 rounded-xl border border-white/5">
                      <CheckCircle className="w-4 h-4 text-gym-lime shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Metadata */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gym-850 rounded-2xl border border-white/5 text-center">
                <div>
                  <div className="text-xs text-gray-400">{isRTL ? 'المدة' : 'Duration'}</div>
                  <div className="text-base font-black text-white mt-1 font-display">{selectedProgram.durationWeeks} {isRTL ? 'أسابيع' : 'Weeks'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{isRTL ? 'الجلسات' : 'Sessions'}</div>
                  <div className="text-base font-black text-white mt-1 font-display">{selectedProgram.sessionsPerWeek} / {isRTL ? 'أسبوع' : 'Wk'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{isRTL ? 'المستوى' : 'Level'}</div>
                  <div className="text-base font-black text-gym-lime mt-1 font-display">{isRTL ? selectedProgram.difficultyAr : selectedProgram.difficulty}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prog = selectedProgram;
                    setSelectedProgram(null);
                    openBookingModal(undefined, prog.coachId);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/25"
                >
                  <span>{isRTL ? 'سجل في هذا البرنامج' : 'Join This Program'}</span>
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
