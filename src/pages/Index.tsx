import { storageGet, storageSet, storageRemove } from '@/lib/storage';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PinDialog from '@/components/PinDialog';
import StarParticles from '@/components/StarParticles';
import SeasonalBackground from '@/components/SeasonalBackground';
import SeasonalThemePicker from '@/components/SeasonalThemePicker';
import ramadanBg from '@/assets/ramadan-bg.jpg';
import { isOnboardingDone, setOnboardingDone, getChildren, getChildProgress, getStreak, AVATAR_IMAGES } from '@/lib/store';
import { Users, Lock, ChevronLeft, Star, Flame, TrendingUp, Sparkles, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SoundToggle from '@/components/SoundToggle';
import { getGreeting, getSeasonalMessage } from '@/lib/greetings';

function SVGLantern({ delay = 0, x = 0 }: { delay?: number; x?: number }) {
  return (
    <motion.g
      animate={{ rotate: [-3, 3, -3], y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 3 + delay * 0.5, ease: 'easeInOut', delay }}
      style={{ transformOrigin: `${x + 20}px 0px` }}
    >
      <line x1={x + 20} y1={0} x2={x + 20} y2={14} stroke="hsl(var(--season-glow, var(--gold-glow)))" strokeWidth="1.5" />
      <rect x={x + 14} y={12} width={12} height={4} rx={1.5} fill="hsl(var(--season-glow, var(--gold-glow)))" />
      <path
        d={`M${x + 12} 16 C${x + 12} 16, ${x + 8} 24, ${x + 8} 34 C${x + 8} 44, ${x + 12} 50, ${x + 20} 52 C${x + 28} 50, ${x + 32} 44, ${x + 32} 34 C${x + 32} 24, ${x + 28} 16, ${x + 28} 16 Z`}
        fill="hsl(var(--season-primary, var(--lantern-orange)))"
      />
      <ellipse cx={x + 20} cy={34} rx={6} ry={10} fill="hsl(var(--season-glow, var(--gold-glow)))" opacity={0.5} />
      <ellipse cx={x + 20} cy={34} rx={3} ry={5} fill="white" opacity={0.3} />
      <path d={`M${x + 17} 50 L${x + 20} 58 L${x + 23} 50`} fill="hsl(var(--season-glow, var(--gold-glow)))" opacity={0.7} />
    </motion.g>
  );
}

function OnboardingFamilySVG() {
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="40" cy="35" r="14" fill="hsl(var(--gold))" opacity="0.9" />
      <rect x="30" y="52" width="20" height="28" rx="8" fill="hsl(var(--gold))" opacity="0.7" />
      <circle cx="72" cy="42" r="11" fill="hsl(var(--secondary))" opacity="0.9" />
      <rect x="64" y="56" width="16" height="22" rx="6" fill="hsl(var(--secondary))" opacity="0.7" />
      <circle cx="95" cy="45" r="9" fill="hsl(var(--accent))" opacity="0.9" />
      <rect x="88" y="57" width="14" height="18" rx="5" fill="hsl(var(--accent))" opacity="0.7" />
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
        <path d="M15 20 L17 25 L22 25 L18 28 L20 33 L15 30 L10 33 L12 28 L8 25 L13 25Z" fill="hsl(var(--star-yellow))" />
      </motion.g>
      <motion.g animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}>
        <path d="M100 15 L101.5 19 L106 19 L102.5 21.5 L104 25.5 L100 23 L96 25.5 L97.5 21.5 L94 19 L98.5 19Z" fill="hsl(var(--star-yellow))" />
      </motion.g>
    </svg>
  );
}

function OnboardingMosqueSVG() {
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
      <path d="M30 65 Q60 20, 90 65" fill="hsl(var(--secondary))" opacity="0.8" />
      <rect x="30" y="65" width="60" height="30" rx="2" fill="hsl(var(--secondary))" opacity="0.6" />
      <path d="M50 95 L50 78 Q60 70, 70 78 L70 95" fill="hsl(var(--gold))" opacity="0.5" />
      <rect x="18" y="40" width="10" height="55" rx="3" fill="hsl(var(--secondary))" opacity="0.7" />
      <path d="M18 40 L23 30 L28 40" fill="hsl(var(--gold))" opacity="0.8" />
      <rect x="92" y="40" width="10" height="55" rx="3" fill="hsl(var(--secondary))" opacity="0.7" />
      <path d="M92 40 L97 30 L102 40" fill="hsl(var(--gold))" opacity="0.8" />
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
        <circle cx="60" cy="28" r="6" fill="hsl(var(--gold))" />
        <circle cx="63" cy="26" r="5" fill="hsl(var(--secondary))" opacity="0.8" />
      </motion.g>
    </svg>
  );
}

