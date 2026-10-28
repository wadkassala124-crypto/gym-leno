/**
 * Dynamic Accent Theme Utilities for GYM & LENO
 * Converts hex colors into RGB space-separated values for Tailwind CSS variables
 * with full alpha channel support (e.g. bg-gym-lime/20, text-gym-lime).
 */

export interface ThemeColorOption {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  description: string;
}

export const THEME_COLOR_PRESETS: ThemeColorOption[] = [
  {
    id: 'lime',
    nameAr: 'أخضر ليموني رياضي (الافتراضي)',
    nameEn: 'Electric Lime',
    color: '#CCFF00',
    description: 'الطاقة والحيوية الرياضية العصرية',
  },
  {
    id: 'orange',
    nameAr: 'برتقالي حماسي نيون',
    nameEn: 'Vibrant Orange',
    color: '#FF5500',
    description: 'الحماس والقوة والاندفاع البدني',
  },
  {
    id: 'red',
    nameAr: 'أحمر قتالي حارق',
    nameEn: 'Combat Crimson',
    color: '#E63946',
    description: 'شغف القتال والتحدي الرياضي القوي',
  },
  {
    id: 'gold',
    nameAr: 'ذهبي فاخر VIP',
    nameEn: 'Luxury Gold',
    color: '#E5A93C',
    description: 'الفخامة والتميز للصالات الرياضية النخبوية',
  },
  {
    id: 'cyan',
    nameAr: 'أزرق كهربائي سايبر',
    nameEn: 'Cyber Cyan',
    color: '#00D2FF',
    description: 'الانتعاش والتكنولوجيا والأداء الحديث',
  },
  {
    id: 'purple',
    nameAr: 'بنفسجي ألترا نيون',
    nameEn: 'Ultra Purple',
    color: '#A855F7',
    description: 'الجرأة والأسلوب الفريد الاستثنائي',
  },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number; spaceSeparated: string; commaSeparated: string } {
  let cleaned = (hex || '').replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    // Default fallback to electric lime
    return { r: 204, g: 255, b: 0, spaceSeparated: '204 255 0', commaSeparated: '204, 255, 0' };
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return {
    r,
    g,
    b,
    spaceSeparated: `${r} ${g} ${b}`,
    commaSeparated: `${r}, ${g}, ${b}`,
  };
}

export function getHoverColor(hex: string): { hex: string; spaceSeparated: string } {
  const { r, g, b } = hexToRgb(hex);
  // Slightly adjust luminance for interactive hover states
  const hr = Math.max(0, Math.min(255, Math.round(r * 0.9)));
  const hg = Math.max(0, Math.min(255, Math.round(g * 0.9)));
  const hb = Math.max(0, Math.min(255, Math.round(b * 0.9)));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return {
    hex: `#${toHex(hr)}${toHex(hg)}${toHex(hb)}`,
    spaceSeparated: `${hr} ${hg} ${hb}`,
  };
}

/**
 * Calculates whether text on top of this color should be dark or white
 */
export function getContrastTextColor(hex: string): '#000000' | '#ffffff' {
  const { r, g, b } = hexToRgb(hex);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? '#000000' : '#ffffff';
}

/**
 * Returns the CSS custom properties needed for the theme
 */
export function getThemeCssVariables(hex: string) {
  const normHex = hex?.startsWith('#') ? hex : `#${hex || 'CCFF00'}`;
  const rgb = hexToRgb(normHex);
  const hover = getHoverColor(normHex);
  const contrast = getContrastTextColor(normHex);

  return {
    '--gym-accent': normHex,
    '--gym-accent-rgb': rgb.spaceSeparated,
    '--gym-accent-hover': hover.hex,
    '--gym-accent-hover-rgb': hover.spaceSeparated,
    '--gym-accent-contrast': contrast,
  };
}

/**
 * Client-safe helper to immediately inject the selected theme color into the DOM root
 */
export function applyThemeColor(hexColor: string): void {
  if (typeof window === 'undefined') return;
  const vars = getThemeCssVariables(hexColor);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}
