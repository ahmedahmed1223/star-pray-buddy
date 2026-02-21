import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getChildren, getChildProgress, getReward, setReward, removeChild, AVATARS, type Child } from '@/lib/store';
import AddChildDialog from '@/components/AddChildDialog';
import { ArrowLeft, Plus, Trash2, Gift, Star } from 'lucide-react';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [reward, setRewardState] = useState(getReward());
  const [editingReward, setEditingReward] = useState(false);
  const [rewardText, setRewardText] = useState(reward.text);
  const [rewardGoal, setRewardGoal] = useState(String(reward.goal));

  const refresh = () => setChildren(getChildren());
  useEffect(refresh, []);

  const saveReward = () => {
    const goal = parseInt(rewardGoal) || 50;
    setReward(rewardText, goal);
    setRewardState({ text: rewardText, goal });
    setEditingReward(false);
  };

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gold">Parent Dashboard</h1>
        </div>

        {/* Reward Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Gift size={20} className="text-lantern" />
            <span className="font-bold text-lg text-foreground">Reward Goal</span>
          </div>
          {editingReward ? (
            <div className="space-y-3">
              <input
                value={rewardText}
                onChange={e => setRewardText(e.target.value)}
                placeholder="Reward description..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2 items-center">
                <Star size={16} className="text-star" />
                <input
                  value={rewardGoal}
                  onChange={e => setRewardGoal(e.target.value)}
                  type="number"
                  className="w-24 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted-foreground text-sm">stars needed</span>
              </div>
              <button onClick={saveReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl">
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">{reward.text}</p>
                <p className="text-muted-foreground text-sm">🌟 {reward.goal} stars</p>
              </div>
              <button onClick={() => setEditingReward(true)} className="text-gold text-sm font-medium underline">
                Edit
              </button>
            </div>
          )}
        </motion.div>

        {/* Children */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Children</h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {children.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border">
            <p className="text-5xl mb-3">👶</p>
            <p className="text-muted-foreground font-medium">No children added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child, i) => {
              const progress = getChildProgress(child.id);
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4"
                >
                  <span className="text-4xl">{AVATARS[child.avatarIndex]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-lg truncate">{child.name}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="text-muted-foreground">Today: <span className="text-gold font-bold">{progress.today}/5</span></span>
                      <span className="text-muted-foreground">Total: <span className="text-star font-bold">⭐ {progress.total}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => { removeChild(child.id); refresh(); }}
                    className="text-destructive/60 hover:text-destructive p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AddChildDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />
    </div>
  );
}
