import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { getChildren, getStreak, getChildProgress, getChildLevel, getDateProgress, AVATAR_IMAGES, localDateStr, type Child } from '@/lib/store';
import { getGreeting, getSeasonalMessage } from '@/lib/greetings';
import StarParticles from '@/components/StarParticles';
import { ArrowLeft, TrendingUp, Crown, Flame, Star } from 'lucide-react';

const cardGradients = [
  'from-primary/20 via-primary/5 to-transparent',
  'from-secondary/20 via-secondary/5 to-transparent',
  'from-accent/20 via-accent/5 to-transparent',
  'from-lantern/20 via-lantern/5 to-transparent',
  'from-gold/20 via-gold/5 to-transparent',
];

const encouragements = [
  'هيا نبدأ يومًا مباركًا! 🌟',
  'كل صلاة نور يوم القيامة 💫',
  'الصلاة خير من النوم ☀️',
  'ربي اجعلني مقيم الصلاة 🤲',
  'من حافظ عليها كانت له نورًا 🌙',
  'بارك الله في يومك! 🌈',
];

function Card3D({ children, index, onClick }: { children: React.ReactNode; index: number; onClick: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 300, damping: 30 });

  function handleMove(e: React.PointerEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ perspective: 800, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileTap={{ scale: 0.95 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export default function KidSelection() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const greeting = useMemo(() => getGreeting(), []);
  const seasonal = useMemo(() => getSeasonalMessage(), []);
  const encouragement = useMemo(() => encouragements[Math.floor(Math.random() * encouragements.length)], []);

  useEffect(() => {
    const kids = getChildren();
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">من يصلّي؟ 🤲</h1>
        </div>

        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong rounded-2xl p-4 mb-5 text-center border border-border/50"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-3xl mb-1"
          >
            🕌
          </motion.div>
          <p className="text-foreground/80 text-base font-bold">
            {greeting.text} {greeting.emoji}
          </p>
          {seasonal.isSpecial && (
            <p className="text-gold/80 text-sm font-medium mt-1">
              {seasonal.emoji} {seasonal.message}
            </p>
          )}
          <p className="text-muted-foreground text-sm mt-1">{encouragement}</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-foreground/70 text-base mb-4 font-bold"
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
          <div className={`grid gap-4 ${children.length === 1 ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-2'}`}>
            {children.map((child, i) => {
              const streak = getStreak(child.id);
              const todayProgress = getDateProgress(child.id, localDateStr());
              const levelInfo = getChildLevel(child.id);
              const isAllDone = todayProgress === 5;
              const todayPct = (todayProgress / 5) * 100;

              return (
                <Card3D key={child.id} index={i} onClick={() => navigate(`/tracker/${child.id}`)}>
                  <div className={`glass-card-strong border-2 ${isAllDone ? 'border-gold glow-gold' : 'border-border/50 hover:border-primary/50'} rounded-3xl p-4 flex flex-col items-center gap-2 transition-all relative overflow-hidden bg-gradient-to-br ${cardGradients[i % cardGradients.length]}`}>
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 5 }}
                      style={{ skewX: '-12deg' }}
                    />

                    {/* All done badge */}
                    {isAllDone && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 z-20"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Crown size={20} className="text-gold drop-shadow-lg" />
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Avatar with progress ring */}
                    <div className="relative mt-1">
                      <svg className="absolute -inset-2 w-[96px] h-[96px] -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="21" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                        <motion.circle
                          cx="24" cy="24" r="21" fill="none"
                          stroke={isAllDone ? 'hsl(var(--gold))' : 'hsl(var(--primary))'}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 21}
                          initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 21 * (1 - todayPct / 100) }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                        />
                      </svg>
                      <img
                        src={AVATAR_IMAGES[child.avatarIndex]}
                        alt={child.name}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <span className="absolute -bottom-1 -right-1 text-base bg-card rounded-full px-1 border border-border shadow-sm">
                        {levelInfo.level.icon}
                      </span>
                    </div>

                    {/* Name */}
                    <span className="text-foreground font-extrabold text-lg relative z-10 leading-tight">{child.name}</span>

                    {/* Level */}
                    <span className="text-xs font-bold relative z-10" style={{ color: levelInfo.level.color }}>
                      {levelInfo.level.name}
                    </span>

                    {/* Level progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden relative z-10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: levelInfo.level.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                      />
                    </div>

                    {/* Today progress */}
                    <div className="flex items-center gap-1 relative z-10">
                      <TrendingUp size={12} className={isAllDone ? 'text-gold' : 'text-secondary'} />
                      <span className={`text-xs font-bold ${isAllDone ? 'text-gold' : 'text-secondary'}`}>
                        {todayProgress}/٥ اليوم
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-gold fill-gold" />
                        <span className="text-gold font-extrabold text-sm">{child.totalStars}</span>
                      </div>
                      {streak.current > 0 && (
                        <div className="flex items-center gap-0.5 bg-destructive/15 px-1.5 py-0.5 rounded-full">
                          <Flame size={12} className="text-destructive" />
                          <span className="text-destructive font-bold text-xs">{streak.current}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
