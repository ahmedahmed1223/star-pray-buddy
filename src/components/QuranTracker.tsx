import { motion } from 'framer-motion';
import { getQuranLog, setQuranPages, getTotalQuranPages } from '@/lib/store';
import { useState, useEffect } from 'react';
import { hapticLight } from '@/lib/haptics';
import { BookOpen, Minus, Plus } from 'lucide-react';

interface Props {
  childId: string;
  date: string;
  onUpdate?: () => void;
}

const TOTAL_PAGES = 604; // Total pages in Quran

export default function QuranTracker({ childId, date, onUpdate }: Props) {
  const [pages, setPages] = useState(0);
  const totalPages = getTotalQuranPages(childId);
  const khatmProgress = Math.min((totalPages / TOTAL_PAGES) * 100, 100);
  const khatmCount = Math.floor(totalPages / TOTAL_PAGES);

  useEffect(() => {
    setPages(getQuranLog(childId, date));
  }, [childId, date]);

  const handleChange = (delta: number) => {
    const newPages = Math.max(0, Math.min(pages + delta, 30));
    setPages(newPages);
    setQuranPages(childId, date, newPages);
    hapticLight();
    onUpdate?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={18} className="text-secondary" />
        <h3 className="text-foreground font-bold text-sm">📖 قراءة القرآن</h3>
      </div>

      {/* Daily counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-xs">صفحات اليوم:</span>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleChange(-1)}
            disabled={pages <= 0}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground disabled:opacity-30"
          >
            <Minus size={14} />
          </motion.button>
          <motion.span
            key={pages}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-extrabold text-secondary w-8 text-center"
          >
            {pages}
          </motion.span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleChange(1)}
            disabled={pages >= 30}
            className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"
          >
            <Plus size={14} />
          </motion.button>
        </div>
      </div>

      {/* Khatm progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">تقدم الختمة {khatmCount > 0 ? `(${khatmCount} ختمة)` : ''}</span>
          <span className="text-secondary font-bold">{totalPages}/{TOTAL_PAGES}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${khatmProgress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-secondary"
          />
        </div>
      </div>

      {khatmProgress >= 100 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gold font-bold text-xs mt-2"
        >
          🎉 ماشاء الله! أتممت ختمة القرآن!
        </motion.p>
      )}
    </motion.div>
  );
}
