import avatarBoy1 from '@/assets/avatar-boy1.png';
import avatarGirl1 from '@/assets/avatar-girl1.png';
import avatarBoy2 from '@/assets/avatar-boy2.png';
import avatarGirl2 from '@/assets/avatar-girl2.png';
import avatarBoy3 from '@/assets/avatar-boy3.png';
import avatarGirl3 from '@/assets/avatar-girl3.png';
import avatarBoy4 from '@/assets/avatar-boy4.png';
import avatarGirl4 from '@/assets/avatar-girl4.png';
import avatarBoy5 from '@/assets/avatar-boy5.png';
import avatarGirl5 from '@/assets/avatar-girl5.png';

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
  fajrJamaah?: boolean;
  dhuhrJamaah?: boolean;
  asrJamaah?: boolean;
  maghribJamaah?: boolean;
  ishaJamaah?: boolean;
}

export interface MoneyReward {
  enabled: boolean;
  amountPerPrayers: number;
  prayersNeeded: number;
  currency: string;
}

export interface CustomActivity {
  id: string;
  name: string;
  emoji: string;
  starsPerCompletion: number;
}

export interface ActivityLog {
  childId: string;
  date: string;
  activityId: string;
  done: boolean;
}

export interface GiftTier {
  id: string;
  name: string;
  starsRequired: number;
  emoji: string;
}

export interface AppSettings {
  jamaahEnabled: boolean;
  jamaahRewardAmount: number;
  allowChildPastEdit: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (data: AppData, childId: string) => boolean;
}

export interface AppData {
  pin: string;
  children: Child[];
  prayerLogs: PrayerLog[];
  rewardText: string;
  rewardGoal: number;
  moneyReward: MoneyReward;
  settings: AppSettings;
  customActivities: CustomActivity[];
  activityLogs: ActivityLog[];
  giftTiers: GiftTier[];
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
  settings: {
    jamaahEnabled: false,
    jamaahRewardAmount: 5,
    allowChildPastEdit: false,
  },
  customActivities: [],
  activityLogs: [],
  giftTiers: [],
};

export function getData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  const data = JSON.parse(raw);
  if (!data.moneyReward) data.moneyReward = { ...defaultData.moneyReward };
  if (!data.settings) data.settings = { ...defaultData.settings };
  if (!data.customActivities) data.customActivities = [];
  if (!data.activityLogs) data.activityLogs = [];
  if (!data.giftTiers) data.giftTiers = [];
  return data;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// === PIN ===
export function verifyPin(pin: string): boolean {
  return getData().pin === pin;
}

export function setPin(pin: string) {
  const data = getData();
  data.pin = pin;
  saveData(data);
}

// === CHILDREN ===
export function addChild(name: string, avatarIndex: number): Child {
  const data = getData();
  const child: Child = { id: crypto.randomUUID(), name, avatarIndex, totalStars: 0 };
  data.children.push(child);
  saveData(data);
  return child;
}

export function removeChild(id: string) {
  const data = getData();
  data.children = data.children.filter(c => c.id !== id);
  data.prayerLogs = data.prayerLogs.filter(l => l.childId !== id);
  data.activityLogs = data.activityLogs.filter(l => l.childId !== id);
  saveData(data);
}

export function getChildren(): Child[] {
  return getData().children;
}

export function getChild(id: string): Child | undefined {
  return getData().children.find(c => c.id === id);
}

// === SETTINGS ===
export function getSettings(): AppSettings {
  return getData().settings;
}

export function updateSettings(settings: Partial<AppSettings>) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  saveData(data);
}

