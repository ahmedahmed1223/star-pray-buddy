import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  count: number;
  total?: number;
}

type ShapeKind = 'lantern' | 'crescent' | 'star' | 'kaaba' | 'petal' | 'leaf' | 'snow';

// Each prayer slot uses its own gradient pair (from → to) + glow.
const prayerPalette = [
  { from: 'hsl(var(--fajr-from))',    to: 'hsl(var(--fajr-to))',    glow: 'hsl(var(--fajr-glow))' },
  { from: 'hsl(var(--dhuhr-from))',   to: 'hsl(var(--dhuhr-to))',   glow: 'hsl(var(--dhuhr-glow))' },
  { from: 'hsl(var(--asr-from))',     to: 'hsl(var(--asr-to))',     glow: 'hsl(var(--asr-glow))' },
  { from: 'hsl(var(--maghrib-from))', to: 'hsl(var(--maghrib-to))', glow: 'hsl(var(--maghrib-glow))' },
  { from: 'hsl(var(--isha-from))',    to: 'hsl(var(--isha-to))',    glow: 'hsl(var(--isha-glow))' },
];

// Map seasonal pattern → shape kind for the progress markers
function patternToShape(pattern: string | undefined): ShapeKind {
  switch (pattern) {
    case 'crescents': return 'crescent';
    case 'stars': return 'star';
    case 'kaaba': return 'kaaba';
    case 'petals': return 'petal';
    case 'leaves': return 'leaf';
    case 'snow': return 'snow';
    case 'lanterns':
    default: return 'lantern';
  }
}

function useSeasonPattern() {
  const read = () =>
    typeof document !== 'undefined' ? document.documentElement.dataset.seasonPattern : undefined;
  const [pattern, setPattern] = useState<string | undefined>(read);
  useEffect(() => {
    const update = () => setPattern(read());
    window.addEventListener('seasonal-theme-change', update);
    return () => window.removeEventListener('seasonal-theme-change', update);
  }, []);
  return pattern;
}

interface ShapeProps {
  lit: boolean;
  from: string;
  to: string;
  glow: string;
  gradId: string;
  kind: ShapeKind;
}

