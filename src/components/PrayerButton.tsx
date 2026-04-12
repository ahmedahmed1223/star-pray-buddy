import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import type { PrayerName } from '@/lib/store';

interface Props {
  label: string;
  emoji: string;
  done: boolean;
  colorClass: string;
  prayerKey?: PrayerName;
  onToggle: () => void;
  jamaahEnabled?: boolean;
  jamaahChecked?: boolean;
  onJamaahToggle?: () => void;
}

const prayerGradients: Record<string, string> = {
  fajr: 'gradient-fajr',
  dhuhr: 'gradient-dhuhr',
  asr: 'gradient-asr',
  maghrib: 'gradient-maghrib',
  isha: 'gradient-isha',
};

const prayerIcons: Record<string, string> = {
  fajr: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌇',
  isha: '🌙',
};

export default function PrayerButton({ label, emoji, done, colorClass, prayerKey, onToggle, jamaahEnabled, jamaahChecked, onJamaahToggle }: Props) {
  const gradientClass = prayerKey ? prayerGradients[prayerKey] : '';
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
    onToggle();
  }, [onToggle]);

  return (
    <div className="flex flex-col gap-1">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.93, rotateX: 3 }}
        style={{ perspective: 800, transformStyle: 'preserve-3d' }}
        aria-label={`${label} - ${done ? 'تم' : 'لم تُصلَّ'}`}
        aria-pressed={done}
        className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all overflow-hidden min-h-[64px] ${
          done
            ? 'border-primary shadow-lg shadow-primary/20 glass-prayer'
            : 'border-border bg-muted/60 backdrop-blur-sm hover:bg-muted/80'
        }`}
      >
        {/* Background gradient when done */}
        {done && (
          <motion.div 
            className={`absolute inset-0 ${gradientClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 0.4 }}
          />
        )}
        
        {/* Ripple effect */}
        {ripple && (
          <motion.div
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{ left: ripple.x - 30, top: ripple.y - 30, width: 60, height: 60 }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        {/* Shine effect when done */}
        {done && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
          />
        )}

        {/* Prayer icon */}
        <motion.div
          animate={done ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-4xl relative z-10 transition-all duration-300 ${done ? 'drop-shadow-lg' : 'grayscale-[30%] opacity-70'}`}
        >
          {prayerKey ? prayerIcons[prayerKey] : emoji}
        </motion.div>

        <span className={`text-xl font-bold relative z-10 transition-colors duration-300 ${done ? 'text-gold' : 'text-foreground'}`}>
          {label}
        </span>

        {/* Bottom colored bar */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${gradientClass}`}
          initial={{ width: '0%' }}
          animate={{ width: done ? '100%' : '0%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="me-0 ms-auto relative z-10">
          {done ? (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-3xl drop-shadow-lg block"
            >
              ⭐
            </motion.span>
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-border bg-muted/50" />
          )}
        </div>
      </motion.button>

      {/* Jamaah checkbox */}
      {jamaahEnabled && done && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 px-4 py-1.5"
        >
          <Checkbox
            checked={jamaahChecked}
            onCheckedChange={() => onJamaahToggle?.()}
            className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
          />
          <span className={`text-sm font-medium ${jamaahChecked ? 'text-secondary' : 'text-muted-foreground'}`}>
            🕌 جماعة {jamaahChecked && '✓'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
