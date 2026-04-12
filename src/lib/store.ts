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

// === DAILY GOALS ===
export interface DailyGoal {
  id: string;
  text: string;
  emoji: string;
  starsReward: number;
}

export interface DailyGoalLog {
  childId: string;
  date: string;
  goalId: string;
  completed: boolean;
}

// === QURAN TRACKER ===
export interface QuranLog {
  childId: string;
  date: string;
  pages: number;
}

// === SHOP ITEMS ===
export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  type: 'reward' | 'coupon';
  description?: string;
}

export interface RedemptionLog {
  id: string;
  childId: string;
  itemId: string;
  itemName: string;
  cost: number;
  date: string;
  redeemed: boolean;
}

// === PARENT MESSAGES ===
export interface ParentMessage {
  id: string;
  text: string;
  emoji: string;
  createdAt: string;
}

// === FAMILY CHALLENGES ===
export interface FamilyChallenge {
  id: string;
  title: string;
  emoji: string;
  target: number; // e.g. 5 days
  type: 'fajr_streak' | 'all_prayers' | 'jamaah' | 'custom';
  startDate: string;
  endDate: string;
  active: boolean;
}

// === CHILD THEMES ===
export type ChildThemeName = 'golden' | 'ocean' | 'garden' | 'purple' | 'cosmic' | 'pink';

export interface ChildTheme {
  label: string;
  emoji: string;
  primary: string;
  accent: string;
  glow: string;
}

export const CHILD_THEMES: Record<ChildThemeName, ChildTheme> = {
  golden: { label: 'ذهبي', emoji: '✨', primary: '42, 100%, 55%', accent: '25, 95%, 55%', glow: '42, 100%, 65%' },
  ocean: { label: 'محيط أزرق', emoji: '🌊', primary: '200, 80%, 50%', accent: '180, 60%, 45%', glow: '200, 80%, 60%' },
  garden: { label: 'حديقة خضراء', emoji: '🌿', primary: '140, 60%, 45%', accent: '120, 50%, 40%', glow: '140, 60%, 55%' },
  purple: { label: 'غروب بنفسجي', emoji: '🌅', primary: '280, 60%, 55%', accent: '320, 50%, 50%', glow: '280, 60%, 65%' },
  cosmic: { label: 'فضاء كوني', emoji: '🚀', primary: '260, 70%, 60%', accent: '180, 100%, 50%', glow: '260, 70%, 70%' },
  pink: { label: 'وردي ناعم', emoji: '🌸', primary: '340, 70%, 60%', accent: '320, 60%, 55%', glow: '340, 70%, 70%' },
};

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
  onboardingDone?: boolean;
  dailyGoalLogs?: DailyGoalLog[];
  quranLogs?: QuranLog[];
  shopItems?: ShopItem[];
  redemptionLogs?: RedemptionLog[];
  parentMessages?: ParentMessage[];
  familyChallenges?: FamilyChallenge[];
  childThemes?: Record<string, ChildThemeName>;
}

// === LEVELING SYSTEM ===
export interface Level {
  id: number;
  name: string;
  icon: string;
  minStars: number;
  color: string;
}

export const LEVELS: Level[] = [
  { id: 0, name: 'مبتدئ', icon: '🌱', minStars: 0, color: 'hsl(var(--muted-foreground))' },
  { id: 1, name: 'متعلم', icon: '📖', minStars: 25, color: 'hsl(var(--secondary))' },
  { id: 2, name: 'منتظم', icon: '⭐', minStars: 75, color: 'hsl(42, 100%, 55%)' },
  { id: 3, name: 'متميز', icon: '💎', minStars: 150, color: 'hsl(var(--accent))' },
  { id: 4, name: 'بطل الصلاة', icon: '👑', minStars: 300, color: 'hsl(42, 100%, 65%)' },
];

export function getChildLevel(childId: string): { level: Level; nextLevel: Level | null; progress: number; starsToNext: number } {
  const child = getChild(childId);
  const stars = child?.totalStars ?? 0;
  
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (stars >= level.minStars) currentLevel = level;
  }
  
  const nextLevel = LEVELS[currentLevel.id + 1] ?? null;
  const starsInLevel = stars - currentLevel.minStars;
  const starsNeeded = nextLevel ? nextLevel.minStars - currentLevel.minStars : 1;
  const progress = nextLevel ? Math.min((starsInLevel / starsNeeded) * 100, 100) : 100;
  const starsToNext = nextLevel ? nextLevel.minStars - stars : 0;
  
  return { level: currentLevel, nextLevel, progress, starsToNext };
}

