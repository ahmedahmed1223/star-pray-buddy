import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PinDialog from '@/components/PinDialog';
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
      <div className="absolute inset-0 gradient-night opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 w-full max-w-sm"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-7xl mb-4"
        >
          🌙
        </motion.div>

        <h1 className="text-4xl font-extrabold text-gold mb-2 drop-shadow-lg">
          متابع الصلاة
        </h1>
        <p className="text-foreground/80 text-lg mb-10 font-medium">
          إصدار رمضان ✨
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/kids')}
            className="w-full gradient-gold text-primary-foreground font-bold text-xl py-5 rounded-2xl glow-gold shadow-lg"
          >
            👧 وضع الأطفال
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPinOpen(true)}
            className="w-full bg-card border-2 border-border text-foreground font-bold text-xl py-5 rounded-2xl hover:bg-muted transition-colors"
          >
            🔒 وضع الوالدين
          </motion.button>
        </div>
      </motion.div>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => { setPinOpen(false); navigate('/parent'); }}
      />
    </div>
  );
}
