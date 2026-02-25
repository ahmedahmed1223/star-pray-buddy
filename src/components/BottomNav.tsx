import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  childId: string;
}

const tabs = [
  { path: 'tracker', label: 'الصلوات', icon: '🕌' },
  { path: 'rewards', label: 'المكافآت', icon: '🏆' },
];

export default function BottomNav({ childId }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.includes('/rewards') ? 'rewards' : 'tracker';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border px-2 py-2 flex justify-around items-center rounded-t-2xl shadow-lg">
          {tabs.map(tab => {
            const active = currentTab === tab.path;
            const targetPath = tab.path === 'tracker' ? `/tracker/${childId}` : `/rewards/${childId}`;
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(targetPath)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all relative ${
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
                <motion.span
                  className="text-2xl relative z-10"
                  animate={active ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {tab.icon}
                </motion.span>
                <span className="text-xs font-bold relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
