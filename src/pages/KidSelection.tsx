import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, getStreak, getChildProgress, getChildLevel, getDateProgress, AVATAR_IMAGES, localDateStr, type Child } from '@/lib/store';
import { getGreeting, getSeasonalMessage } from '@/lib/greetings';
import StarParticles from '@/components/StarParticles';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const cardColors = [
  'border-gold/50 hover:border-gold',
  'border-secondary/50 hover:border-secondary',
  'border-accent/50 hover:border-accent',
  'border-lantern/50 hover:border-lantern',
  'border-star/50 hover:border-star',
];

export default function KidSelection() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const greeting = useMemo(() => getGreeting(), []);
  const seasonal = useMemo(() => getSeasonalMessage(), []);

  useEffect(() => {
    const kids = getChildren();
    // Sort by activity: most active today first, then by stars
    const sorted = [...kids].sort((a, b) => {
      const aToday = getDateProgress(a.id, localDateStr());
      const bToday = getDateProgress(b.id, localDateStr());
      if (bToday !== aToday) return bToday - aToday;
      return b.totalStars - a.totalStars;
    });
    setChildren(sorted);
  }, []);

  return (
    <div className="min-h-screen gradient-night p-4 relative overflow-hidden">
      <StarParticles />
      <div className="max-w-md mx-auto sm:max-w-lg relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">من يصلّي؟ 🤲</h1>
        </div>

        {/* Dynamic greeting + seasonal */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <p className="text-foreground/70 text-lg font-medium">
            {greeting.text} {greeting.emoji}
          </p>
          {seasonal.isSpecial && (
            <p className="text-gold/80 text-sm font-medium mt-1">
              {seasonal.emoji} {seasonal.message}
            </p>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center text-foreground/70 text-base mb-6 font-medium"
        >
          اختر اسمك 👇
        </motion.p>

        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-strong rounded-3xl p-10 text-center border-2 border-dashed border-border"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-4">
              <svg width="80" height="100" viewBox="0 0 44 60" className="mx-auto">
                <line x1="22" y1="0" x2="22" y2="12" stroke="hsl(var(--gold))" strokeWidth="1.5" />
                <rect x="16" y="10" width="12" height="4" rx="1" fill="hsl(var(--gold))" />
                <path d="M14 14 C14 14, 10 20, 10 30 C10 40, 14 46, 22 48 C30 46, 34 40, 34 30 C34 20, 30 14, 30 14 Z" fill="hsl(var(--lantern-orange))" />
                <ellipse cx="22" cy="30" rx="8" ry="12" fill="hsl(var(--gold))" opacity="0.4" />
                <path d="M18 46 L22 54 L26 46" fill="hsl(var(--gold))" opacity="0.7" />
              </svg>
            </motion.div>
            <p className="text-foreground font-bold text-lg mb-2">لا يوجد أطفال!</p>
            <p className="text-muted-foreground mb-4">اطلب من الوالدين إضافتك أولاً 💛</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="gradient-gold text-primary-foreground font-bold text-base px-6 py-3 rounded-xl glow-gold"
            >
              🔒 الذهاب لوضع الوالدين
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {children.map((child, i) => {
              const streak = getStreak(child.id);
              const progress = getChildProgress(child.id);
              const todayProgress = getDateProgress(child.id, localDateStr());
              const levelInfo = getChildLevel(child.id);
              const isTopPerformer = todayProgress === 5;
              const todayPct = (todayProgress / 5) * 100;
              return (
                <motion.button
                  key={child.id}
                  initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.06, rotateY: 5 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(`/tracker/${child.id}`)}
                  style={{ perspective: 600 }}
                  className={`glass-card-strong border-2 ${isTopPerformer ? 'border-primary glow-pulse' : cardColors[i % cardColors.length]} rounded-3xl p-5 flex flex-col items-center gap-2 transition-all relative overflow-hidden`}
                >
                  {isTopPerformer && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      style={{ skewX: '-12deg' }}
                    />
                  )}
                  <div className="absolute top-4 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
                  
                  {/* Avatar with progress ring */}
                  <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} className="relative">
                    <svg className="absolute -inset-2 w-[104px] h-[104px] -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                      <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 * (1 - todayPct / 100)}
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <img
                      src={AVATAR_IMAGES[child.avatarIndex]}
                      alt={child.name}
                      className="w-22 h-22 rounded-full object-cover ring-3 ring-primary/30"
                      style={{ width: 88, height: 88 }}
                    />
                    <span className="absolute -bottom-1 -right-1 text-lg bg-card rounded-full px-1 border border-border">{levelInfo.level.icon}</span>
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-gold/40"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    />
                  </motion.div>
                  
                  <span className="text-foreground font-bold text-lg relative z-10">{child.name}</span>
                  
                  {/* Today's progress indicator */}
                  <div className="flex items-center gap-1 relative z-10">
                    <TrendingUp size={12} className="text-secondary" />
                    <span className="text-xs font-bold text-secondary">{todayProgress}/٥ اليوم</span>
                  </div>
                  
                  <span className="text-xs font-bold relative z-10" style={{ color: levelInfo.level.color }}>
                    {levelInfo.level.icon} {levelInfo.level.name}
                  </span>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative z-10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: levelInfo.level.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                    />
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} className="flex items-center gap-1">
                      <span className="text-star text-lg">⭐</span>
                      <span className="text-gold font-extrabold text-lg">{child.totalStars}</span>
                    </motion.div>
                    {streak.current > 0 && (
                      <div className="flex items-center gap-0.5 bg-destructive/20 px-2 py-0.5 rounded-full">
                        <span className="text-sm">🔥</span>
                        <span className="text-destructive font-bold text-sm">{streak.current}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
