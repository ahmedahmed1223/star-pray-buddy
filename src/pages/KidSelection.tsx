import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, getStreak, getChildProgress, AVATAR_IMAGES, type Child } from '@/lib/store';
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
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-4">
              <svg width="80" height="100" viewBox="0 0 44 60" className="mx-auto">
                <line x1="22" y1="0" x2="22" y2="12" stroke="hsl(var(--gold))" strokeWidth="1.5" />
                <rect x="16" y="10" width="12" height="4" rx="1" fill="hsl(var(--gold))" />
                <path d="M14 14 C14 14, 10 20, 10 30 C10 40, 14 46, 22 48 C30 46, 34 40, 34 30 C34 20, 30 14, 30 14 Z" fill="hsl(var(--lantern-orange))" />
                <ellipse cx="22" cy="30" rx="8" ry="12" fill="hsl(var(--gold))" opacity="0.4" />
                <path d="M18 46 L22 54 L26 46" fill="hsl(var(--gold))" opacity="0.7" />
              </svg>
            </motion.div>
            <p className="text-foreground font-bold text-lg mb-2">لا يوجد أطفال!</p>
            <p className="text-muted-foreground">اطلب من الوالدين إضافتك أولاً 💛</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {children.map((child, i) => {
              const streak = getStreak(child.id);
              const progress = getChildProgress(child.id);
              const isTopPerformer = progress.today === 5;
              return (
                <motion.button
                  key={child.id}
                  initial={{ opacity: 0, scale: 0.7, rotateY: -15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.06, rotateY: 5 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(`/tracker/${child.id}`)}
                  style={{ perspective: 600 }}
                  className={`bg-card border-2 ${isTopPerformer ? 'border-primary glow-gold' : cardColors[i % cardColors.length]} rounded-3xl p-6 flex flex-col items-center gap-3 transition-all relative overflow-hidden`}
                >
                  {/* Shimmer on top performer */}
                  {isTopPerformer && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      style={{ skewX: '-12deg' }}
                    />
                  )}
                  
                  {/* Glow behind avatar */}
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
                    {/* Golden ring animation */}
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-gold/40"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                    />
                  </motion.div>
                  
                  <span className="text-foreground font-bold text-lg relative z-10">{child.name}</span>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      className="flex items-center gap-1"
                    >
                      <span className="text-star text-lg">⭐</span>
                      <span className="text-gold font-extrabold text-lg">{child.totalStars}</span>
                    </motion.div>
                    {streak.current > 0 && (
                      <div className="flex items-center gap-0.5 bg-destructive/20 px-2 py-0.5 rounded-full">
                        <span className="text-sm">🔥</span>
                        <span className="text-destructive font-bold text-sm">{streak.current}</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