// === PRAYER LOGS ===
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateLog(childId: string, date: string): PrayerLog {
  const data = getData();
  let log = data.prayerLogs.find(l => l.childId === childId && l.date === date);
  if (!log) {
    log = { childId, date, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    data.prayerLogs.push(log);
    saveData(data);
  }
  return log;
}

export function getTodayLog(childId: string): PrayerLog {
  return getDateLog(childId, todayStr());
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type JamaahKey = 'fajrJamaah' | 'dhuhrJamaah' | 'asrJamaah' | 'maghribJamaah' | 'ishaJamaah';

export function togglePrayerForDate(childId: string, prayer: PrayerName, date: string): boolean {
  const data = getData();
  let log = data.prayerLogs.find(l => l.childId === childId && l.date === date);
  if (!log) {
    log = { childId, date, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    data.prayerLogs.push(log);
  }
  const wasChecked = log[prayer];
  log[prayer] = !wasChecked;

  const child = data.children.find(c => c.id === childId);
  if (child) {
    child.totalStars += log[prayer] ? 1 : -1;
    if (!log[prayer]) {
      const jamaahKey = `${prayer}Jamaah` as JamaahKey;
      log[jamaahKey] = false;
    }
  }

  saveData(data);
  return log[prayer];
}

export function togglePrayer(childId: string, prayer: PrayerName): boolean {
  return togglePrayerForDate(childId, prayer, todayStr());
}

export function toggleJamaah(childId: string, prayer: PrayerName, date: string): boolean {
  const data = getData();
  let log = data.prayerLogs.find(l => l.childId === childId && l.date === date);
  if (!log) return false;
  
  const jamaahKey = `${prayer}Jamaah` as JamaahKey;
  if (!log[prayer]) return false;
  
  log[jamaahKey] = !log[jamaahKey];
  saveData(data);
  return log[jamaahKey] ?? false;
}

export function getChildProgress(childId: string): { today: number; total: number } {
  const data = getData();
  const today = todayStr();
  const log = data.prayerLogs.find(l => l.childId === childId && l.date === today);
  const todayCount = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
  const child = data.children.find(c => c.id === childId);
  return { today: todayCount, total: child?.totalStars ?? 0 };
}

export function getDateProgress(childId: string, date: string): number {
  const data = getData();
  const log = data.prayerLogs.find(l => l.childId === childId && l.date === date);
  return log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
}

export function getJamaahCount(childId: string): number {
  const data = getData();
  let count = 0;
  for (const log of data.prayerLogs.filter(l => l.childId === childId)) {
    if (log.fajrJamaah) count++;
    if (log.dhuhrJamaah) count++;
    if (log.asrJamaah) count++;
    if (log.maghribJamaah) count++;
    if (log.ishaJamaah) count++;
  }
  return count;
}

// === STREAK ===
export function getStreak(childId: string): { current: number; best: number } {
  const data = getData();
  const today = new Date();
  let current = 0;
  let best = 0;
  let streak = 0;

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr);
    const complete = log ? (log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) : false;

    if (complete) {
      streak++;
      if (i === 0 || (i > 0 && streak > 0)) {
        // continue streak
      }
    } else {
      if (i === 0) {
        // Today not complete yet, check from yesterday
        streak = 0;
      } else {
        break;
      }
    }
  }
  current = streak;

  // Calculate best streak
  streak = 0;
  const allDates = data.prayerLogs
    .filter(l => l.childId === childId)
    .map(l => l.date)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  for (const dateStr of allDates) {
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr);
    const complete = log ? (log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) : false;
    if (complete) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }

  return { current, best };
}

// === BADGES ===
export const BADGES: Badge[] = [
  {
    id: 'first_day',
    name: 'أول يوم كامل',
    description: 'أتممت جميع الصلوات في يوم واحد',
    icon: '🌟',
    condition: (data, childId) => {
      return data.prayerLogs.some(l => l.childId === childId && l.fajr && l.dhuhr && l.asr && l.maghrib && l.isha);
    },
  },
  {
    id: 'week_streak',
    name: 'أسبوع متواصل',
    description: '7 أيام متتالية من الصلوات الكاملة',
    icon: '🔥',
    condition: (_data, childId) => getStreak(childId).best >= 7,
  },
  {
    id: 'month_streak',
    name: 'شهر كامل',
    description: '30 يوم متتالي من الصلوات الكاملة',
    icon: '🏆',
    condition: (_data, childId) => getStreak(childId).best >= 30,
  },
  {
    id: 'jamaah_10',
    name: '10 صلوات جماعة',
    description: 'صليت 10 صلوات في الجماعة',
    icon: '🕌',
    condition: (_data, childId) => getJamaahCount(childId) >= 10,
  },
  {
    id: 'star_50',
    name: '50 نجمة',
    description: 'جمعت 50 نجمة',
    icon: '⭐',
    condition: (data, childId) => {
      const child = data.children.find(c => c.id === childId);
      return (child?.totalStars ?? 0) >= 50;
    },
  },
  {
    id: 'star_100',
    name: '100 نجمة',
    description: 'جمعت 100 نجمة',
    icon: '💎',
    condition: (data, childId) => {
      const child = data.children.find(c => c.id === childId);
      return (child?.totalStars ?? 0) >= 100;
    },
  },
];

export function getEarnedBadges(childId: string): Badge[] {
  const data = getData();
  return BADGES.filter(b => b.condition(data, childId));
}

// === REWARDS ===
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
  let total = Math.floor(child.totalStars / data.moneyReward.prayersNeeded) * data.moneyReward.amountPerPrayers;
  if (data.settings.jamaahEnabled) {
    total += getJamaahCount(childId) * data.settings.jamaahRewardAmount;
  }
  return total;
}

export function resetChildStars(childId: string) {
  const data = getData();
  const child = data.children.find(c => c.id === childId);
  if (child) child.totalStars = 0;
  saveData(data);
}

// === GIFT TIERS ===
export function getGiftTiers(): GiftTier[] {
  return getData().giftTiers;
}

export function addGiftTier(name: string, starsRequired: number, emoji: string): GiftTier {
  const data = getData();
  const tier: GiftTier = { id: crypto.randomUUID(), name, starsRequired, emoji };
  data.giftTiers.push(tier);
  data.giftTiers.sort((a, b) => a.starsRequired - b.starsRequired);
  saveData(data);
  return tier;
}

