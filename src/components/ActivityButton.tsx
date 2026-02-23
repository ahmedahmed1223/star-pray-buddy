import { motion } from 'framer-motion';

interface Props {
  name: string;
  emoji: string;
  stars: number;
  done: boolean;
  onToggle: () => void;
}

export default function ActivityButton({ name, emoji, stars, done, onToggle }: Props) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.93 }}
      className={`relative w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all overflow-hidden ${
        done
          ? 'border-secondary bg-secondary/10 shadow-md'
          : 'border-border bg-muted hover:bg-muted/80'
      }`}
    >
      {done && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
        />
      )}
      <motion.span
        animate={done ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="text-3xl relative z-10"
      >
        {emoji}
      </motion.span>
      <div className="flex-1 text-right relative z-10">
        <span className={`text-lg font-bold ${done ? 'text-secondary' : 'text-foreground'}`}>
          {name}
        </span>
        <p className="text-xs text-muted-foreground">+{stars} ⭐</p>
      </div>
      <div className="relative z-10">
        {done ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">✅</motion.span>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-border" />
        )}
      </div>
    </motion.button>
  );
}
