import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getChild, getStreak, getEarnedBadges, BADGES, getJamaahCount, getChildProgress,
  getWeeklyLogs, getChildLevel, getPrayerAnalysis, PRAYER_NAMES, AVATAR_IMAGES, LEVELS
} from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { ArrowLeft, Flame, Target, TrendingUp, Share2, Download } from 'lucide-react';
import { useState } from 'react';
import CertificateGenerator from '@/components/CertificateGenerator';

function ProgressRing({ progress, size = 48, strokeWidth = 3, color }: { progress: number; size?: number; strokeWidth?: number; color: string }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeDasharray={circumference}
      />
    </svg>
  );
}

export default function AchievementsScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const [showCertificate, setShowCertificate] = useState(false);

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
  const levelInfo = getChildLevel(child.id);
  const analysis = getPrayerAnalysis(child.id);

  const prayerLabels: Record<string, string> = {
    fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
  };

  const prayerAnalysisData = [
    { key: 'fajr', label: 'الفجر', pct: analysis.fajr },
    { key: 'dhuhr', label: 'الظهر', pct: analysis.dhuhr },
    { key: 'asr', label: 'العصر', pct: analysis.asr },
    { key: 'maghrib', label: 'المغرب', pct: analysis.maghrib },
    { key: 'isha', label: 'العشاء', pct: analysis.isha },
  ];

  // Upcoming badges (not yet earned)
  const upcomingBadges = BADGES.filter(b => !earnedBadges.some(e => e.id === b.id)).slice(0, 3);
  const badgeProgressPct = (earnedBadges.length / BADGES.length) * 100;

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

        {/* Level Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong rounded-2xl p-5 border border-border mb-5 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            style={{ skewX: '-12deg' }}
          />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="relative">
              <ProgressRing progress={levelInfo.progress} size={56} strokeWidth={4} color={levelInfo.level.color} />
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {levelInfo.level.icon}
              </motion.span>
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-xl" style={{ color: levelInfo.level.color }}>{levelInfo.level.name}</p>
              <p className="text-muted-foreground text-sm">
                {levelInfo.nextLevel
                  ? `${levelInfo.starsToNext} نجمة للمستوى التالي (${levelInfo.nextLevel.name})`
                  : 'أعلى مستوى! 🎉'
                }
              </p>
            </div>
          </div>
          {/* All levels display */}
          <div className="flex justify-between mt-3 relative z-10">
            {LEVELS.map(level => (
              <div key={level.id} className={`flex flex-col items-center transition-all ${level.id <= levelInfo.level.id ? 'opacity-100 scale-100' : 'opacity-30 scale-90'}`}>
                <span className="text-lg">{level.icon}</span>
                <span className="text-xs text-muted-foreground">{level.minStars}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card-strong rounded-2xl p-5 border border-border mb-5"
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

        {/* Prayer Analysis */}
        {analysis.totalDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-strong rounded-2xl p-5 border border-border mb-5"
          >
            <h3 className="font-bold text-foreground text-lg mb-4">📊 تحليل الصلوات</h3>
            
            <div className="space-y-3 mb-4">
              {prayerAnalysisData.map((p, i) => (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="text-foreground font-medium text-sm w-16">{p.label}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: `hsl(var(--${p.key === 'fajr' ? 'fajr' : p.key === 'dhuhr' ? 'dhuhr' : p.key === 'asr' ? 'asr' : p.key === 'maghrib' ? 'maghrib' : 'isha'}-from))` }}
                    />
                  </div>
                  <span className="text-muted-foreground font-bold text-sm w-10 text-left">{p.pct}%</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/15 rounded-xl p-3 text-center">
                <p className="text-secondary font-bold text-sm">💪 الأقوى</p>
                <p className="text-foreground font-extrabold">{prayerLabels[analysis.strongest]}</p>
                <p className="text-secondary text-sm">{analysis[analysis.strongest]}%</p>
              </div>
              <div className="bg-destructive/15 rounded-xl p-3 text-center">
                <p className="text-destructive font-bold text-sm">🎯 للتحسين</p>
                <p className="text-foreground font-extrabold">{prayerLabels[analysis.weakest]}</p>
                <p className="text-destructive text-sm">{analysis[analysis.weakest]}%</p>
              </div>
            </div>

            {analysis[analysis.weakest] < 80 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-gold text-sm font-medium mt-3 bg-primary/10 rounded-xl p-2"
              >
                💡 حاول تحسين صلاة {prayerLabels[analysis.weakest]} هذا الأسبوع!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Stats Grid - Enhanced with colored cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="glass-card-strong rounded-xl p-3 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={14} className="text-gold" />
            </div>
            <p className="text-2xl font-extrabold text-gold">{progress.total}</p>
            <p className="text-muted-foreground text-xs">نجمة</p>
          </div>
          <div className="glass-card-strong rounded-xl p-3 border border-secondary/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} className="text-secondary" />
            </div>
            <p className="text-2xl font-extrabold text-secondary">{totalWeekPrayers}</p>
            <p className="text-muted-foreground text-xs">صلاة/أسبوع</p>
          </div>
          <div className="glass-card-strong rounded-xl p-3 border border-accent/20 text-center">
            <p className="text-sm mb-1">🕌</p>
            <p className="text-2xl font-extrabold text-accent">{jamaahCount}</p>
            <p className="text-muted-foreground text-xs">جماعة</p>
          </div>
        </motion.div>

        {/* Upcoming Badges - NEW SECTION */}
        {upcomingBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="glass-card-strong rounded-2xl p-5 border border-primary/20 mb-5"
          >
            <h3 className="font-bold text-foreground mb-3 text-lg">🎯 الإنجازات القريبة</h3>
            <div className="space-y-3">
              {upcomingBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <span className="text-2xl grayscale opacity-60">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-bold">{badge.name}</p>
                    <p className="text-muted-foreground text-xs">{badge.description}</p>
                  </div>
                  <span className="text-xs text-gold font-bold bg-primary/10 px-2 py-1 rounded-lg">قريباً</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges - 3D Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-strong rounded-2xl p-5 border border-border mb-5"
        >
          <h3 className="font-bold text-foreground mb-3 text-lg">🏅 الشارات ({earnedBadges.length}/{BADGES.length})</h3>
          
          {/* Overall badge progress ring */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <ProgressRing progress={badgeProgressPct} size={72} strokeWidth={5} color="hsl(var(--gold))" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gold font-extrabold text-lg">{Math.round(badgeProgressPct)}%</span>
              </div>
            </div>
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
                  whileHover={earned ? { scale: 1.05, rotateY: 5 } : {}}
                  style={{ perspective: 600 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    earned ? 'border-primary bg-primary/10 glass-card' : 'border-border bg-muted/50 opacity-50'
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

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card-strong rounded-2xl p-5 border border-border mb-5"
        >
          <h3 className="font-bold text-foreground mb-4 text-lg">📤 شارك إنجازاتك</h3>
          <div className="space-y-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCertificate(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary/20 text-gold font-bold py-3 rounded-xl border border-primary/30 min-h-[48px]"
            >
              <Download size={18} />
              <span className="text-sm">📜 إنشاء شهادة إنجاز</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                const shareText = `🌟 ${child.name} وصل لمستوى ${levelInfo.level.name} ${levelInfo.level.icon}\n⭐ ${progress.total} نجمة\n🔥 ${streak.current} يوم متتالي\n🏅 ${earnedBadges.length}/${BADGES.length} شارة\n\nمن تطبيق متابع الصلاة 🕌`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `إنجازات ${child.name}`, text: shareText });
                  } catch {}
                } else {
                  await navigator.clipboard.writeText(shareText);
                  alert('تم نسخ الإنجازات! يمكنك لصقها ومشاركتها 📋');
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-secondary/20 text-secondary font-bold py-3 rounded-xl border border-secondary/30 min-h-[48px]"
            >
              <Share2 size={18} />
              <span className="text-sm">📱 مشاركة سريعة</span>
            </motion.button>
          </div>
        </motion.div>

        {showCertificate && (
          <CertificateGenerator
            child={child}
            levelInfo={levelInfo}
            streak={streak}
            earnedBadgesCount={earnedBadges.length}
            totalBadges={BADGES.length}
            totalStars={progress.total}
            onClose={() => setShowCertificate(false)}
          />
        )}

        {/* Weekly Calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>

      <BottomNav childId={child.id} />
    </div>
  );
}
