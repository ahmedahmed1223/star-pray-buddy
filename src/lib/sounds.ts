/** Sound effects using Web Audio API — no external files needed.
 *  Soft, theme-aware tones. Respects user "mute" preference (localStorage `sound-muted`).
 */

import type { PrayerName } from '@/lib/store';

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return _ctx;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  try { return localStorage.getItem('sound-muted') === '1'; } catch { return false; }
}

export function setMuted(m: boolean) {
  try { localStorage.setItem('sound-muted', m ? '1' : '0'); } catch {}
}
export function getMuted(): boolean { return isMuted(); }

/** Get current seasonal theme key from <html data-season-key="..."> */
function currentSeason(): string {
  if (typeof document === 'undefined') return 'default';
  return document.documentElement.dataset.seasonKey || 'default';
}

/** Map season → small detune (cents) so the same melody feels different per theme.
 *  Subtle: ±0..+200 cents max. */
const seasonDetune: Record<string, number> = {
  default: 0,
  ramadan: -50,        // warm, slightly lower
  laylat_qadr: 100,    // shimmery, brighter
  eid_fitr: 200,       // bright & festive
  hajj: -100,          // deep & reverent
  eid_adha: 150,
  ashura: -150,        // somber
  mawlid: 50,
  spring: 100,
  summer: 50,
  autumn: -50,
  winter: 150,         // crystalline
};

/** Map season → preferred oscillator timbre. Soft choices only. */
function seasonTimbre(): OscillatorType {
  const s = currentSeason();
  if (s === 'winter' || s === 'laylat_qadr') return 'triangle'; // crystalline
  if (s === 'hajj' || s === 'ashura') return 'sine';            // pure & calm
  if (s === 'eid_fitr' || s === 'eid_adha') return 'triangle';  // gentle festive
  return 'sine';
}

interface ToneOpts {
  freq: number;
  start: number;       // seconds offset from now
  dur: number;
  gain?: number;       // 0..1, default 0.12 (soft)
  type?: OscillatorType;
  detune?: number;     // cents
}

function playTones(tones: ToneOpts[], masterGain = 0.7) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.value = masterGain;
  // gentle low-pass to keep things soft / non-shrill
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4500;
  master.connect(lp).connect(ctx.destination);

  const baseDetune = seasonDetune[currentSeason()] ?? 0;
  const baseType = seasonTimbre();
  const t0 = ctx.currentTime;

  tones.forEach(({ freq, start, dur, gain = 0.12, type, detune = 0 }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type ?? baseType;
    osc.frequency.setValueAtTime(freq, t0 + start);
    osc.detune.setValueAtTime(baseDetune + detune, t0 + start);

    // soft attack/release envelope (no clicks)
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(gain, t0 + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);

    osc.connect(g).connect(master);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.05);
  });
}

/* ───────────────────── Prayer-specific chimes ─────────────────────
 * Each prayer has its own gentle 2-note chime that matches its mood:
 *   Fajr    — soft rising (calm awakening)
 *   Dhuhr   — bright, balanced
 *   Asr     — warm, settled
 *   Maghrib — descending, sunset
 *   Isha    — deep, restful
 */
const prayerChimes: Record<PrayerName, ToneOpts[]> = {
  fajr:    [{ freq: 523, start: 0, dur: 0.45, gain: 0.10 }, { freq: 784, start: 0.12, dur: 0.55, gain: 0.10 }],
  dhuhr:   [{ freq: 659, start: 0, dur: 0.40, gain: 0.11 }, { freq: 880, start: 0.10, dur: 0.50, gain: 0.10 }],
  asr:     [{ freq: 587, start: 0, dur: 0.45, gain: 0.10 }, { freq: 740, start: 0.12, dur: 0.55, gain: 0.10 }],
  maghrib: [{ freq: 698, start: 0, dur: 0.45, gain: 0.11 }, { freq: 466, start: 0.14, dur: 0.55, gain: 0.10 }],
  isha:    [{ freq: 392, start: 0, dur: 0.55, gain: 0.10 }, { freq: 523, start: 0.14, dur: 0.65, gain: 0.10 }],
};

/** Soft per-prayer chime. Theme-aware (timbre + slight detune). */
export function playPrayerChime(prayer: PrayerName) {
  const tones = prayerChimes[prayer];
  if (!tones) return playPrayerSound();
  playTones(tones, 0.6);
}

/** Generic check-in sound (kept for backwards compat). */
export function playPrayerSound() {
  playTones([
    { freq: 523, start: 0,    dur: 0.35, gain: 0.10 },
    { freq: 659, start: 0.10, dur: 0.35, gain: 0.10 },
    { freq: 784, start: 0.20, dur: 0.45, gain: 0.10 },
  ], 0.6);
}

export function playUndoSound() {
  playTones([
    { freq: 400, start: 0,    dur: 0.18, gain: 0.08 },
    { freq: 300, start: 0.12, dur: 0.22, gain: 0.07 },
  ], 0.5);
}

export function playAllCompleteSound() {
  playTones([
    { freq: 523,  start: 0.00, dur: 0.35, gain: 0.10 },
    { freq: 659,  start: 0.15, dur: 0.35, gain: 0.10 },
    { freq: 784,  start: 0.30, dur: 0.35, gain: 0.10 },
    { freq: 1047, start: 0.45, dur: 0.55, gain: 0.11 },
  ], 0.65);
}

export function playBadgeUnlockSound() {
  playTones([
    { freq: 392,  start: 0.00, dur: 0.40, gain: 0.10, type: 'triangle' },
    { freq: 523,  start: 0.10, dur: 0.40, gain: 0.10, type: 'triangle' },
    { freq: 659,  start: 0.20, dur: 0.40, gain: 0.10, type: 'triangle' },
    { freq: 784,  start: 0.30, dur: 0.40, gain: 0.10, type: 'triangle' },
    { freq: 1047, start: 0.40, dur: 0.50, gain: 0.11, type: 'triangle' },
  ], 0.6);
}

export function playLevelUpSound() {
  playTones([
    { freq: 523,  start: 0.00, dur: 0.30, gain: 0.10 },
    { freq: 659,  start: 0.15, dur: 0.30, gain: 0.10 },
    { freq: 784,  start: 0.30, dur: 0.30, gain: 0.10 },
    { freq: 1047, start: 0.45, dur: 0.55, gain: 0.11 },
    { freq: 784,  start: 0.70, dur: 0.20, gain: 0.09 },
    { freq: 1047, start: 0.85, dur: 0.70, gain: 0.10 },
  ], 0.65);
}

export function playSwipeSound() {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain).connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.18);
}
