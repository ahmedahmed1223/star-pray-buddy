import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, getChildProgress, getReward, setReward, removeChild, resetChildStars, setPin, AVATAR_IMAGES, type Child } from '@/lib/store';
import AddChildDialog from '@/components/AddChildDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ArrowLeft, Plus, Trash2, Gift, Star, KeyRound, RotateCcw } from 'lucide-react';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [reward, setRewardState] = useState(getReward());
  const [editingReward, setEditingReward] = useState(false);
  const [rewardText, setRewardText] = useState(reward.text);
  const [rewardGoal, setRewardGoal] = useState(String(reward.goal));
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [resetTarget, setResetTarget] = useState<Child | null>(null);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  const refresh = () => setChildren(getChildren());
  useEffect(refresh, []);

  const saveReward = () => {
    const goal = parseInt(rewardGoal) || 50;
    setReward(rewardText, goal);
    setRewardState({ text: rewardText, goal });
    setEditingReward(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      removeChild(deleteTarget.id);
      refresh();
      setDeleteTarget(null);
    }
  };

  const handleReset = () => {
    if (resetTarget) {
      resetChildStars(resetTarget.id);
      refresh();
      setResetTarget(null);
    }
  };

  const handleChangePin = () => {
    if (newPin.length === 4) {
      setPin(newPin);
      setNewPin('');
      setChangingPin(false);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">لوحة الوالدين</h1>
        </div>

        {/* Change PIN */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <KeyRound size={20} className="text-gold" />
            <span className="font-bold text-lg text-foreground">رمز الدخول</span>
          </div>
          {changingPin ? (
            <div className="flex gap-2 items-center">
              <input
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="رمز جديد (4 أرقام)"
                type="tel"
                maxLength={4}
                className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest"
                dir="ltr"
              />
              <button
                onClick={handleChangePin}
                disabled={newPin.length !== 4}
                className="gradient-gold text-primary-foreground font-bold px-5 py-2 rounded-xl disabled:opacity-50"
              >
                حفظ
              </button>
              <button onClick={() => { setChangingPin(false); setNewPin(''); }} className="text-muted-foreground px-3 py-2">
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">يمكنك تغيير رمز الدخول للوالدين</p>
              <button onClick={() => setChangingPin(true)} className="text-gold text-sm font-medium underline">
                تغيير
              </button>
            </div>
          )}
          {pinSaved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-secondary text-sm mt-2 font-medium">
              ✅ تم تغيير الرمز بنجاح!
            </motion.p>
          )}
        </motion.div>

        {/* Reward Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Gift size={20} className="text-lantern" />
            <span className="font-bold text-lg text-foreground">هدف المكافأة</span>
          </div>
          {editingReward ? (
            <div className="space-y-3">
              <input
                value={rewardText}
                onChange={e => setRewardText(e.target.value)}
                placeholder="وصف المكافأة..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2 items-center">
                <Star size={16} className="text-star" />
                <input
                  value={rewardGoal}
                  onChange={e => setRewardGoal(e.target.value)}
                  type="number"
                  className="w-24 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  dir="ltr"
                />
                <span className="text-muted-foreground text-sm">نجمة مطلوبة</span>
              </div>
              <button onClick={saveReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl">
                حفظ
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">{reward.text}</p>
                <p className="text-muted-foreground text-sm">🌟 {reward.goal} نجمة</p>
              </div>
              <button onClick={() => setEditingReward(true)} className="text-gold text-sm font-medium underline">
                تعديل
              </button>
            </div>
          )}
        </motion.div>

        {/* Children */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">الأطفال</h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          >
            <Plus size={16} /> إضافة
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <p className="text-5xl mb-3">👶</p>
            <p className="text-muted-foreground font-medium">لم يتم إضافة أطفال بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child, i) => {
              const progress = getChildProgress(child.id);
              const rewardData = getReward();
              const achieved = progress.total >= rewardData.goal;
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-card rounded-2xl p-4 border ${achieved ? 'border-primary glow-gold' : 'border-border'} flex items-center gap-4`}
                >
                  <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-lg truncate">{child.name}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="text-muted-foreground">اليوم: <span className="text-gold font-bold">{progress.today}/٥</span></span>
                      <span className="text-muted-foreground">المجموع: <span className="text-star font-bold">⭐ {progress.total}</span></span>
                    </div>
                    {achieved && <p className="text-gold text-xs font-bold mt-1">🏆 حقق الهدف!</p>}
                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full gradient-gold rounded-full transition-all"
                        style={{ width: `${Math.min((progress.total / rewardData.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setResetTarget(child)}
                      className="text-muted-foreground hover:text-gold p-1.5"
                      title="إعادة تعيين النجوم"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(child)}
                      className="text-destructive/60 hover:text-destructive p-1.5"
                      title="حذف الطفل"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AddChildDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف الطفل"
        message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟ سيتم حذف جميع بياناته.`}
        confirmText="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />

      <ConfirmDialog
        open={!!resetTarget}
        title="إعادة تعيين النجوم"
        message={`هل تريد إعادة نجوم "${resetTarget?.name}" إلى صفر؟`}
        confirmText="إعادة تعيين"
        onConfirm={handleReset}
        onCancel={() => setResetTarget(null)}
      />
    </div>
  );
}
