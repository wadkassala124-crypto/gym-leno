'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Trainer } from '@/lib/types';

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: Trainer | null;
  onSave: (payload: any) => Promise<boolean>;
  onUpload: (file: File, customName?: string) => Promise<string | null>;
}

export default function TrainerModal({
  isOpen,
  onClose,
  trainer,
  onSave,
  onUpload,
}: TrainerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [specialtyAr, setSpecialtyAr] = useState('');
  const [specialtyEn, setSpecialtyEn] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [rating, setRating] = useState(4.9);
  const [priceEGP, setPriceEGP] = useState(500);
  const [image, setImage] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    if (trainer) {
      setNameAr(trainer.nameAr || '');
      setNameEn(trainer.nameEn || '');
      setSpecialtyAr(trainer.specialtyAr || '');
      setSpecialtyEn(trainer.specialtyEn || '');
      setBioAr(trainer.bioAr || '');
      setBioEn(trainer.bioEn || '');
      setExperienceYears(trainer.experienceYears || 5);
      setRating(trainer.rating || 4.9);
      setPriceEGP(trainer.priceEGP ?? 500);
      setImage(trainer.image || '');
      setInstagram(trainer.socialLinks?.instagram || '');
    } else {
      setNameAr('');
      setNameEn('');
      setSpecialtyAr('');
      setSpecialtyEn('');
      setBioAr('');
      setBioEn('');
      setExperienceYears(5);
      setRating(4.9);
      setPriceEGP(500);
      setImage('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80');
      setInstagram('');
    }
  }, [trainer, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await onUpload(file, `صورة المدرب ${nameAr || file.name}`);
    if (uploadedUrl) {
      setImage(uploadedUrl);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !specialtyAr.trim()) {
      alert('يرجى كتابة اسم وتخصص المدرب بالعربية على الأقل');
      return;
    }

    setSubmitting(true);
    const success = await onSave({
      id: trainer?.id,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      specialtyAr: specialtyAr.trim(),
      specialtyEn: specialtyEn.trim() || specialtyAr.trim(),
      bioAr: bioAr.trim(),
      bioEn: bioEn.trim() || bioAr.trim(),
      experienceYears: Number(experienceYears),
      rating: Number(rating),
      priceEGP: Math.max(0, Number(priceEGP) || 0),
      image: image.trim(),
      socialLinks: { instagram: instagram.trim() },
      availableDays: trainer?.availableDays || ['السبت', 'الاثنين', 'الأربعاء'],
      programsOffered: trainer?.programsOffered || [],
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gym-950 border border-gym-lime/30 rounded-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 bg-gym-900 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white font-display">
              {trainer ? 'تعديل بيانات المدرب' : 'إضافة مدرب جديد'}
            </h3>
            <p className="text-xs text-gray-400">
              {trainer ? `تعديل بيانات الكابتن: ${trainer.nameAr}` : 'إضافة مدرب جديد لفريق العمل وعرضه في الموقع'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload Row */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              صورة المدرب الشخصية
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gym-900 border border-white/10">
              <div className="relative w-20 h-20 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-gym-lime animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'جاري الرفع للتخزين...' : 'رفع صورة من جهازك مباشرة'}</span>
                </button>
                <div className="text-[11px] text-gray-400">
                  أو يمكنك كتابة رابط صورة خارجي:
                </div>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-gym-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-gym-lime"
                />
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالعربية *</label>
              <input
                type="text"
                required
                placeholder="مثال: كابتن حسام حسن"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                placeholder="e.g. Coach Hossam Hassan"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">التخصص الرياضي (عربي) *</label>
              <input
                type="text"
                required
                placeholder="مثال: مدرب لياقة بدنية وتضخيم عضلي"
                value={specialtyAr}
                onChange={(e) => setSpecialtyAr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">التخصص (إنجليزي)</label>
              <input
                type="text"
                placeholder="e.g. Strength & Conditioning Coach"
                value={specialtyEn}
                onChange={(e) => setSpecialtyEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
          </div>

          {/* Trainer Pricing Field */}
          <div className="p-4 rounded-2xl bg-gym-900 border border-gym-lime/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-gym-lime">
                سعر اشتراك / تدريب المدرب (ج.م) *
              </label>
              <span className="text-[10px] bg-gym-lime/10 text-gym-lime px-2 py-0.5 rounded font-bold">
                تجميع تلقائي مع رسوم الباقة
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="50"
                required
                value={priceEGP}
                onChange={(e) => setPriceEGP(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-sm font-black focus:outline-none focus:border-gym-lime"
                placeholder="مثال: 500"
              />
              <span className="text-xs font-bold text-gray-300 shrink-0">ج.م / اشتراك</span>
            </div>
            <p className="text-[11px] text-gray-400">
              عند اختيار العميل لهذا المدرب أثناء حجز الاشتراك، سيتم جمع هذا المبلغ مع سعر الباقة ويظهر في الإجمالي المستحق للعميل وللإدارة (اكتب 0 إذا كان المدرب مشمولاً مجاناً).
            </p>
          </div>

          {/* Stats: Experience & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">سنوات الخبرة</label>
              <input
                type="number"
                min="1"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">التقييم (من 5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 5)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">حساب إنستغرام (اختياري)</label>
              <input
                type="text"
                placeholder="@username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime font-mono"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">نبذة عن المدرب والشهادات (عربي)</label>
            <textarea
              rows={2}
              placeholder="اكتب نبذة مختصرة عن خبرة المدرب وأبرز إنجازاته الرياضية..."
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gym-900 hover:bg-gym-850 text-xs font-bold text-gray-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{trainer ? 'حفظ التعديلات' : 'إضافة المدرب الآن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
