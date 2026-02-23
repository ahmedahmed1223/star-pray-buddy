import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatHijri } from '@/lib/hijri';

interface Props {
  date: Date;
  onDateChange: (date: Date) => void;
  allowPast?: boolean;
  allowFuture?: boolean;
}

export default function DateNavigator({ date, onDateChange, allowPast = false, allowFuture = false }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];

  const gregorian = date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijri = formatHijri(date);

  const canGoBack = allowPast || date > today;
  const canGoForward = allowFuture || date < today;

  const goDay = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    // Check constraints
    if (delta < 0 && !allowPast && newDate < today) return;
    if (delta > 0 && !allowFuture && newDate > today) return;
    onDateChange(newDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-3 border border-border mb-4"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => goDay(1)}
          disabled={!canGoForward && isToday}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-30 rtl:rotate-180"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <p className="text-foreground font-bold text-sm">{gregorian}</p>
          <p className="text-gold text-xs font-medium">{hijri}</p>
          {isToday && <span className="text-[10px] text-secondary font-bold">📍 اليوم</span>}
        </div>
        <button
          onClick={() => goDay(-1)}
          disabled={!canGoBack && isToday}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-30 rtl:rotate-180"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {!isToday && (
        <button
          onClick={() => onDateChange(new Date())}
          className="w-full text-center text-gold text-xs font-medium mt-1 underline"
        >
          العودة لليوم ↩
        </button>
      )}
    </motion.div>
  );
}
