import { PRAYER_NAMES } from './store';

export interface ReminderSettings {
  enabled: boolean;
  times: Record<string, string>; // prayer key -> HH:MM
}

const REMINDER_KEY = 'salat-reminder-settings';

const defaultTimes: Record<string, string> = {
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '15:30',
  maghrib: '18:15',
  isha: '19:45',
};

export function getReminderSettings(): ReminderSettings {
  const raw = localStorage.getItem(REMINDER_KEY);
  if (!raw) return { enabled: false, times: { ...defaultTimes } };
  return JSON.parse(raw);
}

export function saveReminderSettings(settings: ReminderSettings) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
  if (settings.enabled) {
    scheduleReminders(settings);
  } else {
    clearAllReminders();
  }
}

let reminderIntervalId: ReturnType<typeof setInterval> | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function scheduleReminders(settings: ReminderSettings) {
  clearAllReminders();
  
  reminderIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    for (const prayer of PRAYER_NAMES) {
      if (settings.times[prayer.key] === currentTime) {
        if (Notification.permission === 'granted') {
          new Notification(`حان وقت صلاة ${prayer.label} ${prayer.emoji}`, {
            body: 'هيا نصلي! 🤲',
            icon: '/favicon.ico',
          });
        }
      }
    }
  }, 60000); // Check every minute
}

function clearAllReminders() {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}

// Auto-start reminders on load
export function initReminders() {
  const settings = getReminderSettings();
  if (settings.enabled) {
    scheduleReminders(settings);
  }
}
