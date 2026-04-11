import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface Props {
  prayersDone: number;
  totalStars: number;
  streak: number;
}

const TIPS = [
  'لا تنسَ صلاة الفجر! 🌅',
  'الصلاة نور يا بطل! 💡',
  'هل قرأت القرآن اليوم؟ 📖',
  'استمر، أنت رائع! 🌟',
  'بارك الله فيك! 🤲',
  'الصلاة عمود الدين 🕌',
  'أنت قدوة حسنة! 👏',
  'ماشاء الله عليك! ✨',
];

export default function Mascot({ prayersDone, totalStars, streak }: Props) {
  const [tipIndex, setTipIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 8000);
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 4000);
    return () => { clearInterval(interval); clearTimeout(t); };
  }, []);

  const mood = useMemo(() => {
    if (prayersDone >= 5) return 'celebrating';
    if (prayersDone >= 3) return 'happy';
    if (prayersDone >= 1) return 'encouraging';
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 4) return 'sleeping';
    return 'waiting';
  }, [prayersDone]);

  const eyeVariant = mood === 'sleeping' ? 'M8 2 Q10 0 12 2' : 'M8 0 Q10 4 12 0';
  const mouthVariant = mood === 'celebrating' || mood === 'happy'
    ? 'M7 0 Q10 5 13 0' 
    : mood === 'encouraging' ? 'M8 0 Q10 2 12 0' : 'M8 1 Q10 0 12 1';

  return (
    <motion.div className="flex items-end gap-2 mb-3">
      {/* Mascot lantern */}
      <motion.div
        className="relative cursor-pointer"
        animate={
          mood === 'celebrating'
            ? { y: [0, -8, 0], rotate: [0, -5, 5, 0] }
            : mood === 'sleeping'
            ? { y: [0, 2, 0] }
            : { y: [0, -4, 0] }
        }
        transition={{ repeat: Infinity, duration: mood === 'sleeping' ? 3 : 2 }}
        onClick={() => { setTipIndex(prev => (prev + 1) % TIPS.length); setShowBubble(true); }}
        whileTap={{ scale: 1.1 }}
      >
        <svg width="48" height="64" viewBox="0 0 48 64" className="drop-shadow-lg">
          {/* Lantern top */}
          <line x1="24" y1="0" x2="24" y2="10" stroke="hsl(var(--gold))" strokeWidth="2" />
          <rect x="18" y="8" width="12" height="4" rx="2" fill="hsl(var(--gold))" />
          {/* Body */}
          <path d="M14 12 C14 12, 8 20, 8 32 C8 42, 14 48, 24 50 C34 48, 40 42, 40 32 C40 20, 34 12, 34 12 Z"
            fill="hsl(var(--lantern-orange))" />
          {/* Glow */}
          <ellipse cx="24" cy="32" rx="10" ry="14" fill="hsl(var(--gold))" opacity="0.35" />
          {/* Face */}
          <g transform="translate(14, 24)">
            {/* Eyes */}
            <path d={eyeVariant} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d={eyeVariant} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" transform="translate(8, 0)" />
            {/* Mouth */}
            <g transform="translate(0, 8)">
              <path d={mouthVariant} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          </g>
          {/* Bottom */}
          <path d="M18 48 L24 58 L30 48" fill="hsl(var(--gold))" opacity="0.6" />
          {/* Glow effect */}
          {mood === 'celebrating' && (
            <circle cx="24" cy="32" r="20" fill="hsl(var(--gold))" opacity="0.15">
              <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.1;0.25;0.1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
        {/* Stars around mascot when celebrating */}
        {mood === 'celebrating' && (
          <>
            <motion.span className="absolute -top-1 -right-1 text-xs" animate={{ scale: [0, 1, 0], rotate: [0, 180] }} transition={{ repeat: Infinity, duration: 1.5 }}>⭐</motion.span>
            <motion.span className="absolute -top-1 -left-1 text-xs" animate={{ scale: [0, 1, 0], rotate: [0, -180] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>✨</motion.span>
          </>
        )}
        {mood === 'sleeping' && (
          <motion.span className="absolute -top-2 right-0 text-sm" animate={{ y: [0, -8], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2 }}>💤</motion.span>
        )}
      </motion.div>

      {/* Speech bubble */}
      {showBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: -5 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          className="relative bg-card border border-border rounded-2xl rounded-br-sm px-3 py-2 max-w-[200px] shadow-md"
        >
          <p className="text-foreground text-xs font-medium leading-relaxed">{TIPS[tipIndex]}</p>
          {/* Arrow */}
          <div className="absolute bottom-2 -left-1.5 w-3 h-3 bg-card border-l border-b border-border rotate-45" />
        </motion.div>
      )}
    </motion.div>
  );
}
