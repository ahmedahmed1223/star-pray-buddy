// نظام Battle Pass موسمي
// يعتمد على الثيم الموسمي النشط ليولد مهام ومكافآت لكل موسم.
import { storageGet, storageSet } from '@/lib/storage';
import { getActiveSeasonalTheme } from '@/lib/seasonalThemes';
import { getChild, getStreak, getChildProgress, localDateStr } from '@/lib/store';

export interface PassMission {
  id: string;
  title: string;
  emoji: string;
  xp: number;
  // goal expressed as { type, target } evaluated by checkMission
  type: 'prayers_today' | 'streak' | 'total_stars_delta' | 'azkar_sections' | 'days_active';
  target: number;
}

export interface PassReward {
  tier: number;       // 1..MAX_TIER
  track: 'free' | 'premium';
  emoji: string;
  label: string;
  // effect (cosmetic only, claim grants the label as record)
}

export interface PassState {
  seasonKey: string;
  childId: string;
  startedAt: string;     // ISO date
  baselineStars: number; // child's totalStars when pass started
  xp: number;            // accumulated XP from missions
  claimedTiers: { free: number[]; premium: number[] };
  completedMissions: string[]; // missionId + ':' + weekIndex
  premium: boolean;
  daysActive: string[];  // dates the user opened the pass
}

export const XP_PER_TIER = 100;
export const MAX_TIER = 20;

export function getSeasonMissions(seasonKey: string): PassMission[] {
  // base missions reused across seasons + seasonal flavor
  const base: PassMission[] = [
    { id: 'm_pray5', title: 'أدِّ 5 صلوات اليوم', emoji: '🕌', xp: 40, type: 'prayers_today', target: 5 },
    { id: 'm_streak3', title: 'حافظ على 3 أيام متتالية', emoji: '🔥', xp: 50, type: 'streak', target: 3 },
    { id: 'm_streak7', title: 'حافظ على 7 أيام متتالية', emoji: '⚡', xp: 120, type: 'streak', target: 7 },
    { id: 'm_stars20', title: 'اجمع 20 نجمة هذا الأسبوع', emoji: '⭐', xp: 60, type: 'total_stars_delta', target: 20 },
    { id: 'm_azkar2', title: 'اقرأ أذكار الصباح والمساء', emoji: '📿', xp: 70, type: 'azkar_sections', target: 2 },
    { id: 'm_days5', title: 'افتح التطبيق 5 أيام', emoji: '📅', xp: 30, type: 'days_active', target: 5 },
  ];
  // seasonal mission
  const seasonal: Record<string, PassMission> = {
    ramadan: { id: 'm_season_ramadan', title: 'صم وادعُ في رمضان', emoji: '🌙', xp: 100, type: 'streak', target: 5 },
    eid_fitr: { id: 'm_season_eid', title: 'احتفل بالعيد بالصلاة', emoji: '🎉', xp: 80, type: 'prayers_today', target: 5 },
    hajj: { id: 'm_season_hajj', title: 'موسم الحج المبارك', emoji: '🕋', xp: 100, type: 'streak', target: 3 },
    eid_adha: { id: 'm_season_adha', title: 'تكبيرات عيد الأضحى', emoji: '🐑', xp: 80, type: 'prayers_today', target: 5 },
    mawlid: { id: 'm_season_mawlid', title: 'المولد النبوي الشريف', emoji: '🌟', xp: 80, type: 'days_active', target: 3 },
    laylat_qadr: { id: 'm_season_qadr', title: 'إحياء ليلة القدر', emoji: '✨', xp: 150, type: 'prayers_today', target: 5 },
    ashura: { id: 'm_season_ashura', title: 'صيام عاشوراء', emoji: '🤲', xp: 60, type: 'days_active', target: 2 },
    spring: { id: 'm_season_spring', title: 'تحدي الربيع', emoji: '🌸', xp: 50, type: 'streak', target: 4 },
    summer: { id: 'm_season_summer', title: 'تحدي الصيف', emoji: '☀️', xp: 50, type: 'streak', target: 4 },
    autumn: { id: 'm_season_autumn', title: 'تحدي الخريف', emoji: '🍂', xp: 50, type: 'streak', target: 4 },
    winter: { id: 'm_season_winter', title: 'تحدي الشتاء', emoji: '❄️', xp: 50, type: 'streak', target: 4 },
    default: { id: 'm_season_default', title: 'تحدي النجوم', emoji: '🌟', xp: 50, type: 'total_stars_delta', target: 30 },
  };
  return [...base, seasonal[seasonKey] || seasonal.default];
}

