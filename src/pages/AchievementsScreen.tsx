import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChild, getStreak, getEarnedBadges, BADGES, getJamaahCount, getChildProgress, getWeeklyLogs, AVATAR_IMAGES } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { ArrowLeft, Flame, Target, TrendingUp } from 'lucide-react';

export default function AchievementsScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const streak = getStreak(child.id);
  const earnedBadges = getEarnedBadges(child.id);
  const jamaahCount = getJamaahCount(child.id);
  const progress = getChildProgress(child.id);
  const weekly = getWeeklyLogs(child.id);
  const totalWeekPrayers = weekly.reduce((s, d) => s + d.count, 0);
  const fullDays = weekly.filter(d => d.count === 5).length;

  return (
    <div className="min-h-screen gradient-night p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/tracker/${child.id}`)} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">الإنجازات 🏅</h1>
        </div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame size={20} className="text-destructive" />
            <h3 className="font-bold text-foreground text-lg">سلسلة الأيام</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <motion.p
                animate={streak.current > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-extrabold text-destructive"
              >
                {streak.current}
              </motion.p>
              <p className="text-muted-foreground text-xs font-medium mt-1">الحالي 🔥</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-4xl font-extrabold text-gold">{streak.best}</p>
              <p className="text-muted-foreground text-xs font-medium mt-1">الأفضل ⭐</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={14} className="text-gold" />
            </div>
            <p className="text-2xl font-extrabold text-gold">{progress.total}</p>
            <p className="text-muted-foreground text-xs">نجمة</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} className="text-secondary" />
            </div>
            <p className="text-2xl font-extrabold text-secondary">{totalWeekPrayers}</p>
            <p className="text-muted-foreground text-xs">صلاة/أسبوع</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-sm mb-1">🕌</p>
            <p className="text-2xl font-extrabold text-accent">{jamaahCount}</p>
            <p className="text-muted-foreground text-xs">جماعة</p>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 border border-border mb-5"
        >
          <h3 className="font-bold text-foreground mb-4 text-lg">🏅 الشارات ({earnedBadges.length}/{BADGES.length})</h3>
          
          {/* Progress bar for badges */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / BADGES.length) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full gradient-gold rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((badge, i) => {
              const earned = earnedBadges.some(b => b.id === badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    earned ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 opacity-50'
                  }`}
                >
                  <motion.span
                    className={`text-3xl ${earned ? '' : 'grayscale'}`}
                    animate={earned ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: earned ? Infinity : 0 }}
                  >
                    {badge.icon}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{badge.description}</p>
                    {earned && <span className="text-xs text-secondary font-bold">✓ محقق</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>

      <BottomNav childId={child.id} />
    </div>
  );
}
