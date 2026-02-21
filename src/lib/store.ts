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
  rewardText: 'آيس كريم عند 50 نجمة! 🍦',
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

export const AVATAR_IMAGES = [avatarBoy1, avatarGirl1, avatarBoy2, avatarGirl2, avatarBoy3, avatarGirl3];
export const AVATAR_LABELS = ['ولد ١', 'بنت ١', 'ولد ٢', 'بنت ٢', 'ولد ٣', 'بنت ٣'];

export const PRAYER_NAMES: { key: PrayerName; label: string; emoji: string }[] = [
  { key: 'fajr', label: 'الفجر', emoji: '🌅' },
  { key: 'dhuhr', label: 'الظهر', emoji: '☀️' },
  { key: 'asr', label: 'العصر', emoji: '🌤️' },
  { key: 'maghrib', label: 'المغرب', emoji: '🌇' },
  { key: 'isha', label: 'العشاء', emoji: '🌙' },
];