// === PRAYER ANALYSIS ===
export interface PrayerAnalysis {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  strongest: PrayerName;
  weakest: PrayerName;
  totalDays: number;
}

export function getPrayerAnalysis(childId: string): PrayerAnalysis {
  const data = getData();
  const logs = data.prayerLogs.filter(l => l.childId === childId);
  const totalDays = logs.length || 1;
  
  const counts = {
    fajr: logs.filter(l => l.fajr).length,
    dhuhr: logs.filter(l => l.dhuhr).length,
    asr: logs.filter(l => l.asr).length,
    maghrib: logs.filter(l => l.maghrib).length,
    isha: logs.filter(l => l.isha).length,
  };
  
  const percentages = {
    fajr: Math.round((counts.fajr / totalDays) * 100),
    dhuhr: Math.round((counts.dhuhr / totalDays) * 100),
    asr: Math.round((counts.asr / totalDays) * 100),
    maghrib: Math.round((counts.maghrib / totalDays) * 100),
    isha: Math.round((counts.isha / totalDays) * 100),
  };
  
  const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const strongest = prayers.reduce((a, b) => percentages[a] >= percentages[b] ? a : b);
  const weakest = prayers.reduce((a, b) => percentages[a] <= percentages[b] ? a : b);
  
  return { ...percentages, strongest, weakest, totalDays: logs.length };
}

// === ONBOARDING ===
export function isOnboardingDone(): boolean {
  return getData().onboardingDone === true;
}

export function setOnboardingDone() {
  const data = getData();
  data.onboardingDone = true;
  saveData(data);
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
  onboardingDone: false,
};

// === CACHE LAYER ===
let _cachedData: AppData | null = null;
let _cacheVersion = 0;

export function getData(): AppData {
  if (_cachedData) return _cachedData;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    _cachedData = { ...defaultData };
    return _cachedData;
  }
  const data = JSON.parse(raw);
  if (!data.moneyReward) data.moneyReward = { ...defaultData.moneyReward };
  if (!data.settings) data.settings = { ...defaultData.settings };
  if (!data.customActivities) data.customActivities = [];
  if (!data.activityLogs) data.activityLogs = [];
  if (!data.giftTiers) data.giftTiers = [];
  if (!data.dailyGoalLogs) data.dailyGoalLogs = [];
  if (!data.quranLogs) data.quranLogs = [];
  if (!data.shopItems) data.shopItems = [];
  if (!data.redemptionLogs) data.redemptionLogs = [];
  if (!data.parentMessages) data.parentMessages = [];
  if (!data.familyChallenges) data.familyChallenges = [];
  if (!data.childThemes) data.childThemes = {};
  _cachedData = data;
  return data;
}

