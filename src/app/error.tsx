'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Gym & Leno client runtime error captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gym-950 text-white flex flex-col items-center justify-center p-6 text-center selection:bg-gym-lime selection:text-black font-arabic">
      {/* Brand Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gym-lime text-black flex items-center justify-center font-black shadow-2xl shadow-gym-lime/20 mb-6 animate-pulse">
        <Dumbbell className="w-8 h-8 stroke-[2.5]" />
      </div>

      <span className="text-gym-lime text-xs font-extrabold uppercase tracking-widest px-3 py-1 bg-gym-lime/10 border border-gym-lime/20 rounded-full inline-block mb-3">
        GYM & LENO
      </span>

      <h1 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight mb-3">
        جاري تحديث الموقع وتنشيط البيانات
      </h1>

      <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        تم تحديث ملفات الموقع مؤخراً. يرجى الضغط على الزر أدناه لإعادة تحميل الصفحة وعرض أحدث نسخة من الموقع فوراً.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            } else {
              reset();
            }
          }}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gym-lime hover:bg-lime-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-gym-lime/25"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث وإعادة تحميل الصفحة</span>
        </button>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gym-900 hover:bg-gym-850 text-gray-300 text-sm font-bold border border-white/10 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
