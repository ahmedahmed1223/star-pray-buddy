import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const PRAYER_LABELS = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

export default function WeeklyCalendar({ childId }: Props) {
  const weekly = getWeeklyLogs(childId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Find consecutive full days for streak highlight
  const streakDays = new Set<number>();
  let streakStart = -1;
  for (let i = 0; i < weekly.length; i++) {
    if (weekly[i].count === 5) {
      if (streakStart === -1) streakStart = i;
    } else {
      if (streakStart !== -1 && i - streakStart >= 2) {
        for (let j = streakStart; j < i; j++) streakDays.add(j);
      }
      streakStart = -1;
    }
  }
  if (streakStart !== -1 && weekly.length - streakStart >= 2) {
    for (let j = streakStart; j < weekly.length; j++) streakDays.add(j);
  }

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
          const isStreakDay = streakDays.has(i);
          const isSelected = selectedDay === i;
          
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDay(isSelected ? null : i)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all ${
                isToday ? 'bg-primary/15 border border-primary' : ''
              } ${isStreakDay ? 'bg-gold/10' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
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

      {/* Day detail popup */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="bg-muted rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-bold text-sm">
                  {DAY_NAMES[new Date(weekly[selectedDay].date).getDay()]} - {new Date(weekly[selectedDay].date).getDate()}
                </span>
                <span className="text-gold font-bold text-sm">{weekly[selectedDay].count}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PRAYER_LABELS.map((label, pi) => {
                  const log = weekly[selectedDay].log;
                  const prayers = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha] : [false, false, false, false, false];
                  const done = prayers[pi];
                  return (
                    <div key={pi} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          done ? 'text-primary-foreground' : 'bg-border text-muted-foreground'
                        }`}
                        style={done ? { backgroundColor: PRAYER_COLORS[pi] } : {}}
                      >
                        {done ? '✓' : '✗'}
                      </div>
                      <span className="text-xs text-muted-foreground leading-tight text-center">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak line for consecutive full days */}
      {streakDays.size >= 2 && (
        <div className="mt-2 h-1 rounded-full gradient-gold opacity-60" />
      )}
    </div>
  );
}
