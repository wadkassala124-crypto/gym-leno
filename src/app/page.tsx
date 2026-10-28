'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProgramsSection from '@/components/ProgramsSection';
import TrainersSection from '@/components/TrainersSection';
import PricingSection from '@/components/PricingSection';
import TrackSection from '@/components/TrackSection';
import Testimonials from '@/components/Testimonials';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { useGym } from '@/context/GymContext';
import { ShieldCheck, Trophy, Sparkles, Activity, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const { content, isRTL, openBookingModal } = useGym();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-gym-950 text-white selection:bg-gym-lime selection:text-black">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Main Hero Section with Looping Video */}
      <Hero />

      {/* About Gym & Leno Feature Highlights */}
      <section className="py-24 bg-gym-900/30 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Image Showcase with Athletic Grid */}
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80"
                  alt="Gym Interior"
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gym-950 via-transparent to-transparent" />
              </div>

              {/* Overlapping Floating Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-8 sm:-right-6 z-20 bg-gym-900/95 backdrop-blur-xl border border-gym-lime/40 rounded-2xl p-4 sm:p-5 shadow-2xl max-w-[85vw] sm:max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white font-display">
                      #1 IN NEW CAIRO
                    </div>
                    <div className="text-xs text-gym-lime font-bold">
                      {isRTL ? 'أحدث صالة أولمبية متكاملة' : 'Top Rated Fitness Center'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Description */}
            <div>
              <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
                {isRTL ? 'الهوية والرسالة' : 'The Gym & Leno Standard'}
              </span>
              
              <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight leading-tight mb-6">
                {isRTL ? content.about.headingAr : content.about.headingEn}
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
                {isRTL ? content.about.descriptionAr : content.about.descriptionEn}
              </p>

              {/* Feature Points */}
              <div className="space-y-4 mb-10">
                {(isRTL ? content.about.featuresAr : content.about.featuresEn).map((f, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gym-lime/20 text-gym-lime flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gym-lime hover:bg-gym-accent-hover text-black px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-gym-lime/20 hover:scale-105"
              >
                <span>{isRTL ? 'انضم إلى مجتمع الأبطال الآن' : 'Claim Your Free Day Pass'}</span>
                <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Training Programs */}
      <ProgramsSection />

      {/* Trainers & Coaches */}
      <TrainersSection />

      {/* Memberships & Pricing with Egyptian Payment gateways */}
      <PricingSection />

      {/* Integrated Live Subscription & Membership Inquiry Section */}
      <TrackSection />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQs */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Global Booking Modal */}
      <BookingModal />
    </div>
  );
}
