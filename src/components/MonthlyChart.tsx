import { useState } from 'react';
import { motion } from 'framer-motion';
import { getMonthlyLogs, getChildren, AVATAR_IMAGES, localDateStr, type Child } from '@/lib/store';

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAY_HEADERS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

interface Props {
  children: Child[];
}

export default function MonthlyChart({ children }: Props) {
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?.id || '');
  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();

  const monthlyData = selectedChild ? getMonthlyLogs(selectedChild) : [];
  const todayStr = localDateStr(now);

  // Calculate grid offset for first day of month
  const firstDayOfMonth = new Date(year, now.getMonth(), 1).getDay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 border border-border"
    >
      <h3 className="font-bold text-lg text-foreground mb-3">📆 المخطط الشهري - {monthName} {year}</h3>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedChild === child.id
                  ? 'bg-primary/20 border border-primary text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-6 h-6 rounded-full object-cover" />
              {child.name}
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {monthlyData.map((day) => {
              const d = new Date(day.date);
              const dayNum = d.getDate();
              const isToday = day.date === todayStr;
              const isFuture = day.date > todayStr;
              const full = day.count === 5;
              const partial = day.count > 0 && day.count < 5;

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: dayNum * 0.01 }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-bold relative ${
                    isToday ? 'ring-2 ring-primary' : ''
                  } ${
                    isFuture ? 'opacity-30' : ''
                  } ${
                    full ? 'bg-primary/25 text-gold' :
                    partial ? 'bg-muted text-foreground' :
                    'bg-muted/50 text-muted-foreground'
                  }`}
                  title={`${dayNum}: ${day.count}/5 صلوات`}
                >
                  <span className="text-[10px]">{dayNum}</span>
                  {full && <span className="text-[10px]">⭐</span>}
                  {partial && !full && <span className="text-[9px]">{day.count}</span>}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/25" />
              <span>٥/٥</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>جزئي</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted/50" />
              <span>لم يُصلّ</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
