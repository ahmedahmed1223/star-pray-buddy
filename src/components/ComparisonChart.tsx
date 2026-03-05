import { motion } from 'framer-motion';
import { getChildren, getChildProgress, getStreak, getChildLevel, AVATAR_IMAGES, type Child } from '@/lib/store';

interface ComparisonChartProps {
  children: Child[];
}

export default function ComparisonChart({ children }: ComparisonChartProps) {
  if (children.length < 2) return null;

  const data = children.map(child => {
    const progress = getChildProgress(child.id);
    const streak = getStreak(child.id);
    const levelInfo = getChildLevel(child.id);
    return { child, progress, streak, levelInfo };
  });

  const maxStars = Math.max(...data.map(d => d.progress.total), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border"
    >
      <h3 className="font-bold text-foreground text-lg mb-4">📊 مقارنة أداء الأطفال</h3>
      
      <div className="space-y-4">
        {data.map((item, i) => (
          <motion.div
            key={item.child.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <img
              src={AVATAR_IMAGES[item.child.avatarIndex]}
              alt={item.child.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-bold text-sm truncate">{item.child.name}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gold font-bold">⭐ {item.progress.total}</span>
                  {item.streak.current > 0 && (
                    <span className="text-destructive font-bold">🔥 {item.streak.current}</span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.levelInfo.level.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.progress.total / maxStars) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold" style={{ color: item.levelInfo.level.color }}>
                  {item.levelInfo.level.icon} {item.levelInfo.level.name}
                </span>
                <span className="text-muted-foreground text-xs">اليوم: {item.progress.today}/٥</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Winner highlight */}
      {data.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-3 border-t border-border text-center"
        >
          <span className="text-muted-foreground text-sm">🏆 الأفضل أداءً: </span>
          <span className="text-gold font-bold text-sm">
            {data.reduce((best, d) => d.progress.total > best.progress.total ? d : best).child.name}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
