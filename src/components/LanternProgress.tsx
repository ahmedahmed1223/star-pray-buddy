import { motion } from 'framer-motion';

interface Props {
  count: number;
  total?: number;
}

const lanternColors = [
  'hsl(var(--fajr-from))',
  'hsl(var(--dhuhr-from))',
  'hsl(var(--asr-from))',
  'hsl(var(--maghrib-from))',
  'hsl(var(--isha-from))',
];

export default function LanternProgress({ count, total = 5 }: Props) {
  return (
    <div className="flex items-end justify-center gap-3 py-3">
      {Array.from({ length: total }, (_, i) => {
        const lit = i < count;
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Thread */}
            <div className={`w-0.5 h-3 ${lit ? 'bg-gold' : 'bg-muted'}`} />
            {/* Lantern body */}
            <motion.div
              className={`relative w-10 h-12 rounded-b-xl rounded-t-lg flex items-center justify-center text-lg transition-all ${
                lit ? 'animate-lantern-swing' : ''
              }`}
              style={{
                backgroundColor: lit ? lanternColors[i] : 'hsl(var(--muted))',
                boxShadow: lit
                  ? `0 0 15px ${lanternColors[i]}80, 0 4px 20px ${lanternColors[i]}40`
                  : 'none',
              }}
              animate={lit ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {lit ? '🏮' : '🔲'}
              {/* Shine effect */}
              {lit && (
                <motion.div
                  className="absolute inset-0 rounded-b-xl rounded-t-lg bg-gradient-to-t from-transparent to-white/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
