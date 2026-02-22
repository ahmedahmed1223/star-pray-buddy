import { motion } from 'framer-motion';

interface Props {
  label: string;
  emoji: string;
  done: boolean;
  onToggle: () => void;
}

export default function PrayerButton({ label, emoji, done, onToggle }: Props) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.93 }}
      className={`relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${
        done
          ? 'border-primary bg-primary/15 glow-lantern'
          : 'border-border bg-muted hover:bg-muted/80'
      }`}
    >
      <motion.span
        animate={done ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl"
      >
        {done ? '🏮' : emoji}
      </motion.span>
      <span className={`text-xl font-bold ${done ? 'text-gold' : 'text-foreground'}`}>
        {label}
      </span>
      <div className="me-0 ms-auto">
        {done ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            className="text-3xl"
          >
            ⭐
          </motion.span>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-border" />
        )}
      </div>
    </motion.button>
  );
}
