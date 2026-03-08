import { toHijri } from '@/lib/hijri';

/** Returns a time-based greeting with 6 prayer-aligned periods */
export function getGreeting(): { text: string; emoji: string; period: string } {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'طابت ليلتك', emoji: '🌙', period: 'night' };
  if (hour < 7) return { text: 'أسعد الله فجرك', emoji: '🌅', period: 'fajr' };
  if (hour < 12) return { text: 'صباح الخير', emoji: '☀️', period: 'morning' };
  if (hour < 15) return { text: 'مساء النور', emoji: '🌤️', period: 'dhuhr' };
  if (hour < 18) return { text: 'طاب عصرك', emoji: '🌇', period: 'asr' };
  if (hour < 20) return { text: 'طاب مغربك', emoji: '🌆', period: 'maghrib' };
  return { text: 'مساء الخير', emoji: '🌙', period: 'isha' };
}

export interface SeasonalInfo {
  message: string;
  emoji: string;
  season: 'ramadan' | 'eid_fitr' | 'eid_adha' | 'dhul_hijjah' | 'laylat_qadr' | 'mawlid' | 'normal';
  isSpecial: boolean;
}

/** Detects Islamic seasons/occasions based on Hijri calendar */
export function getSeasonalMessage(date: Date = new Date()): SeasonalInfo {
  const h = toHijri(date);

  // Ramadan (month 9)
  if (h.month === 9) {
    // Laylat al-Qadr — last 10 nights, odd nights (21, 23, 25, 27, 29)
    if (h.day >= 21 && h.day % 2 === 1) {
      return { message: 'تحرّوا ليلة القدر', emoji: '✨', season: 'laylat_qadr', isSpecial: true };
    }
    return { message: 'رمضان كريم', emoji: '🌙', season: 'ramadan', isSpecial: true };
  }

  // Eid al-Fitr (Shawwal 1-3)
  if (h.month === 10 && h.day <= 3) {
    return { message: 'عيد فطر مبارك', emoji: '🎉', season: 'eid_fitr', isSpecial: true };
  }

  // First 10 days of Dhul Hijjah
  if (h.month === 12 && h.day <= 9) {
    return { message: 'عشر ذي الحجة المباركة', emoji: '🕋', season: 'dhul_hijjah', isSpecial: true };
  }

  // Eid al-Adha (Dhul Hijjah 10-13)
  if (h.month === 12 && h.day >= 10 && h.day <= 13) {
    return { message: 'عيد أضحى مبارك', emoji: '🐑', season: 'eid_adha', isSpecial: true };
  }

  // Mawlid al-Nabi (Rabi al-Awwal 12)
  if (h.month === 3 && h.day === 12) {
    return { message: 'ذكرى المولد النبوي', emoji: '🕌', season: 'mawlid', isSpecial: true };
  }

  return { message: 'متابع الصلاة', emoji: '⭐', season: 'normal', isSpecial: false };
}
