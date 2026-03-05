import { Capacitor } from '@capacitor/core';
import { PRAYER_NAMES, getChildren, isDateComplete } from './store';

// Dynamic import for Capacitor Local Notifications (only on native)
let LocalNotifications: any = null;

async function getLocalNotifications() {
  if (LocalNotifications) return LocalNotifications;
  if (Capacitor.isNativePlatform()) {
    try {
      const mod = await import('@capacitor/local-notifications');
      LocalNotifications = mod.LocalNotifications;
      return LocalNotifications;
    } catch {
      return null;
    }
  }
  return null;
}

const MOTIVATIONAL_MESSAGES = [
  'هيا نصلي! صلاتك نور يوم القيامة 🌟',
  'حان وقت الصلاة! لا تفوّت أجرها 🤲',
  'الصلاة خير من النوم! قم وصلِّ ⭐',
  'حافظ على سلسلتك! لا تكسر الـ Streak 🔥',
  'بارك الله فيك! حان وقت الصلاة 🕌',
  'كل صلاة نجمة جديدة! ⭐',
  'أنت بطل الصلاة! واصل 💪',
];

function getRandomMotivation(): string {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

export async function requestPermission(): Promise<boolean> {
  const ln = await getLocalNotifications();
  if (ln) {
    const result = await ln.requestPermissions();
    return result.display === 'granted';
  }
  // Web fallback
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function scheduleNativeNotifications(times: Record<string, string>, options: { smartReminders?: boolean; streakAlert?: boolean }) {
  const ln = await getLocalNotifications();
  if (!ln) return;

  // Cancel all existing
  await ln.cancel({ notifications: await getPendingIds(ln) });

  const notifications: any[] = [];
  let id = 1;

  // Schedule prayer reminders
  for (const prayer of PRAYER_NAMES) {
    const time = times[prayer.key];
    if (!time) continue;
    const [hours, minutes] = time.split(':').map(Number);

    notifications.push({
      id: id++,
      title: `حان وقت صلاة ${prayer.label} ${prayer.emoji}`,
      body: getRandomMotivation(),
      schedule: {
        on: { hour: hours, minute: minutes },
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#D4A017',
    });

    // Smart reminder: 2 hours after prayer time
    if (options.smartReminders) {
      const smartHour = (hours + 2) % 24;
      notifications.push({
        id: id++,
        title: `⏰ هل صليت ${prayer.label}؟`,
        body: `لا تنسَ صلاة ${prayer.label}! ${getRandomMotivation()}`,
        schedule: {
          on: { hour: smartHour, minute: minutes },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#D4A017',
      });
    }
  }

  // Streak alert at 9 PM
  if (options.streakAlert) {
    notifications.push({
      id: id++,
      title: '⚠️ سلسلتك في خطر!',
      body: 'لم تكتمل صلوات اليوم بعد - أكملها قبل منتصف الليل! 🔥',
      schedule: {
        on: { hour: 21, minute: 0 },
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#EF4444',
    });
  }

  if (notifications.length > 0) {
    await ln.schedule({ notifications });
  }
}

async function getPendingIds(ln: any): Promise<{ id: number }[]> {
  try {
    const pending = await ln.getPending();
    return pending.notifications.map((n: any) => ({ id: n.id }));
  } catch {
    return [];
  }
}

export async function cancelAllNativeNotifications() {
  const ln = await getLocalNotifications();
  if (!ln) return;
  const ids = await getPendingIds(ln);
  if (ids.length > 0) {
    await ln.cancel({ notifications: ids });
  }
}

// Web fallback notification
export function sendWebNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
