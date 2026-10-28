'use client';

import React, { useState, useRef } from 'react';
import { useGym } from '@/context/GymContext';
import { PaymentMethod } from '@/lib/types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function BookingModal() {
  const {
    bookingModalOpen,
    closeBookingModal,
    plans,
    trainers,
    paymentMethods,
    selectedPlanId,
    selectedTrainerId,
    settings,
    isRTL,
  } = useGym();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planId, setPlanId] = useState(selectedPlanId || plans[1]?.id || plans[0]?.id || '');
  const [trainerId, setTrainerId] = useState(selectedTrainerId || '');
  const [preferredShift, setPreferredShift] = useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderCode: string;
    totalAmountEGP: number;
    customerName: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Compute available shifts safely based on gender and settings
  const availableShifts = React.useMemo(() => {
    return (
      (gender === 'female'
        ? settings?.genderSchedules?.women
        : settings?.genderSchedules?.men) ||
      (gender === 'female'
        ? [
            {
              id: 'women-morning',
              labelAr: 'الصباحية للسيدات',
              labelEn: 'Morning (Ladies)',
              timeRangeAr: '10:00 ص – 02:00 م',
              timeRangeEn: '10:00 AM – 02:00 PM',
            },
            {
              id: 'women-afternoon',
              labelAr: 'فترة ما بعد الظهر للسيدات',
              labelEn: 'Afternoon (Ladies)',
              timeRangeAr: '03:00 م – 06:00 م',
              timeRangeEn: '03:00 PM – 06:00 PM',
            },
            {
              id: 'women-night',
              labelAr: 'فترة السهرة للسيدات',
              labelEn: 'Evening (Ladies)',
              timeRangeAr: '08:00 م – 11:00 م',
              timeRangeEn: '08:00 PM – 11:00 PM',
            },
          ]
        : [
            {
              id: 'men-morning',
              labelAr: 'الصباحية للرجال',
              labelEn: 'Morning (Men)',
              timeRangeAr: '06:00 ص – 10:00 ص',
              timeRangeEn: '06:00 AM – 10:00 AM',
            },
            {
              id: 'men-afternoon',
              labelAr: 'فترة الظهيرة للرجال',
              labelEn: 'Afternoon (Men)',
              timeRangeAr: '02:00 م – 06:00 م',
              timeRangeEn: '02:00 PM – 06:00 PM',
            },
            {
              id: 'men-evening',
              labelAr: 'الفترة المسائية للرجال',
              labelEn: 'Evening (Men)',
              timeRangeAr: '06:00 م – 12:00 منتصف الليل',
              timeRangeEn: '06:00 PM – 12:00 Midnight',
            },
          ])
    );
  }, [gender, settings?.genderSchedules]);

  // Hook 1: Sync selected props and reset form state when modal opens
  React.useEffect(() => {
    if (bookingModalOpen) {
      setStep(1);
      setErrorMsg('');
      if (selectedPlanId) {
        setPlanId(selectedPlanId);
      } else if (!planId && plans && plans.length > 0) {
        setPlanId(plans[1]?.id || plans[0]?.id || '');
      }
      if (selectedTrainerId !== undefined && selectedTrainerId !== null) {
        setTrainerId(selectedTrainerId);
      }
      if (!paymentMethodId && paymentMethods && paymentMethods.length > 0) {
        setPaymentMethodId(paymentMethods[0]?.id || '');
      }
    }
  }, [bookingModalOpen, selectedPlanId, selectedTrainerId]);

  // Hook 2: Set default preferredShift when availableShifts, gender, or language changes
  React.useEffect(() => {
    if (availableShifts && availableShifts.length > 0) {
      const match = availableShifts.find(
        (s) => preferredShift === `${s.labelAr} (${s.timeRangeAr})` || preferredShift === s.labelAr
      );
      if (!match) {
        setPreferredShift(
          isRTL
            ? `${availableShifts[0].labelAr} (${availableShifts[0].timeRangeAr})`
            : `${availableShifts[0].labelEn} (${availableShifts[0].timeRangeEn})`
        );
      }
    }
  }, [gender, availableShifts, isRTL]);

  // Safe calculated values
  const currentPlan = (plans && plans.length > 0)
    ? (plans.find((p) => p.id === planId) || plans[0])
    : null;
  const currentTrainer = (trainers && trainers.length > 0)
    ? trainers.find((t) => t.id === trainerId)
    : null;
  const trainerFee =
    currentTrainer && typeof currentTrainer.priceEGP === 'number'
      ? Math.max(0, currentTrainer.priceEGP)
      : 0;
  const planPrice = currentPlan?.priceEGP || 0;
  const totalAmount = planPrice + trainerFee;
  const currentPayment = (paymentMethods && paymentMethods.length > 0)
    ? (paymentMethods.find((pm) => pm.id === paymentMethodId) || paymentMethods[0])
    : null;

  // IMPORTANT: All hooks are declared above. Now we can conditionally render.
  if (!bookingModalOpen) return null;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg(isRTL ? 'يرجى إدخال الاسم ورقم الهاتف على الأقل' : 'Please provide at least your Name and Phone');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-proof', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProofImageUrl(data.url);
      } else {
        setErrorMsg(data.error || (isRTL ? 'فشل رفع صورة الإشعار' : 'Failed to upload proof'));
      }
    } catch {
      setErrorMsg(isRTL ? 'حدث خطأ أثناء رفع سكرين شوت التحويل' : 'Upload network error');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitBooking = async () => {
    // Validate that non-cash transfers have at least screenshot proof or transaction ref
    if (currentPayment?.type !== 'cash' && !proofImageUrl && !transactionRef.trim()) {
      setErrorMsg(
        isRTL
          ? 'يرجى إرفاق سكرين شوت التحويل أو كتابة رقم العملية لتأكيد طلبك'
          : 'Please attach a transfer screenshot or provide the transaction reference'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          gender,
          phone,
          email,
          planId: currentPlan?.id || planId,
          trainerId: trainerId || undefined,
          planPriceEGP: planPrice,
          trainerFeeEGP: trainerFee,
          preferredShift,
          paymentMethodId: currentPayment?.id || paymentMethodId,
          transactionRef,
          proofImageUrl,
          totalAmountEGP: totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setCompletedOrder({
        orderCode: data.data.orderCode,
        totalAmountEGP: data.data.totalAmountEGP,
        customerName: data.data.customerName,
      });

      // Save to localStorage so user can always track their order on this device
      try {
        localStorage.setItem('gym_last_order_code', data.data.orderCode);
        const existing = JSON.parse(localStorage.getItem('gym_user_orders') || '[]');
        const filtered = existing.filter((o: any) => o.orderCode !== data.data.orderCode);
        filtered.unshift(data.data);
        localStorage.setItem('gym_user_orders', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || (isRTL ? 'حدث خطأ أثناء إرسال الطلب' : 'An error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAccount = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] flex flex-col bg-gym-950 border border-gym-lime/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-gym-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gym-lime text-black flex items-center justify-center font-black shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-black text-white font-display uppercase tracking-wide truncate">
                {isRTL ? 'حجز وتأكيد العضوية' : 'Membership Reservation'}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                {isRTL ? 'خطوات بسيطة للانضمام إلى نخبة أبطال جيم آند لينو' : 'Simple steps to join the elite at Gym & Leno'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeBookingModal}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {step < 3 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-xs font-bold text-gray-400 border-b border-white/5 shrink-0 bg-gym-950/90">
            <span className={`text-[11px] sm:text-xs shrink-0 ${step >= 1 ? 'text-gym-lime font-black' : ''}`}>
              1. {isRTL ? 'البيانات والباقة' : 'Personal & Plan'}
            </span>
            <div className="flex-1 mx-2.5 sm:mx-4 h-0.5 bg-white/10 relative">
              <div className={`h-full bg-gym-lime transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <span className={`text-[11px] sm:text-xs shrink-0 ${step >= 2 ? 'text-gym-lime font-black' : ''}`}>
              2. {isRTL ? 'طريقة الدفع والتأكيد' : 'Payment & Confirm'}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body with internal smooth scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          
          {/* STEP 1: Personal Info & Plan Choice */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? 'مثال: أحمد محمد رضوان' : 'e.g. John Doe'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gym-900 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
              </div>

              {/* Gender Selection: Male vs Female */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'تحديد النوع / الجنس (رجال / سيدات) *' : 'Gender (Men / Ladies) *'}
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('male');
                    }}
                    className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                      gender === 'male'
                        ? 'bg-gym-lime text-black border-gym-lime font-black shadow-lg shadow-gym-lime/20'
                        : 'bg-gym-900 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-base sm:text-lg">👨</span>
                    <span className="truncate">{isRTL ? 'ذكر (رجال / شباب)' : 'Male (Men)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGender('female');
                    }}
                    className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                      gender === 'female'
                        ? 'bg-gym-lime text-black border-gym-lime font-black shadow-lg shadow-gym-lime/20'
                        : 'bg-gym-900 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-base sm:text-lg">👩</span>
                    <span className="truncate">{isRTL ? 'أنثى (سيدات / بنات)' : 'Female (Ladies)'}</span>
                  </button>
                </div>
              </div>

              {/* Phone & Email: Full width stacked on mobile, side-by-side on md screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {isRTL ? 'رقم الهاتف (واتساب) *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder={isRTL ? '010XXXXXXXX' : '+20 100 000 0000'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gym-900 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gym-lime transition-colors text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gym-900 border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gym-lime transition-colors"
                  />
                </div>
              </div>

              {/* Plan Choice Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  {isRTL ? 'اختر باقة الاشتراك *' : 'Select Plan *'}
                </label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gym-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-gym-lime transition-colors"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isRTL ? p.nameAr : p.name} — {p.priceEGP.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trainer Choice (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {isRTL ? 'المدرب الشخصي الخاص (اختياري)' : 'Personal Trainer (Optional)'}
                  </label>
                  {trainerFee > 0 && (
                    <span className="text-[11px] font-black text-gym-lime">
                      +{trainerFee.toLocaleString()} {isRTL ? 'ج.م رسوم تدريب' : 'EGP'}
                    </span>
                  )}
                </div>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gym-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-gym-lime transition-colors"
                >
                  <option value="">
                    {isRTL ? '-- بدون مدرب خاص (اشتراك الجيم فقط) --' : '-- No coach (Gym access only) --'}
                  </option>
                  {trainers.map((t) => {
                    const fee = typeof t.priceEGP === 'number' ? t.priceEGP : 0;
                    const feeText = fee > 0 ? ` (+${fee.toLocaleString()} ${isRTL ? 'ج.م' : 'EGP'})` : ` (${isRTL ? 'مشمول مجاناً' : 'Free'})`;
                    return (
                      <option key={t.id} value={t.id}>
                        {isRTL ? t.nameAr : t.nameEn} — {isRTL ? t.specialtyAr : t.specialtyEn}{feeText}
                      </option>
                    );
                  })}
                </select>

                {currentTrainer && (
                  <div className="mt-2 p-2.5 sm:p-3 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-between text-xs animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gym-lime animate-pulse" />
                      <span className="text-white font-bold">
                        {isRTL ? `كابتن: ${currentTrainer.nameAr}` : `Coach: ${currentTrainer.nameEn}`}
                      </span>
                    </div>
                    <span className="font-mono font-black text-gym-lime">
                      {trainerFee > 0
                        ? `+${trainerFee.toLocaleString()} ${isRTL ? 'ج.م رسوم تدريب' : 'EGP coach fee'}`
                        : (isRTL ? 'مشمول مجاناً' : 'Included free')}
                    </span>
                  </div>
                )}
              </div>

              {/* Shift preference (Gender-specific) - Fully responsive and balanced */}
              <div>
                <div className="flex items-center justify-between flex-wrap gap-1.5 mb-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {isRTL
                      ? gender === 'female'
                        ? 'مواعيد وفترات تدريب السيدات المتاحة:'
                        : 'مواعيد وفترات تدريب الرجال المتاحة:'
                      : gender === 'female'
                      ? 'Ladies Workout Shifts:'
                      : 'Men Workout Shifts:'}
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-bold text-gym-lime bg-gym-lime/10 px-2 py-0.5 rounded-full border border-gym-lime/20">
                    {isRTL ? (gender === 'female' ? '🌸 خصوصية تامة للسيدات' : '⚡ فترات تدريب الرجال') : ''}
                  </span>
                </div>

                <div
                  className={`grid gap-2 sm:gap-2.5 ${
                    availableShifts.length === 1
                      ? 'grid-cols-1'
                      : availableShifts.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  }`}
                >
                  {availableShifts.map((s) => {
                    const shiftFullLabel = isRTL
                      ? `${s.labelAr} (${s.timeRangeAr})`
                      : `${s.labelEn} (${s.timeRangeEn})`;
                    const isSelected =
                      preferredShift === shiftFullLabel ||
                      preferredShift === s.labelAr ||
                      preferredShift.includes(s.labelAr);

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPreferredShift(shiftFullLabel)}
                        className={`p-3 sm:p-3.5 rounded-xl text-xs font-bold border transition-all text-right flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-gym-lime text-black border-gym-lime font-black shadow-lg shadow-gym-lime/20'
                            : 'bg-gym-900 text-gray-300 border-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 flex-1 text-right">
                          <span className="font-extrabold text-xs sm:text-sm leading-snug truncate">
                            {isRTL ? s.labelAr : s.labelEn}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold mt-1 ${
                              isSelected ? 'text-black/85' : 'text-gym-lime'
                            }`}
                          >
                            {isRTL ? s.timeRangeAr : s.timeRangeEn}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            isSelected
                              ? 'bg-black text-gym-lime border-black'
                              : 'border-white/20 bg-white/5'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 bg-gym-lime hover:bg-gym-accent-hover text-black py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/25 hover:shadow-gym-lime/40"
                >
                  <span>{isRTL ? 'التالي: اختيار طريقة الدفع' : 'Next: Payment Method'}</span>
                  <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Egyptian Payment Method & Confirmation */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Order Summary box with Trainer Fee Breakdown */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gym-900 border border-white/10 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-400 shrink-0">{isRTL ? 'رسوم باقة الجيم:' : 'Gym Plan Fee:'}</span>
                    <span className="font-bold text-white truncate">{isRTL ? currentPlan?.nameAr : currentPlan?.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white shrink-0">
                    {planPrice.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-400 shrink-0">{isRTL ? 'اشتراك المدرب الخاص:' : 'Personal Coach:'}</span>
                    <span className="font-bold text-white truncate">
                      {currentTrainer
                        ? isRTL
                          ? currentTrainer.nameAr
                          : currentTrainer.nameEn
                        : isRTL
                        ? 'بدون مدرب خاص'
                        : 'None'}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold shrink-0 ${
                      trainerFee > 0 ? 'text-gym-lime' : 'text-gray-500'
                    }`}
                  >
                    {trainerFee > 0
                      ? `+${trainerFee.toLocaleString()} ${isRTL ? 'ج.م' : 'EGP'}`
                      : isRTL
                      ? '0 ج.م'
                      : '0 EGP'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">{isRTL ? 'النوع والفترة المحددة:' : 'Gender & Shift:'}</span>
                    <span className="font-bold text-white">
                      {gender === 'female' ? (isRTL ? 'أنثى 👩' : 'Female 👩') : (isRTL ? 'ذكر 👨' : 'Male 👨')}
                    </span>
                  </div>
                  <span className="text-gym-lime text-[11px] font-mono font-bold">
                    {preferredShift}
                  </span>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block font-bold">
                      {isRTL ? 'إجمالي المبلغ المستحق:' : 'Total Amount Due:'}
                    </span>
                    <span className="text-[10px] text-gym-lime font-medium">
                      {isRTL ? '(مجموع الباقة + اشتراك المدرب)' : '(Plan + Coach Fee Total)'}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gym-lime font-display">
                    {totalAmount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                  </div>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {isRTL ? 'اختر طريقة الدفع المناسبة لك في مصر *' : 'Select Egyptian Payment Gateway *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {paymentMethods.filter((pm) => pm.isActive).map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethodId(pm.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                        paymentMethodId === pm.id
                          ? 'bg-gym-lime/10 border-gym-lime text-gym-lime shadow-md'
                          : 'bg-gym-900 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="truncate w-full">{isRTL ? pm.nameAr : pm.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Payment Instructions Card */}
              {currentPayment && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gym-900/90 border border-gym-lime/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase text-gym-lime">
                      {isRTL ? currentPayment.nameAr : currentPayment.nameEn}
                    </span>
                    {currentPayment.walletNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white bg-black/60 px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                          {isRTL ? 'رقم المحفظة:' : 'Wallet:'} {currentPayment.walletNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(currentPayment.walletNumber || '')}
                          className="p-1.5 rounded-lg bg-gym-800 hover:bg-gym-700 text-gym-lime transition-colors"
                          title={isRTL ? 'نسخ رقم المحفظة' : 'Copy'}
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                    {currentPayment.instapayHandle && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white bg-black/60 px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                          {currentPayment.instapayHandle}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount(currentPayment.instapayHandle || '')}
                          className="p-1.5 rounded-lg bg-gym-800 hover:bg-gym-700 text-gym-lime transition-colors"
                          title={isRTL ? 'نسخ عنوان انستاباي' : 'Copy'}
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isRTL ? currentPayment.instructionsAr : currentPayment.instructionsEn}
                  </p>

                  {/* Upload Screenshot / Receipt Proof */}
                  {currentPayment.type !== 'cash' && (
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-gym-lime" />
                          <span>{isRTL ? 'إرفاق سكرين شوت أو إشعار التحويل' : 'Attach Transfer Screenshot / Receipt'}</span>
                        </label>
                        <span className="text-[10px] text-gym-lime bg-gym-lime/10 px-2 py-0.5 rounded border border-gym-lime/30 font-bold">
                          {isRTL ? 'إلزامي للاعتماد الفوري' : 'Required for instant verification'}
                        </span>
                      </div>

                      <input
                        type="file"
                        ref={proofInputRef}
                        onChange={handleProofUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      {proofImageUrl ? (
                        <div className="p-3 rounded-xl bg-black/60 border border-gym-lime/40 flex items-center justify-between gap-3 animate-fade-in">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={proofImageUrl}
                              alt="Proof preview"
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isRTL ? 'تم رفع صورة التحويل بنجاح' : 'Screenshot uploaded'}</span>
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-gray-400 block truncate mt-0.5">
                                {isRTL ? 'سيتم التحقق منها واعتماد عضويتك' : 'Will be verified by administration'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => proofInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-lg bg-gym-800 hover:bg-gym-700 text-gray-200 text-xs font-semibold transition-colors"
                            >
                              {isRTL ? 'تغيير' : 'Change'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setProofImageUrl('')}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title={isRTL ? 'حذف الصورة' : 'Remove'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={uploadingProof}
                          onClick={() => proofInputRef.current?.click()}
                          className="w-full py-4 px-4 rounded-xl border border-dashed border-gym-lime/50 hover:border-gym-lime bg-gym-950/80 hover:bg-gym-lime/5 text-center flex flex-col items-center justify-center gap-1.5 transition-all group"
                        >
                          {uploadingProof ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin text-gym-lime mb-1" />
                              <span className="text-xs font-bold text-gym-lime">
                                {isRTL ? 'جاري رفع وحفظ صورة الإشعار...' : 'Uploading screenshot...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-gym-lime/10 group-hover:bg-gym-lime/20 flex items-center justify-center text-gym-lime transition-all">
                                <Upload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white group-hover:text-gym-lime transition-colors">
                                {isRTL ? 'اضغط هنا لرفع سكرين شوت التحويل من جهازك' : 'Click to upload transfer screenshot'}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {isRTL ? 'يدعم صور JPG, PNG, WebP (من الكاميرا أو المعرض)' : 'Supports JPG, PNG, WebP'}
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Transaction reference code */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">
                          {isRTL ? 'رقم التحويل أو كود العملية من الرسالة (اختياري مع الصورة):' : 'Transaction Reference (Optional with image):'}
                        </label>
                        <input
                          type="text"
                          placeholder={isRTL ? 'مثال: TX-9923841 أو رقم المحفظة المحول منها' : 'e.g. TX-9923841'}
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gym-lime"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons: Back + Confirm */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gym-900 hover:bg-gym-850 text-gray-300 text-xs font-bold border border-white/10 transition-colors"
                >
                  {isRTL ? 'السابق' : 'Back'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitBooking}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gym-lime hover:bg-gym-accent-hover text-black py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/25 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? 'جاري تأكيد الطلب...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isRTL ? 'تأكيد وإرسال طلب الاشتراك' : 'Submit & Confirm Membership'}</span>
                      <ArrowIcon className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Order Submitted Success Screen */}
          {step === 3 && completedOrder && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gym-lime/20 text-gym-lime flex items-center justify-center mx-auto border border-gym-lime/30">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
                  {isRTL ? 'تم إرسال طلب اشتراكك بنجاح!' : 'Booking Request Submitted!'}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                  {isRTL
                    ? 'شكراً لك! تم تسجيل طلبك في نظام إدارة الجيم وهو الآن قيد المراجعة والاعتماد من قبل الإدارة.'
                    : 'Thank you! Your membership order has been recorded and is pending verification by the gym administration.'}
                </p>
              </div>

              {/* Order Code Box */}
              <div className="p-4 rounded-2xl bg-gym-900 border border-white/10 max-w-sm mx-auto">
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                  {isRTL ? 'كود الطلب الخاص بك' : 'Your Order Code'}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-black text-gym-lime tracking-widest">
                    {completedOrder.orderCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-gym-800 hover:bg-gym-700 text-gray-300 hover:text-white transition-colors"
                    title={isRTL ? 'نسخ الكود' : 'Copy Code'}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <div className="text-[11px] text-gym-lime mt-1 font-bold">
                    {isRTL ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard'}
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="#track"
                  onClick={() => {
                    closeBookingModal();
                    setTimeout(() => {
                      const el = document.getElementById('track');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-black text-xs uppercase tracking-wider transition-all"
                >
                  {isRTL ? 'الاستعلام عن الاشتراك في الصفحة الرئيسية' : 'Check Status on Homepage'}
                </a>
                <button
                  onClick={closeBookingModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gym-900 hover:bg-gym-850 text-gray-300 text-xs font-bold border border-white/10"
                >
                  {isRTL ? 'إغلاق والعودة للموقع' : 'Close & Return'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
