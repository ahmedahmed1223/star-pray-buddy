import { motion } from 'framer-motion';

interface Props {
  count: number;
  total?: number;
  size?: number;
}

const messages = [
  'هيا نبدأ! 💪',
  'أحسنت! واصل 🌟',
  'ممتاز! نصف الطريق 🚀',
  'رائع! قاربت على الاكتمال ✨',
  'بقيت واحدة فقط! 🔥',
  'ماشاء الله! أتممتها كلها! 🏆',
];

export default function CircularProgress({ count, total = 5, size = 140 }: Props) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(count / total, 1);
  const offset = circumference * (1 - progress);
  const isComplete = count >= total;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${isComplete ? 'glow-gold' : ''} rounded-full`}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? 'hsl(var(--gold))' : 'hsl(var(--primary))'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-black ${isComplete ? 'text-gold' : 'text-foreground'}`}
          >
            {count}/{total}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">صلوات</span>
        </div>
      </div>
      {/* Encouragement message */}
      <motion.p
        key={count}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-bold ${isComplete ? 'text-gold' : 'text-muted-foreground'}`}
      >
        {messages[Math.min(count, total)]}
      </motion.p>
    </div>
  );
}