function saveData(data: AppData) {
  _cachedData = data;
  _cacheVersion++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function invalidateCache() {
  _cachedData = null;
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

export function updateChild(id: string, updates: Partial<Pick<Child, 'name' | 'avatarIndex'>>) {
  const data = getData();
  const child = data.children.find(c => c.id === id);
  if (child) {
    if (updates.name !== undefined) child.name = updates.name;
    if (updates.avatarIndex !== undefined) child.avatarIndex = updates.avatarIndex;
    saveData(data);
  }
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

// === DATE HELPER (LOCAL TIMEZONE) ===
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// === PRAYER LOGS ===
function todayStr(): string {
  return localDateStr();
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

// === STREAK (FIXED) ===
function dateToKey(d: Date): string {
  return localDateStr(d);
}

function isLogComplete(log: PrayerLog | undefined): boolean {
  if (!log) return false;
  return log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha;
}

export function getStreak(childId: string): { current: number; best: number } {
  const data = getData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  const todayLog = data.prayerLogs.find(l => l.childId === childId && l.date === dateToKey(today));
  const todayComplete = isLogComplete(todayLog);

  const startOffset = todayComplete ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateToKey(d));
    if (isLogComplete(log)) {
      current++;
    } else {
      break;
    }
  }

  let best = current;
  const completeDates = data.prayerLogs
    .filter(l => l.childId === childId && isLogComplete(l))
    .map(l => l.date)
    .sort();

  if (completeDates.length > 0) {
    let streak = 1;
    for (let i = 1; i < completeDates.length; i++) {
      const prev = new Date(completeDates[i - 1]);
      const curr = new Date(completeDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        best = Math.max(best, streak);
        streak = 1;
      }
    }
    best = Math.max(best, streak);
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
    id: 'three_days',
    name: '3 أيام متتالية',
    description: '3 أيام متتالية من الصلوات الكاملة',
    icon: '✨',
    condition: (_data, childId) => getStreak(childId).best >= 3,
  },
  {
    id: 'week_streak',
    name: 'أسبوع متواصل',
    description: '7 أيام متتالية من الصلوات الكاملة',
    icon: '🔥',
    condition: (_data, childId) => getStreak(childId).best >= 7,
  },
  {
    id: 'two_weeks',
    name: 'أسبوعان متواصلان',
    description: '14 يوم متتالي من الصلوات الكاملة',
    icon: '💪',
    condition: (_data, childId) => getStreak(childId).best >= 14,
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
    id: 'jamaah_50',
    name: '50 صلاة جماعة',
    description: 'صليت 50 صلاة في الجماعة',
    icon: '🤲',
    condition: (_data, childId) => getJamaahCount(childId) >= 50,
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
  {
    id: 'star_200',
    name: '200 نجمة',
    description: 'جمعت 200 نجمة',
    icon: '👑',
    condition: (data, childId) => {
      const child = data.children.find(c => c.id === childId);
      return (child?.totalStars ?? 0) >= 200;
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
    const dateStr = localDateStr(d);
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
    const dateStr = localDateStr(d);
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

// === EXPORT / IMPORT ===
export function exportData(): string {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultData);
}

export async function importData(jsonStr: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonStr);

    // Prototype pollution check
    if (parsed != null && typeof parsed === 'object') {
      const dangerous = ['__proto__', 'constructor', 'prototype'];
      const jsonCheck = JSON.stringify(parsed);
      if (dangerous.some(k => jsonCheck.includes(`"${k}"`))) {
        return false;
      }
    }

    const { z } = await import('zod');

    const childSchema = z.object({
      id: z.string().min(1).max(100),
      name: z.string().min(1).max(100),
      avatarIndex: z.number().int().min(0).max(9),
      totalStars: z.number().int().min(0).max(1000000),
    });

    const prayerLogSchema = z.object({
      childId: z.string().min(1).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      fajr: z.boolean(),
      dhuhr: z.boolean(),
      asr: z.boolean(),
      maghrib: z.boolean(),
      isha: z.boolean(),
      fajrJamaah: z.boolean().optional(),
      dhuhrJamaah: z.boolean().optional(),
      asrJamaah: z.boolean().optional(),
      maghribJamaah: z.boolean().optional(),
      ishaJamaah: z.boolean().optional(),
    });

    const activityLogSchema = z.object({
      childId: z.string().min(1).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      activityId: z.string().min(1).max(100),
      done: z.boolean(),
    });

    const appDataSchema = z.object({
      pin: z.string().regex(/^\d{4}$/),
      children: z.array(childSchema).max(50),
      prayerLogs: z.array(prayerLogSchema).max(50000),
      rewardText: z.string().max(500),
      rewardGoal: z.number().int().min(1).max(100000),
      moneyReward: z.object({
        enabled: z.boolean(),
        amountPerPrayers: z.number().min(0).max(100000),
        prayersNeeded: z.number().int().min(1).max(1000),
        currency: z.string().max(20),
      }),
      settings: z.object({
        jamaahEnabled: z.boolean(),
        jamaahRewardAmount: z.number().int().min(0).max(100),
        allowChildPastEdit: z.boolean(),
      }),
      customActivities: z.array(z.object({
        id: z.string().min(1).max(100),
        name: z.string().min(1).max(100),
        emoji: z.string().max(10),
        starsPerCompletion: z.number().int().min(0).max(100),
      })).max(50),
      activityLogs: z.array(activityLogSchema).max(50000),
      giftTiers: z.array(z.object({
        id: z.string().min(1).max(100),
        name: z.string().min(1).max(100),
        starsRequired: z.number().int().min(0).max(100000),
        emoji: z.string().max(10),
      })).max(50),
      onboardingDone: z.boolean().optional(),
    });

    const validated = appDataSchema.parse(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    invalidateCache();
    return true;
  } catch {
    return false;
  }
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

// === DAILY GOALS SYSTEM ===
const DAILY_GOALS: DailyGoal[] = [
  { id: 'fajr_time', text: 'صلِّ الفجر في وقته', emoji: '🌅', starsReward: 3 },
  { id: 'all_prayers', text: 'أتمم الصلوات الخمس', emoji: '🕌', starsReward: 5 },
  { id: 'jamaah', text: 'صلِّ صلاة واحدة في الجماعة', emoji: '🤝', starsReward: 3 },
  { id: 'quran_5', text: 'اقرأ 5 صفحات من القرآن', emoji: '📖', starsReward: 3 },
  { id: 'dhikr', text: 'اذكر الله 100 مرة', emoji: '📿', starsReward: 2 },
  { id: 'dua', text: 'ادعُ الله بعد كل صلاة', emoji: '🤲', starsReward: 2 },
  { id: 'help_family', text: 'ساعد أهلك في شيء', emoji: '💪', starsReward: 2 },
  { id: 'early_sleep', text: 'نم مبكراً للفجر', emoji: '😴', starsReward: 2 },
  { id: 'no_miss', text: 'لا تفوّت أي صلاة اليوم', emoji: '🎯', starsReward: 4 },
  { id: 'smile', text: 'ابتسم في وجه الجميع', emoji: '😊', starsReward: 1 },
];

export function getDailyGoal(date: string): DailyGoal {
  // Deterministic daily goal based on date hash
  const hash = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DAILY_GOALS[hash % DAILY_GOALS.length];
}

export function isDailyGoalCompleted(childId: string, date: string): boolean {
  const data = getData();
  const logs = data.dailyGoalLogs ?? [];
  return logs.some(l => l.childId === childId && l.date === date && l.completed);
}

export function completeDailyGoal(childId: string, date: string) {
  const data = getData();
  if (!data.dailyGoalLogs) data.dailyGoalLogs = [];
  if (data.dailyGoalLogs.some(l => l.childId === childId && l.date === date && l.completed)) return;
  const goal = getDailyGoal(date);
  data.dailyGoalLogs.push({ childId, date, goalId: goal.id, completed: true });
  const child = data.children.find(c => c.id === childId);
  if (child) child.totalStars += goal.starsReward;
  saveData(data);
}

// === QURAN TRACKER ===
export function getQuranLog(childId: string, date: string): number {
  const data = getData();
  const logs = data.quranLogs ?? [];
  const log = logs.find(l => l.childId === childId && l.date === date);
  return log?.pages ?? 0;
}

export function setQuranPages(childId: string, date: string, pages: number) {
  const data = getData();
  if (!data.quranLogs) data.quranLogs = [];
  let log = data.quranLogs.find(l => l.childId === childId && l.date === date);
  if (log) {
    log.pages = pages;
  } else {
    data.quranLogs.push({ childId, date, pages });
  }
  saveData(data);
}

export function getTotalQuranPages(childId: string): number {
  const data = getData();
  const logs = data.quranLogs ?? [];
  return logs.filter(l => l.childId === childId).reduce((sum, l) => sum + l.pages, 0);
}

// === SHOP SYSTEM ===
export function getShopItems(): ShopItem[] {
  return getData().shopItems ?? [];
}

export function addShopItem(item: Omit<ShopItem, 'id'>): ShopItem {
  const data = getData();
  if (!data.shopItems) data.shopItems = [];
  const newItem: ShopItem = { ...item, id: crypto.randomUUID() };
  data.shopItems.push(newItem);
  saveData(data);
  return newItem;
}

export function removeShopItem(id: string) {
  const data = getData();
  if (!data.shopItems) return;
  data.shopItems = data.shopItems.filter(i => i.id !== id);
  saveData(data);
}

export function redeemItem(childId: string, item: ShopItem): boolean {
  const data = getData();
  const child = data.children.find(c => c.id === childId);
  if (!child || child.totalStars < item.cost) return false;
  child.totalStars -= item.cost;
  if (!data.redemptionLogs) data.redemptionLogs = [];
  data.redemptionLogs.push({
    id: crypto.randomUUID(),
    childId,
    itemId: item.id,
    itemName: item.name,
    cost: item.cost,
    date: localDateStr(),
    redeemed: false,
  });
  saveData(data);
  return true;
}

export function getRedemptionLogs(childId: string): RedemptionLog[] {
  const data = getData();
  return (data.redemptionLogs ?? []).filter(l => l.childId === childId);
}

export function markRedemptionUsed(id: string) {
  const data = getData();
  const log = (data.redemptionLogs ?? []).find(l => l.id === id);
  if (log) { log.redeemed = true; saveData(data); }
}

// === PARENT MESSAGES ===
export function getParentMessages(): ParentMessage[] {
  return getData().parentMessages ?? [];
}

export function addParentMessage(text: string, emoji: string) {
  const data = getData();
  if (!data.parentMessages) data.parentMessages = [];
  data.parentMessages.push({ id: crypto.randomUUID(), text, emoji, createdAt: localDateStr() });
  saveData(data);
}

export function removeParentMessage(id: string) {
  const data = getData();
  if (!data.parentMessages) return;
  data.parentMessages = data.parentMessages.filter(m => m.id !== id);
  saveData(data);
}

export function getLatestParentMessage(): ParentMessage | null {
  const msgs = getParentMessages();
  return msgs.length > 0 ? msgs[msgs.length - 1] : null;
}

// === FAMILY CHALLENGES ===
export function getFamilyChallenges(): FamilyChallenge[] {
  return getData().familyChallenges ?? [];
}

export function getActiveFamilyChallenge(): FamilyChallenge | null {
  const challenges = getFamilyChallenges();
  const today = localDateStr();
  return challenges.find(c => c.active && c.startDate <= today && c.endDate >= today) ?? null;
}

export function addFamilyChallenge(title: string, emoji: string, target: number, type: FamilyChallenge['type'], durationDays: number): FamilyChallenge {
  const data = getData();
  if (!data.familyChallenges) data.familyChallenges = [];
  // Deactivate existing
  data.familyChallenges.forEach(c => c.active = false);
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + durationDays - 1);
  const challenge: FamilyChallenge = {
    id: crypto.randomUUID(), title, emoji, target, type,
    startDate: localDateStr(start), endDate: localDateStr(end), active: true,
  };
  data.familyChallenges.push(challenge);
  saveData(data);
  return challenge;
}

export function removeFamilyChallenge(id: string) {
  const data = getData();
  if (!data.familyChallenges) return;
  data.familyChallenges = data.familyChallenges.filter(c => c.id !== id);
  saveData(data);
}

export function getFamilyChallengeProgress(challenge: FamilyChallenge): { childId: string; childName: string; progress: number }[] {
  const data = getData();
  const children = data.children;
  return children.map(child => {
    let progress = 0;
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    const today = new Date(localDateStr());
    const effectiveEnd = end < today ? end : today;
    
    for (let d = new Date(start); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = localDateStr(d);
      const log = data.prayerLogs.find(l => l.childId === child.id && l.date === dateStr);
      if (!log) continue;
      
      switch (challenge.type) {
        case 'fajr_streak':
          if (log.fajr) progress++;
          break;
        case 'all_prayers':
          if (log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) progress++;
          break;
        case 'jamaah':
          if (log.fajrJamaah) progress++;
          if (log.dhuhrJamaah) progress++;
          if (log.asrJamaah) progress++;
          if (log.maghribJamaah) progress++;
          if (log.ishaJamaah) progress++;
          break;
        default:
          if (log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) progress++;
      }
    }
    return { childId: child.id, childName: child.name, progress };
  });
}

// === CHILD THEMES ===
export function getChildTheme(childId: string): ChildThemeName {
  const data = getData();
  return data.childThemes?.[childId] ?? 'golden';
}

export function setChildTheme(childId: string, theme: ChildThemeName) {
  const data = getData();
  if (!data.childThemes) data.childThemes = {};
  data.childThemes[childId] = theme;
  saveData(data);
}

// === YEARLY HEATMAP DATA ===
export function getYearlyHeatmapData(childId: string): { date: string; count: number }[] {
  const data = getData();
  const today = new Date();
  const result: { date: string; count: number }[] = [];
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const log = data.prayerLogs.find(l => l.childId === childId && l.date === dateStr);
    const count = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
    result.push({ date: dateStr, count });
  }
  return result;
}
