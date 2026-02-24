import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PinDialog from '@/components/PinDialog';
import StarParticles from '@/components/StarParticles';
import ramadanBg from '@/assets/ramadan-bg.jpg';

export default function Index() {
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${ramadanBg})` }}
      />
      <div className="absolute inset-0 gradient-night opacity-70" />
      <StarParticles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 w-full max-w-sm"
      >
        {/* Animated Lanterns */}
        <div className="flex justify-center gap-6 mb-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut', delay: i * 0.3 }}
              className="text-5xl drop-shadow-lg"
            >
              🏮
            </motion.div>
          ))}
        </div>

        {/* Crescent Moon SVG */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-2"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto drop-shadow-lg">
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'hsl(42, 100%, 65%)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(42, 100%, 50%)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="30" fill="url(#moonGrad)" />
            <circle cx="50" cy="35" r="25" fill="hsl(230, 45%, 10%)" />
          </svg>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-gold mb-1 drop-shadow-lg">
          متابع الصلاة
        </h1>
        <p className="text-foreground/80 text-lg mb-8 font-medium">
          إصدار رمضان ✨
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/kids')}
            className="relative w-full gradient-gold text-primary-foreground font-bold text-xl py-5 rounded-2xl glow-gold shadow-lg overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{ skewX: '-12deg' }}
            />
            <span className="relative z-10">👧 وضع الأطفال</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPinOpen(true)}
            className="w-full bg-card border-2 border-border text-foreground font-bold text-xl py-5 rounded-2xl hover:bg-muted transition-colors"
          >
            🔒 وضع الوالدين
          </motion.button>
        </div>

        {/* Bottom decorative text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/60 text-sm font-medium">🌙 رمضان كريم 🌙</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>
      </motion.div>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => { setPinOpen(false); navigate('/parent'); }}
      />
    </div>
  );
}
