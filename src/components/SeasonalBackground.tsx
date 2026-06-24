import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getActiveSeasonalTheme, type SeasonPattern } from '@/lib/seasonalThemes';
import { useReducedMotion } from '@/lib/motion';

interface Props {
  /** Override pattern; otherwise uses active seasonal theme */
  pattern?: SeasonPattern;
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/** Floating SVG decorative layer that adapts to seasonal theme */
function SeasonalBackgroundImpl({ pattern, density = 'medium', className = '' }: Props) {
  const reduced = useReducedMotion();
  const [activePattern, setActivePattern] = useState<SeasonPattern>('stars');

  useEffect(() => {
    if (pattern) { setActivePattern(pattern); return; }
    const sync = () => setActivePattern(getActiveSeasonalTheme().pattern);
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('seasonal-theme-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('seasonal-theme-change', sync);
    };
  }, [pattern]);

  const count = reduced ? 4 : density === 'low' ? 8 : density === 'high' ? 24 : 14;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      {activePattern === 'stars' && <Stars count={count} reduced={reduced} />}
      {activePattern === 'crescents' && <Crescents count={Math.max(3, Math.floor(count / 3))} reduced={reduced} />}
      {activePattern === 'lanterns' && <Lanterns count={Math.max(3, Math.floor(count / 3))} reduced={reduced} />}
      {activePattern === 'snow' && <Snow count={count} reduced={reduced} />}
      {activePattern === 'leaves' && <Leaves count={Math.max(6, Math.floor(count / 1.5))} reduced={reduced} />}
      {activePattern === 'petals' && <Petals count={Math.max(6, Math.floor(count / 1.5))} reduced={reduced} />}
      {activePattern === 'kaaba' && <KaabaPattern reduced={reduced} />}
      {activePattern === 'balloons' && <Balloons count={Math.max(5, Math.floor(count / 1.6))} reduced={reduced} />}
      {activePattern === 'suns' && <Suns count={Math.max(3, Math.floor(count / 3))} reduced={reduced} />}
      {activePattern === 'bubbles' && <Bubbles count={count} reduced={reduced} />}
    </div>
  );
}

export default memo(SeasonalBackgroundImpl);

/* === Patterns === */

function Stars({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <svg className="absolute inset-0 w-full h-full">
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(2, 98), y = rand(2, 98), s = rand(1, 2.5), d = rand(1.5, 4);
        return (
          <motion.circle
            key={i} cx={`${x}%`} cy={`${y}%`} r={s}
            fill="hsl(var(--season-particle, 45 100% 70%))"
            animate={reduced ? {} : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: d, repeat: Infinity, delay: rand(0, 2) }}
          />
        );
      })}
    </svg>
  );
}

function Crescents({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(5, 90), y = rand(5, 80), size = rand(18, 32);
        return (
          <motion.svg
            key={i} width={size} height={size} viewBox="0 0 40 40"
            className="absolute" style={{ left: `${x}%`, top: `${y}%`, opacity: 0.18 }}
            animate={reduced ? {} : { y: [0, -8, 0], rotate: [0, 6, 0] }}
            transition={{ duration: rand(4, 7), repeat: Infinity, delay: rand(0, 3) }}
          >
            <circle cx="20" cy="20" r="14" fill="hsl(var(--season-glow, 42 100% 65%))" />
            <circle cx="25" cy="17" r="12" fill="hsl(var(--season-bg-from, 230 45% 8%))" />
          </motion.svg>
        );
      })}
    </>
  );
}

function Lanterns({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(5, 90), size = rand(28, 44), top = rand(-2, 8);
        return (
          <motion.svg
            key={i} width={size} height={size * 1.4} viewBox="0 0 40 56"
            className="absolute" style={{ left: `${x}%`, top: `${top}%`, opacity: 0.22 }}
            animate={reduced ? {} : { rotate: [-4, 4, -4] }}
            transition={{ duration: rand(3, 5), repeat: Infinity, delay: rand(0, 2), ease: 'easeInOut' }}
          >
            <line x1="20" y1="0" x2="20" y2="12" stroke="hsl(var(--season-glow))" strokeWidth="1" />
            <rect x="14" y="10" width="12" height="4" rx="1" fill="hsl(var(--season-glow))" />
            <path d="M12 14 C12 14, 8 24, 8 34 C8 46, 14 52, 20 52 C26 52, 32 46, 32 34 C32 24, 28 14, 28 14 Z"
              fill="hsl(var(--season-primary))" opacity="0.9" />
            <ellipse cx="20" cy="32" rx="6" ry="10" fill="hsl(var(--season-glow))" opacity="0.5" />
          </motion.svg>
        );
      })}
    </>
  );
}

