'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, Loader2, Dumbbell } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gym-950 flex items-center justify-center p-4 relative font-arabic selection:bg-gym-lime selection:text-black">
      
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-gym-lime/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-gym-900 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gym-lime text-black flex items-center justify-center font-black mx-auto mb-4 shadow-lg shadow-gym-lime/20">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display">
            GYM & LENO
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-semibold">
            لوحة تحكم الإدارة الآمنة • Admin Control Panel
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              اسم المستخدم (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-gym-950 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gym-lime transition-colors"
              />
              <User className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              كلمة المرور (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-gym-950 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gym-lime transition-colors"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gym-lime hover:bg-gym-accent-hover text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-gym-lime/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق وتسجيل الدخول...</span>
              </>
            ) : (
              <span>دخول لوحة التحكم</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة إلى الموقع الرئيسي</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
