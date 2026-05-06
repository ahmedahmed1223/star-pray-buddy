// IndexedDB-backed storage layer (with localStorage migration + fallback).
// Provides a sync read API after `initStorage()` has run, and async writes.
import { get, set, del, createStore } from 'idb-keyval';

const DB_NAME = 'salat-tracker-db';
const STORE_NAME = 'kv';
const idbStore = createStore(DB_NAME, STORE_NAME);

const memory = new Map<string, string>();
let initialized = false;
let initPromise: Promise<void> | null = null;

// Keys we want to hydrate from IDB on boot. Anything else falls back to lazy localStorage.
const HYDRATE_KEYS = [
  'salat-tracker-data',
  'salat-tracker-pwa-prompt-dismissed',
  'theme-mode',
  'sound-muted',
  'seasonal-theme',
];

async function idbGet(key: string): Promise<string | undefined> {
  try { return (await get(key, idbStore)) as string | undefined; }
  catch { return undefined; }
}

async function idbSet(key: string, value: string): Promise<void> {
  try { await set(key, value, idbStore); } catch { /* swallow */ }
}

async function idbDel(key: string): Promise<void> {
  try { await del(key, idbStore); } catch { /* swallow */ }
}

export async function initStorage(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    for (const key of HYDRATE_KEYS) {
      let value = await idbGet(key);
      if (value === undefined) {
        // Migrate from localStorage if present
        try {
          const ls = localStorage.getItem(key);
          if (ls !== null) {
            value = ls;
            await idbSet(key, ls);
          }
        } catch { /* ignore */ }
      }
      if (value !== undefined) memory.set(key, value);
    }
    initialized = true;
  })();
  return initPromise;
}

export function storageGet(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  // Fallback to localStorage for keys we didn't hydrate.
  try {
    const ls = localStorage.getItem(key);
    if (ls !== null) memory.set(key, ls);
    return ls;
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  memory.set(key, value);
  // Mirror to localStorage as redundant cache (best-effort, tolerate quota errors).
  try { localStorage.setItem(key, value); } catch { /* quota — IDB still works */ }
  void idbSet(key, value);
}

export function storageRemove(key: string): void {
  memory.delete(key);
  try { localStorage.removeItem(key); } catch { /* ignore */ }
  void idbDel(key);
}
