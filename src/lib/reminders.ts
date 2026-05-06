import { PRAYER_NAMES, getChildren, isDateComplete, localDateStr } from './store';
import {
  requestPermission,
  scheduleNativeNotifications,
  cancelAllNativeNotifications,
  sendWebNotification,
  isNativePlatform,
} from './notifications';

export interface ReminderSettings {
  enabled: boolean;
  times: Record<string, string>;
  smartReminders?: boolean;
  streakAlert?: boolean;
}

const REMINDER_KEY = 'salat-reminder-settings';

const defaultTimes: Record<string, string> = {
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '15:30',
  maghrib: '18:15',
  isha: '19:45',
};

const MOTIVATIONAL_NOTIFICATIONS = [
  'هيا نصلي! صلاتك نور يوم القيامة 🌟',
  'حان وقت الصلاة! لا تفوّت أجرها 🤲',
  'الصلاة خير من النوم! قم وصلِّ ⭐',
  'حافظ على سلسلتك! لا تكسر الـ Streak 🔥',
  'بارك الله فيك! حان وقت الصلاة 🕌',
];

export function getReminderSettings(): ReminderSettings {
  const raw = storageGet(REMINDER_KEY);
  if (!raw) return { enabled: false, times: { ...defaultTimes }, smartReminders: false, streakAlert: false };
  const parsed = JSON.parse(raw);
  return {
    enabled: parsed.enabled ?? false,
    times: parsed.times ?? { ...defaultTimes },
    smartReminders: parsed.smartReminders ?? false,
    streakAlert: parsed.streakAlert ?? false,
  };
}

export function saveReminderSettings(settings: ReminderSettings) {
  storageSet(REMINDER_KEY, JSON.stringify(settings));
  if (settings.enabled) {
    scheduleReminders(settings);
  } else {
    clearAllReminders();
  }
}

let reminderIntervalId: ReturnType<typeof setInterval> | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  return requestPermission();
}

function getRandomMotivation(): string {
  return MOTIVATIONAL_NOTIFICATIONS[Math.floor(Math.random() * MOTIVATIONAL_NOTIFICATIONS.length)];
}

async function scheduleReminders(settings: ReminderSettings) {
  clearAllReminders();

  // On native: use Capacitor Local Notifications
  if (isNativePlatform()) {
    await scheduleNativeNotifications(settings.times, {
      smartReminders: settings.smartReminders,
      streakAlert: settings.streakAlert,
    });
    return;
  }

  // Web fallback: setInterval
  reminderIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const prayer of PRAYER_NAMES) {
      if (settings.times[prayer.key] === currentTime) {
        sendWebNotification(
          `حان وقت صلاة ${prayer.label} ${prayer.emoji}`,
          getRandomMotivation()
        );
      }
    }

    if (settings.smartReminders) {
      for (const prayer of PRAYER_NAMES) {
        const prayerTime = settings.times[prayer.key];
        if (!prayerTime) continue;
        const [ph, pm] = prayerTime.split(':').map(Number);
        const reminderHour = ph + 2;
        const reminderTime = `${String(reminderHour).padStart(2, '0')}:${String(pm).padStart(2, '0')}`;
        if (currentTime === reminderTime) {
          const children = getChildren();
          const today = localDateStr();
          for (const child of children) {
            if (!isDateComplete(child.id, today)) {
              sendWebNotification(
                `⏰ هل صليت ${prayer.label}؟`,
                `${child.name} - لا تنسَ صلاة ${prayer.label}! ${getRandomMotivation()}`
              );
            }
          }
        }
      }
    }

    if (settings.streakAlert && currentTime === '21:00') {
      const children = getChildren();
      const today = localDateStr();
      for (const child of children) {
        if (!isDateComplete(child.id, today)) {
          sendWebNotification(
            `⚠️ سلسلة ${child.name} في خطر!`,
            `لم تكتمل صلوات اليوم بعد - أكملها قبل منتصف الليل! 🔥`
          );
        }
      }
    }
  }, 60000);
}

async function clearAllReminders() {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
  if (isNativePlatform()) {
    await cancelAllNativeNotifications();
  }
}

export function initReminders() {
  const settings = getReminderSettings();
  if (settings.enabled) {
    scheduleReminders(settings);
  }
}
