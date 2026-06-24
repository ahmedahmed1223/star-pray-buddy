// نظام ثيمات وخلفيات موسمية دينية وفصلية
// يعتمد على التقويم الهجري والميلادي للكشف التلقائي

import { storageGet, storageSet, storageRemove } from '@/lib/storage';
import { toHijri } from '@/lib/hijri';

export type SeasonalThemeKey =
  | 'auto'
  | 'default'
  | 'ramadan'
  | 'eid_fitr'
  | 'hajj'
  | 'eid_adha'
  | 'ashura'
  | 'mawlid'
  | 'laylat_qadr'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter';

export type SeasonPattern = 'stars' | 'crescents' | 'lanterns' | 'snow' | 'leaves' | 'petals' | 'kaaba' | 'balloons' | 'suns' | 'bubbles' | 'none';

export interface SeasonalTheme {
  key: Exclude<SeasonalThemeKey, 'auto'>;
  label: string;
  emoji: string;
  description: string;
  bgFrom: string;       // HSL "H S% L%"
  bgTo: string;
  primary: string;
  glow: string;
  pattern: SeasonPattern;
  particleColor: string;
}

export const SEASONAL_THEMES: Record<Exclude<SeasonalThemeKey, 'auto'>, SeasonalTheme> = {
  default: {
    key: 'default', label: 'افتراضي', emoji: '🌟',
    description: 'سماء مرحة بنجوم ذهبية',
    bgFrom: '230 55% 14%', bgTo: '250 60% 24%',
    primary: '45 100% 62%', glow: '50 100% 72%',
    pattern: 'stars', particleColor: '50 100% 78%',
  },
  ramadan: {
    key: 'ramadan', label: 'رمضان', emoji: '🌙',
    description: 'فوانيس مضيئة وألوان دافئة',
    bgFrom: '270 55% 16%', bgTo: '290 60% 28%',
    primary: '40 100% 65%', glow: '45 100% 75%',
    pattern: 'lanterns', particleColor: '42 100% 72%',
  },
  laylat_qadr: {
    key: 'laylat_qadr', label: 'ليلة القدر', emoji: '✨',
    description: 'سماء مرصّعة بالنور',
    bgFrom: '255 60% 14%', bgTo: '275 65% 24%',
    primary: '52 100% 70%', glow: '55 100% 80%',
    pattern: 'stars', particleColor: '55 100% 82%',
  },
  eid_fitr: {
    key: 'eid_fitr', label: 'عيد الفطر', emoji: '🎉',
    description: 'بالونات وألوان احتفال',
    bgFrom: '320 70% 22%', bgTo: '285 75% 32%',
    primary: '330 95% 70%', glow: '50 100% 75%',
    pattern: 'balloons', particleColor: '335 95% 80%',
  },
  hajj: {
    key: 'hajj', label: 'الحج', emoji: '🕋',
    description: 'عشر ذي الحجة المباركة',
    bgFrom: '35 50% 20%', bgTo: '25 55% 30%',
    primary: '42 95% 60%', glow: '48 100% 72%',
    pattern: 'kaaba', particleColor: '45 95% 72%',
  },
  eid_adha: {
    key: 'eid_adha', label: 'عيد الأضحى', emoji: '🐑',
    description: 'فرحة العيد الكبير',
    bgFrom: '20 60% 22%', bgTo: '40 65% 32%',
    primary: '30 95% 60%', glow: '40 100% 70%',
    pattern: 'balloons', particleColor: '40 95% 75%',
  },
  ashura: {
    key: 'ashura', label: 'عاشوراء', emoji: '🤲',
    description: 'يوم الصيام والذكر',
    bgFrom: '210 50% 16%', bgTo: '225 55% 26%',
    primary: '200 90% 65%', glow: '195 95% 75%',
    pattern: 'crescents', particleColor: '200 90% 80%',
  },
  mawlid: {
    key: 'mawlid', label: 'المولد النبوي', emoji: '🕌',
    description: 'ذكرى مولد الحبيب ﷺ',
    bgFrom: '160 60% 18%', bgTo: '185 65% 28%',
    primary: '165 90% 60%', glow: '155 100% 75%',
    pattern: 'crescents', particleColor: '160 95% 80%',
  },
  spring: {
    key: 'spring', label: 'الربيع', emoji: '🌸',
    description: 'زهور وردية وأخضر مشرق',
    bgFrom: '150 60% 28%', bgTo: '95 70% 40%',
    primary: '130 75% 60%', glow: '90 85% 70%',
    pattern: 'petals', particleColor: '335 90% 82%',
  },
  summer: {
    key: 'summer', label: 'الصيف', emoji: '☀️',
    description: 'شمس مشرقة وسماء صافية',
    bgFrom: '200 80% 35%', bgTo: '45 90% 60%',
    primary: '40 100% 60%', glow: '50 100% 72%',
    pattern: 'suns', particleColor: '50 100% 78%',
  },
  autumn: {
    key: 'autumn', label: 'الخريف', emoji: '🍂',
    description: 'أوراق ذهبية وألوان دافئة',
    bgFrom: '25 60% 22%', bgTo: '15 65% 32%',
    primary: '28 95% 60%', glow: '38 100% 68%',
    pattern: 'leaves', particleColor: '25 90% 68%',
  },
  winter: {
    key: 'winter', label: 'الشتاء', emoji: '❄️',
    description: 'هدوء وثلج ناعم',
    bgFrom: '205 55% 22%', bgTo: '215 60% 34%',
    primary: '195 85% 68%', glow: '200 95% 80%',
    pattern: 'snow', particleColor: '200 40% 95%',
  },
};

