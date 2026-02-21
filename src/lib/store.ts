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

export interface AppData {
  pin: string;
  children: Child[];
  prayerLogs: PrayerLog[];
  rewardText: string;
  rewardGoal: number;
}

const STORAGE_KEY = 'salat-tracker-data';

const defaultData: AppData = {
  pin: '1234',
  children: [],
  prayerLogs: [],
  rewardText: 'Ice Cream Party! 🍦',
  rewardGoal: 50,
};

export function getData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultData };
  return JSON.parse(raw);
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

export const AVATARS = ['🧒', '👦', '👧', '🧒🏽', '👦🏽', '👧🏽', '🧒🏿', '👦🏿', '👧🏿', '👶', '👶🏽', '👶🏿'];

export const PRAYER_NAMES: { key: PrayerName; label: string; emoji: string }[] = [
  { key: 'fajr', label: 'Fajr', emoji: '🌅' },
  { key: 'dhuhr', label: 'Dhuhr', emoji: '☀️' },
  { key: 'asr', label: 'Asr', emoji: '🌤️' },
  { key: 'maghrib', label: 'Maghrib', emoji: '🌇' },
  { key: 'isha', label: 'Isha', emoji: '🌙' },
];
