/** Sound effects using free CC0 MP3 files in /public/sounds.
 *  Soft, child-friendly. Respects user "mute" preference (localStorage `sound-muted`).
 *  Source: Mixkit Free SFX (https://mixkit.co/free-sound-effects/) — free for commercial use.
 */

import type { PrayerName } from '@/lib/store';

type SoundKey =
  | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  | 'undo' | 'complete' | 'badge' | 'levelup' | 'swipe';

const FILES: Record<SoundKey, string> = {
  fajr:     '/sounds/fajr.mp3',
  dhuhr:    '/sounds/dhuhr.mp3',
  asr:      '/sounds/asr.mp3',
  maghrib:  '/sounds/maghrib.mp3',
  isha:     '/sounds/isha.mp3',
  undo:     '/sounds/undo.mp3',
  complete: '/sounds/complete.mp3',
  badge:    '/sounds/badge.mp3',
  levelup:  '/sounds/levelup.mp3',
  swipe:    '/sounds/swipe.mp3',
};

// Per-sound default volume (kept gentle; max 0.6)
const VOLUMES: Record<SoundKey, number> = {
  fajr: 0.45, dhuhr: 0.45, asr: 0.45, maghrib: 0.45, isha: 0.45,
  undo: 0.35, complete: 0.55, badge: 0.55, levelup: 0.6, swipe: 0.25,
};

// Cached, preloaded HTMLAudioElements — cloned per play for overlap support.
const cache: Partial<Record<SoundKey, HTMLAudioElement>> = {};

function isMuted(): boolean {
  try { return localStorage.getItem('sound-muted') === '1'; } catch { return false; }
}
export function setMuted(m: boolean) {
  try { localStorage.setItem('sound-muted', m ? '1' : '0'); } catch {}
  try { window.dispatchEvent(new CustomEvent('sound-muted-change', { detail: m })); } catch {}
}
export function getMuted(): boolean { return isMuted(); }

function getAudio(key: SoundKey): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!cache[key]) {
    try {
      const a = new Audio(FILES[key]);
      a.preload = 'auto';
      a.volume = VOLUMES[key];
      cache[key] = a;
    } catch { return null; }
  }
  return cache[key]!;
}

function play(key: SoundKey, volumeScale = 1) {
  if (isMuted()) return;
  const base = getAudio(key);
  if (!base) return;
  try {
    // Clone the source to allow overlapping plays without cutting off the previous one.
    const node = base.cloneNode(true) as HTMLAudioElement;
    node.volume = Math.max(0, Math.min(1, VOLUMES[key] * volumeScale));
    const p = node.play();
    if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay gate */ });
  } catch { /* ignore */ }
}

/** Preload all sounds (call once after first user interaction). */
export function preloadSounds() {
  (Object.keys(FILES) as SoundKey[]).forEach(getAudio);
}

/* ───────────────────── Public API (unchanged) ───────────────────── */

export function playPrayerChime(prayer: PrayerName) {
  play(prayer as SoundKey);
}

export function playPrayerSound() { play('complete', 0.7); }
export function playUndoSound() { play('undo'); }
export function playAllCompleteSound() { play('complete'); }
export function playBadgeUnlockSound() { play('badge'); }
export function playLevelUpSound() { play('levelup'); }
export function playSwipeSound() { play('swipe'); }