const STORAGE_KEY = 'seasonal-theme';

export function getStoredSeasonalTheme(): SeasonalThemeKey {
  if (typeof localStorage === 'undefined') return 'auto';
  return (storageGet(STORAGE_KEY) as SeasonalThemeKey) || 'auto';
}

export function setStoredSeasonalTheme(key: SeasonalThemeKey) {
  storageSet(STORAGE_KEY, key);
  applySeasonalTheme(key);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('seasonal-theme-change', { detail: key }));
  }
}

/** Detect appropriate theme based on Hijri/Gregorian date */
export function detectAutoTheme(date: Date = new Date()): Exclude<SeasonalThemeKey, 'auto'> {
  const h = toHijri(date);

  // Islamic priority
  if (h.month === 9) {
    if (h.day >= 21 && h.day % 2 === 1) return 'laylat_qadr';
    return 'ramadan';
  }
  if (h.month === 10 && h.day <= 3) return 'eid_fitr';
  if (h.month === 12 && h.day <= 9) return 'hajj';
  if (h.month === 12 && h.day >= 10 && h.day <= 13) return 'eid_adha';
  if (h.month === 1 && (h.day === 9 || h.day === 10)) return 'ashura';
  if (h.month === 3 && h.day === 12) return 'mawlid';

  // Seasons (northern hemisphere)
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

export function resolveTheme(key: SeasonalThemeKey): SeasonalTheme {
  if (key === 'auto') return SEASONAL_THEMES[detectAutoTheme()];
  return SEASONAL_THEMES[key as Exclude<SeasonalThemeKey, 'auto'>] || SEASONAL_THEMES.default;
}

export function applySeasonalTheme(key: SeasonalThemeKey) {
  if (typeof document === 'undefined') return;
  const theme = resolveTheme(key);
  const root = document.documentElement;
  root.style.setProperty('--season-bg-from', theme.bgFrom);
  root.style.setProperty('--season-bg-to', theme.bgTo);
  root.style.setProperty('--season-primary', theme.primary);
  root.style.setProperty('--season-glow', theme.glow);
  root.style.setProperty('--season-particle', theme.particleColor);

  // Cohesion: drive the global accent tokens from the active theme so that
  // buttons, gold text, rings and glows stay in harmony with background + shapes.
  // For the "default" theme we clear the overrides so index.css base values apply.
  if (theme.key === 'default') {
    ['--primary', '--ring', '--gold', '--gold-glow', '--star-yellow', '--lantern-orange', '--lantern-glow', '--accent']
      .forEach(v => root.style.removeProperty(v));
  } else {
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--gold', theme.primary);
    root.style.setProperty('--gold-glow', theme.glow);
    root.style.setProperty('--star-yellow', theme.glow);
    root.style.setProperty('--lantern-orange', theme.primary);
    root.style.setProperty('--lantern-glow', theme.glow);
    root.style.setProperty('--accent', theme.glow);
  }

  root.dataset.seasonPattern = theme.pattern;
  root.dataset.seasonKey = theme.key;
}

export function getActiveSeasonalTheme(): SeasonalTheme {
  return resolveTheme(getStoredSeasonalTheme());
}
