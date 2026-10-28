'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SiteContent,
  VideoBackgroundConfig,
  MembershipPlan,
  PaymentMethod,
  Trainer,
  Program,
  SiteSettings,
  Testimonial,
  FAQItem,
} from '@/lib/types';
import {
  initialSiteContent,
  initialVideoBackground,
  initialPlans,
  initialPaymentMethods,
  initialTrainers,
  initialPrograms,
  initialSiteSettings,
  initialTestimonials,
  initialFAQs,
} from '@/lib/initial-data';
import { applyThemeColor } from '@/lib/theme';

interface GymContextType {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  isRTL: boolean;
  content: SiteContent;
  video: VideoBackgroundConfig;
  plans: MembershipPlan[];
  paymentMethods: PaymentMethod[];
  trainers: Trainer[];
  programs: Program[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  settings: SiteSettings;
  activeMembersCount: number;
  bookingModalOpen: boolean;
  openBookingModal: (planId?: string, trainerId?: string) => void;
  closeBookingModal: () => void;
  selectedPlanId: string | null;
  selectedTrainerId: string | null;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'ar'>('en');
  const [content, setContent] = useState<SiteContent>(initialSiteContent);
  const [video, setVideo] = useState<VideoBackgroundConfig>(initialVideoBackground);
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [settings, setSettings] = useState<SiteSettings>(initialSiteSettings);
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRTL = lang === 'ar';

  const setLang = (newLang: 'en' | 'ar') => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gym_lang', newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  };

  const openBookingModal = (planId?: string, trainerId?: string) => {
    if (planId) setSelectedPlanId(planId);
    if (trainerId) setSelectedTrainerId(trainerId);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
  };

  const refreshData = async () => {
    try {
      const [
        resContent,
        resVideo,
        resPlans,
        resPayments,
        resTrainers,
        resPrograms,
        resTestimonials,
        resFaqs,
        resSettings,
        resMetrics,
      ] = await Promise.all([
        fetch('/api/content').then((r) => r.json()),
        fetch('/api/video').then((r) => r.json()),
        fetch('/api/plans').then((r) => r.json()),
        fetch('/api/payment-methods').then((r) => r.json()),
        fetch('/api/trainers').then((r) => r.json()),
        fetch('/api/programs').then((r) => r.json()),
        fetch('/api/testimonials').then((r) => r.json()),
        fetch('/api/faqs').then((r) => r.json()).catch(() => null),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/metrics').then((r) => r.json()).catch(() => null),
      ]);

      if (resContent?.data) setContent(resContent.data);
      if (resVideo?.data) setVideo(resVideo.data);
      if (resPlans?.data) setPlans(resPlans.data);
      if (resPayments?.data) setPaymentMethods(resPayments.data);
      if (resTrainers?.data) setTrainers(resTrainers.data);
      if (resPrograms?.data) setPrograms(resPrograms.data);
      if (resTestimonials?.data) setTestimonials(resTestimonials.data);
      if (resFaqs?.data) setFaqs(resFaqs.data);
      if (resSettings?.data) {
        setSettings(resSettings.data);
        if (resSettings.data.accentColor) {
          applyThemeColor(resSettings.data.accentColor);
        }
      }
      if (resMetrics?.data?.activeMembers !== undefined) {
        setActiveMembersCount(resMetrics.data.activeMembers);
      }
    } catch (err) {
      console.warn('Using default initial data while API connects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings?.accentColor) {
      applyThemeColor(settings.accentColor);
    }
  }, [settings?.accentColor]);

  useEffect(() => {
    const saved = localStorage.getItem('gym_lang') as 'en' | 'ar' | null;
    if (saved) {
      setLang(saved);
    }
    refreshData();
  }, []);

  return (
    <GymContext.Provider
      value={{
        lang,
        setLang,
        isRTL,
        content,
        video,
        plans,
        paymentMethods,
        trainers,
        programs,
        testimonials,
        faqs,
        settings,
        activeMembersCount,
        bookingModalOpen,
        openBookingModal,
        closeBookingModal,
        selectedPlanId,
        selectedTrainerId,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
}
