import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getChild, getStreak, getEarnedBadges, BADGES, getJamaahCount, getChildProgress,
  getWeeklyLogs, getChildLevel, getPrayerAnalysis, PRAYER_NAMES, AVATAR_IMAGES, LEVELS
} from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { ArrowLeft, Flame, Target, TrendingUp, Share2, Download, MessageCircle } from 'lucide-react';

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
  const levelInfo = getChildLevel(child.id);
  const analysis = getPrayerAnalysis(child.id);

  const prayerLabels: Record<string, string> = {
    fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
  };

  const shareViaWhatsApp = () => {
    const text = `🕌 تقرير ${child.name}\n⭐ النجوم: ${progress.total}\n🔥 الـ Streak: ${streak.current} يوم\n${levelInfo.level.icon} المستوى: ${levelInfo.level.name}\n🏅 الشارات: ${earnedBadges.length}/${BADGES.length}\n💪 أقوى صلاة: ${prayerLabels[analysis.strongest]} (${analysis[analysis.strongest]}%)\n📊 صلوات الأسبوع: ${totalWeekPrayers}/35\n\nماشاء الله! بارك الله فيه 🤲`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadCertificate = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a3e"/>
          <stop offset="100%" style="stop-color:#0d1b2a"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#d4a017"/>
          <stop offset="100%" style="stop-color:#f0c040"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg)" rx="20"/>
      <rect x="15" y="15" width="570" height="370" fill="none" stroke="url(#gold)" stroke-width="2" rx="15" stroke-dasharray="8,4"/>
      <text x="300" y="60" text-anchor="middle" fill="#f0c040" font-size="28" font-family="Cairo" font-weight="800">🏆 شهادة إنجاز 🏆</text>
      <text x="300" y="110" text-anchor="middle" fill="#e8e8f0" font-size="22" font-family="Cairo" font-weight="700">يُمنح هذا التقدير لـ</text>
      <text x="300" y="155" text-anchor="middle" fill="#f0c040" font-size="32" font-family="Cairo" font-weight="900">${child.name}</text>
      <text x="300" y="200" text-anchor="middle" fill="#e8e8f0" font-size="18" font-family="Cairo">${levelInfo.level.icon} المستوى: ${levelInfo.level.name}</text>
      <text x="200" y="250" text-anchor="middle" fill="#f0c040" font-size="20" font-family="Cairo">⭐ ${progress.total} نجمة</text>
      <text x="400" y="250" text-anchor="middle" fill="#ff6b6b" font-size="20" font-family="Cairo">🔥 ${streak.best} يوم أفضل سلسلة</text>
      <text x="300" y="295" text-anchor="middle" fill="#e8e8f0" font-size="16" font-family="Cairo">🏅 ${earnedBadges.length} شارة من أصل ${BADGES.length}</text>
      <text x="300" y="340" text-anchor="middle" fill="#888" font-size="14" font-family="Cairo">متابع الصلاة - ${new Date().toLocaleDateString('ar-SA')}</text>
      <text x="300" y="375" text-anchor="middle" fill="#555" font-size="12" font-family="Cairo">ماشاء الله! بارك الله فيك 🤲</text>
    </svg>`;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `شهادة-${child.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prayerAnalysisData = [
    { key: 'fajr', label: 'الفجر', pct: analysis.fajr },
    { key: 'dhuhr', label: 'الظهر', pct: analysis.dhuhr },
    { key: 'asr', label: 'العصر', pct: analysis.asr },
    { key: 'maghrib', label: 'المغرب', pct: analysis.maghrib },
    { key: 'isha', label: 'العشاء', pct: analysis.isha },
  ];

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

        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border mb-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {levelInfo.level.icon}
            </motion.span>
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
          {/* Level progress */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: levelInfo.level.color }}
            />
          </div>
          {/* All levels display */}
          <div className="flex justify-between mt-3">
            {LEVELS.map(level => (
              <div key={level.id} className={`flex flex-col items-center ${level.id <= levelInfo.level.id ? 'opacity-100' : 'opacity-30'}`}>
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

        {/* Prayer Analysis */}
        {analysis.totalDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 border border-border mb-5"
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

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
          transition={{ delay: 0.2 }}
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

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-5 border border-border mb-5"
        >
          <h3 className="font-bold text-foreground mb-4 text-lg">📤 شارك إنجازاتك</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={shareViaWhatsApp}
              className="flex items-center justify-center gap-2 bg-secondary/20 text-secondary font-bold py-3 rounded-xl border border-secondary/30 min-h-[48px]"
            >
              <MessageCircle size={18} />
              <span className="text-sm">واتساب</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={downloadCertificate}
              className="flex items-center justify-center gap-2 bg-primary/20 text-gold font-bold py-3 rounded-xl border border-primary/30 min-h-[48px]"
            >
              <Download size={18} />
              <span className="text-sm">شهادة إنجاز</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Weekly Calendar */}
        <WeeklyCalendar childId={child.id} />
      </div>

      <BottomNav childId={child.id} />
    </div>
  );
}
