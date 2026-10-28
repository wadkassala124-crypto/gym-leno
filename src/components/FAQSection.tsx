'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const { isRTL, faqs } = useGym();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const activeFaqs = (faqs || []).filter((f) => f.isActive !== false);

  if (!activeFaqs || activeFaqs.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="py-24 bg-gym-950 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-gym-lime text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
            {isRTL ? 'إجابات واضحة' : 'Got Questions?'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
            {isRTL ? 'الأسئلة الشائعة والأجوبة' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-4">
          {activeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const question = isRTL ? faq.questionAr : (faq.questionEn || faq.questionAr);
            const answer = isRTL ? faq.answerAr : (faq.answerEn || faq.answerAr);

            return (
              <div
                key={faq.id || index}
                className="bg-gym-900 border border-white/10 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-6 text-start flex items-center justify-between gap-3 sm:gap-4 text-white hover:text-gym-lime transition-colors"
                >
                  <span className="text-sm sm:text-base md:text-lg font-bold font-display uppercase tracking-wide">
                    {question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gym-lime transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3.5 sm:pt-4 animate-fade-in whitespace-pre-line">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
