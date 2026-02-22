import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getChild, getTodayLog, togglePrayer, getChildProgress, isTodayComplete, getRandomMotivation, AVATAR_IMAGES, PRAYER_NAMES, type PrayerLog, type PrayerName } from '@/lib/store';
import PrayerButton from '@/components/PrayerButton';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function KidTracker() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const [log, setLog] = useState<PrayerLog | null>(null);
  const [progress, setProgress] = useState({ today: 0, total: 0 });
  const [celebration, setCelebration] = useState(false);
  const [allDoneCelebration, setAllDoneCelebration] = useState(false);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    if (!child) return;
    setLog(getTodayLog(child.id));
    setProgress(getChildProgress(child.id));
  }, [child]);

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const handleToggle = (prayer: PrayerName) => {
    const nowDone = togglePrayer(child.id, prayer);
    setLog(getTodayLog(child.id));
    setProgress(getChildProgress(child.id));
    if (nowDone) {
      setMotivation(getRandomMotivation());
      setCelebration(true);
      setTimeout(() => {
        setCelebration(false);
        setMotivation('');
      }, 1500);

      // Check if all 5 prayers are complete
      if (isTodayComplete(child.id)) {
        setTimeout(() => {
          setAllDoneCelebration(true);
          setTimeout(() => setAllDoneCelebration(false), 3000);
        }, 500);
      }
    }
  };

  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen gradient-night p-4 pb-8 relative overflow-hidden">
      {/* Single prayer celebration */}
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
        >
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 1.5,
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 400,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute text-3xl"
            >
              {['⭐', '🌙', '✨', '🏮'][i % 4]}
            </motion.span>
          ))}
          {motivation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: -50 }}
              exit={{ opacity: 0 }}
              className="absolute bg-card/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-primary shadow-lg"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-3xl p-8 border-2 border-primary glow-gold text-center shadow-2xl"
            >
              <motion.p
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-6xl mb-3"
              >
                🏆
              </motion.p>
              <p className="text-gold font-extrabold text-2xl mb-1">ماشاء الله!</p>
              <p className="text-foreground font-bold text-lg mb-1">أتممت صلوات اليوم كلها!</p>
              <p className="text-muted-foreground">بارك الله فيك يا {child.name} 🤲</p>
            </motion.div>
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 2,
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 600,
                }}
                transition={{ duration: 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
                className="absolute text-4xl"
              >
                {['⭐', '🌙', '✨', '🏮', '🎉', '🏆', '🤲'][i % 7]}
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
            <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{child.name}</h1>
              <p className="text-muted-foreground text-sm">{today}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/rewards/${child.id}`)}
            className="bg-primary/15 text-gold p-3 rounded-xl glow-gold"
          >
            <Trophy size={22} />
          </button>
        </div>

        {/* Star count */}
        <motion.div
          animate={{ scale: celebration ? [1, 1.1, 1] : 1 }}
          className="text-center my-5"
        >
          <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-2xl border border-border">
            <span className="text-star text-2xl">⭐</span>
            <span className="text-3xl font-extrabold text-gold">{progress.total}</span>
            <span className="text-muted-foreground font-medium">نجمة</span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground font-medium">تقدّم اليوم</span>
            <span className="text-gold font-bold">{progress.today}/٥</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(progress.today / 5) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="h-full gradient-gold rounded-full"
            />
          </div>
          {progress.today === 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gold font-bold text-sm mt-2"
            >
              🎉 أتممت جميع صلوات اليوم!
            </motion.p>
          )}
        </div>

        {/* Prayer buttons */}
        <div className="space-y-3 mb-6">
          {PRAYER_NAMES.map((prayer, i) => (
            <motion.div
              key={prayer.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <PrayerButton
                label={prayer.label}
                emoji={prayer.emoji}
                done={log?.[prayer.key] ?? false}
                onToggle={() => handleToggle(prayer.key)}
              />
            </motion.div>
          ))}
        </div>

        {/* Weekly calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>
    </div>
  );
}
