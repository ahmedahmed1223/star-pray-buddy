import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PinDialog from '@/components/PinDialog';
import StarParticles from '@/components/StarParticles';
import ramadanBg from '@/assets/ramadan-bg.jpg';
import { isOnboardingDone, setOnboardingDone, getChildren } from '@/lib/store';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'طابت ليلتك 🌙';
  if (hour < 12) return 'صباح الخير ☀️';
  if (hour < 17) return 'مساء النور 🌤️';
  return 'مساء الخير 🌙';
}

function SVGLantern({ delay = 0, x = 0 }: { delay?: number; x?: number }) {
  return (
    <motion.g
      animate={{ rotate: [-3, 3, -3], y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 3 + delay * 0.5, ease: 'easeInOut', delay }}
      style={{ transformOrigin: `${x + 20}px 0px` }}
    >
      <line x1={x + 20} y1={0} x2={x + 20} y2={14} stroke="hsl(42, 100%, 55%)" strokeWidth="1.5" />
      <rect x={x + 14} y={12} width={12} height={4} rx={1.5} fill="hsl(42, 100%, 55%)" />
      <path
        d={`M${x + 12} 16 C${x + 12} 16, ${x + 8} 24, ${x + 8} 34 C${x + 8} 44, ${x + 12} 50, ${x + 20} 52 C${x + 28} 50, ${x + 32} 44, ${x + 32} 34 C${x + 32} 24, ${x + 28} 16, ${x + 28} 16 Z`}
        fill="hsl(25, 95%, 55%)"
      />
      <ellipse cx={x + 20} cy={34} rx={6} ry={10} fill="hsl(42, 100%, 65%)" opacity={0.5} />
      <ellipse cx={x + 20} cy={34} rx={3} ry={5} fill="white" opacity={0.3} />
      <path d={`M${x + 17} 50 L${x + 20} 58 L${x + 23} 50`} fill="hsl(42, 100%, 55%)" opacity={0.7} />
    </motion.g>
  );
}

const onboardingSlides = [
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'أضف أطفالك',
    description: 'سجّل أطفالك مع صور أفاتار مميزة لكل واحد',
    bg: 'from-primary/20 to-secondary/20',
  },
  {
    icon: '🕌',
    title: 'سجّل الصلوات يومياً',
    description: 'تابع أداء كل صلاة مع تأثيرات ممتعة ومحفزة',
    bg: 'from-secondary/20 to-accent/20',
  },
  {
    icon: '⭐',
    title: 'اجمع النجوم والمكافآت',
    description: 'احصل على نجوم وشارات وترقيات مستوى مع كل صلاة',
    bg: 'from-accent/20 to-primary/20',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const greeting = useMemo(getGreeting, []);
  const children = getChildren();
  const needsOnboarding = !isOnboardingDone() && children.length === 0;
  const [showOnboarding, setShowOnboarding] = useState(needsOnboarding);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFinishOnboarding = () => {
    setOnboardingDone();
    setShowOnboarding(false);
    navigate('/parent');
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen gradient-night flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <StarParticles />
        <div className="relative z-10 w-full max-w-sm">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSlides.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
                layout
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-7xl mb-6"
              >
                {onboardingSlides[currentSlide].icon}
              </motion.div>
              <h2 className="text-3xl font-extrabold text-gold mb-3">
                {onboardingSlides[currentSlide].title}
              </h2>
              <p className="text-foreground/80 text-lg leading-relaxed mb-10">
                {onboardingSlides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            {currentSlide < onboardingSlides.length - 1 ? (
              <>
                <button
                  onClick={handleFinishOnboarding}
                  className="flex-1 py-4 rounded-2xl text-muted-foreground font-bold text-lg bg-muted"
                >
                  تخطي
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  className="flex-[2] py-4 rounded-2xl gradient-gold text-primary-foreground font-bold text-lg glow-gold"
                >
                  التالي ←
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFinishOnboarding}
                className="w-full py-5 rounded-2xl gradient-gold text-primary-foreground font-extrabold text-xl glow-gold"
              >
                🚀 ابدأ الآن!
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${ramadanBg})` }}
      />
      <div className="absolute inset-0 gradient-night opacity-75" />
      <StarParticles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 w-full max-w-sm"
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
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-2"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(42, 100%, 65%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(42, 100%, 50%)', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="moonGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="40" cy="40" r="30" fill="url(#moonGrad)" filter="url(#moonGlow)" />
            <circle cx="50" cy="35" r="25" fill="hsl(230, 45%, 10%)" />
          </svg>
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-foreground/70 text-base mb-1 font-medium"
        >
          {greeting}
        </motion.p>

        <h1 className="text-4xl font-extrabold text-gold mb-1 drop-shadow-lg">
          متابع الصلاة
        </h1>
        <p className="text-foreground/80 text-lg mb-8 font-medium">
          إصدار رمضان ✨
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/kids')}
            className="relative w-full gradient-gold text-primary-foreground font-bold text-xl py-5 rounded-2xl glow-gold shadow-lg overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{ skewX: '-12deg' }}
            />
            <span className="relative z-10">👧 وضع الأطفال</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPinOpen(true)}
            className="w-full bg-card border-2 border-border text-foreground font-bold text-xl py-5 rounded-2xl hover:bg-muted transition-colors"
          >
            🔒 وضع الوالدين
          </motion.button>
        </div>

        {/* Islamic decorative bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-50">
            <path d="M20 0 C25 0, 30 5, 30 10 C30 15, 25 20, 20 20 C15 20, 10 15, 10 10 C10 5, 15 0, 20 0Z" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.8" />
            <path d="M20 3 L22 8 L27 8 L23 12 L25 17 L20 14 L15 17 L17 12 L13 8 L18 8Z" fill="hsl(var(--gold))" opacity="0.5" />
          </svg>
          <span className="text-gold/60 text-sm font-medium">🌙 رمضان كريم 🌙</span>
          <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-50">
            <path d="M20 0 C25 0, 30 5, 30 10 C30 15, 25 20, 20 20 C15 20, 10 15, 10 10 C10 5, 15 0, 20 0Z" fill="none" stroke="hsl(var(--gold))" strokeWidth="0.8" />
            <path d="M20 3 L22 8 L27 8 L23 12 L25 17 L20 14 L15 17 L17 12 L13 8 L18 8Z" fill="hsl(var(--gold))" opacity="0.5" />
          </svg>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>
      </motion.div>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => { setPinOpen(false); navigate('/parent'); }}
      />
    </div>
  );
}
