'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Program, Trainer } from '@/lib/types';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
  trainers: Trainer[];
  onSave: (payload: any) => Promise<boolean>;
  onUpload: (file: File, customName?: string) => Promise<string | null>;
}

export default function ProgramModal({
  isOpen,
  onClose,
  program,
  trainers,
  onSave,
  onUpload,
}: ProgramModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<Program['category']>('strength');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [difficulty, setDifficulty] = useState<Program['difficulty']>('Intermediate');
  const [difficultyAr, setDifficultyAr] = useState<Program['difficultyAr']>('متوسط');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [coachId, setCoachId] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (program) {
      setTitleAr(program.titleAr || '');
      setTitleEn(program.titleEn || '');
      setSlug(program.slug || '');
      setCategory(program.category || 'strength');
      setDescriptionAr(program.descriptionAr || '');
      setDescriptionEn(program.descriptionEn || '');
      setDurationWeeks(program.durationWeeks || 8);
      setDifficulty(program.difficulty || 'Intermediate');
      setDifficultyAr(program.difficultyAr || 'متوسط');
      setSessionsPerWeek(program.sessionsPerWeek || 4);
      setCoachId(program.coachId || '');
      setImage(program.image || '');
    } else {
      setTitleAr('');
      setTitleEn('');
      setSlug(`prog-${Date.now()}`);
      setCategory('strength');
      setDescriptionAr('');
      setDescriptionEn('');
      setDurationWeeks(8);
      setDifficulty('Intermediate');
      setDifficultyAr('متوسط');
      setSessionsPerWeek(4);
      setCoachId(trainers[0]?.id || '');
      setImage('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80');
    }
  }, [program, isOpen, trainers]);

  if (!isOpen) return null;

  const handleDifficultyChange = (val: string) => {
    if (val === 'Beginner') {
      setDifficulty('Beginner');
      setDifficultyAr('مبتدئ');
    } else if (val === 'Advanced') {
      setDifficulty('Advanced');
      setDifficultyAr('متقدم');
    } else if (val === 'All Levels') {
      setDifficulty('All Levels');
      setDifficultyAr('جميع المستويات');
    } else {
      setDifficulty('Intermediate');
      setDifficultyAr('متوسط');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadedUrl = await onUpload(file, `صورة برنامج ${titleAr || file.name}`);
    if (uploadedUrl) {
      setImage(uploadedUrl);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      alert('يرجى كتابة عنوان البرنامج بالعربية');
      return;
    }

    setSubmitting(true);
    const success = await onSave({
      id: program?.id,
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim() || titleAr.trim(),
      slug: slug.trim() || `prog-${Date.now()}`,
      category,
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim() || descriptionAr.trim(),
      durationWeeks: Number(durationWeeks),
      difficulty,
      difficultyAr,
      sessionsPerWeek: Number(sessionsPerWeek),
      coachId: coachId || undefined,
      image: image.trim(),
      highlightsAr: program?.highlightsAr || ['متابعة تدريبية دقيقة', 'خطة غذائية متكاملة', 'تقييم أسبوعي للتطور'],
      highlightsEn: program?.highlightsEn || ['Accurate tracking', 'Custom nutrition', 'Weekly review'],
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
              {program ? 'تعديل البرنامج التدريبي' : 'إضافة برنامج تدريبي جديد'}
            </h3>
            <p className="text-xs text-gray-400">
              {program ? `تعديل تفاصيل برنامج: ${program.titleAr}` : 'إضافة كورس أو برنامج جديد لقائمة برامج الجيم'}
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
              صورة غلاف البرنامج التدريبي
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gym-900 border border-white/10">
              <div className="relative w-28 h-20 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0">
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

          {/* Title AR / EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">عنوان البرنامج (عربي) *</label>
              <input
                type="text"
                required
                placeholder="مثال: بناء العضلات والضخامة القصوى"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">العنوان (إنجليزي)</label>
              <input
                type="text"
                placeholder="e.g. Muscle Hypertrophy & Strength"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
          </div>

          {/* Category & Coach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">تصنيف البرنامج</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              >
                <option value="strength">كمال أجسام وقوة عضلية (Strength)</option>
                <option value="fatloss">خسارة دهون وتنشيف (Fat Loss)</option>
                <option value="cardio">كارديو ولياقة بدنية (Cardio)</option>
                <option value="beginner">تأسيس للمبتدئين (Beginners)</option>
                <option value="endurance">تحمل ولياقة رياضية (Endurance)</option>
                <option value="personal">تدريب خاص VIP (Personal)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">المدرب المشرف</label>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              >
                <option value="">-- بدون مدرب محدد (إشراف عام) --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr} ({t.specialtyAr})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration, Sessions, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">مدة البرنامج (بالأسابيع)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 8)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الحصص أسبوعياً</label>
              <input
                type="number"
                min="1"
                max="7"
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(parseInt(e.target.value) || 4)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">مستوى الصعوبة</label>
              <select
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gym-900 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime"
              >
                <option value="Beginner">مبتدئ (Beginner)</option>
                <option value="Intermediate">متوسط (Intermediate)</option>
                <option value="Advanced">متقدم (Advanced)</option>
                <option value="All Levels">جميع المستويات (All Levels)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">شرح وتفاصيل البرنامج (عربي)</label>
            <textarea
              rows={2}
              placeholder="اكتب وصفاً جذاباً يشرح أهداف البرنامج والنتائج المتوقعة..."
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
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
                  <span>{program ? 'حفظ التعديلات' : 'إضافة البرنامج الآن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