function Snow({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(0, 100), size = rand(4, 10), dur = rand(8, 16);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`, top: '-5%', width: size, height: size,
              background: 'hsl(var(--season-particle, 200 30% 90%))',
              opacity: 0.6, filter: 'blur(0.5px)',
            }}
            animate={reduced ? {} : { y: ['0vh', '110vh'], x: [0, rand(-30, 30), 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: rand(0, dur), ease: 'linear' }}
          />
        );
      })}
    </>
  );
}

function Leaves({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(0, 100), size = rand(12, 22), dur = rand(10, 18);
        return (
          <motion.svg
            key={i} width={size} height={size} viewBox="0 0 24 24"
            className="absolute" style={{ left: `${x}%`, top: '-5%', opacity: 0.55 }}
            animate={reduced ? {} : { y: ['0vh', '110vh'], rotate: [0, 360], x: [0, rand(-40, 40), 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: rand(0, dur), ease: 'linear' }}
          >
            <path d="M12 2 C7 7, 4 12, 12 22 C20 12, 17 7, 12 2 Z" fill="hsl(var(--season-particle))" />
            <line x1="12" y1="2" x2="12" y2="22" stroke="hsl(var(--season-bg-from))" strokeWidth="0.5" opacity="0.4" />
          </motion.svg>
        );
      })}
    </>
  );
}

function Petals({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(0, 100), size = rand(8, 16), dur = rand(8, 14);
        return (
          <motion.svg
            key={i} width={size} height={size} viewBox="0 0 20 20"
            className="absolute" style={{ left: `${x}%`, top: '-5%', opacity: 0.6 }}
            animate={reduced ? {} : { y: ['0vh', '110vh'], rotate: [0, 540], x: [0, rand(-50, 50), 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: rand(0, dur), ease: 'linear' }}
          >
            <ellipse cx="10" cy="10" rx="4" ry="8" fill="hsl(var(--season-particle))" />
          </motion.svg>
        );
      })}
    </>
  );
}

function KaabaPattern({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Stars count={reduced ? 4 : 12} reduced={reduced} />
      <motion.svg
        width="80" height="100" viewBox="0 0 80 100"
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
        style={{ opacity: 0.18 }}
        animate={reduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="15" y="35" width="50" height="55" rx="2" fill="hsl(var(--season-bg-from))" stroke="hsl(var(--season-glow))" strokeWidth="1.5" />
        <rect x="15" y="55" width="50" height="6" fill="hsl(var(--season-glow))" opacity="0.5" />
        <rect x="32" y="65" width="16" height="20" rx="1" fill="hsl(var(--season-primary))" opacity="0.7" />
      </motion.svg>
    </>
  );
}

function Balloons({ count, reduced }: { count: number; reduced: boolean }) {
  const colors = ['330 90% 70%', '200 90% 65%', '45 100% 65%', '150 75% 60%', '280 80% 70%'];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(2, 95), size = rand(22, 38), dur = rand(10, 18);
        const color = colors[i % colors.length];
        return (
          <motion.svg
            key={i} width={size} height={size * 1.45} viewBox="0 0 40 58"
            className="absolute" style={{ left: `${x}%`, top: '110%', opacity: 0.65 }}
            animate={reduced ? {} : { y: ['0vh', '-130vh'], x: [0, rand(-25, 25), 0], rotate: [-5, 5, -5] }}
            transition={{ duration: dur, repeat: Infinity, delay: rand(0, dur), ease: 'linear' }}
          >
            <ellipse cx="20" cy="20" rx="14" ry="17" fill={`hsl(${color})`} />
            <ellipse cx="15" cy="14" rx="3" ry="5" fill="hsl(0 0% 100%)" opacity="0.4" />
            <path d="M20 37 L18 41 L22 41 Z" fill={`hsl(${color})`} />
            <path d="M20 41 Q22 48 19 52 Q17 56 20 58" stroke="hsl(0 0% 100% / 0.5)" strokeWidth="0.8" fill="none" />
          </motion.svg>
        );
      })}
    </>
  );
}

function Suns({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(5, 90), y = rand(5, 60), size = rand(36, 60);
        return (
          <motion.svg
            key={i} width={size} height={size} viewBox="0 0 60 60"
            className="absolute" style={{ left: `${x}%`, top: `${y}%`, opacity: 0.35 }}
            animate={reduced ? {} : { rotate: [0, 360] }}
            transition={{ duration: rand(20, 40), repeat: Infinity, ease: 'linear' }}
          >
            <g fill="hsl(var(--season-glow))">
              {Array.from({ length: 8 }).map((_, j) => (
                <rect key={j} x="28" y="2" width="4" height="10" rx="2" transform={`rotate(${j * 45} 30 30)`} />
              ))}
            </g>
            <circle cx="30" cy="30" r="14" fill="hsl(var(--season-primary))" />
            <circle cx="30" cy="30" r="14" fill="hsl(var(--season-glow))" opacity="0.5" />
          </motion.svg>
        );
      })}
    </>
  );
}

function Bubbles({ count, reduced }: { count: number; reduced: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = rand(0, 100), size = rand(10, 26), dur = rand(8, 16);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`, top: '110%', width: size, height: size,
              background: 'hsl(var(--season-particle) / 0.35)',
              border: '1px solid hsl(var(--season-glow) / 0.4)',
            }}
            animate={reduced ? {} : { y: ['0vh', '-120vh'], x: [0, rand(-30, 30), 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: rand(0, dur), ease: 'linear' }}
          />
        );
      })}
    </>
  );
}
