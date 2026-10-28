export interface SiteContent {
  hero: {
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    ctaPrimaryEn: string;
    ctaPrimaryAr: string;
    ctaSecondaryEn: string;
    ctaSecondaryAr: string;
    badgeEn: string;
    badgeAr: string;
  };
  stats: {
    membersCount: number;
    trainersCount: number;
    programsCount: number;
    satisfactionRate: number;
    autoSyncFromDatabase?: boolean;
  };
  about: {
    headingEn: string;
    headingAr: string;
    descriptionEn: string;
    descriptionAr: string;
    featuresEn: string[];
    featuresAr: string[];
  };
  announcement: {
    enabled: boolean;
    textEn: string;
    textAr: string;
    linkUrl?: string;
  };
}

export interface VideoBackgroundConfig {
  heroVideoUrl: string;
  heroPosterUrl: string;
  overlayOpacity: number; // 0.1 to 0.9
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  useImageOnMobile: boolean;
  titlePlacement: 'center' | 'left' | 'right';
}

export interface MembershipPlan {
  id: string;
  name: string;
  nameAr: string;
  priceEGP: number;
  originalPriceEGP: number;
  durationMonths: number;
  durationLabelEn: string;
  durationLabelAr: string;
  featuresEn: string[];
  featuresAr: string[];
  isPopular?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export type PaymentMethodType = 
  | 'vodafone_cash'
  | 'instapay'
  | 'orange_cash'
  | 'etisalat_cash'
  | 'we_pay'
  | 'card'
  | 'fawry'
  | 'bank_transfer'
  | 'cash';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  nameEn: string;
  nameAr: string;
  walletNumber?: string;
  instapayHandle?: string;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    iban: string;
  };
  fawryMerchantCode?: string;
  instructionsEn: string;
  instructionsAr: string;
  isActive: boolean;
  sortOrder: number;
  isOnlineGateway?: boolean;
}

export interface Trainer {
  id: string;
  nameEn: string;
  nameAr: string;
  specialtyEn: string;
  specialtyAr: string;
  bioEn: string;
  bioAr: string;
  experienceYears: number;
  rating: number;
  image: string;
  priceEGP?: number; // Subscription / personal training rate in EGP
  availableDays: string[];
  programsOffered: string[];
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
  };
}

export interface Program {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  category: 'strength' | 'cardio' | 'fatloss' | 'personal' | 'beginner' | 'endurance' | 'fitness';
  descriptionEn: string;
  descriptionAr: string;
  durationWeeks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  difficultyAr: 'مبتدئ' | 'متوسط' | 'متقدم' | 'جميع المستويات';
  image: string;
  coachId?: string;
  sessionsPerWeek: number;
  highlightsEn: string[];
  highlightsAr: string[];
}

export interface Testimonial {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  rating: number; // 1 to 5
  commentEn: string;
  commentAr: string;
  image: string;
  createdAt?: string;
}

export interface FAQItem {
  id: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type MemberStatus = 'active' | 'expiring_soon' | 'expired' | 'pending';

export interface Member {
  id: string;
  membershipCode: string;
  fullName: string;
  gender?: 'male' | 'female';
  phone: string;
  email: string;
  planId: string;
  trainerId?: string;
  startDate: string;
  endDate: string;
  status: MemberStatus;
  notes?: string;
  lastReminderSentAt?: string;
}

export interface WhatsAppReminderConfig {
  enabled: boolean;
  daysThreshold: number; // default 4
  messageTemplate: string;
  provider?: 'direct_link' | 'ultramsg' | 'custom_webhook';
  ultramsgInstanceId?: string;
  ultramsgToken?: string;
  customWebhookUrl?: string;
}

export interface WorkoutShiftItem {
  id: string;
  labelAr: string;
  labelEn: string;
  timeRangeAr: string;
  timeRangeEn: string;
}

export interface GenderSchedules {
  men: WorkoutShiftItem[];
  women: WorkoutShiftItem[];
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface BookingOrder {
  id: string;
  orderCode: string;
  customerName: string;
  gender?: 'male' | 'female';
  phone: string;
  email: string;
  planId: string;
  trainerId?: string;
  planPriceEGP?: number;
  trainerFeeEGP?: number;
  preferredShift: string;
  paymentMethodId: string;
  transactionRef?: string;
  proofImageUrl?: string;
  status: BookingStatus;
  totalAmountEGP: number;
  createdAt: string;
  adminNotes?: string;
  startDate?: string;
  endDate?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  sizeFormatted: string;
  createdAt: string;
  tags?: string[];
}

export interface SiteSettings {
  gymNameEn: string;
  gymNameAr: string;
  logoText: string;
  accentColor: string; // e.g. '#ccff00'
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;
  addressEn: string;
  addressAr: string;
  cityAreaEn: string;
  cityAreaAr: string;
  mapEmbedUrl: string;
  googleMapsLink: string;
  workingHoursEn: {
    weekdays: string;
    friday: string;
  };
  workingHoursAr: {
    weekdays: string;
    friday: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
  };
  currency: string;
  reminderConfig?: WhatsAppReminderConfig;
  genderSchedules?: GenderSchedules;
}
