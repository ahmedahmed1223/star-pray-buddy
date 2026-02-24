import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChild, getReward, getWeeklyLogs, getMoneyReward, getChildMoney, getGiftTiers, getJamaahCount, AVATAR_IMAGES } from '@/lib/store';
import { ArrowLeft, Star, Coins } from 'lucide-react';

export default function RewardsScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const reward = getReward();
  const moneyReward = getMoneyReward();
  const giftTiers = getGiftTiers();

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
  const childMoney = getChildMoney(child.id);
  const jamaahCount = getJamaahCount(child.id);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block mb-3 relative"
          >
            <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-24 h-24 rounded-full object-cover mx-auto ring-3 ring-primary/30" />
            <motion.div
              className="absolute -inset-2 rounded-full border-2 border-gold/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{child.name}</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="inline-flex items-center gap-2 text-star">
              <Star size={24} fill="currentColor" />
              <span className="text-3xl font-extrabold">{child.totalStars}</span>
            </div>
            {moneyReward.enabled && (
              <div className="inline-flex items-center gap-2 text-secondary">
                <Coins size={24} />
                <span className="text-3xl font-extrabold">{childMoney}</span>
                <span className="text-lg font-medium">{moneyReward.currency}</span>
              </div>
            )}
          </div>
          {jamaahCount > 0 && (
            <p className="text-muted-foreground text-sm mt-2">🕌 صلوات جماعة: <span className="text-secondary font-bold">{jamaahCount}</span></p>
          )}
        </motion.div>

        {/* Money Card */}
        {moneyReward.enabled && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-5 border border-secondary/30 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Coins size={20} className="text-secondary" />
              <h3 className="font-bold text-foreground">المكافأة المالية</h3>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-extrabold text-secondary">{childMoney}</p>
                <p className="text-muted-foreground text-sm">{moneyReward.currency} مكتسبة</p>
              </div>
              <div>
                <p className="text-lg text-muted-foreground">كل <span className="text-gold font-bold">{moneyReward.prayersNeeded}</span> صلوات</p>
                <p className="text-lg text-muted-foreground">= <span className="text-secondary font-bold">{moneyReward.amountPerPrayers}</span> {moneyReward.currency}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weekly Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 border border-border mb-6">
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
              <p className="text-muted-foreground text-sm">إنجاز</p>
            </div>
          </div>
        </motion.div>

        {/* Gift Tiers - Reward Path */}
        {giftTiers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-5 border border-border mb-6">
            <h3 className="font-bold text-foreground mb-4">🎁 طريق المكافآت</h3>
            <div className="relative">
              {/* Path line */}
              <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {giftTiers.map((tier, i) => {
                  const tierAchieved = child.totalStars >= tier.starsRequired;
                  const tierProgress = Math.min((child.totalStars / tier.starsRequired) * 100, 100);
                  return (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="relative flex items-center gap-4 pe-8"
                    >
                      {/* Node on path */}
                      <div className={`absolute right-4 w-5 h-5 rounded-full border-2 z-10 ${
                        tierAchieved ? 'bg-primary border-primary glow-gold' : 'bg-card border-border'
                      }`}>
                        {tierAchieved && <span className="absolute -top-0.5 -right-0.5 text-xs">✓</span>}
                      </div>
                      <div className={`flex-1 rounded-xl p-3 border transition-all ms-4 ${
                        tierAchieved ? 'border-primary bg-primary/10 glow-gold' : 'border-border bg-muted'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <motion.span
                            className="text-2xl"
                            animate={tierAchieved ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            {tier.emoji}
                          </motion.span>
                          <span className={`font-bold ${tierAchieved ? 'text-gold' : 'text-foreground'}`}>{tier.name}</span>
                          {tierAchieved && <span className="text-sm">🏆</span>}
                          <span className="ms-auto text-xs text-muted-foreground">⭐ {tier.starsRequired}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tierProgress}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                            className="h-full gradient-gold rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Reward Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`bg-card rounded-3xl p-6 border-2 ${achieved ? 'border-primary glow-gold' : 'border-border'}`}>
          <div className="text-center mb-4">
            <p className="text-lg text-muted-foreground font-medium mb-1">هدف المكافأة الرئيسي</p>
            <p className="text-2xl font-bold text-foreground">{reward.text}</p>
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(230 30% 25%)" strokeWidth="10" />
                <motion.circle cx="60" cy="60" r="52" fill="none" stroke="hsl(42 100% 55%)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - progress / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-gold">{Math.round(progress)}%</span>
                <span className="text-xs text-muted-foreground">{child.totalStars}/{reward.goal}</span>
              </div>
              {/* Glow effect near completion */}
              {progress > 75 && !achieved && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ boxShadow: ['0 0 10px hsl(42 100% 55% / 0.2)', '0 0 25px hsl(42 100% 55% / 0.5)', '0 0 10px hsl(42 100% 55% / 0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
          {achieved && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
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