export function getSeasonRewards(seasonKey: string): PassReward[] {
  const seasonalEmoji: Record<string, string> = {
    ramadan: '🏮', eid_fitr: '🎁', hajj: '🕋', eid_adha: '🐑', mawlid: '🌟',
    laylat_qadr: '✨', ashura: '🤲', spring: '🌸', summer: '☀️',
    autumn: '🍁', winter: '❄️', default: '⭐',
  };
  const em = seasonalEmoji[seasonKey] || '⭐';
  const rewards: PassReward[] = [];
  for (let t = 1; t <= MAX_TIER; t++) {
    // free track: every tier
    rewards.push({
      tier: t,
      track: 'free',
      emoji: t % 5 === 0 ? '🏆' : (t % 2 === 0 ? '⭐' : em),
      label: t % 5 === 0 ? `صندوق نجوم ×${t * 2}` : (t % 2 === 0 ? `نجمة إضافية ×${t}` : `وسام ${em}`),
    });
    // premium: every other tier
    if (t % 2 === 0) {
      rewards.push({
        tier: t,
        track: 'premium',
        emoji: t === MAX_TIER ? '👑' : (t >= 14 ? '💎' : '🎖️'),
        label: t === MAX_TIER ? `تاج البطل الموسمي ${em}` : (t >= 14 ? `أيقونة جوهرة ${em}` : `وسام ذهبي ${em}`),
      });
    }
  }
  return rewards;
}

function key(childId: string, seasonKey: string) {
  return `battlePass:${childId}:${seasonKey}`;
}

export function getPassState(childId: string): PassState {
  const theme = getActiveSeasonalTheme();
  const seasonKey = theme.key;
  const child = getChild(childId);
  const raw = storageGet(key(childId, seasonKey));
  if (raw) {
    try {
      const parsed: PassState = JSON.parse(raw);
      if (parsed.seasonKey === seasonKey) {
        const today = localDateStr();
        if (!parsed.daysActive.includes(today)) {
          parsed.daysActive.push(today);
          storageSet(key(childId, seasonKey), JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch { /* fall through */ }
  }
  const fresh: PassState = {
    seasonKey,
    childId,
    startedAt: new Date().toISOString(),
    baselineStars: child?.totalStars ?? 0,
    xp: 0,
    claimedTiers: { free: [], premium: [] },
    completedMissions: [],
    premium: false,
    daysActive: [localDateStr()],
  };
  storageSet(key(childId, seasonKey), JSON.stringify(fresh));
  return fresh;
}

export function savePassState(state: PassState) {
  storageSet(key(state.childId, state.seasonKey), JSON.stringify(state));
}

export function getTierFromXp(xp: number): number {
  return Math.min(MAX_TIER, Math.floor(xp / XP_PER_TIER));
}

export function getTierProgress(xp: number) {
  const tier = getTierFromXp(xp);
  const inTier = xp - tier * XP_PER_TIER;
  return { tier, inTier, pct: Math.min(100, (inTier / XP_PER_TIER) * 100) };
}

// Evaluate a mission against live data
export function evaluateMission(state: PassState, m: PassMission): { done: boolean; current: number } {
  const child = getChild(state.childId);
  if (!child) return { done: false, current: 0 };
  switch (m.type) {
    case 'prayers_today': {
      const p = getChildProgress(state.childId);
      return { done: p.today >= m.target, current: p.today };
    }
    case 'streak': {
      const s = getStreak(state.childId);
      return { done: s.current >= m.target, current: s.current };
    }
    case 'total_stars_delta': {
      const delta = (child.totalStars ?? 0) - state.baselineStars;
      return { done: delta >= m.target, current: Math.max(0, delta) };
    }
    case 'azkar_sections': {
      const today = localDateStr();
      const sections = ['morning', 'evening', 'sleep', 'after_prayer'];
      let done = 0;
      for (const sec of sections) {
        const last = storageGet(`azkar-reset-${state.childId}-${sec}`);
        if (last === today) done++;
      }
      return { done: done >= m.target, current: done };
    }
    case 'days_active': {
      return { done: state.daysActive.length >= m.target, current: state.daysActive.length };
    }
  }
}

export function completeMission(state: PassState, m: PassMission): PassState {
  if (state.completedMissions.includes(m.id)) return state;
  const ev = evaluateMission(state, m);
  if (!ev.done) return state;
  state.completedMissions.push(m.id);
  state.xp = Math.min(MAX_TIER * XP_PER_TIER, state.xp + m.xp);
  savePassState(state);
  return state;
}

export function claimTier(state: PassState, tier: number, track: 'free' | 'premium'): PassState {
  if (tier > getTierFromXp(state.xp)) return state;
  if (track === 'premium' && !state.premium) return state;
  if (state.claimedTiers[track].includes(tier)) return state;
  state.claimedTiers[track].push(tier);
  savePassState(state);
  return state;
}

export function upgradePremium(state: PassState): PassState {
  state.premium = true;
  savePassState(state);
  return state;
}
