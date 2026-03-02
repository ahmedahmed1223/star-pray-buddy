import { useState } from 'react';
import { motion } from 'framer-motion';
import { getReminderSettings, saveReminderSettings, requestNotificationPermission } from '@/lib/reminders';
import { PRAYER_NAMES } from '@/lib/store';
import { Bell, BellOff, ShieldAlert, Flame } from 'lucide-react';

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

  const toggleSmartReminders = () => {
    const updated = { ...settings, smartReminders: !settings.smartReminders };
    setSettings(updated);
    saveReminderSettings(updated);
  };

  const toggleStreakAlert = () => {
    const updated = { ...settings, streakAlert: !settings.streakAlert };
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
          className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors min-h-[40px] ${
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
                className="bg-muted border border-border rounded-xl px-3 py-1.5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary min-h-[40px]"
                dir="ltr"
              />
            </div>
          ))}

          {/* Smart Reminders */}
          <div className="border-t border-border pt-3 mt-3">
            <h4 className="text-foreground font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-gold" />
              تذكيرات ذكية
            </h4>
            
            <button
              onClick={toggleSmartReminders}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors mb-2 min-h-[48px] ${
                settings.smartReminders
                  ? 'border-gold/50 bg-primary/10'
                  : 'border-border bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className={settings.smartReminders ? 'text-gold' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${settings.smartReminders ? 'text-foreground' : 'text-muted-foreground'}`}>
                  تذكير عند نسيان صلاة
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                settings.smartReminders ? 'bg-primary/20 text-gold' : 'bg-muted text-muted-foreground'
              }`}>
                {settings.smartReminders ? 'مفعّل' : 'معطّل'}
              </span>
            </button>
            <p className="text-muted-foreground text-xs mb-3">
              سيتم إرسال تذكير بعد ساعتين من وقت الصلاة إذا لم تُسجَل
            </p>

            <button
              onClick={toggleStreakAlert}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors mb-2 min-h-[48px] ${
                settings.streakAlert
                  ? 'border-destructive/50 bg-destructive/10'
                  : 'border-border bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame size={16} className={settings.streakAlert ? 'text-destructive' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${settings.streakAlert ? 'text-foreground' : 'text-muted-foreground'}`}>
                  تنبيه "Streak في خطر"
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                settings.streakAlert ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
              }`}>
                {settings.streakAlert ? 'مفعّل' : 'معطّل'}
              </span>
            </button>
            
            <p className="text-muted-foreground text-xs">
              سيتم إرسال تنبيه الساعة 9 مساءً إذا لم تكتمل صلوات اليوم
            </p>
          </div>

          <p className="text-muted-foreground text-xs mt-2">
            ⏰ سيتم إرسال إشعار في الوقت المحدد (يجب أن يكون التطبيق مفتوحاً)
          </p>
        </div>
      )}
    </motion.div>
  );
}
