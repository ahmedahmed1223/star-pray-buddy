import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface Props {
  active: boolean;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  type: 'star' | 'crescent' | 'diamond' | 'circle';
  color: string;
}

const COLORS = [
  'hsl(42, 100%, 55%)',   // gold
  'hsl(42, 100%, 65%)',   // light gold
  'hsl(160, 60%, 45%)',   // emerald
  'hsl(160, 60%, 55%)',   // light emerald
  'hsl(45, 100%, 70%)',   // yellow
  'hsl(25, 95%, 55%)',    // orange
];

function ParticleShape({ type, color, size }: { type: string; color: string; size: number }) {
  switch (type) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill={color} />
        </svg>
      );
    case 'crescent':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill={color} />
          <circle cx="15" cy="10" r="7" fill="hsl(230, 45%, 12%)" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L22 12L12 22L2 12Z" fill={color} />
        </svg>
      );
    default:
      return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />;
  }
}

export default function Confetti({ active, count = 40 }: Props) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 800,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 0.5,
      type: (['star', 'crescent', 'diamond', 'circle'] as const)[Math.floor(Math.random() * 4)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, [count, active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center overflow-hidden">
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, p.scale, p.scale * 0.5],
                x: p.x,
                y: p.y,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: p.delay, ease: 'easeOut' }}
              className="absolute"
            >
              <ParticleShape type={p.type} color={p.color} size={16} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
