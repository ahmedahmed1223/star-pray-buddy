import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChildren, getStreak, getDateProgress, type Child } from '@/lib/store';
import { Zap, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target: number;
  check: (childId: string) => number;
}

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'fajr_7',
    title: 'بطل الفجر',
    description: 'صلِّ الفجر 7 أيام متتالية',
    emoji: '🌅',
    target: 7,
    check: (childId) => {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (getDateProgress(childId, dateStr) >= 1) count++;
      }
      return count;
    },
  },
  {
    id: 'full_day_5',
    title: 'أسبوع ذهبي',
    description: 'أكمل 5 أيام كاملة هذا الأسبوع',
    emoji: '🌟',
    target: 5,
    check: (childId) => {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (getDateProgress(childId, dateStr) === 5) count++;
      }
      return count;
    },
  },
  {
    id: 'streak_3',
    title: 'سلسلة النار',
    description: 'حافظ على سلسلة 3 أيام على الأقل',
    emoji: '🔥',
    target: 3,
    check: (childId) => getStreak(childId).current,
  },
  {
    id: 'all_prayers_today',
    title: 'يوم مثالي',
    description: 'أكمل جميع الصلوات اليوم',
    emoji: '💎',
    target: 5,
    check: (childId) => {
      const today = new Date().toISOString().split('T')[0];
      return getDateProgress(childId, today);
    },
  },
];

interface WeeklyChallengesProps {
  children: Child[];
}

export default function WeeklyChallenges({ children }: WeeklyChallengesProps) {
  const [expanded, setExpanded] = useState(true);

  const challengeResults = useMemo(() => {
    return WEEKLY_CHALLENGES.map(challenge => {
      const childResults = children.map(child => ({
        child,
        progress: challenge.check(child.id),
        completed: challenge.check(child.id) >= challenge.target,
      }));
      return { challenge, childResults };
    });
  }, [children]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-gold" />
          <h3 className="font-bold text-foreground text-lg">⚡ تحديات الأسبوع</h3>
        </div>
        {expanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3"
          >
            {challengeResults.map(({ challenge, childResults }, i) => {
              const anyCompleted = childResults.some(r => r.completed);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-xl border p-3 ${
                    anyCompleted ? 'border-secondary/50 bg-secondary/10' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{challenge.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${anyCompleted ? 'text-secondary' : 'text-foreground'}`}>
                        {challenge.title}
                      </p>
                      <p className="text-muted-foreground text-xs">{challenge.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    {childResults.map(({ child, progress, completed }) => (
                      <div key={child.id} className="flex items-center gap-2">
                        <span className="text-xs text-foreground font-medium w-16 truncate">{child.name}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${completed ? 'bg-secondary' : 'bg-primary/60'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((progress / challenge.target) * 100, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-bold w-8 text-left">
                          {progress}/{challenge.target}
                        </span>
                        {completed && <CheckCircle size={14} className="text-secondary" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
