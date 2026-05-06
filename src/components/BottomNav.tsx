import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Gift, Award, ShoppingBag, BookHeart } from 'lucide-react';
import { getEarnedBadges, BADGES } from '@/lib/store';
import { hapticLight } from '@/lib/haptics';

interface Props {
  childId: string;
}

export default function BottomNav({ childId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const earnedBadges = getEarnedBadges(childId);
  const unreadBadges = earnedBadges.length;
  const totalBadges = BADGES.length;
  const hasNewBadges = unreadBadges > 0 && unreadBadges < totalBadges;

  const tabs = [
    { path: 'tracker', label: 'الصلوات', Icon: BookOpen, badge: 0 },
    { path: 'azkar', label: 'الأذكار', Icon: BookHeart, badge: 0 },
    { path: 'shop', label: 'المتجر', Icon: ShoppingBag, badge: 0 },
    { path: 'rewards', label: 'المكافآت', Icon: Gift, badge: 0 },
    { path: 'achievements', label: 'الإنجازات', Icon: Award, badge: hasNewBadges ? unreadBadges : 0 },
  ];

  const currentTab = location.pathname.includes('/achievements')
    ? 'achievements'
    : location.pathname.includes('/azkar')
    ? 'azkar'
    : location.pathname.includes('/rewards')
    ? 'rewards'
    : location.pathname.includes('/shop')
    ? 'shop'
    : 'tracker';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="التنقل الرئيسي" role="navigation">
      <div className="max-w-md mx-auto">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border px-1.5 py-2 flex justify-around items-center rounded-t-2xl shadow-lg" role="tablist">
          {tabs.map(tab => {
            const active = currentTab === tab.path;
            const targetPath = tab.path === 'tracker'
              ? `/tracker/${childId}`
              : tab.path === 'azkar'
              ? `/azkar/${childId}`
              : tab.path === 'shop'
              ? `/shop/${childId}`
              : tab.path === 'rewards'
              ? `/rewards/${childId}`
              : `/achievements/${childId}`;
            return (
                <motion.button
                key={tab.path}
                onClick={() => { hapticLight(); navigate(targetPath); }}
                whileTap={{ scale: 0.9 }}
                role="tab"
                aria-selected={active}
                aria-label={tab.label}
                className={`flex flex-col items-center gap-0.5 px-1 sm:px-3 py-2 rounded-xl transition-all relative min-w-[44px] min-h-[48px] ${
                  active ? 'text-gold' : 'text-muted-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-primary/15 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  className="relative z-10"
                  animate={active ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <tab.Icon size={20} />
                  {tab.badge > 0 && !active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </motion.div>
                <span className="text-[10px] font-bold relative z-10 leading-tight">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
