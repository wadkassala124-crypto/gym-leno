'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { Play, Volume2, VolumeX, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Hero() {
  const {
    content,
    video,
    isRTL,
    openBookingModal,
    trainers,
    programs,
    testimonials,
    activeMembersCount,
  } = useGym();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(video.muted ?? true);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Dynamic automatic calculation of real live stats:
  // 1. Active Members: real live count of active subscribers in the system
  const realMembersCount = activeMembersCount;

  // 2. Elite Coaches: real live count of registered trainers in the gym
  const realTrainersCount = trainers.length;

  // 3. Fitness Programs: real live count of active training programs
  const realProgramsCount = programs.length;

  // 4. Member Satisfaction Rate: real live calculation from verified client reviews
  const realSatisfactionRate = testimonials.length > 0
    ? Math.min(
        100,
        Math.round(
          (testimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 5), 0) /
            (testimonials.length * 5)) * 100
        )
      )
    : 100;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      
      {/* Background Video & Poster Layer */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {!videoError && video.heroVideoUrl ? (
          <video
            ref={videoRef}
            autoPlay={video.autoplay}
            loop={video.loop}
            muted={isMuted}
            playsInline
            poster={video.heroPosterUrl}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          >
            <source src={video.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${video.heroPosterUrl})` }}
          />
        )}

        {/* Dynamic Dark Gradient Overlay */}
        <div
          className="absolute inset-0 video-overlay"
          style={{ opacity: video.overlayOpacity || 0.65 }}
        />
        
        {/* Subtle mesh background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(204,255,0,0.04)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      </div>

      {/* Video controls (mute / unmute toggle) */}
      {!videoError && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs text-gray-300 hover:text-white transition-all shadow-xl"
          title={isMuted ? 'Unmute Background Audio' : 'Mute Background Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-gym-lime" /> : <Volume2 className="w-4 h-4 text-gym-lime" />}
          <span className="hidden sm:inline">{isMuted ? (isRTL ? 'تشغيل الصوت' : 'Sound Off') : (isRTL ? 'كتم الصوت' : 'Sound On')}</span>
        </button>
      )}

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Top Announcement Pill */}
        {content.announcement?.enabled && content.announcement?.textAr && !content.announcement.textAr.includes('يمكن لمدير') && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-gym-lime/30 text-gym-lime text-xs sm:text-sm font-bold tracking-wide backdrop-blur-md mb-8 animate-fade-in shadow-lg shadow-gym-lime/10">
            <Sparkles className="w-4 h-4 text-gym-lime shrink-0 animate-pulse" />
            <span>{isRTL ? content.announcement.textAr : content.announcement.textEn}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white font-display leading-[1.1] mb-6 drop-shadow-2xl break-words">
          {isRTL ? (
            <span>
              {content.hero.titleAr.split(' ')[0]}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gym-lime to-white">
                {content.hero.titleAr.split(' ').slice(1).join(' ')}
              </span>
            </span>
          ) : (
            <span>
              {content.hero.titleEn.split(' ')[0]} {content.hero.titleEn.split(' ')[1]}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gym-lime to-white">
                {content.hero.titleEn.split(' ').slice(2).join(' ')}
              </span>
            </span>
          )}
        </h1>

        {/* Subtitle Description */}
        <p className="max-w-2xl text-sm sm:text-lg md:text-xl text-gray-300 font-normal leading-relaxed mb-8 sm:mb-10 text-center drop-shadow-md">
          {isRTL ? content.hero.subtitleAr : content.hero.subtitleEn}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 w-full sm:w-auto">
          {/* Button 1: Start Journey */}
          <button
            onClick={() => openBookingModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gym-lime hover:bg-gym-accent-hover text-black px-8 py-3.5 sm:py-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-xl shadow-gym-lime/30 hover:shadow-gym-lime/50 hover:scale-105 active:scale-95"
          >
            <span>{isRTL ? content.hero.ctaPrimaryAr : content.hero.ctaPrimaryEn}</span>
            <ArrowIcon className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Button 2: Explore Programs */}
          <a
            href="#programs"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide border border-white/20 backdrop-blur-md transition-all hover:border-gym-lime/50"
          >
            <Play className="w-4 h-4 text-gym-lime fill-gym-lime" />
            <span>{isRTL ? content.hero.ctaSecondaryAr : content.hero.ctaSecondaryEn}</span>
          </a>
        </div>

        {/* Brand Guarantee Badges */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 lg:gap-10 text-center w-full">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-display">
              {realMembersCount.toLocaleString()}+
            </div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
              {isRTL ? 'أعضاء نشطين' : 'Active Members'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gym-lime font-display">
              {realTrainersCount}+
            </div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
              {isRTL ? 'مدربين محترفين' : 'Elite Coaches'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-display">
              {realProgramsCount}+
            </div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
              {isRTL ? 'برامج تدريبية' : 'Fitness Programs'}
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-gym-lime font-display">
              {realSatisfactionRate}%
            </div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
              {isRTL ? 'نسبة رضا المشتركين' : 'Satisfaction Rate'}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
