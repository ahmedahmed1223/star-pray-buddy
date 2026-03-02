import { PRAYER_NAMES, getChildren, isDateComplete } from './store';

export interface ReminderSettings {
  enabled: boolean;
  times: Record<string, string>; // prayer key -> HH:MM
  smartReminders?: boolean; // remind if prayer not logged after delay
  streakAlert?: boolean; // alert if streak at risk before end of day
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
  const raw = localStorage.getItem(REMINDER_KEY);
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

function getRandomMotivation(): string {
  return MOTIVATIONAL_NOTIFICATIONS[Math.floor(Math.random() * MOTIVATIONAL_NOTIFICATIONS.length)];
}

function scheduleReminders(settings: ReminderSettings) {
  clearAllReminders();
  
  reminderIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Regular prayer time reminders
    for (const prayer of PRAYER_NAMES) {
      if (settings.times[prayer.key] === currentTime) {
        if (Notification.permission === 'granted') {
          new Notification(`حان وقت صلاة ${prayer.label} ${prayer.emoji}`, {
            body: getRandomMotivation(),
            icon: '/favicon.ico',
          });
        }
      }
    }

    // Smart reminders - remind 2 hours after prayer time if not logged
    if (settings.smartReminders) {
      for (const prayer of PRAYER_NAMES) {
        const prayerTime = settings.times[prayer.key];
        if (!prayerTime) continue;
        const [ph, pm] = prayerTime.split(':').map(Number);
        const reminderHour = ph + 2;
        const reminderTime = `${String(reminderHour).padStart(2, '0')}:${String(pm).padStart(2, '0')}`;
        if (currentTime === reminderTime) {
          const children = getChildren();
          const today = new Date().toISOString().split('T')[0];
          for (const child of children) {
            if (!isDateComplete(child.id, today)) {
              if (Notification.permission === 'granted') {
                new Notification(`⏰ هل صليت ${prayer.label}؟`, {
                  body: `${child.name} - لا تنسَ صلاة ${prayer.label}! ${getRandomMotivation()}`,
                  icon: '/favicon.ico',
                });
              }
            }
          }
        }
      }
    }

    // Streak at risk alert - at 9 PM if prayers not complete
    if (settings.streakAlert && currentTime === '21:00') {
      const children = getChildren();
      const today = new Date().toISOString().split('T')[0];
      for (const child of children) {
        if (!isDateComplete(child.id, today)) {
          if (Notification.permission === 'granted') {
            new Notification(`⚠️ سلسلة ${child.name} في خطر!`, {
              body: `لم تكتمل صلوات اليوم بعد - أكملها قبل منتصف الليل! 🔥`,
              icon: '/favicon.ico',
            });
          }
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
