import { motion } from 'framer-motion';
import { getWeeklyLogs } from '@/lib/store';

interface Props {
  childId: string;
}

const DAY_NAMES = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const PRAYER_COLORS = [
  'hsl(var(--fajr-from))',
  'hsl(var(--dhuhr-from))',
  'hsl(var(--asr-from))',
  'hsl(var(--maghrib-from))',
  'hsl(var(--isha-from))',
];

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
          const log = day.log;
          const prayers = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha] : [false, false, false, false, false];
          
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
              <span className="text-muted-foreground text-xs font-medium">{dayName}</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                full
                  ? 'bg-primary text-primary-foreground'
                  : day.count > 0
                  ? 'bg-muted text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {day.count > 0 ? (full ? '⭐' : day.count) : '·'}
              </div>
              {/* Prayer dots */}
              <div className="flex gap-[2px]">
                {prayers.map((done, pi) => (
                  <div
                    key={pi}
                    className="w-[5px] h-[5px] rounded-full transition-colors"
                    style={{ backgroundColor: done ? PRAYER_COLORS[pi] : 'hsl(var(--muted))' }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{d.getDate()}</span>
            </motion.div>
          );
        })}
      </div>
      {/* Streak line for consecutive full days */}
      {weekly.filter(d => d.count === 5).length >= 2 && (
        <div className="mt-2 h-1 rounded-full gradient-gold opacity-60" />
      )}
    </div>
  );
}
