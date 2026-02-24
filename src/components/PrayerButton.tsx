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

export default function PrayerButton({ label, emoji, done, colorClass, prayerKey, onToggle, jamaahEnabled, jamaahChecked, onJamaahToggle }: Props) {
  const gradientClass = prayerKey ? prayerGradients[prayerKey] : '';

  return (
    <div className="flex flex-col gap-1">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.93 }}
        className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all overflow-hidden ${
          done
            ? 'border-primary shadow-lg shadow-primary/20'
            : 'border-border bg-muted hover:bg-muted/80'
        }`}
        style={done ? {} : {}}
      >
        {/* Background gradient when done */}
        {done && (
          <div className={`absolute inset-0 ${gradientClass} opacity-25`} />
        )}
        
        {/* Candy crush shine effect when done */}
        {done && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
          />
        )}

        <motion.div
          animate={done ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-4xl relative z-10 ${done ? 'drop-shadow-lg' : ''}`}
        >
          {done ? '🏮' : emoji}
        </motion.div>
        <span className={`text-xl font-bold relative z-10 ${done ? 'text-gold' : 'text-foreground'}`}>
          {label}
        </span>
        <div className="me-0 ms-auto relative z-10">
          {done ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              className="text-3xl drop-shadow-lg"
            >
              ⭐
            </motion.span>
          ) : (
            <div className={`w-9 h-9 rounded-full border-2 border-border bg-muted/50 ${prayerKey ? '' : ''}`} />
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
