import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, AVATAR_IMAGES, type Child } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

export default function KidSelection() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => setChildren(getChildren()), []);

  return (
    <div className="min-h-screen gradient-night p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">من يصلّي؟ 🤲</h1>
        </div>

        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-8 text-center border border-border"
          >
            <p className="text-5xl mb-4">😅</p>
            <p className="text-foreground font-bold text-lg mb-2">لا يوجد أطفال!</p>
            <p className="text-muted-foreground">اطلب من الوالدين إضافتك أولاً.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {children.map((child, i) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/tracker/${child.id}`)}
                className="bg-card border-2 border-border hover:border-primary rounded-3xl p-6 flex flex-col items-center gap-3 transition-colors"
              >
                <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-20 h-20 rounded-full object-cover" />
                <span className="text-foreground font-bold text-lg">{child.name}</span>
                <span className="text-star text-sm font-medium">⭐ {child.totalStars}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
