'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, User, Phone, DollarSign, Dumbbell, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BookingOrder, MembershipPlan, Trainer, PaymentMethod, BookingStatus } from '@/lib/types';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingOrder | null;
  plans: MembershipPlan[];
  trainers: Trainer[];
  paymentMethods: PaymentMethod[];
  onSave: (payload: Partial<BookingOrder> & { id: string }) => Promise<boolean>;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  booking,
  plans,
  trainers,
  paymentMethods,
  onSave,
}: EditBookingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [planId, setPlanId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmountEGP, setTotalAmountEGP] = useState<number>(0);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [status, setStatus] = useState<BookingStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (booking) {
      setCustomerName(booking.customerName || '');
      setPhone(booking.phone || '');
      setGender(booking.gender || 'male');
      setPlanId(booking.planId || (plans[0]?.id || ''));
      setTrainerId(booking.trainerId || '');
      setPreferredShift(booking.preferredShift || '');
      setStartDate(booking.startDate || (booking.createdAt ? booking.createdAt.split('T')[0] : ''));
      setEndDate(booking.endDate || '');
      setTotalAmountEGP(booking.totalAmountEGP || 0);
      setPaymentMethodId(booking.paymentMethodId || (paymentMethods[0]?.id || 'pm-cash'));
      setTransactionRef(booking.transactionRef || '');
      setStatus(booking.status || 'pending');
      setAdminNotes(booking.adminNotes || '');
    }
    setErrorMsg(null);
  }, [booking, isOpen, plans, paymentMethods]);

  if (!isOpen || !booking) return null;

  // Helper: auto calculate end date based on selected plan
  const handleAutoCalcEndDate = () => {
    const selPlan = plans.find((p) => p.id === planId);
    const months = selPlan?.durationMonths || 1;
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setMonth(baseDate.getMonth() + months);
    setEndDate(baseDate.toISOString().split('T')[0]);
  };

  // Helper: auto calculate total amount based on selected plan and trainer
  const handleAutoCalcTotal = () => {
    const selPlan = plans.find((p) => p.id === planId);
    const selTrainer = trainers.find((t) => t.id === trainerId);
    const planPrice = selPlan ? selPlan.priceEGP : 0;
    const trainerPrice = selTrainer ? (selTrainer.priceEGP || 0) : 0;
    setTotalAmountEGP(planPrice + trainerPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('اسم العميل مطلوب');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('رقم الهاتف مطلوب');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const selPlan = plans.find((p) => p.id === planId);
    const selTrainer = trainers.find((t) => t.id === trainerId);

    const payload: Partial<BookingOrder> & { id: string } = {
      id: booking.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      gender,
      planId,
      trainerId: trainerId || undefined,
      planPriceEGP: selPlan ? selPlan.priceEGP : undefined,
      trainerFeeEGP: selTrainer ? (selTrainer.priceEGP || 0) : 0,
      preferredShift: preferredShift.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      totalAmountEGP: Number(totalAmountEGP) || 0,
      paymentMethodId,
      transactionRef: transactionRef.trim(),
      status,
      adminNotes: adminNotes.trim(),
    };

    const success = await onSave(payload);
    setSubmitting(false);

    if (success) {
      onClose();
    } else {
      setErrorMsg('حدث خطأ أثناء حفظ التعديلات');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-gym-950 border border-gym-lime/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gym-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-lime font-black">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">تعديل بيانات طلب الاشتراك</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-gym-lime/10 text-gym-lime border border-gym-lime/20 font-bold">
                  {booking.orderCode}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                تحديث بيانات العميل، الباقة، المدرب، التواريخ، والمبلغ المالي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: Customer Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gym-lime uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>بيانات المشترك</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">اسم المشترك *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                  placeholder="الاسم الثلاثي أو الثنائي"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف *</label>
                <input
                  type="text"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none text-right font-mono"
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الجنس</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                >
                  <option value="male">رجال 👨</option>
                  <option value="female">سيدات 👩</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Plan & Trainer */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gym-lime uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>الباقة والتدريب</span>
              </h4>
              <button
                type="button"
                onClick={handleAutoCalcTotal}
                className="text-[11px] font-bold text-gym-lime hover:underline flex items-center gap-1"
                title="إعادة حساب المبلغ الإجمالي من أسعار الباقة والمدرب"
              >
                <span>⚡ تحديث السعر تلقائياً</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الباقة المختارة</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr || p.name} ({p.priceEGP} ج.م / {p.durationLabelAr || `${p.durationMonths} شهر`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الكابتن / المدرب الخاص</label>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                >
                  <option value="">بدون مدرب خاص (اشتراك حر)</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameAr || t.nameEn} {t.priceEGP ? `(+${t.priceEGP} ج.م)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الموعد / الوردية</label>
                <input
                  type="text"
                  value={preferredShift}
                  onChange={(e) => setPreferredShift(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                  placeholder="مثال: مسائي (سيدات 1:00 - 6:00)"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Dates & Total Amount */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gym-lime uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>فترة الاشتراك والمبلغ المالي</span>
              </h4>
              <button
                type="button"
                onClick={handleAutoCalcEndDate}
                className="text-[11px] font-bold text-gym-lime hover:underline flex items-center gap-1"
                title="حساب تاريخ الانتهاء تلقائياً حسب تاريخ البداية ومدة الباقة"
              >
                <span>📅 حساب تاريخ الانتهاء تلقائياً</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">تاريخ بداية الاشتراك</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">تاريخ انتهاء الاشتراك</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">المبلغ الإجمالي (ج.م) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={totalAmountEGP}
                    onChange={(e) => setTotalAmountEGP(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-gym-lime font-mono font-bold text-sm focus:border-gym-lime focus:outline-none"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Payment & Status */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h4 className="text-xs font-black text-gym-lime uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>بيانات الدفع وحالة الطلب</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">طريقة الدفع</label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.nameAr || pm.nameEn}
                    </option>
                  ))}
                  <option value="pm-cash">دفع نقدي في الجيم</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">كود العملية / إشعار التحويل</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none font-mono"
                  placeholder="رقم الحوالة أو المرجع"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">حالة الطلب</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                    status === 'approved'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : status === 'pending'
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <option value="pending" className="bg-gym-900 text-yellow-400">
                    قيد المراجعة (معلق) ⏳
                  </option>
                  <option value="approved" className="bg-gym-900 text-green-400">
                    معتمد ومفعل ✅
                  </option>
                  <option value="rejected" className="bg-gym-900 text-red-400">
                    مرفوض ❌
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">ملاحظات الإدارة (داخلية)</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none resize-none"
                placeholder="أي ملاحظات خاصة بالدفع أو العضوية..."
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-black text-xs shadow-lg shadow-gym-lime/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
