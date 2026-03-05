import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChildren, getStreak, getChildProgress, getChildLevel, AVATAR_IMAGES, type Child } from '@/lib/store';
import { Trophy, Target, Flame, ChevronDown, ChevronUp } from 'lucide-react';

interface LeaderboardProps {
  children: Child[];
}

type SortBy = 'stars' | 'streak' | 'today';

export default function Leaderboard({ children }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortBy>('stars');
  const [expanded, setExpanded] = useState(true);

  if (children.length < 2) return null;

  const data = children.map(child => {
    const progress = getChildProgress(child.id);
    const streak = getStreak(child.id);
    const levelInfo = getChildLevel(child.id);
    return { child, progress, streak, levelInfo };
  });

  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'stars') return b.progress.total - a.progress.total;
    if (sortBy === 'streak') return b.streak.current - a.streak.current;
    return b.progress.today - a.progress.today;
  });

  const medals = ['🥇', '🥈', '🥉'];

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
          <Trophy size={20} className="text-gold" />
          <h3 className="font-bold text-foreground text-lg">🏆 لوحة المتصدرين</h3>
        </div>
        {expanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Sort tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'stars' as SortBy, label: '⭐ النجوم', icon: Target },
                { key: 'streak' as SortBy, label: '🔥 السلسلة', icon: Flame },
                { key: 'today' as SortBy, label: '📿 اليوم', icon: Target },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSortBy(tab.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${
                    sortBy === tab.key
                      ? 'bg-primary/20 text-gold border border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {sorted.map((item, i) => (
                <motion.div
                  key={item.child.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    i === 0 ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{medals[i] || `${i + 1}`}</span>
                  <img
                    src={AVATAR_IMAGES[item.child.avatarIndex]}
                    alt={item.child.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm truncate">{item.child.name}</p>
                    <p className="text-xs font-bold" style={{ color: item.levelInfo.level.color }}>
                      {item.levelInfo.level.icon} {item.levelInfo.level.name}
                    </p>
                  </div>
                  <div className="text-left">
                    {sortBy === 'stars' && <span className="text-gold font-extrabold">⭐ {item.progress.total}</span>}
                    {sortBy === 'streak' && <span className="text-destructive font-extrabold">🔥 {item.streak.current}</span>}
                    {sortBy === 'today' && <span className="text-secondary font-extrabold">{item.progress.today}/٥</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
