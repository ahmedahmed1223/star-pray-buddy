import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  label: string;
  emoji: string;
  done: boolean;
  colorClass: string;
  onToggle: () => void;
  jamaahEnabled?: boolean;
  jamaahChecked?: boolean;
  onJamaahToggle?: () => void;
}

export default function PrayerButton({ label, emoji, done, colorClass, onToggle, jamaahEnabled, jamaahChecked, onJamaahToggle }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.93 }}
        className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all overflow-hidden ${
          done
            ? 'border-primary bg-gradient-to-l shadow-lg shadow-primary/20'
            : 'border-border bg-muted hover:bg-muted/80'
        }`}
        style={done ? { backgroundImage: `linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.2))` } : {}}
      >
        {/* Candy crush style shine effect when done */}
        {done && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
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
            <div className="w-8 h-8 rounded-full border-2 border-border bg-muted/50" />
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
