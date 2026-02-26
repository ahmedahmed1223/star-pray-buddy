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
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const isToday = normalizedDate.getTime() === today.getTime();

  const gregorian = date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hijri = formatHijri(date);

  const canGoBack = allowPast || normalizedDate > today;
  const canGoForward = allowFuture || normalizedDate < today;

  const goDay = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    newDate.setHours(0, 0, 0, 0);
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
        {/* Right arrow in RTL = go forward (next day) */}
        <button
          onClick={() => goDay(1)}
          disabled={!canGoForward}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
        <div className="text-center flex-1">
          <p className="text-foreground font-bold text-sm">{gregorian}</p>
          <p className="text-gold text-xs font-medium">{hijri}</p>
          {isToday && <span className="text-xs text-secondary font-bold">📍 اليوم</span>}
        </div>
        {/* Left arrow in RTL = go back (previous day) */}
        <button
          onClick={() => goDay(-1)}
          disabled={!canGoBack}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      {!isToday && (
        <button
          onClick={() => onDateChange(new Date())}
          className="w-full text-center text-gold text-xs font-medium mt-1 underline min-h-[36px]"
        >
          العودة لليوم ↩
        </button>
      )}
    </motion.div>
  );
}
