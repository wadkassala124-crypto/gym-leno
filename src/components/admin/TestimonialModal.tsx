'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Save, Loader2, Star, User } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: Testimonial | null;
  onSave: (payload: any) => Promise<boolean>;
  onUpload: (file: File, customName?: string) => Promise<string | null>;
}

export default function TestimonialModal({
  isOpen,
  onClose,
  testimonial,
  onSave,
  onUpload,
}: TestimonialModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleAr, setRoleAr] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [commentAr, setCommentAr] = useState('');
  const [commentEn, setCommentEn] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState('');

  useEffect(() => {
    if (testimonial) {
      setNameAr(testimonial.nameAr || '');
      setNameEn(testimonial.nameEn || '');
      setRoleAr(testimonial.roleAr || '');
      setRoleEn(testimonial.roleEn || '');
      setCommentAr(testimonial.commentAr || '');
      setCommentEn(testimonial.commentEn || '');
      setRating(testimonial.rating || 5);
      setImage(testimonial.image || '');
    } else {
      setNameAr('');
      setNameEn('');
      setRoleAr('');
      setRoleEn('');
      setCommentAr('');
      setCommentEn('');
      setRating(5);
      setImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');
    }
  }, [testimonial, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await onUpload(file, `صورة العميل ${nameAr || file.name}`);
    if (uploadedUrl) {
      setImage(uploadedUrl);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !commentAr.trim()) {
      alert('يرجى إدخال اسم المشترك ورأيه بالعربية على الأقل');
      return;
    }

    setSubmitting(true);
    const success = await onSave({
      id: testimonial?.id,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      roleAr: roleAr.trim() || 'مشترك في النادي',
      roleEn: roleEn.trim() || (roleAr.trim() || 'Gym Member'),
      commentAr: commentAr.trim(),
      commentEn: commentEn.trim() || commentAr.trim(),
      rating: Number(rating),
      image: image.trim(),
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gym-950 border border-gym-lime/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gym-900/50">
          <div>
            <h3 className="text-xl font-black text-white font-display uppercase">
              {testimonial ? 'تعديل رأي المشترك' : 'إضافة رأي / قصة تحول جديدة'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              إدارة تجارب الأعضاء المعروضة في قسم آراء المشتركين على الصفحة الرئيسية
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Client Photo & Upload */}
          <div className="bg-gym-900/40 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gym-lime bg-gym-850 shrink-0">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black text-xs font-black transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة من جهازك</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-semibold block mb-1">
                  أو الصق رابط الصورة مباشرة:
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-gym-950 border border-white/10 text-white text-xs focus:border-gym-lime focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                اسم المشترك بالعربية <span className="text-gym-lime">*</span>
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: كريم مصطفى"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                اسم المشترك بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Karim Mostafa"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none"
              />
            </div>
          </div>

          {/* Roles / Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                الوصف / إنجاز التحول بالعربية
              </label>
              <input
                type="text"
                value={roleAr}
                onChange={(e) => setRoleAr(e.target.value)}
                placeholder="مثال: خسر 18 كجم خلال 4 أشهر"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                الوصف بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                placeholder="Lost 18kg in 4 Months"
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              تقييم العميل (عدد النجوم)
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    rating >= star
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                      : 'bg-gym-900 border-white/5 text-gray-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${rating >= star ? 'fill-yellow-400' : ''}`} />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Arabic */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص الرأي / قصة التحول بالعربية <span className="text-gym-lime">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={commentAr}
              onChange={(e) => setCommentAr(e.target.value)}
              placeholder="اكتب تجربة العميل ورأيه في الجيم والأجهزة والمدربين..."
              className="w-full px-4 py-3 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none leading-relaxed"
            />
          </div>

          {/* Comment English */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص الرأي بالإنجليزية (اختياري)
            </label>
            <textarea
              rows={2}
              value={commentEn}
              onChange={(e) => setCommentEn(e.target.value)}
              placeholder="Client quote in English..."
              className="w-full px-4 py-3 rounded-xl bg-gym-900 border border-white/10 text-white text-sm focus:border-gym-lime focus:outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-sm uppercase transition-all shadow-lg shadow-gym-lime/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{testimonial ? 'حفظ التعديلات' : 'إضافة التقييم الآن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