function Shape({ lit, from, to, glow, gradId, kind }: ShapeProps) {
  const dim = 'hsl(var(--muted))';
  const opacity = lit ? 1 : 0.35;

  // Shared gradient defs — vertical body fill + radial inner glow
  const Defs = (
    <defs>
      <linearGradient id={`${gradId}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={lit ? from : dim} />
        <stop offset="55%"  stopColor={lit ? glow : dim} />
        <stop offset="100%" stopColor={lit ? to   : dim} />
      </linearGradient>
      <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stopColor="white"        stopOpacity={lit ? 0.55 : 0} />
        <stop offset="45%" stopColor={lit ? glow : dim} stopOpacity={lit ? 0.5 : 0} />
        <stop offset="100%" stopColor={lit ? to : dim}   stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  if (kind === 'lantern') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        <line x1="22" y1="0" x2="22" y2="12" stroke={lit ? from : dim} strokeWidth="1.5" />
        <rect x="16" y="10" width="12" height="4" rx="1" fill={lit ? from : dim} />
        <path
          d="M14 14 C14 14, 10 20, 10 30 C10 40, 14 46, 22 48 C30 46, 34 40, 34 30 C34 20, 30 14, 30 14 Z"
          fill={`url(#${gradId}-body)`}
          opacity={opacity}
        />
        {lit && <ellipse cx="22" cy="30" rx="9" ry="13" fill={`url(#${gradId}-glow)`} />}
        {lit && <ellipse cx="22" cy="28" rx="3" ry="5" fill="white" opacity="0.35" />}
        <path d="M18 46 L22 54 L26 46" fill={lit ? to : dim} opacity={lit ? 0.85 : 0.3} />
      </svg>
    );
  }

  if (kind === 'crescent') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        {lit && <circle cx="22" cy="30" r="18" fill={`url(#${gradId}-glow)`} />}
        <circle cx="22" cy="30" r="14" fill={`url(#${gradId}-body)`} opacity={opacity} />
        <circle cx="27" cy="26" r="12" fill="hsl(var(--background))" />
        {lit && <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.9" />}
      </svg>
    );
  }

  if (kind === 'star') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        {lit && <circle cx="22" cy="30" r="20" fill={`url(#${gradId}-glow)`} />}
        <path
          d="M22 12 L26 24 L38 24 L28 32 L32 44 L22 36 L12 44 L16 32 L6 24 L18 24 Z"
          fill={`url(#${gradId}-body)`}
          opacity={opacity}
        />
        {lit && <circle cx="22" cy="29" r="3" fill="white" opacity="0.5" />}
      </svg>
    );
  }

  if (kind === 'kaaba') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        {lit && <ellipse cx="22" cy="32" rx="20" ry="14" fill={`url(#${gradId}-glow)`} />}
        {/* Cube */}
        <rect x="10" y="20" width="24" height="26" rx="1.5" fill="hsl(230 30% 10%)" opacity={lit ? 1 : 0.4} />
        {/* Gold band */}
        <rect x="10" y="28" width="24" height="3" fill={`url(#${gradId}-body)`} opacity={opacity} />
        {/* Door */}
        <rect x="20" y="34" width="6" height="10" fill={lit ? from : dim} opacity={opacity} />
        {/* Top corners */}
        <rect x="10" y="20" width="24" height="2" fill={lit ? glow : dim} opacity={opacity} />
      </svg>
    );
  }

  if (kind === 'petal') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        {lit && <circle cx="22" cy="30" r="18" fill={`url(#${gradId}-glow)`} />}
        {[0, 72, 144, 216, 288].map(angle => (
          <ellipse
            key={angle}
            cx="22" cy="18" rx="5" ry="10"
            fill={`url(#${gradId}-body)`}
            opacity={opacity}
            transform={`rotate(${angle} 22 30)`}
          />
        ))}
        <circle cx="22" cy="30" r="3.5" fill={lit ? glow : dim} />
      </svg>
    );
  }

  if (kind === 'leaf') {
    return (
      <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
        {Defs}
        {lit && <ellipse cx="22" cy="32" rx="18" ry="14" fill={`url(#${gradId}-glow)`} />}
        <path
          d="M22 12 C32 18, 36 30, 22 48 C8 30, 12 18, 22 12 Z"
          fill={`url(#${gradId}-body)`}
          opacity={opacity}
        />
        <path d="M22 14 L22 46" stroke={lit ? to : dim} strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }

  // snow
  return (
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none">
      {Defs}
      {lit && <circle cx="22" cy="30" r="18" fill={`url(#${gradId}-glow)`} />}
      <g stroke={`url(#${gradId}-body)`} strokeWidth="2.2" strokeLinecap="round" opacity={opacity}>
        <line x1="22" y1="14" x2="22" y2="46" />
        <line x1="8"  y1="30" x2="36" y2="30" />
        <line x1="12" y1="20" x2="32" y2="40" />
        <line x1="32" y1="20" x2="12" y2="40" />
        {/* small tips */}
        <line x1="22" y1="14" x2="19" y2="17" />
        <line x1="22" y1="14" x2="25" y2="17" />
        <line x1="22" y1="46" x2="19" y2="43" />
        <line x1="22" y1="46" x2="25" y2="43" />
      </g>
    </svg>
  );
}

export default function LanternProgress({ count, total = 5 }: Props) {
  const pattern = useSeasonPattern();
  const kind = patternToShape(pattern);

  return (
    <div className="flex items-start justify-center gap-2 py-3 relative">
      {/* Connection line */}
      <div className="absolute top-[11px] left-[15%] right-[15%] h-[1.5px] bg-border" />

      {Array.from({ length: total }, (_, i) => {
        const lit = i < count;
        const { from, to, glow } = prayerPalette[i];
        const gradId = `lp-${i}`;
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
                rotate: kind === 'lantern' ? [-2, 2, -2] : [0, 0, 0],
                scale: kind === 'lantern' ? [1, 1, 1] : [1, 1.06, 1],
                filter: [
                  `drop-shadow(0 0 6px ${glow})`,
                  `drop-shadow(0 0 18px ${glow})`,
                  `drop-shadow(0 0 6px ${glow})`,
                ],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              style={{ transformOrigin: 'top center' }}
            >
              <Shape lit={lit} from={from} to={to} glow={glow} gradId={gradId} kind={kind} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
