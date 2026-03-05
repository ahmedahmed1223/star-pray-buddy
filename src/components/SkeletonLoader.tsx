import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card rounded-2xl p-5 border border-border animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded-lg w-2/3" />
          <div className="h-3 bg-muted rounded-lg w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPrayerButton() {
  return (
    <div className="w-full h-16 bg-card rounded-2xl border border-border animate-pulse flex items-center gap-4 px-4">
      <div className="w-10 h-10 rounded-full bg-muted" />
      <div className="h-4 bg-muted rounded-lg w-24" />
      <div className="ms-auto w-9 h-9 rounded-full bg-muted" />
    </div>
  );
}

export function SkeletonTracker() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <div className="flex justify-center">
        <div className="h-12 bg-card rounded-2xl border border-border animate-pulse w-48" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <SkeletonPrayerButton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonKidCard() {
  return (
    <div className="bg-card border-2 border-border rounded-3xl p-5 flex flex-col items-center gap-2 animate-pulse">
      <div className="w-20 h-20 rounded-full bg-muted" />
      <div className="h-4 bg-muted rounded-lg w-16" />
      <div className="h-1.5 bg-muted rounded-full w-full" />
      <div className="flex items-center gap-3">
        <div className="h-5 bg-muted rounded-lg w-12" />
      </div>
    </div>
  );
}

interface ParticleBurstProps {
  active: boolean;
  x?: number;
  y?: number;
}

const PARTICLE_EMOJIS = ['⭐', '✨', '🌟', '💫', '🌙', '☪️'];

export function ParticleBurst({ active, x = 50, y = 50 }: ParticleBurstProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" style={{ perspective: 600 }}>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 60 + Math.random() * 80;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        return (
          <motion.span
            key={i}
            className="absolute text-lg"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: [1, 1.5, 0.5],
              x: dx,
              y: dy - 30,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {PARTICLE_EMOJIS[i % PARTICLE_EMOJIS.length]}
          </motion.span>
        );
      })}
    </div>
  );
}
