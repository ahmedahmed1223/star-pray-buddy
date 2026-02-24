import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getChild, getDateLog, togglePrayerForDate, toggleJamaah, getChildProgress, getDateProgress,
  isDateComplete, getRandomMotivation, getMoneyReward, getChildMoney, getSettings,
  getCustomActivities, toggleActivity, getActivityLog,
  AVATAR_IMAGES, PRAYER_NAMES, type PrayerLog, type PrayerName
} from '@/lib/store';
import { formatHijri } from '@/lib/hijri';
import { playPrayerSound, playUndoSound, playAllCompleteSound } from '@/lib/sounds';
import PrayerButton from '@/components/PrayerButton';
import ActivityButton from '@/components/ActivityButton';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import DateNavigator from '@/components/DateNavigator';
import LanternProgress from '@/components/LanternProgress';
import { ArrowLeft, Trophy, Coins } from 'lucide-react';

export default function KidTracker() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const settings = getSettings();
  const moneyReward = getMoneyReward();
  const activities = getCustomActivities();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState<PrayerLog | null>(null);
  const [progress, setProgress] = useState({ today: 0, total: 0 });
  const [celebration, setCelebration] = useState(false);
  const [allDoneCelebration, setAllDoneCelebration] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [activityStates, setActivityStates] = useState<Record<string, boolean>>({});

  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  const refreshState = () => {
    if (!child) return;
    setLog(getDateLog(child.id, dateStr));
    setProgress(getChildProgress(child.id));
    const states: Record<string, boolean> = {};
    activities.forEach(a => { states[a.id] = getActivityLog(child.id, a.id, dateStr); });
    setActivityStates(states);
  };

  useEffect(() => { refreshState(); }, [child, dateStr]);

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const childMoney = getChildMoney(child.id);
  const dateProgress = getDateProgress(child.id, dateStr);

  const handleToggle = (prayer: PrayerName) => {
    const nowDone = togglePrayerForDate(child.id, prayer, dateStr);
    refreshState();
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(nowDone ? 50 : 30);
    if (nowDone) {
      playPrayerSound();
      setMotivation(getRandomMotivation());
      setCelebration(true);
      setTimeout(() => { setCelebration(false); setMotivation(''); }, 1500);

      if (isDateComplete(child.id, dateStr)) {
        setTimeout(() => {
          playAllCompleteSound();
          if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
          setAllDoneCelebration(true);
          setTimeout(() => setAllDoneCelebration(false), 3000);
        }, 500);
      }
    } else {
      playUndoSound();
    }
  };

  const handleJamaahToggle = (prayer: PrayerName) => {
    toggleJamaah(child.id, prayer, dateStr);
    refreshState();
  };

  const handleActivityToggle = (activityId: string) => {
    toggleActivity(child.id, activityId, dateStr);
    if (navigator.vibrate) navigator.vibrate(40);
    refreshState();
  };

  return (
    <div className="min-h-screen gradient-night p-4 pb-8 relative overflow-hidden">
      {/* Single prayer celebration */}
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {[...Array(15)].map((_, i) => (
            <motion.span key={i}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 350, y: (Math.random() - 0.5) * 450 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute text-3xl"
            >
              {['⭐', '🌙', '✨', '🏮', '💫'][i % 5]}
            </motion.span>
          ))}
          {motivation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: -50 }} exit={{ opacity: 0 }}
              className="absolute bg-card/95 backdrop-blur-sm px-6 py-3 rounded-2xl border border-primary shadow-lg glow-gold"
            >
              <p className="text-gold font-bold text-lg">{motivation}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* All 5 prayers complete celebration */}
      <AnimatePresence>
        {allDoneCelebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-3xl p-8 border-2 border-primary glow-gold text-center shadow-2xl"
            >
              <motion.p animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }} className="text-6xl mb-3">🏆</motion.p>
              <p className="text-gold font-extrabold text-2xl mb-1">ماشاء الله!</p>
              <p className="text-foreground font-bold text-lg mb-1">أتممت صلوات اليوم كلها!</p>
              <p className="text-muted-foreground">بارك الله فيك يا {child.name} 🤲</p>
            </motion.div>
            {[...Array(25)].map((_, i) => (
              <motion.span key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 2, x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 600 }}
                transition={{ duration: 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
                className="absolute text-4xl"
              >
                {['⭐', '🌙', '✨', '🏮', '🎉', '🏆', '🤲', '💫'][i % 8]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/kids')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <motion.img
              src={AVATAR_IMAGES[child.avatarIndex]}
              alt={child.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
              whileTap={{ scale: 1.1 }}
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">{child.name}</h1>
            </div>
          </div>
          <motion.button
            onClick={() => navigate(`/rewards/${child.id}`)}
            className="bg-primary/15 text-gold p-3 rounded-xl glow-gold"
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy size={22} />
          </motion.button>
        </div>

        {/* Date Navigator with Hijri */}
        <DateNavigator
          date={selectedDate}
          onDateChange={setSelectedDate}
          allowPast={settings.allowChildPastEdit}
          allowFuture={false}
        />

        {/* Star & Money count */}
        <motion.div animate={{ scale: celebration ? [1, 1.1, 1] : 1 }} className="text-center my-4">
          <div className="inline-flex items-center gap-4 bg-card px-6 py-3 rounded-2xl border border-border">
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-star text-2xl"
              >
                ⭐
              </motion.span>
              <span className="text-3xl font-extrabold text-gold">{progress.total}</span>
              <span className="text-muted-foreground font-medium text-sm">نجمة</span>
            </div>
            {moneyReward.enabled && (
              <>
                <div className="w-px h-8 bg-border" />
                <div className="flex items-center gap-1.5">
                  <Coins size={20} className="text-secondary" />
                  <span className="text-2xl font-extrabold text-secondary">{childMoney}</span>
                  <span className="text-muted-foreground font-medium text-sm">{moneyReward.currency}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Lantern Progress instead of progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1 px-2">
            <span className="text-muted-foreground font-medium">{isToday ? 'تقدّم اليوم' : 'تقدّم هذا اليوم'}</span>
            <span className="text-gold font-bold">{dateProgress}/٥</span>
          </div>
          <LanternProgress count={dateProgress} />
          {dateProgress === 5 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gold font-bold text-sm mt-1">
              🎉 أتممت جميع الصلوات!
            </motion.p>
          )}
        </div>

        {/* Prayer buttons with unique gradients */}
        <div className="space-y-3 mb-5">
          {PRAYER_NAMES.map((prayer, i) => (
            <motion.div key={prayer.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <PrayerButton
                label={prayer.label}
                emoji={prayer.emoji}
                colorClass={prayer.color}
                prayerKey={prayer.key}
                done={log?.[prayer.key] ?? false}
                onToggle={() => handleToggle(prayer.key)}
                jamaahEnabled={settings.jamaahEnabled}
                jamaahChecked={log?.[`${prayer.key}Jamaah` as keyof PrayerLog] as boolean ?? false}
                onJamaahToggle={() => handleJamaahToggle(prayer.key)}
              />
            </motion.div>
          ))}
        </div>

        {/* Custom Activities */}
        {activities.length > 0 && (
          <div className="mb-5">
            <h3 className="text-foreground font-bold text-lg mb-3">📋 أنشطة إضافية</h3>
            <div className="space-y-2">
              {activities.map((activity, i) => (
                <motion.div key={activity.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <ActivityButton
                    name={activity.name}
                    emoji={activity.emoji}
                    stars={activity.starsPerCompletion}
                    done={activityStates[activity.id] ?? false}
                    onToggle={() => handleActivityToggle(activity.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>
    </div>
  );
}