function OnboardingStarsSVG() {
  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
      <motion.g animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} style={{ transformOrigin: '60px 50px' }}>
        <path d="M60 20 L68 42 L92 42 L73 56 L80 78 L60 64 L40 78 L47 56 L28 42 L52 42Z" fill="hsl(var(--gold))" />
        <path d="M60 28 L65 42 L80 42 L68 51 L73 65 L60 56 L47 65 L52 51 L40 42 L55 42Z" fill="hsl(var(--star-yellow))" opacity="0.6" />
      </motion.g>
      <motion.path d="M20 30 L22 35 L27 35 L23 38 L25 43 L20 40 L15 43 L17 38 L13 35 L18 35Z" fill="hsl(var(--accent))" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} style={{ transformOrigin: '20px 36px' }} />
      <motion.path d="M95 25 L97 29 L101 29 L98 31.5 L99 35.5 L95 33 L91 35.5 L92 31.5 L89 29 L93 29Z" fill="hsl(var(--secondary))" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} style={{ transformOrigin: '95px 30px' }} />
    </svg>
  );
}

const onboardingSlides = [
  { SVG: OnboardingFamilySVG, title: 'أضف أطفالك', description: 'سجّل أطفالك مع صور أفاتار مميزة لكل واحد' },
  { SVG: OnboardingMosqueSVG, title: 'سجّل الصلوات يومياً', description: 'تابع أداء كل صلاة مع تأثيرات ممتعة ومحفزة' },
  { SVG: OnboardingStarsSVG, title: 'اجمع النجوم والمكافآت', description: 'احصل على نجوم وشارات وترقيات مستوى مع كل صلاة' },
];

