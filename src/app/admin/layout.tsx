import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة تحكم الإدارة | Gym & Leno Admin Dashboard',
  description: 'لوحة التحكم الإدارية الشاملة لإدارة محتوى وأعضاء واشتراكات جيم آند لينو',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-gym-950 text-white font-arabic selection:bg-gym-lime selection:text-black">
      {children}
    </div>
  );
}
