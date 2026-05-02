import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { localDateStr } from '@/lib/store';

interface Props {
  childId: string;
  getLogs: (childId: string) => { date: string; count: number }[];
}

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function getColor(count: number): string {
  if (count === 0) return 'hsl(var(--muted))';
  if (count === 1) return 'hsl(var(--primary) / 0.25)';
  if (count === 2) return 'hsl(var(--primary) / 0.4)';
  if (count === 3) return 'hsl(var(--primary) / 0.6)';
  if (count === 4) return 'hsl(var(--primary) / 0.8)';
  return 'hsl(var(--primary))';
}

function HeatmapImpl({ childId, getLogs }: Props) {
  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date();
    const logsMap = new Map<string, number>();
    
    // Get all prayer logs for past year
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);
    
    // Build full year of dates
    const allDays: { date: string; count: number; dayOfWeek: number }[] = [];
    const d = new Date(startDate);
    while (d <= today) {
      const key = localDateStr(d);
      allDays.push({ date: key, count: 0, dayOfWeek: d.getDay() });
      d.setDate(d.getDate() + 1);
    }
    
    // Fill in actual logs
    const logs = getLogs(childId);
    logs.forEach(l => logsMap.set(l.date, l.count));
    allDays.forEach(day => { day.count = logsMap.get(day.date) ?? 0; });

    // Group into weeks (columns)
    const weeks: typeof allDays[] = [];
    let currentWeek: typeof allDays = [];
    
    // Pad first week
    const firstDow = allDays[0]?.dayOfWeek ?? 0;
    for (let i = 0; i < firstDow; i++) {
      currentWeek.push({ date: '', count: -1, dayOfWeek: i });
    }
    
    allDays.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Month labels
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const validDay = week.find(d => d.count >= 0);
      if (validDay && validDay.date) {
        const m = parseInt(validDay.date.split('-')[1]) - 1;
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTHS_AR[m], weekIdx: wi });
          lastMonth = m;
        }
      }
    });

    // Stats
    const totalDays = allDays.filter(d => d.count > 0).length;
    const perfectDays = allDays.filter(d => d.count === 5).length;
    const totalPrayers = allDays.reduce((s, d) => s + Math.max(0, d.count), 0);

    return { weeks, monthLabels, stats: { totalDays, perfectDays, totalPrayers } };
  }, [childId, getLogs]);

  const cellSize = 10;
  const gap = 2;
  const svgWidth = weeks.length * (cellSize + gap) + 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <h3 className="font-bold text-foreground text-lg mb-3">📅 خريطة السنة</h3>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted rounded-xl p-2 text-center">
          <p className="text-xl font-extrabold text-gold">{stats.totalDays}</p>
          <p className="text-muted-foreground text-xs">يوم نشط</p>
        </div>
        <div className="bg-muted rounded-xl p-2 text-center">
          <p className="text-xl font-extrabold text-secondary">{stats.perfectDays}</p>
          <p className="text-muted-foreground text-xs">يوم كامل</p>
        </div>
        <div className="bg-muted rounded-xl p-2 text-center">
          <p className="text-xl font-extrabold text-star">{stats.totalPrayers}</p>
          <p className="text-muted-foreground text-xs">صلاة</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <svg width={svgWidth} height={7 * (cellSize + gap) + 20} className="block">
          {/* Month labels */}
          {monthLabels.map((ml, i) => (
            <text
              key={i}
              x={ml.weekIdx * (cellSize + gap)}
              y={10}
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
              fontFamily="Cairo"
            >
              {ml.label}
            </text>
          ))}
          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (day.count < 0) return null;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (cellSize + gap)}
                  y={di * (cellSize + gap) + 16}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={getColor(day.count)}
                  className="transition-colors"
                >
                  <title>{day.date}: {day.count}/5 صلوات</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <span className="text-muted-foreground text-xs ml-1">أقل</span>
        {[0, 1, 2, 3, 4, 5].map(n => (
          <div key={n} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(n) }} />
        ))}
        <span className="text-muted-foreground text-xs mr-1">أكثر</span>
      </div>
    </motion.div>
  );
}
