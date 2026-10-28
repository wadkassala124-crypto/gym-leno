import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GymProvider } from '@/context/GymContext';
import { getSiteSettings } from '@/lib/db';
import { getThemeCssVariables } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080808',
};

export const metadata: Metadata = {
  title: 'Gym & Leno | Elite Fitness & Sports Club',
  description:
    'Build your stronger self at Gym & Leno. Olympic gym equipment, certified personal trainers, sports nutrition, and modern luxury fitness facilities in Cairo, Egypt.',
  keywords: [
    'Gym in Egypt',
    'Cairo Gym',
    'New Cairo Fitness',
    'Gym & Leno',
    'Personal Trainer Egypt',
    'Bodybuilding Cairo',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let themeCss = '';
  try {
    const settings = await getSiteSettings();
    if (settings?.accentColor) {
      const vars = getThemeCssVariables(settings.accentColor);
      themeCss = `:root { ${Object.entries(vars)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ')} }`;
    }
  } catch {}

  return (
    <html lang="en">
      <head>
        {themeCss ? (
          <style id="gym-theme-root" dangerouslySetInnerHTML={{ __html: themeCss }} />
        ) : null}
      </head>
      <body className="bg-gym-950 text-white min-h-screen antialiased selection:bg-gym-lime selection:text-black">
        <GymProvider>{children}</GymProvider>
      </body>
    </html>
  );
}
