import { useMemo } from 'react';
import { motion } from 'framer-motion';

const starColors = [
  'hsl(var(--star-yellow))',
  'hsl(var(--gold))',
  'hsl(var(--lantern-orange))',
  'hsl(220, 80%, 75%)',
  'hsl(280, 60%, 70%)',
];

/** Adaptive particle count based on device capability */
function getParticleCount(): number {
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return 12;
  if (cores <= 4) return 20;
  return 35;
}

export default function StarParticles() {
  const particles = useMemo(() => {
    const count = getParticleCount();
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
