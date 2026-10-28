'use client';

import React, { useEffect } from 'react';

export default function TrackPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const code = new URLSearchParams(window.location.search).get('code');
      const target = code ? `/#track?code=${encodeURIComponent(code)}` : '/#track';
      window.location.replace(target);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gym-950 text-white flex flex-col items-center justify-center p-6 text-center font-arabic">
      <div className="w-12 h-12 rounded-2xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-lime animate-pulse mb-4">
        <span className="text-xl">⚡</span>
      </div>
      <h2 className="text-lg font-black text-white mb-2">جاري الانتقال إلى قسم الاستعلام في الصفحة الرئيسية...</h2>
      <p className="text-xs text-gray-400 mb-4">تم دمج نظام الاستعلام المباشر في الصفحة الرئيسية للجيم.</p>
      <a
        href="/#track"
        className="px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-lime-400 text-black font-extrabold text-xs transition-colors"
      >
        الذهاب إلى الاستعلام الآن
      </a>
    </div>
  );
}
