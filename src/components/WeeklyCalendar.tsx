import { motion } from 'framer-motion';
import { getWeeklyLogs } from '@/lib/store';

interface Props {
  childId: string;
}

const DAY_NAMES = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function WeeklyCalendar({ childId }: Props) {
  const weekly = getWeeklyLogs(childId);

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <h3 className="text-foreground font-bold text-lg mb-3">📅 الأسبوع الماضي</h3>
      <div className="grid grid-cols-7 gap-1">
        {weekly.map((day, i) => {
          const d = new Date(day.date);
          const dayName = DAY_NAMES[d.getDay()];
          const isToday = i === 6;
          const full = day.count === 5;
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
                isToday ? 'bg-primary/15 border border-primary' : ''
              }`}
            >
              <span className="text-muted-foreground text-[10px] font-medium">{dayName}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                full
                  ? 'bg-primary text-primary-foreground'
                  : day.count > 0
                  ? 'bg-muted text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {day.count > 0 ? (full ? '⭐' : day.count) : '·'}
              </div>
              <span className="text-[10px] text-muted-foreground">{d.getDate()}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
