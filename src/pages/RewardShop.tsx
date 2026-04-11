import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getChild, getShopItems, redeemItem, getRedemptionLogs, getChildProgress,
  AVATAR_IMAGES, type ShopItem
} from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import Confetti from '@/components/Confetti';
import { ArrowLeft, ShoppingBag, Ticket, Gift, Check } from 'lucide-react';
import { hapticSuccess, hapticLight } from '@/lib/haptics';

export default function RewardShop() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [logs, setLogs] = useState(getRedemptionLogs(childId!));
  const [progress, setProgress] = useState({ today: 0, total: 0 });
  const [confetti, setConfetti] = useState(false);
  const [justBought, setJustBought] = useState<string | null>(null);

  useEffect(() => {
    setItems(getShopItems());
    setLogs(getRedemptionLogs(childId!));
    setProgress(getChildProgress(childId!));
  }, [childId]);

  if (!child) {
    return (
      <div className="min-h-screen gradient-night flex items-center justify-center">
        <p className="text-foreground text-xl">الطفل غير موجود 😢</p>
      </div>
    );
  }

  const handleRedeem = (item: ShopItem) => {
    if (child.totalStars < item.cost) return;
    const success = redeemItem(child.id, item);
    if (success) {
      hapticSuccess();
      setConfetti(true);
      setJustBought(item.id);
      setProgress(getChildProgress(child.id));
      setLogs(getRedemptionLogs(child.id));
      setTimeout(() => { setConfetti(false); setJustBought(null); }, 3000);
    }
  };

  const rewards = items.filter(i => i.type === 'reward');
  const coupons = items.filter(i => i.type === 'coupon');

  return (
    <div className="min-h-screen gradient-night p-4 pb-24">
      <Confetti active={confetti} count={30} />
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(`/tracker/${child.id}`)} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold flex-1">🛍️ المتجر</h1>
          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border">
            <span className="text-star text-lg">⭐</span>
            <span className="text-gold font-extrabold text-lg">{progress.total}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-10 text-center border-2 border-dashed border-border"
          >
            <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-bold text-lg mb-2">المتجر فارغ! 🏪</p>
            <p className="text-muted-foreground text-sm">اطلب من والديك إضافة مكافآت وكوبونات</p>
          </motion.div>
        ) : (
          <>
            {/* Rewards section */}
            {rewards.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gift size={18} className="text-lantern" />
                  <h2 className="text-foreground font-bold">المكافآت</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {rewards.map((item, i) => {
                    const canAfford = progress.total >= item.cost;
                    const wasBought = justBought === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-card rounded-2xl p-4 border transition-all ${canAfford ? 'border-primary/50' : 'border-border opacity-60'}`}
                      >
                        <motion.span className="text-3xl block text-center mb-2" animate={wasBought ? { scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] } : {}}>
                          {item.emoji}
                        </motion.span>
                        <p className="text-foreground font-bold text-sm text-center mb-1">{item.name}</p>
                        <p className="text-gold text-xs text-center font-bold mb-2">⭐ {item.cost}</p>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRedeem(item)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-xl text-xs font-bold min-h-[36px] transition-all ${
                            canAfford ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {canAfford ? '🛒 اشترِ' : '🔒 نجوم غير كافية'}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coupons section */}
            {coupons.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket size={18} className="text-accent" />
                  <h2 className="text-foreground font-bold">الكوبونات</h2>
                </div>
                <div className="space-y-3">
                  {coupons.map((item, i) => {
                    const canAfford = progress.total >= item.cost;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`bg-card rounded-2xl p-4 border flex items-center gap-3 ${canAfford ? 'border-accent/50' : 'border-border opacity-60'}`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-bold text-sm">{item.name}</p>
                          {item.description && <p className="text-muted-foreground text-xs">{item.description}</p>}
                          <p className="text-gold text-xs font-bold">⭐ {item.cost}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRedeem(item)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-bold min-h-[36px] ${
                            canAfford ? 'bg-accent/20 text-accent border border-accent' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {canAfford ? '🎫 احصل' : '🔒'}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Redemption history */}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <h3 className="text-foreground font-bold text-sm mb-3">📋 سجل المشتريات</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {logs.slice().reverse().map(log => (
                <div key={log.id} className={`flex items-center gap-2 text-xs p-2 rounded-xl ${log.redeemed ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                  <span>{log.redeemed ? '✅' : '🎫'}</span>
                  <span className="text-foreground font-medium flex-1">{log.itemName}</span>
                  <span className="text-gold font-bold">-{log.cost}⭐</span>
                  <span className="text-muted-foreground">{log.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav childId={child.id} />
    </div>
  );
}
