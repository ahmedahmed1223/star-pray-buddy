import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChild, getReward, getWeeklyLogs, AVATAR_IMAGES } from '@/lib/store';
import { ArrowLeft, Star } from 'lucide-react';

export default function RewardsScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const reward = getReward();

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const progress = Math.min((child.totalStars / reward.goal) * 100, 100);
  const achieved = child.totalStars >= reward.goal;
  const weekly = getWeeklyLogs(child.id);
  const totalWeekPrayers = weekly.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/tracker/${child.id}`)} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">المكافآت 🎁</h1>
        </div>

        {/* Avatar & Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block mb-3"
          >
            <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-24 h-24 rounded-full object-cover mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{child.name}</h2>
          <div className="inline-flex items-center gap-2 text-star">
            <Star size={28} fill="currentColor" />
            <span className="text-4xl font-extrabold">{child.totalStars}</span>
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 border border-border mb-6"
        >
          <h3 className="font-bold text-foreground mb-3">📊 ملخص الأسبوع</h3>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-3xl font-extrabold text-gold">{totalWeekPrayers}</p>
              <p className="text-muted-foreground text-sm">صلاة</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-star">{weekly.filter(d => d.count === 5).length}</p>
              <p className="text-muted-foreground text-sm">يوم كامل</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-secondary">{Math.round((totalWeekPrayers / 35) * 100)}%</p>
              <p className="text-muted-foreground text-sm">نسبة الإنجاز</p>
            </div>
          </div>
        </motion.div>

        {/* Reward Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-card rounded-3xl p-6 border-2 ${achieved ? 'border-primary glow-gold' : 'border-border'}`}
        >
          <div className="text-center mb-4">
            <p className="text-lg text-muted-foreground font-medium mb-1">هدف المكافأة</p>
            <p className="text-2xl font-bold text-foreground">{reward.text}</p>
          </div>

          {/* Progress ring */}
          <div className="flex justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(230 30% 25%)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="hsl(42 100% 55%)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - progress / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-gold">{Math.round(progress)}%</span>
                <span className="text-xs text-muted-foreground">{child.totalStars}/{reward.goal}</span>
              </div>
            </div>
          </div>

          {achieved && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-3xl mb-2">🎉🏆🎉</p>
              <p className="text-gold font-bold text-xl">تم تحقيق الهدف!</p>
              <p className="text-foreground">ماشاء الله! أحسنت!</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
