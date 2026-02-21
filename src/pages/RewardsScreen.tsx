import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChild, getReward, AVATARS } from '@/lib/store';
import { ArrowLeft, Star } from 'lucide-react';

export default function RewardsScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const reward = getReward();

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">Child not found 😢</p>
      </div>
    );
  }

  const progress = Math.min((child.totalStars / reward.goal) * 100, 100);
  const achieved = child.totalStars >= reward.goal;

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/tracker/${child.id}`)} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gold">Rewards 🎁</h1>
        </div>

        {/* Avatar & Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl inline-block mb-3"
          >
            {AVATARS[child.avatarIndex]}
          </motion.span>
          <h2 className="text-2xl font-bold text-foreground mb-1">{child.name}</h2>
          <div className="inline-flex items-center gap-2 text-star">
            <Star size={28} fill="currentColor" />
            <span className="text-4xl font-extrabold">{child.totalStars}</span>
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
            <p className="text-lg text-muted-foreground font-medium mb-1">Reward Goal</p>
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
              <p className="text-gold font-bold text-xl">Goal Achieved!</p>
              <p className="text-foreground">MashaAllah! Great job!</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
