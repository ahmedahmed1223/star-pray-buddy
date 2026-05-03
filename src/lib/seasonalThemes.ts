// نظام ثيمات وخلفيات موسمية دينية وفصلية
// يعتمد على التقويم الهجري والميلادي للكشف التلقائي

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

export type SeasonPattern = 'stars' | 'crescents' | 'lanterns' | 'snow' | 'leaves' | 'petals' | 'kaaba' | 'none';

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
    description: 'الثيم الذهبي الأصلي',
    bgFrom: '230 45% 8%', bgTo: '230 45% 16%',
    primary: '42 100% 55%', glow: '42 100% 65%',
    pattern: 'stars', particleColor: '45 100% 70%',
  },
  ramadan: {
    key: 'ramadan', label: 'رمضان', emoji: '🌙',
    description: 'فوانيس وأهلّة وليالي مباركة',
    bgFrom: '260 50% 10%', bgTo: '280 45% 18%',
    primary: '42 100% 60%', glow: '42 100% 70%',
    pattern: 'lanterns', particleColor: '42 100% 65%',
  },
  laylat_qadr: {
    key: 'laylat_qadr', label: 'ليلة القدر', emoji: '✨',
    description: 'سماء مرصّعة بالنور',
    bgFrom: '250 60% 8%', bgTo: '270 55% 16%',
    primary: '50 100% 65%', glow: '50 100% 75%',
    pattern: 'stars', particleColor: '50 100% 75%',
  },
  eid_fitr: {
    key: 'eid_fitr', label: 'عيد الفطر', emoji: '🎉',
    description: 'ألوان فرح وزينة',
    bgFrom: '320 45% 15%', bgTo: '280 50% 22%',
    primary: '320 80% 60%', glow: '340 90% 70%',
    pattern: 'petals', particleColor: '330 80% 70%',
  },
  hajj: {
    key: 'hajj', label: 'الحج', emoji: '🕋',
    description: 'عشر ذي الحجة المباركة',
    bgFrom: '30 35% 12%', bgTo: '20 30% 20%',
    primary: '40 90% 55%', glow: '40 95% 65%',
    pattern: 'kaaba', particleColor: '40 90% 65%',
  },
  eid_adha: {
    key: 'eid_adha', label: 'عيد الأضحى', emoji: '🐑',
    description: 'فرحة العيد الكبير',
    bgFrom: '15 40% 14%', bgTo: '35 45% 22%',
    primary: '25 90% 55%', glow: '35 95% 65%',
    pattern: 'crescents', particleColor: '35 90% 70%',
  },
  ashura: {
    key: 'ashura', label: 'عاشوراء', emoji: '🤲',
    description: 'يوم الصيام والذكر',
    bgFrom: '210 40% 10%', bgTo: '220 35% 18%',
    primary: '200 80% 55%', glow: '200 85% 65%',
    pattern: 'crescents', particleColor: '200 80% 70%',
  },
  mawlid: {
    key: 'mawlid', label: 'المولد النبوي', emoji: '🕌',
    description: 'ذكرى مولد الحبيب ﷺ',
    bgFrom: '160 40% 10%', bgTo: '180 35% 18%',
    primary: '160 70% 50%', glow: '170 80% 60%',
    pattern: 'crescents', particleColor: '160 70% 65%',
  },
  spring: {
    key: 'spring', label: 'الربيع', emoji: '🌸',
    description: 'زهور وأخضرار',
    bgFrom: '140 35% 14%', bgTo: '120 40% 22%',
    primary: '120 65% 55%', glow: '140 70% 65%',
    pattern: 'petals', particleColor: '320 70% 75%',
  },
  summer: {
    key: 'summer', label: 'الصيف', emoji: '☀️',
    description: 'دفء وشمس مشرقة',
    bgFrom: '35 50% 14%', bgTo: '20 55% 22%',
    primary: '35 95% 55%', glow: '45 100% 65%',
    pattern: 'stars', particleColor: '45 100% 70%',
  },
  autumn: {
    key: 'autumn', label: 'الخريف', emoji: '🍂',
    description: 'ألوان دافئة وأوراق ذهبية',
    bgFrom: '25 45% 12%', bgTo: '15 40% 20%',
    primary: '25 85% 55%', glow: '35 90% 60%',
    pattern: 'leaves', particleColor: '25 80% 60%',
  },
  winter: {
    key: 'winter', label: 'الشتاء', emoji: '❄️',
    description: 'هدوء وثلج',
    bgFrom: '210 40% 12%', bgTo: '220 35% 20%',
    primary: '200 75% 60%', glow: '200 85% 70%',
    pattern: 'snow', particleColor: '200 30% 90%',
  },
};

const STORAGE_KEY = 'seasonal-theme';

export function getStoredSeasonalTheme(): SeasonalThemeKey {
  if (typeof localStorage === 'undefined') return 'auto';
  return (localStorage.getItem(STORAGE_KEY) as SeasonalThemeKey) || 'auto';
}

export function setStoredSeasonalTheme(key: SeasonalThemeKey) {
  localStorage.setItem(STORAGE_KEY, key);
  applySeasonalTheme(key);
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
