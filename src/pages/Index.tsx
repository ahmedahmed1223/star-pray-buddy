import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PinDialog from '@/components/PinDialog';
import StarParticles from '@/components/StarParticles';
import ramadanBg from '@/assets/ramadan-bg.jpg';
import { isOnboardingDone, setOnboardingDone, getChildren } from '@/lib/store';
import { Users, Lock, ChevronLeft } from 'lucide-react';

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

// SVG Illustrations for onboarding slides
function OnboardingFamilySVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      {/* Parent figure */}
      <circle cx="40" cy="35" r="14" fill="hsl(var(--gold))" opacity="0.9" />
      <rect x="30" y="52" width="20" height="28" rx="8" fill="hsl(var(--gold))" opacity="0.7" />
      {/* Child 1 */}
      <circle cx="72" cy="42" r="11" fill="hsl(var(--secondary))" opacity="0.9" />
      <rect x="64" y="56" width="16" height="22" rx="6" fill="hsl(var(--secondary))" opacity="0.7" />
      {/* Child 2 */}
      <circle cx="95" cy="45" r="9" fill="hsl(var(--accent))" opacity="0.9" />
      <rect x="88" y="57" width="14" height="18" rx="5" fill="hsl(var(--accent))" opacity="0.7" />
      {/* Stars around */}
      <motion.g animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
        <path d="M15 20 L17 25 L22 25 L18 28 L20 33 L15 30 L10 33 L12 28 L8 25 L13 25Z" fill="hsl(var(--star))" />
      </motion.g>
      <motion.g animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}>
        <path d="M100 15 L101.5 19 L106 19 L102.5 21.5 L104 25.5 L100 23 L96 25.5 L97.5 21.5 L94 19 L98.5 19Z" fill="hsl(var(--star))" />
      </motion.g>
      {/* Ground line */}
      <path d="M20 85 Q60 80, 100 85" stroke="hsl(var(--gold))" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function OnboardingMosqueSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      {/* Dome */}
      <path d="M30 65 Q60 20, 90 65" fill="hsl(var(--secondary))" opacity="0.8" />
      {/* Building */}
      <rect x="30" y="65" width="60" height="30" rx="2" fill="hsl(var(--secondary))" opacity="0.6" />
      {/* Door */}
      <path d="M50 95 L50 78 Q60 70, 70 78 L70 95" fill="hsl(var(--gold))" opacity="0.5" />
      {/* Minaret left */}
      <rect x="18" y="40" width="10" height="55" rx="3" fill="hsl(var(--secondary))" opacity="0.7" />
      <path d="M18 40 L23 30 L28 40" fill="hsl(var(--gold))" opacity="0.8" />
      {/* Minaret right */}
      <rect x="92" y="40" width="10" height="55" rx="3" fill="hsl(var(--secondary))" opacity="0.7" />
      <path d="M92 40 L97 30 L102 40" fill="hsl(var(--gold))" opacity="0.8" />
      {/* Crescent on dome */}
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
        <circle cx="60" cy="28" r="6" fill="hsl(var(--gold))" />
        <circle cx="63" cy="26" r="5" fill="hsl(var(--secondary))" opacity="0.8" />
      </motion.g>
      {/* Stars */}
      <motion.circle cx="15" cy="25" r="2" fill="hsl(var(--star))" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <motion.circle cx="105" cy="20" r="1.5" fill="hsl(var(--star))" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} />
    </svg>
  );
}

function OnboardingStarsSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      {/* Central big star */}
      <motion.g animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} style={{ transformOrigin: '60px 50px' }}>
        <path d="M60 20 L68 42 L92 42 L73 56 L80 78 L60 64 L40 78 L47 56 L28 42 L52 42Z" fill="hsl(var(--gold))" />
        <path d="M60 28 L65 42 L80 42 L68 51 L73 65 L60 56 L47 65 L52 51 L40 42 L55 42Z" fill="hsl(var(--star))" opacity="0.6" />
      </motion.g>
      {/* Small stars */}
      <motion.path d="M20 30 L22 35 L27 35 L23 38 L25 43 L20 40 L15 43 L17 38 L13 35 L18 35Z" fill="hsl(var(--accent))" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} style={{ transformOrigin: '20px 36px' }} />
      <motion.path d="M95 25 L97 29 L101 29 L98 31.5 L99 35.5 L95 33 L91 35.5 L92 31.5 L89 29 L93 29Z" fill="hsl(var(--secondary))" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} style={{ transformOrigin: '95px 30px' }} />
      {/* Trophy */}
      <path d="M48 82 L52 82 L52 78 Q60 72, 68 78 L68 82 L72 82 L72 88 L48 88Z" fill="hsl(var(--gold))" opacity="0.7" />
      <rect x="55" y="88" width="10" height="4" rx="1" fill="hsl(var(--gold))" opacity="0.5" />
      {/* Sparkles */}
      <motion.circle cx="35" cy="70" r="2" fill="hsl(var(--star))" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
      <motion.circle cx="85" cy="65" r="2.5" fill="hsl(var(--lantern-orange))" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.8 }} />
    </svg>
  );
}

const onboardingSlides = [
  {
    SVG: OnboardingFamilySVG,
    title: 'أضف أطفالك',
    description: 'سجّل أطفالك مع صور أفاتار مميزة لكل واحد',
  },
  {
    SVG: OnboardingMosqueSVG,
    title: 'سجّل الصلوات يومياً',
    description: 'تابع أداء كل صلاة مع تأثيرات ممتعة ومحفزة',
  },
  {
    SVG: OnboardingStarsSVG,
    title: 'اجمع النجوم والمكافآت',
    description: 'احصل على نجوم وشارات وترقيات مستوى مع كل صلاة',
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
    const SlideIcon = onboardingSlides[currentSlide].SVG;
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
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="mb-6"
              >
                <SlideIcon />
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
          {/* Kids mode - primary CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/kids')}
            className="relative w-full gradient-gold text-primary-foreground font-bold text-xl py-5 rounded-2xl glow-gold shadow-lg overflow-hidden flex items-center justify-center gap-3"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{ skewX: '-12deg' }}
            />
            <Users size={24} className="relative z-10" />
            <span className="relative z-10">وضع الأطفال</span>
          </motion.button>

          {/* Parent mode - secondary, distinct style */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPinOpen(true)}
            className="w-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground font-bold text-base py-4 rounded-2xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={18} />
            <span>وضع الوالدين</span>
            <ChevronLeft size={16} className="opacity-50" />
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
