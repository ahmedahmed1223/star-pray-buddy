import { useState } from 'react';
import { motion } from 'framer-motion';
import { getReminderSettings, saveReminderSettings, requestNotificationPermission } from '@/lib/reminders';
import { PRAYER_NAMES } from '@/lib/store';
import { Bell, BellOff } from 'lucide-react';

export default function ReminderSettings() {
  const [settings, setSettings] = useState(getReminderSettings());
  const [permissionDenied, setPermissionDenied] = useState(false);

  const toggleEnabled = async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
    }
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveReminderSettings(updated);
  };

  const updateTime = (key: string, time: string) => {
    const updated = { ...settings, times: { ...settings.times, [key]: time } };
    setSettings(updated);
    saveReminderSettings(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {settings.enabled ? <Bell size={20} className="text-gold" /> : <BellOff size={20} className="text-muted-foreground" />}
          <span className="font-bold text-lg text-foreground">تذكيرات الصلاة</span>
        </div>
        <button
          onClick={toggleEnabled}
          className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
            settings.enabled
              ? 'bg-primary/20 text-gold border border-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {settings.enabled ? 'مفعّل' : 'معطّل'}
        </button>
      </div>

      {permissionDenied && (
        <p className="text-destructive text-sm mb-3">⚠️ يرجى السماح بالإشعارات من إعدادات المتصفح</p>
      )}

      {settings.enabled && (
        <div className="space-y-3">
          {PRAYER_NAMES.map(prayer => (
            <div key={prayer.key} className="flex items-center justify-between">
              <span className="text-foreground font-medium">
                {prayer.emoji} {prayer.label}
              </span>
              <input
                type="time"
                value={settings.times[prayer.key] || ''}
                onChange={e => updateTime(prayer.key, e.target.value)}
                className="bg-muted border border-border rounded-xl px-3 py-1.5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                dir="ltr"
              />
            </div>
          ))}
          <p className="text-muted-foreground text-xs mt-2">
            ⏰ سيتم إرسال إشعار في الوقت المحدد (يجب أن يكون التطبيق مفتوحاً)
          </p>
        </div>
      )}
    </motion.div>
  );
}
