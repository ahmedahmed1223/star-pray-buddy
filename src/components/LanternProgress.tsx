import { motion } from 'framer-motion';

interface Props {
  count: number;
  total?: number;
}

const lanternColors = [
  { body: 'hsl(var(--fajr-from))', glow: 'hsl(var(--fajr-glow))' },
  { body: 'hsl(var(--dhuhr-from))', glow: 'hsl(var(--dhuhr-glow))' },
  { body: 'hsl(var(--asr-from))', glow: 'hsl(var(--asr-glow))' },
  { body: 'hsl(var(--maghrib-from))', glow: 'hsl(var(--maghrib-glow))' },
  { body: 'hsl(var(--isha-from))', glow: 'hsl(var(--isha-glow))' },
];

function LanternSVG({ lit, color, glow }: { lit: boolean; color: string; glow: string }) {
  return (
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
      {/* Thread */}
      <line x1="22" y1="0" x2="22" y2="12" stroke={lit ? 'hsl(var(--gold))' : 'hsl(var(--muted))'} strokeWidth="1.5" />
      {/* Cap */}
      <rect x="16" y="10" width="12" height="4" rx="1" fill={lit ? 'hsl(var(--gold))' : 'hsl(var(--muted))'} />
      {/* Body */}
      <path
        d="M14 14 C14 14, 10 20, 10 30 C10 40, 14 46, 22 48 C30 46, 34 40, 34 30 C34 20, 30 14, 30 14 Z"
        fill={lit ? color : 'hsl(var(--muted))'}
        opacity={lit ? 1 : 0.4}
      />
      {/* Inner glow */}
      {lit && (
        <ellipse cx="22" cy="30" rx="8" ry="12" fill={glow} opacity="0.4" />
      )}
      {/* Light rays */}
      {lit && (
        <ellipse cx="22" cy="30" rx="4" ry="6" fill="white" opacity="0.25" />
      )}
      {/* Bottom tip */}
      <path
        d="M18 46 L22 54 L26 46"
        fill={lit ? 'hsl(var(--gold))' : 'hsl(var(--muted))'}
        opacity={lit ? 0.8 : 0.3}
      />
    </svg>
  );
}

export default function LanternProgress({ count, total = 5 }: Props) {
  return (
    <div className="flex items-start justify-center gap-2 py-3 relative">
      {/* Connection line */}
      <div className="absolute top-[11px] left-[15%] right-[15%] h-[1.5px] bg-border" />
      
      {Array.from({ length: total }, (_, i) => {
        const lit = i < count;
        const { body, glow } = lanternColors[i];
        return (
          <motion.div
            key={i}
            className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: 'spring' }}
          >
            <motion.div
              animate={lit ? { 
                rotate: [-2, 2, -2],
                filter: [`drop-shadow(0 0 8px ${glow})`, `drop-shadow(0 0 16px ${glow})`, `drop-shadow(0 0 8px ${glow})`]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              style={{ transformOrigin: 'top center' }}
            >
              <LanternSVG lit={lit} color={body} glow={glow} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
