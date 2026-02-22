import avatarBoy1 from '@/assets/avatar-boy1.png';
import avatarGirl1 from '@/assets/avatar-girl1.png';
import avatarBoy2 from '@/assets/avatar-boy2.png';
import avatarGirl2 from '@/assets/avatar-girl2.png';
import avatarBoy3 from '@/assets/avatar-boy3.png';
import avatarGirl3 from '@/assets/avatar-girl3.png';

export interface Child {
  id: string;
  name: string;
  avatarIndex: number;
  totalStars: number;
}

export interface PrayerLog {
  childId: string;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface MoneyReward {
  enabled: boolean;
  amountPerPrayers: number; // e.g. 10 dirhams
  prayersNeeded: number; // e.g. per 5 prayers
  currency: string; // e.g. "درهم"
}

export interface AppData {
  pin: string;
  children: Child[];
  prayerLogs: PrayerLog[];
  rewardText: string;
  rewardGoal: number;
  moneyReward: MoneyReward;
}

const STORAGE_KEY = 'salat-tracker-data';

const defaultData: AppData = {
  pin: '1234',
  children: [],
  prayerLogs: [],
  rewardText: 'آيس كريم عند 50 نجمة! 🍦',
  rewardGoal: 50,
  moneyReward: {
    enabled: false,
    amountPerPrayers: 10,
    prayersNeeded: 5,
    currency: 'درهم',
  },
};

export function getData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  const data = JSON.parse(raw);
  // Migration: add moneyReward if missing
  if (!data.moneyReward) {
    data.moneyReward = { ...defaultData.moneyReward };
  }
  return data;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function verifyPin(pin: string): boolean {
  return getData().pin === pin;
}

export function setPin(pin: string) {
  const data = getData();
  data.pin = pin;
  saveData(data);
}

export function addChild(name: string, avatarIndex: number): Child {
  const data = getData();
  const child: Child = {
    id: crypto.randomUUID(),
    name,
    avatarIndex,
    totalStars: 0,
  };
  data.children.push(child);
  saveData(data);
  return child;
}

export function removeChild(id: string) {
  const data = getData();
  data.children = data.children.filter(c => c.id !== id);
  data.prayerLogs = data.prayerLogs.filter(l => l.childId !== id);
  saveData(data);
}

export function getChildren(): Child[] {
  return getData().children;
}

export function getChild(id: string): Child | undefined {
  return getData().children.find(c => c.id === id);
}

export function getTodayLog(childId: string): PrayerLog {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  let log = data.prayerLogs.find(l => l.childId === childId && l.date === today);
  if (!log) {
    log = { childId, date: today, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    data.prayerLogs.push(log);
    saveData(data);
  }
  return log;
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export function togglePrayer(childId: string, prayer: PrayerName): boolean {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  let log = data.prayerLogs.find(l => l.childId === childId && l.date === today);
  if (!log) {
    log = { childId, date: today, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    data.prayerLogs.push(log);
  }
  const wasChecked = log[prayer];
  log[prayer] = !wasChecked;

  const child = data.children.find(c => c.id === childId);
  if (child) {
    child.totalStars += log[prayer] ? 1 : -1;
  }

  saveData(data);
  return log[prayer];
}

export function getChildProgress(childId: string): { today: number; total: number } {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  const log = data.prayerLogs.find(l => l.childId === childId && l.date === today);
  const todayCount = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
  const child = data.children.find(c => c.id === childId);
  return { today: todayCount, total: child?.totalStars ?? 0 };
}

export function setReward(text: string, goal: number) {
  const data = getData();
  data.rewardText = text;
  data.rewardGoal = goal;
  saveData(data);
}

export function getReward(): { text: string; goal: number } {
  const data = getData();
  return { text: data.rewardText, goal: data.rewardGoal };
}

export function setMoneyReward(moneyReward: MoneyReward) {
  const data = getData();
  data.moneyReward = moneyReward;
  saveData(data);
}

export function getMoneyReward(): MoneyReward {
  return getData().moneyReward;
}

export function getChildMoney(childId: string): number {
  const data = getData();
  const child = data.children.find(c => c.id === childId);
  if (!child || !data.moneyReward.enabled) return 0;
  return Math.floor(child.totalStars / data.moneyReward.prayersNeeded) * data.moneyReward.amountPerPrayers;
}

export function resetChildStars(childId: string) {
  const data = getData();
  const child = data.children.find(c => c.id === childId);
  if (child) {
    child.totalStars = 0;
  }
  saveData(data);
}

export function getWeeklyLogs(childId: string): { date: string; count: number; log: PrayerLog | null }[] {
  const data = getData();
  const result: { date: string; count: number; log: PrayerLog | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr) || null;
    const count = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
    result.push({ date: dateStr, count, log });
  }
  return result;
}

export function getMonthlyLogs(childId: string): { date: string; count: number }[] {
  const data = getData();
  const result: { date: string; count: number }[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr);
    const count = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
    result.push({ date: dateStr, count });
  }
  return result;
}

export function isTodayComplete(childId: string): boolean {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];
  const log = data.prayerLogs.find(l => l.childId === childId && l.date === today);
  if (!log) return false;
  return log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha;
}

export const AVATAR_IMAGES = [avatarBoy1, avatarGirl1, avatarBoy2, avatarGirl2, avatarBoy3, avatarGirl3];
export const AVATAR_LABELS = ['ولد ١', 'بنت ١', 'ولد ٢', 'بنت ٢', 'ولد ٣', 'بنت ٣'];

export const PRAYER_NAMES: { key: PrayerName; label: string; emoji: string }[] = [
  { key: 'fajr', label: 'الفجر', emoji: '🌅' },
  { key: 'dhuhr', label: 'الظهر', emoji: '☀️' },
  { key: 'asr', label: 'العصر', emoji: '🌤️' },
  { key: 'maghrib', label: 'المغرب', emoji: '🌇' },
  { key: 'isha', label: 'العشاء', emoji: '🌙' },
];

export const MOTIVATIONAL_MESSAGES = [
  'ماشاء الله! أحسنت! 🌟',
  'بارك الله فيك! 💫',
  'ممتاز! استمر! 🏮',
  'رائع! الله يبارك فيك! ✨',
  'أنت بطل الصلاة! 🏆',
  'صلاتك نور! 🌙',
];

export function getRandomMotivation(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}