export default function Index() {
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const greeting = useMemo(() => getGreeting(), []);
  const seasonal = useMemo(() => getSeasonalMessage(), []);
  const children = getChildren();
  const needsOnboarding = !isOnboardingDone() && children.length === 0;
  const [showOnboarding, setShowOnboarding] = useState(needsOnboarding);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Last selected child for quick access
  const lastChildId = typeof localStorage !== 'undefined' ? storageGet('last-child-id') : null;
  const lastChild = lastChildId ? children.find(c => c.id === lastChildId) : null;

  // Quick stats
  const totalTodayPrayers = children.reduce((sum, c) => sum + getChildProgress(c.id).today, 0);
  const totalStars = children.reduce((sum, c) => sum + c.totalStars, 0);
  const bestStreak = children.reduce((best, c) => {
    const s = getStreak(c.id);
    return s.current > best ? s.current : best;
  }, 0);

  const handleFinishOnboarding = () => {
    setOnboardingDone();
    setShowOnboarding(false);
    navigate('/parent');
  };

  if (showOnboarding) {
    const SlideIcon = onboardingSlides[currentSlide].SVG;
    return (
      <div className="min-h-screen gradient-night flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <StarParticles />
        <div className="relative z-10 w-full max-w-sm">
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, i) => (
              <motion.div key={i} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} layout />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="text-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-6">
                <SlideIcon />
              </motion.div>
              <h2 className="text-3xl font-extrabold text-gold mb-3">{onboardingSlides[currentSlide].title}</h2>
              <p className="text-foreground/80 text-lg leading-relaxed mb-10">{onboardingSlides[currentSlide].description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-3">
            {currentSlide < onboardingSlides.length - 1 ? (
              <>
                <button onClick={handleFinishOnboarding} className="flex-1 py-4 rounded-2xl text-muted-foreground font-bold text-lg bg-muted">تخطي</button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCurrentSlide(currentSlide + 1)} className="flex-[2] py-4 rounded-2xl gradient-gold text-primary-foreground font-bold text-lg glow-gold">التالي ←</motion.button>
              </>
            ) : (
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleFinishOnboarding} className="w-full py-5 rounded-2xl gradient-gold text-primary-foreground font-extrabold text-xl glow-gold">🚀 ابدأ الآن!</motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: `url(${ramadanBg})` }} />
      <div className="absolute inset-0 gradient-night opacity-90" />
      <SeasonalBackground density="medium" />
      <StarParticles />

      {/* Top controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        <SoundToggle />
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setThemePickerOpen(true)}
          aria-label="اختر الثيم الموسمي"
          className="w-11 h-11 rounded-xl glass-card-strong flex items-center justify-center text-season glow-season"
        >
          <Sparkles size={18} />
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 w-full max-w-sm sm:max-w-md"
      >
        {/* SVG Lanterns */}
        <div className="flex justify-center mb-2">
          <svg width="200" height="65" viewBox="0 0 200 65">
            <SVGLantern delay={0} x={10} />
            <SVGLantern delay={0.3} x={80} />
            <SVGLantern delay={0.6} x={150} />
          </svg>
        </div>

        {/* Crescent Moon SVG */}
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className="mb-2">
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--season-glow, var(--gold-glow)))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--season-primary, var(--gold)))" stopOpacity={1} />
              </linearGradient>
              <filter id="moonGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="40" cy="40" r="30" fill="url(#moonGrad)" filter="url(#moonGlow)" />
            <circle cx="50" cy="35" r="25" fill="hsl(var(--season-bg-from, 230 45% 10%))" />
          </svg>
        </motion.div>

        {/* Dynamic Greeting */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-foreground/70 text-base mb-1 font-medium">
          {greeting.text} {greeting.emoji}
        </motion.p>

        <h1 className="text-4xl font-extrabold text-gold mb-1 drop-shadow-lg">متابع الصلاة</h1>
        
        {/* Dynamic Seasonal Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-foreground/80 text-lg mb-6 font-medium"
        >
          {seasonal.emoji} {seasonal.message} {seasonal.emoji}
        </motion.p>

        {/* Quick Stats - only when children exist */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-strong rounded-2xl p-4 mb-6"
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={14} className="text-secondary" />
                </div>
                <p className="text-2xl font-extrabold text-secondary">{totalTodayPrayers}</p>
                <p className="text-muted-foreground text-xs">صلاة اليوم</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={14} className="text-star" />
                </div>
                <p className="text-2xl font-extrabold text-gold">{totalStars}</p>
                <p className="text-muted-foreground text-xs">نجمة</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame size={14} className="text-destructive" />
                </div>
                <p className="text-2xl font-extrabold text-destructive">{bestStreak}</p>
                <p className="text-muted-foreground text-xs">أفضل streak</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Access — last selected child */}
        {lastChild && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/tracker/${lastChild.id}`)}
            className="relative w-full glass-card-strong rounded-2xl p-3 mb-3 overflow-hidden flex items-center gap-3 text-right border border-primary/30 glow-season"
            aria-label={`متابعة ${lastChild.name}`}
          >
            <img src={AVATAR_IMAGES[lastChild.avatarIndex]} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-season" />
                <span className="text-xs text-muted-foreground">متابعة سريعة</span>
              </div>
              <p className="text-foreground font-bold truncate">{lastChild.name}</p>
            </div>
            <ChevronLeft size={18} className="text-muted-foreground" />
          </motion.button>
        )}

        {/* Navigation Cards */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/kids')}
            className="relative w-full glass-card-strong rounded-2xl p-5 overflow-hidden flex items-center gap-4 text-right"
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} style={{ skewX: '-12deg' }} />
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center glow-gold shrink-0">
              <Users size={26} className="text-primary-foreground" />
            </div>
            <div className="flex-1 relative z-10">
              <p className="text-foreground font-extrabold text-lg">وضع الأطفال</p>
              <p className="text-muted-foreground text-sm">
                {children.length > 0 ? `${children.length} طفل مسجل` : 'ابدأ بتسجيل الصلوات'}
              </p>
            </div>
            <ChevronLeft size={20} className="text-muted-foreground rtl:rotate-0 relative z-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPinOpen(true)}
            className="w-full glass-card-strong rounded-2xl p-5 flex items-center gap-4 text-right"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
              <Lock size={22} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-bold text-lg">وضع الوالدين</p>
              <p className="text-muted-foreground text-sm">إدارة الإعدادات والمكافآت</p>
            </div>
            <ChevronLeft size={20} className="text-muted-foreground rtl:rotate-0" />
          </motion.button>
        </div>

        {/* Dynamic seasonal footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/60 text-sm font-medium">{seasonal.emoji} {seasonal.message} {seasonal.emoji}</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>
      </motion.div>

      <PinDialog open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={() => { setPinOpen(false); navigate('/parent'); }} />
      <SeasonalThemePicker open={themePickerOpen} onClose={() => setThemePickerOpen(false)} />
    </div>
  );
}
