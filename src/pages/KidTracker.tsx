import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getChild, getChildren, getDateLog, togglePrayerForDate, toggleJamaah, getChildProgress, getDateProgress,
  isDateComplete, getRandomMotivation, getMoneyReward, getChildMoney, getSettings, getStreak,
  getCustomActivities, toggleActivity, getActivityLog, getEarnedBadges, getChildLevel, LEVELS,
  AVATAR_IMAGES, PRAYER_NAMES, localDateStr, getLatestParentMessage,
  getActiveFamilyChallenge, getFamilyChallengeProgress,
  getChildTheme, setChildTheme, CHILD_THEMES,
  type PrayerLog, type PrayerName, type ChildThemeName
} from '@/lib/store';
import { formatHijri } from '@/lib/hijri';
import { playPrayerSound, playUndoSound, playAllCompleteSound, playBadgeUnlockSound, playLevelUpSound, playSwipeSound } from '@/lib/sounds';
import { hapticLight, hapticMedium, hapticSuccess } from '@/lib/haptics';
import PrayerButton from '@/components/PrayerButton';
import ActivityButton from '@/components/ActivityButton';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import DateNavigator from '@/components/DateNavigator';
import LanternProgress from '@/components/LanternProgress';
import CircularProgress from '@/components/CircularProgress';
import BottomNav from '@/components/BottomNav';
import Confetti from '@/components/Confetti';
import Mascot from '@/components/Mascot';
import DailyGoalCard from '@/components/DailyGoalCard';
import QuranTracker from '@/components/QuranTracker';
import AdventureMap from '@/components/AdventureMap';
import ThemePickerDialog from '@/components/ThemePickerDialog';
import { ParticleBurst } from '@/components/SkeletonLoader';
import { ArrowLeft, Trophy, Coins, Flame, Award, Palette } from 'lucide-react';

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
  const [streak, setStreakState] = useState({ current: 0, best: 0 });
  const [confettiActive, setConfettiActive] = useState(false);
  const [badgePopup, setBadgePopup] = useState<{ name: string; icon: string } | null>(null);
  const [levelUpPopup, setLevelUpPopup] = useState<{ name: string; icon: string } | null>(null);
  const [particleBurst, setParticleBurst] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [childTheme, setChildThemeState] = useState<ChildThemeName>('golden');
  const prevBadgeCount = useRef(0);
  const prevLevelId = useRef(0);

  const dateStr = localDateStr(selectedDate);
  const isToday = dateStr === localDateStr();

  // Swipe between children
  const allChildren = getChildren();
  const currentIndex = allChildren.findIndex(c => c.id === childId);
  const handleSwipe = (dir: number) => {
    const nextIdx = currentIndex + dir;
    if (nextIdx >= 0 && nextIdx < allChildren.length) {
      playSwipeSound();
      navigate(`/tracker/${allChildren[nextIdx].id}`, { replace: true });
    }
  };

  const refreshState = () => {
    if (!child) return;
    setLog(getDateLog(child.id, dateStr));
    setProgress(getChildProgress(child.id));
    setStreakState(getStreak(child.id));
    const states: Record<string, boolean> = {};
    activities.forEach(a => { states[a.id] = getActivityLog(child.id, a.id, dateStr); });
    setActivityStates(states);
  };

  useEffect(() => {
    if (!child) return;
    refreshState();
    prevBadgeCount.current = getEarnedBadges(child.id).length;
    prevLevelId.current = getChildLevel(child.id).level.id;
    setChildThemeState(getChildTheme(child.id));
  }, [child, dateStr]);

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const childMoney = getChildMoney(child.id);
  const dateProgress = getDateProgress(child.id, dateStr);
  const levelInfo = getChildLevel(child.id);
  const familyChallenge = getActiveFamilyChallenge();
  const challengeProgress = familyChallenge ? getFamilyChallengeProgress(familyChallenge) : [];

  const themeVars = CHILD_THEMES[childTheme];
  const themeStyle: React.CSSProperties = childTheme !== 'golden' ? {
    '--primary': themeVars.primary,
    '--ring': themeVars.primary,
    '--gold': themeVars.primary,
    '--gold-glow': themeVars.glow,
  } as React.CSSProperties : {};
  const checkBadgesAndLevel = () => {
    const newBadges = getEarnedBadges(child.id);
    if (newBadges.length > prevBadgeCount.current) {
      const newBadge = newBadges[newBadges.length - 1];
      playBadgeUnlockSound();
      setBadgePopup({ name: newBadge.name, icon: newBadge.icon });
      setTimeout(() => setBadgePopup(null), 3000);
    }
    prevBadgeCount.current = newBadges.length;

    const newLevel = getChildLevel(child.id);
    if (newLevel.level.id > prevLevelId.current) {
      setTimeout(() => {
        playLevelUpSound();
        setLevelUpPopup({ name: newLevel.level.name, icon: newLevel.level.icon });
        setConfettiActive(true);
        setTimeout(() => { setLevelUpPopup(null); setConfettiActive(false); }, 4000);
      }, badgePopup ? 3200 : 500);
    }
    prevLevelId.current = newLevel.level.id;
  };

  const handleToggle = (prayer: PrayerName) => {
    const nowDone = togglePrayerForDate(child.id, prayer, dateStr);
    refreshState();
    nowDone ? hapticMedium() : hapticLight();
    if (nowDone) {
      playPrayerSound();
      setMotivation(getRandomMotivation());
      setCelebration(true);
      setParticleBurst(true);
      setTimeout(() => { setCelebration(false); setMotivation(''); setParticleBurst(false); }, 1500);

      if (isDateComplete(child.id, dateStr)) {
        setTimeout(() => {
          playAllCompleteSound();
          hapticSuccess();
          setAllDoneCelebration(true);
          setConfettiActive(true);
          setTimeout(() => {
            setAllDoneCelebration(false);
            setConfettiActive(false);
            checkBadgesAndLevel();
          }, 3500);
        }, 500);
      } else {
        checkBadgesAndLevel();
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
    hapticLight();
    refreshState();
    checkBadgesAndLevel();
  };

  return (
    <motion.div
      className="min-h-screen gradient-night p-3 pb-24 relative overflow-hidden"
      style={themeStyle}
      drag={allChildren.length > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80) {
          handleSwipe(info.offset.x > 0 ? -1 : 1);
        }
      }}
    >
      {/* Particle Burst */}
      <ParticleBurst active={particleBurst} x={50} y={60} />
      
      {/* SVG Confetti */}
      <Confetti active={confettiActive} count={45} />

      {/* Badge unlock popup */}
      <AnimatePresence>
        {badgePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-card border-2 border-primary rounded-2xl px-6 py-4 glow-gold shadow-2xl text-center"
          >
            <motion.div animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.6 }}>
              <Award size={32} className="text-gold mx-auto mb-2" />
            </motion.div>
            <p className="text-gold font-extrabold text-lg">شارة جديدة! 🎉</p>
            <p className="text-foreground font-bold">{badgePopup.icon} {badgePopup.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level up popup */}
      <AnimatePresence>
        {levelUpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotateZ: -10 }}
              animate={{ scale: [0, 1.2, 1], rotateZ: 0 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.7, type: 'spring' }}
              className="bg-card rounded-3xl p-8 border-2 border-accent glow-gold text-center shadow-2xl max-w-xs"
            >
              <motion.div
                animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                {levelUpPopup.icon}
              </motion.div>
              <p className="text-accent font-extrabold text-2xl mb-1">ترقية! 🎊</p>
              <p className="text-gold font-bold text-xl mb-2">مستوى: {levelUpPopup.name}</p>
              <p className="text-muted-foreground">استمر في الصلاة للوصول للمستوى التالي!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single prayer celebration */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
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
      </AnimatePresence>

      {/* All 5 prayers complete celebration */}
      <AnimatePresence>
        {allDoneCelebration && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotateY: -180 }} animate={{ scale: [0, 1.15, 1], rotateY: 0 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.7, type: 'spring' }}
              className="bg-card rounded-3xl p-8 border-2 border-primary glow-gold text-center shadow-2xl max-w-xs"
            >
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }}>
                <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto mb-3">
                  <defs>
                    <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(42, 100%, 65%)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(42, 100%, 45%)', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <path d="M16 8h32v4c0 12-8 24-16 28-8-4-16-16-16-28V8z" fill="url(#trophyGrad)" />
                  <rect x="24" y="40" width="16" height="4" rx="2" fill="hsl(42, 100%, 50%)" />
                  <rect x="20" y="44" width="24" height="6" rx="3" fill="hsl(42, 100%, 55%)" />
                  <path d="M16 8C16 8, 4 10, 4 20C4 28, 12 28, 16 24" fill="hsl(42, 100%, 60%)" opacity="0.5" />
                  <path d="M48 8C48 8, 60 10, 60 20C60 28, 52 28, 48 24" fill="hsl(42, 100%, 60%)" opacity="0.5" />
                </svg>
              </motion.div>
              <p className="text-gold font-extrabold text-2xl mb-1">ماشاء الله!</p>
              <p className="text-foreground font-bold text-lg mb-1">أتممت صلوات اليوم كلها!</p>
              <p className="text-muted-foreground mb-3">بارك الله فيك يا {child.name} 🤲</p>
              {streak.current > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 bg-destructive/15 px-4 py-2 rounded-xl"
                >
                  <Flame size={18} className="text-destructive" />
                  <span className="text-destructive font-extrabold text-lg">{streak.current}</span>
                  <span className="text-foreground text-sm font-medium">يوم متتالي!</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        {/* Glass Header Card */}
        <div className="glass-card-strong rounded-2xl p-3 mb-3">
          {/* Top row: back + actions */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate('/kids')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft size={22} className="rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-1">
              {streak.current > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-destructive/15 px-2.5 py-1 rounded-xl">
                  <Flame size={14} className="text-destructive" />
                  <span className="text-destructive font-extrabold text-sm">{streak.current}</span>
                </motion.div>
              )}
              <motion.button onClick={() => setThemePickerOpen(true)} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <Palette size={18} />
              </motion.button>
              <motion.button onClick={() => navigate(`/rewards/${child.id}`)} className="bg-primary/15 text-gold p-2.5 rounded-xl glow-gold min-w-[44px] min-h-[44px] flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <Trophy size={20} />
              </motion.button>
            </div>
          </div>

          {/* Avatar + Name centered */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <motion.div className="relative">
              <motion.img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/40" whileTap={{ scale: 1.1 }} />
              <span className="absolute -bottom-1 -right-1 text-sm bg-card rounded-full px-1 border border-border">{levelInfo.level.icon}</span>
            </motion.div>
            <h1 className="text-lg font-bold text-foreground">{child.name}</h1>
            {/* Level bar */}
            <div className="flex items-center gap-2 w-full max-w-[200px]">
              <span className="text-xs font-bold" style={{ color: levelInfo.level.color }}>{levelInfo.level.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full gradient-gold" initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ duration: 0.8 }} />
              </div>
              {levelInfo.nextLevel && <span className="text-xs text-muted-foreground">{levelInfo.starsToNext}⭐</span>}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-xl">
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-lg">⭐</motion.span>
              <span className="text-xl font-extrabold text-gold">{progress.total}</span>
            </div>
            {moneyReward.enabled && (
              <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-xl">
                <Coins size={18} className="text-secondary" />
                <span className="text-xl font-extrabold text-secondary">{childMoney}</span>
                <span className="text-xs text-muted-foreground">{moneyReward.currency}</span>
              </div>
            )}
          </div>
        </div>

        {/* Date Navigator */}
        <DateNavigator date={selectedDate} onDateChange={setSelectedDate} allowPast={settings.allowChildPastEdit} allowFuture={false} />

        {/* Circular Progress */}
        <div className="my-3 flex justify-center">
          <CircularProgress count={dateProgress} />
        </div>
        {/* Parent message */}
        {(() => {
          const parentMsg = getLatestParentMessage();
          return parentMsg ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3 mb-3 text-center"
            >
              <span className="text-lg mr-1">{parentMsg.emoji}</span>
              <span className="text-foreground text-sm font-medium">{parentMsg.text}</span>
            </motion.div>
          ) : null;
        })()}

        {/* Mascot */}
        <Mascot prayersDone={dateProgress} totalStars={progress.total} streak={streak.current} />

        {/* Daily Goal */}
        <div className="mb-4">
          <DailyGoalCard childId={child.id} date={dateStr} onComplete={refreshState} />
        </div>

        {/* Section: Prayer Buttons */}
        <div className="flex items-center gap-2 mb-2 mt-1 px-1">
          <span className="text-lg">🕌</span>
          <span className="text-sm font-bold text-foreground">الصلوات الخمس</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-2.5 mb-4">
          {PRAYER_NAMES.map((prayer, i) => (
            <motion.div key={prayer.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
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

        {/* Section: Activities */}
        {activities.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-lg">📋</span>
              <span className="text-sm font-bold text-foreground">أنشطة إضافية</span>
              <div className="flex-1 h-px bg-border" />
            </div>
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

        {/* Section: Quran */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-lg">📖</span>
            <span className="text-sm font-bold text-foreground">القرآن الكريم</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <QuranTracker childId={child.id} date={dateStr} onUpdate={refreshState} />
        </div>

        {/* Family Challenge */}
        {familyChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong rounded-2xl p-4 border border-border mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{familyChallenge.emoji}</span>
              <div className="flex-1">
                <p className="text-gold font-bold text-sm">🏠 تحدي الأسرة</p>
                <p className="text-foreground font-medium text-sm">{familyChallenge.title}</p>
              </div>
            </div>
            <div className="space-y-2">
              {challengeProgress.map(cp => {
                const pct = Math.min((cp.progress / familyChallenge.target) * 100, 100);
                return (
                  <div key={cp.childId} className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-16 truncate ${cp.childId === child.id ? 'text-gold' : 'text-muted-foreground'}`}>
                      {cp.childName}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-primary"
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-bold">{cp.progress}/{familyChallenge.target}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Adventure Map */}
        <AdventureMap totalStars={progress.total} />

        {/* Weekly calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>

      {/* Theme Picker */}
      <ThemePickerDialog
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
        currentTheme={childTheme}
        onSelect={(theme) => {
          setChildTheme(child.id, theme);
          setChildThemeState(theme);
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav childId={child.id} />
    </motion.div>
  );
}