export function removeGiftTier(id: string) {
  const data = getData();
  data.giftTiers = data.giftTiers.filter(t => t.id !== id);
  saveData(data);
}

export function updateGiftTier(id: string, updates: Partial<GiftTier>) {
  const data = getData();
  const tier = data.giftTiers.find(t => t.id === id);
  if (tier) Object.assign(tier, updates);
  data.giftTiers.sort((a, b) => a.starsRequired - b.starsRequired);
  saveData(data);
}

// === CUSTOM ACTIVITIES ===
export function getCustomActivities(): CustomActivity[] {
  return getData().customActivities;
}

export function addCustomActivity(name: string, emoji: string, starsPerCompletion: number): CustomActivity {
  const data = getData();
  const activity: CustomActivity = { id: crypto.randomUUID(), name, emoji, starsPerCompletion };
  data.customActivities.push(activity);
  saveData(data);
  return activity;
}

export function removeCustomActivity(id: string) {
  const data = getData();
  data.customActivities = data.customActivities.filter(a => a.id !== id);
  data.activityLogs = data.activityLogs.filter(l => l.activityId !== id);
  saveData(data);
}

export function toggleActivity(childId: string, activityId: string, date: string): boolean {
  const data = getData();
  let log = data.activityLogs.find(l => l.childId === childId && l.activityId === activityId && l.date === date);
  if (!log) {
    log = { childId, date, activityId, done: true };
    data.activityLogs.push(log);
  } else {
    log.done = !log.done;
  }

  const activity = data.customActivities.find(a => a.id === activityId);
  const child = data.children.find(c => c.id === childId);
  if (child && activity) {
    child.totalStars += log.done ? activity.starsPerCompletion : -activity.starsPerCompletion;
  }

  saveData(data);
  return log.done;
}

export function getActivityLog(childId: string, activityId: string, date: string): boolean {
  const data = getData();
  const log = data.activityLogs.find(l => l.childId === childId && l.activityId === activityId && l.date === date);
  return log?.done ?? false;
}

// === WEEKLY / MONTHLY LOGS ===
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

export function getMonthlyLogs(childId: string, year?: number, month?: number): { date: string; count: number }[] {
  const data = getData();
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const result: { date: string; count: number }[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(y, m, day);
    const dateStr = d.toISOString().split('T')[0];
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr);
    const count = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
    result.push({ date: dateStr, count });
  }
  return result;
}

export function isDateComplete(childId: string, date: string): boolean {
  const data = getData();
  const log = data.prayerLogs.find(l => l.childId === childId && l.date === date);
  if (!log) return false;
  return log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha;
}

export function isTodayComplete(childId: string): boolean {
  return isDateComplete(childId, todayStr());
}

// === AVATARS ===
export const AVATAR_IMAGES = [avatarBoy1, avatarGirl1, avatarBoy2, avatarGirl2, avatarBoy3, avatarGirl3, avatarBoy4, avatarGirl4, avatarBoy5, avatarGirl5];
export const AVATAR_LABELS = ['ولد ١', 'بنت ١', 'ولد ٢', 'بنت ٢', 'ولد ٣', 'بنت ٣', 'ولد ٤', 'بنت ٤', 'ولد ٥', 'بنت ٥'];

// === PRAYER NAMES ===
export const PRAYER_NAMES: { key: PrayerName; label: string; emoji: string; color: string }[] = [
  { key: 'fajr', label: 'الفجر', emoji: '🌅', color: 'from-indigo-500 to-purple-600' },
  { key: 'dhuhr', label: 'الظهر', emoji: '☀️', color: 'from-yellow-500 to-orange-500' },
  { key: 'asr', label: 'العصر', emoji: '🌤️', color: 'from-amber-500 to-yellow-600' },
  { key: 'maghrib', label: 'المغرب', emoji: '🌇', color: 'from-red-500 to-orange-600' },
  { key: 'isha', label: 'العشاء', emoji: '🌙', color: 'from-blue-600 to-indigo-700' },
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

// === REPORTS ===
export function getYearlyStats(childId: string): { month: number; prayers: number; jamaah: number; activities: number }[] {
  const data = getData();
  const now = new Date();
  const year = now.getFullYear();
  const result: { month: number; prayers: number; jamaah: number; activities: number }[] = [];

  for (let m = 0; m < 12; m++) {
    const logs = data.prayerLogs.filter(l => {
      if (l.childId !== childId) return false;
      const d = new Date(l.date);
      return d.getFullYear() === year && d.getMonth() === m;
    });
    const prayers = logs.reduce((sum, l) => sum + [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length, 0);
    const jamaah = logs.reduce((sum, l) => sum + [l.fajrJamaah, l.dhuhrJamaah, l.asrJamaah, l.maghribJamaah, l.ishaJamaah].filter(Boolean).length, 0);
    const activities = data.activityLogs.filter(a => {
      if (a.childId !== childId || !a.done) return false;
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === m;
    }).length;
    result.push({ month: m, prayers, jamaah, activities });
  }
  return result;
}
