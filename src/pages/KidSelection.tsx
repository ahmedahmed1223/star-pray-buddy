import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, AVATAR_IMAGES, type Child } from '@/lib/store';
import StarParticles from '@/components/StarParticles';
import { ArrowLeft } from 'lucide-react';

const cardColors = [
  'border-gold/50 hover:border-gold',
  'border-secondary/50 hover:border-secondary',
  'border-accent/50 hover:border-accent',
  'border-lantern/50 hover:border-lantern',
  'border-star/50 hover:border-star',
];

export default function KidSelection() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => setChildren(getChildren()), []);

  return (
    <div className="min-h-screen gradient-night p-4 relative overflow-hidden">
      <StarParticles />
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">من يصلّي؟ 🤲</h1>
        </div>

        {/* Welcome message */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-foreground/70 text-lg mb-6 font-medium"
        >
          أهلاً! اختر اسمك 👇
        </motion.p>

        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-10 text-center border-2 border-dashed border-border"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-7xl mb-4"
            >
              🏮
            </motion.div>
            <p className="text-foreground font-bold text-lg mb-2">لا يوجد أطفال!</p>
            <p className="text-muted-foreground">اطلب من الوالدين إضافتك أولاً 💛</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {children.map((child, i) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(`/tracker/${child.id}`)}
                className={`bg-card border-2 ${cardColors[i % cardColors.length]} rounded-3xl p-6 flex flex-col items-center gap-3 transition-all relative overflow-hidden`}
              >
                {/* Glow effect behind avatar */}
                <div className="absolute top-4 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="relative"
                >
                  <img
                    src={AVATAR_IMAGES[child.avatarIndex]}
                    alt={child.name}
                    className="w-22 h-22 rounded-full object-cover ring-3 ring-primary/30"
                    style={{ width: 88, height: 88 }}
                  />
                </motion.div>
                <span className="text-foreground font-bold text-lg relative z-10">{child.name}</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  className="flex items-center gap-1.5 relative z-10"
                >
                  <span className="text-star text-xl">⭐</span>
                  <span className="text-gold font-extrabold text-lg">{child.totalStars}</span>
                </motion.div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
