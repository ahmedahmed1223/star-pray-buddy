import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lock, Check, Trophy, Crown, Zap } from 'lucide-react';
import {
  getPassState, getSeasonMissions, getSeasonRewards,
  getTierProgress, evaluateMission, completeMission, claimTier, upgradePremium,
  XP_PER_TIER, MAX_TIER, type PassState,
} from '@/lib/battlePass';
import { getActiveSeasonalTheme } from '@/lib/seasonalThemes';
import { getChild } from '@/lib/store';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { toast } from 'sonner';
import SeasonalBackground from '@/components/SeasonalBackground';
import BottomNav from '@/components/BottomNav';

export default function BattlePass() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const child = getChild(childId!);
  const theme = getActiveSeasonalTheme();
  const [state, setState] = useState<PassState | null>(null);

  useEffect(() => {
    if (!childId) return;
    setState(getPassState(childId));
  }, [childId]);

  const missions = useMemo(() => getSeasonMissions(theme.key), [theme.key]);
  const rewards = useMemo(() => getSeasonRewards(theme.key), [theme.key]);

  if (!child || !state) {
    return <div className="min-h-screen flex items-center justify-center text-foreground">جاري التحميل...</div>;
  }

  const prog = getTierProgress(state.xp);

  const handleClaimMission = (missionId: string) => {
    const m = missions.find(x => x.id === missionId);
    if (!m) return;
    const ev = evaluateMission(state, m);
    if (!ev.done) {
      toast.error('لم تكمل المهمة بعد');
      return;
    }
    const updated = completeMission({ ...state }, m);
    setState({ ...updated });
    hapticSuccess();
    toast.success(`+${m.xp} XP! 🎉`);
  };

  const handleClaim = (tier: number, track: 'free' | 'premium') => {
    if (tier > prog.tier) { toast.error('لم تصل لهذا المستوى بعد'); return; }
    if (track === 'premium' && !state.premium) { toast.error('يحتاج المسار المميز ✨'); return; }
    const updated = claimTier({ ...state, claimedTiers: { ...state.claimedTiers } }, tier, track);
    setState({ ...updated });
    hapticSuccess();
    toast.success('تم استلام المكافأة! 🎁');
  };

  const handleUpgrade = () => {
    const updated = upgradePremium({ ...state });
    setState({ ...updated });
    hapticSuccess();
    toast.success('تم تفعيل المسار المميز ✨');
  };

  const themeStyle = {
    '--bg-from': theme.bgFrom, '--bg-to': theme.bgTo,
  } as React.CSSProperties;

  // group rewards by tier
  const rewardsByTier = new Map<number, { free?: typeof rewards[number]; premium?: typeof rewards[number] }>();
  for (const r of rewards) {
    const e = rewardsByTier.get(r.tier) || {};
    if (r.track === 'free') e.free = r; else e.premium = r;
    rewardsByTier.set(r.tier, e);
  }

  return (
    <div className="min-h-screen gradient-night relative overflow-hidden pb-24" style={themeStyle}>
      <SeasonalBackground density="low" />
      <div className="max-w-md mx-auto p-3 relative z-10">
        {/* Header */}
        <div className="glass-card-strong rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground" aria-label="رجوع">
              <ArrowLeft size={22} className="rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-gold" />
              <h1 className="text-lg font-extrabold text-foreground">جواز {theme.label}</h1>
              <span className="text-xl">{theme.emoji}</span>
            </div>
            <div className="w-[44px]" />
          </div>

          {/* XP / Tier */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              <span className="text-foreground font-bold">المستوى {prog.tier}</span>
            </div>
            <span className="text-xs text-muted-foreground">{prog.inTier}/{XP_PER_TIER} XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full gradient-gold" initial={{ width: 0 }} animate={{ width: `${prog.pct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">{prog.tier} / {MAX_TIER} مستويات</div>

          {/* Premium upgrade */}
          {!state.premium && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleUpgrade}
              className="mt-3 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-900 font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <Crown size={18} /> فعّل المسار المميز ✨
            </motion.button>
          )}
          {state.premium && (
            <div className="mt-3 w-full bg-primary/15 text-gold font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
              <Crown size={18} /> المسار المميز مُفعّل
            </div>
          )}
        </div>

        {/* Missions */}
        <div className="glass-card rounded-2xl p-3 mb-3">
          <h2 className="text-foreground font-bold mb-2 flex items-center gap-2"><Zap size={18} className="text-gold" /> المهام</h2>
          <div className="space-y-2">
            {missions.map(m => {
              const completed = state.completedMissions.includes(m.id);
              const ev = evaluateMission(state, m);
              const pct = Math.min(100, (ev.current / m.target) * 100);
              return (
                <div key={m.id} className="bg-card/60 border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-foreground font-semibold text-sm truncate">{m.title}</span>
                    </div>
                    <span className="text-xs text-gold font-bold whitespace-nowrap">+{m.xp} XP</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{ev.current}/{m.target}</span>
                    {completed ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Check size={14} /> مكتملة</span>
                    ) : (
                      <button
                        disabled={!ev.done}
                        onClick={() => { hapticLight(); handleClaimMission(m.id); }}
                        className={`text-xs font-bold px-3 py-1 rounded-lg ${ev.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                      >
                        استلام
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward Track */}
        <div className="glass-card rounded-2xl p-3">
          <h2 className="text-foreground font-bold mb-2 flex items-center gap-2"><Trophy size={18} className="text-gold" /> مسار المكافآت</h2>
          <div className="overflow-x-auto -mx-1 pb-1">
            <div className="flex gap-2 px-1" style={{ minWidth: 'min-content' }}>
              {Array.from({ length: MAX_TIER }, (_, i) => i + 1).map(tier => {
                const e = rewardsByTier.get(tier) || {};
                const reached = tier <= prog.tier;
                const freeClaimed = state.claimedTiers.free.includes(tier);
                const premClaimed = state.claimedTiers.premium.includes(tier);
                return (
                  <div key={tier} className="flex flex-col items-center gap-1 min-w-[64px]">
                    <span className={`text-[10px] font-bold ${reached ? 'text-gold' : 'text-muted-foreground'}`}>{tier}</span>
                    {/* free */}
                    {e.free && (
                      <button
                        onClick={() => handleClaim(tier, 'free')}
                        disabled={!reached || freeClaimed}
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xl border transition
                          ${freeClaimed ? 'bg-emerald-500/20 border-emerald-400' :
                            reached ? 'bg-primary/15 border-primary/40 hover:bg-primary/25' :
                            'bg-muted/30 border-border opacity-60'}`}
                        title={e.free.label}
                      >
                        {freeClaimed ? <Check size={20} className="text-emerald-400" /> : e.free.emoji}
                      </button>
                    )}
                    {/* premium */}
                    {e.premium ? (
                      <button
                        onClick={() => handleClaim(tier, 'premium')}
                        disabled={!reached || !state.premium || premClaimed}
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xl border transition
                          ${premClaimed ? 'bg-amber-500/30 border-amber-400' :
                            (reached && state.premium) ? 'bg-amber-500/15 border-amber-400/40 hover:bg-amber-500/25' :
                            'bg-muted/30 border-border opacity-60'}`}
                        title={e.premium.label}
                      >
                        {premClaimed ? <Check size={20} className="text-amber-300" /> :
                          (state.premium ? e.premium.emoji : <Lock size={16} className="text-muted-foreground" />)}
                      </button>
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-dashed border-border/50 opacity-30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary rounded-full" /> مجاني</span>
            <span className="flex items-center gap-1"><Crown size={11} className="text-amber-400" /> مميز</span>
          </div>
        </div>
      </div>

      <BottomNav childId={child.id} />
    </div>
  );
}
