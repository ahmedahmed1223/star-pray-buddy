// Hijri date using Intl.DateTimeFormat with Umm al-Qura calendar (official Saudi calendar)

const HIJRI_MONTHS_AR = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'
];

export function toHijri(date: Date): { year: number; month: number; day: number; monthName: string } {
  try {
    const fmt = new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = fmt.formatToParts(date);
    const day = Number(parts.find(p => p.type === 'day')?.value ?? 1);
    const month = Number(parts.find(p => p.type === 'month')?.value ?? 1);
    const year = Number(parts.find(p => p.type === 'year')?.value ?? 1446);

    return { year, month, day, monthName: HIJRI_MONTHS_AR[month - 1] || '' };
  } catch {
    // Fallback for environments without Intl support
    return { year: 1446, month: 1, day: 1, monthName: HIJRI_MONTHS_AR[0] };
  }
}

export function formatHijri(date: Date): string {
  const h = toHijri(date);
  return `${h.day} ${h.monthName} ${h.year} هـ`;
}
