import { motion } from 'framer-motion';
import { getDailyGoal, completeDailyGoal, isDailyGoalCompleted } from '@/lib/store';
import { useState, useEffect } from 'react';
import { hapticSuccess } from '@/lib/haptics';
import { Check } from 'lucide-react';

interface Props {
  childId: string;
  date: string;
  onComplete?: () => void;
}

export default function DailyGoalCard({ childId, date, onComplete }: Props) {
  const goal = getDailyGoal(date);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isDailyGoalCompleted(childId, date));
  }, [childId, date]);

  const handleComplete = () => {
    if (completed) return;
    completeDailyGoal(childId, date);
    setCompleted(true);
    hapticSuccess();
    onComplete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border transition-all ${
        completed 
          ? 'bg-secondary/15 border-secondary' 
          : 'bg-card border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.span 
          className="text-2xl"
          animate={completed ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {goal.emoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium mb-0.5">🎯 هدف اليوم</p>
          <p className={`text-sm font-bold ${completed ? 'text-secondary' : 'text-foreground'}`}>
            {goal.text}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleComplete}
          disabled={completed}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            completed
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-gold'
          }`}
        >
          {completed ? <Check size={18} /> : <span className="text-sm font-bold">+{goal.starsReward}</span>}
        </motion.button>
      </div>
      {completed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-secondary text-xs font-bold mt-2 text-center"
        >
          ✅ أحسنت! حصلت على {goal.starsReward} نجوم إضافية!
        </motion.p>
      )}
    </motion.div>
  );
}
