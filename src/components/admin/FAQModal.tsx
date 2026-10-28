'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, HelpCircle } from 'lucide-react';
import { FAQItem } from '@/lib/types';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQItem | null;
  onSave: (payload: any) => Promise<boolean>;
}

export default function FAQModal({
  isOpen,
  onClose,
  faq,
  onSave,
}: FAQModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const [questionAr, setQuestionAr] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [answerAr, setAnswerAr] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (faq) {
      setQuestionAr(faq.questionAr || '');
      setQuestionEn(faq.questionEn || '');
      setAnswerAr(faq.answerAr || '');
      setAnswerEn(faq.answerEn || '');
      setIsActive(faq.isActive !== false);
      setSortOrder(faq.sortOrder ?? 1);
    } else {
      setQuestionAr('');
      setQuestionEn('');
      setAnswerAr('');
      setAnswerEn('');
      setIsActive(true);
      setSortOrder(1);
    }
    setErrorMsg(null);
  }, [faq, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionAr.trim() && !questionEn.trim()) {
      setErrorMsg('يرجى كتابة نص السؤال (بالعربية أو الإنجليزية)');
      return;
    }
    if (!answerAr.trim() && !answerEn.trim()) {
      setErrorMsg('يرجى كتابة نص الإجابة (بالعربية أو الإنجليزية)');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      id: faq?.id,
      questionAr: questionAr.trim() || questionEn.trim(),
      questionEn: questionEn.trim() || questionAr.trim(),
      answerAr: answerAr.trim() || answerEn.trim(),
      answerEn: answerEn.trim() || answerAr.trim(),
      isActive,
      sortOrder: Number(sortOrder) || 1,
    };

    const success = await onSave(payload);
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gym-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-gym-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gym-lime/10 text-gym-lime flex items-center justify-center border border-gym-lime/20 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {faq ? 'تعديل السؤال والإجابة' : 'إضافة سؤال وإجابة جديدة'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                التحكم الكامل في نصوص وإجابات قسم الأسئلة الشائعة في الموقع
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Question Arabic */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص السؤال (باللغة العربية) <span className="text-gym-lime">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: ما هي مواعيد وأيام عمل الجيم؟"
              value={questionAr}
              onChange={(e) => setQuestionAr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-gym-lime"
            />
          </div>

          {/* Question English */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص السؤال (English)
            </label>
            <input
              type="text"
              placeholder="e.g. What are the gym operating hours?"
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-gym-lime"
              dir="ltr"
            />
          </div>

          {/* Answer Arabic */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص الإجابة المعتمدة (باللغة العربية) <span className="text-gym-lime">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="اكتب الإجابة الدقيقة والواضحة التي تريد ظهورها للعملاء..."
              value={answerAr}
              onChange={(e) => setAnswerAr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-gym-lime resize-y leading-relaxed"
            />
          </div>

          {/* Answer English */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نص الإجابة (English)
            </label>
            <textarea
              rows={3}
              placeholder="Write the official answer in English..."
              value={answerEn}
              onChange={(e) => setAnswerEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gym-950 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-gym-lime resize-y leading-relaxed"
              dir="ltr"
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                ترتيب الظهور في الموقع
              </label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-xl bg-gym-950 border border-white/10 text-white text-xs focus:outline-none focus:border-gym-lime font-bold"
              />
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-gym-lime w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-white">تفعيل وعرض السؤال في الموقع</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-extrabold text-xs uppercase shadow-lg shadow-gym-lime/20 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{faq ? 'حفظ التعديلات' : 'إضافة السؤال'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
