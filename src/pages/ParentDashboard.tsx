import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getChildren, getChildProgress, getReward, setReward, removeChild, resetChildStars, setPin,
  getMoneyReward, setMoneyReward, getChildMoney, getSettings, updateSettings, getStreak,
  getCustomActivities, addCustomActivity, removeCustomActivity,
  getGiftTiers, addGiftTier, removeGiftTier,
  getDateLog, togglePrayerForDate, toggleJamaah, exportData, importData,
  getShopItems, addShopItem, removeShopItem,
  getParentMessages, addParentMessage, removeParentMessage,
  getFamilyChallenges, addFamilyChallenge, removeFamilyChallenge,
  getYearlyHeatmapData,
  AVATAR_IMAGES, PRAYER_NAMES, localDateStr, type Child, type MoneyReward, type PrayerName, type ShopItem, type FamilyChallenge
} from '@/lib/store';
import AddChildDialog from '@/components/AddChildDialog';
import EditChildDialog from '@/components/EditChildDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import MonthlyChart from '@/components/MonthlyChart';
import ReminderSettings from '@/components/ReminderSettings';
import ReportView from '@/components/ReportView';
import ComparisonChart from '@/components/ComparisonChart';
import Leaderboard from '@/components/Leaderboard';
import WeeklyChallenges from '@/components/WeeklyChallenges';
import Heatmap from '@/components/Heatmap';
import DateNavigator from '@/components/DateNavigator';
import PrayerButton from '@/components/PrayerButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft, Plus, Trash2, Gift, Star, KeyRound, RotateCcw, Coins,
  Settings2, Target, BookOpen, BarChart3, CalendarDays, Users, Download, Upload, Pencil, Cloud
} from 'lucide-react';
import CloudSyncPanel from '@/components/CloudSyncPanel';
import ThemeToggle from '@/components/ThemeToggle';
import PinDialog from '@/components/PinDialog';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [pinVerified, setPinVerified] = useState(() => sessionStorage.getItem('parent-pin-verified') === 'true');
  const [children, setChildren] = useState<Child[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editChild, setEditChildState] = useState<Child | null>(null);
  const [reward, setRewardState] = useState(getReward());
  const [editingReward, setEditingReward] = useState(false);
  const [rewardText, setRewardText] = useState(reward.text);
  const [rewardGoal, setRewardGoal] = useState(String(reward.goal));
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [resetTarget, setResetTarget] = useState<Child | null>(null);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [moneyReward, setMoneyRewardState] = useState<MoneyReward>(getMoneyReward());
  const [editingMoney, setEditingMoney] = useState(false);
  const [settings, setSettingsState] = useState(getSettings());
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activities
  const [activities, setActivities] = useState(getCustomActivities());
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityEmoji, setNewActivityEmoji] = useState('📖');
  const [newActivityStars, setNewActivityStars] = useState('1');

  // Gift tiers
  const [giftTiers, setGiftTiersState] = useState(getGiftTiers());
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftStars, setNewGiftStars] = useState('50');
  const [newGiftEmoji, setNewGiftEmoji] = useState('🎁');

  // Shop items
  const [shopItems, setShopItemsState] = useState(getShopItems());
  const [newShopName, setNewShopName] = useState('');
  const [newShopEmoji, setNewShopEmoji] = useState('🎁');
  const [newShopCost, setNewShopCost] = useState('20');
  const [newShopType, setNewShopType] = useState<'reward' | 'coupon'>('reward');
  const [newShopDesc, setNewShopDesc] = useState('');

  // Parent messages
  const [messages, setMessagesState] = useState(getParentMessages());
  const [newMsgText, setNewMsgText] = useState('');
  const [newMsgEmoji, setNewMsgEmoji] = useState('💪');

  // Family challenges
  const [challenges, setChallengesState] = useState<FamilyChallenge[]>(getFamilyChallenges());
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeEmoji, setNewChallengeEmoji] = useState('🏠');
  const [newChallengeTarget, setNewChallengeTarget] = useState('5');
  const [newChallengeType, setNewChallengeType] = useState<FamilyChallenge['type']>('all_prayers');
  const [newChallengeDays, setNewChallengeDays] = useState('7');

  // Heatmap child
  const [heatmapChildId, setHeatmapChildId] = useState('');

  // Edit day
  const [editDate, setEditDate] = useState(new Date());
  const [editChildId, setEditChildId] = useState('');

  const refresh = () => {
    setChildren(getChildren());
    setActivities(getCustomActivities());
    setGiftTiersState(getGiftTiers());
    setShopItemsState(getShopItems());
    setMessagesState(getParentMessages());
    setSettingsState(getSettings());
    setChallengesState(getFamilyChallenges());
  };
  useEffect(() => {
    refresh();
    const kids = getChildren();
    if (kids.length > 0 && !heatmapChildId) setHeatmapChildId(kids[0].id);
  }, []);

  if (!pinVerified) {
    return (
      <PinDialog
        open={true}
        onClose={() => navigate('/')}
        onSuccess={() => {
          sessionStorage.setItem('parent-pin-verified', 'true');
          setPinVerified(true);
        }}
      />
    );
  }

  const saveReward = () => {
    const goal = parseInt(rewardGoal) || 50;
    setReward(rewardText, goal);
    setRewardState({ text: rewardText, goal });
    setEditingReward(false);
  };

  const handleDelete = () => { if (deleteTarget) { removeChild(deleteTarget.id); refresh(); setDeleteTarget(null); } };
  const handleReset = () => { if (resetTarget) { resetChildStars(resetTarget.id); refresh(); setResetTarget(null); } };

  const handleChangePin = () => {
    if (newPin.length === 4) {
      setPin(newPin); setNewPin(''); setChangingPin(false); setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  const saveMoneyReward = () => { setMoneyReward(moneyReward); setEditingMoney(false); };

  const handleSaveSetting = (key: string, value: any) => {
    updateSettings({ [key]: value });
    setSettingsState(getSettings());
  };

  const handleAddActivity = () => {
    if (!newActivityName.trim()) return;
    addCustomActivity(newActivityName.trim(), newActivityEmoji, parseInt(newActivityStars) || 1);
    setNewActivityName(''); setNewActivityEmoji('📖'); setNewActivityStars('1');
    refresh();
  };

  const handleAddGift = () => {
    if (!newGiftName.trim()) return;
    addGiftTier(newGiftName.trim(), parseInt(newGiftStars) || 50, newGiftEmoji);
    setNewGiftName(''); setNewGiftStars('50'); setNewGiftEmoji('🎁');
    refresh();
  };

  const editDateStr = localDateStr(editDate);
  const editLog = editChildId ? getDateLog(editChildId, editDateStr) : null;

  const handleEditPrayer = (prayer: PrayerName) => {
    if (!editChildId) return;
    togglePrayerForDate(editChildId, prayer, editDateStr);
    refresh();
  };

  const handleEditJamaah = (prayer: PrayerName) => {
    if (!editChildId) return;
    toggleJamaah(editChildId, prayer, editDateStr);
    refresh();
  };

  // Export
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salat-tracker-backup-${localDateStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const success = await importData(text);
      setImportStatus(success ? 'success' : 'error');
      if (success) refresh();
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick summary stats
  const totalTodayPrayers = children.reduce((sum, c) => {
    const p = getChildProgress(c.id);
    return sum + p.today;
  }, 0);
  const bestChild = children.length > 0
    ? children.reduce((best, c) => (c.totalStars > best.totalStars ? c : best), children[0])
    : null;
  const bestStreak = children.length > 0
    ? children.reduce((best, c) => {
        const s = getStreak(c.id);
        return s.current > best.streak ? { name: c.name, streak: s.current } : best;
      }, { name: '', streak: 0 })
    : null;

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold flex-1">لوحة الوالدين</h1>
          <ThemeToggle />
        </div>

        {/* Quick Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong rounded-2xl p-4 border border-border mb-4"
        >
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-2xl font-extrabold text-gold">{children.length}</p>
              <p className="text-muted-foreground text-xs">أطفال</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-secondary">{totalTodayPrayers}</p>
              <p className="text-muted-foreground text-xs">صلاة اليوم</p>
            </div>
            <div>
              {bestStreak && bestStreak.streak > 0 ? (
                <>
                  <p className="text-2xl font-extrabold text-destructive">🔥{bestStreak.streak}</p>
                  <p className="text-muted-foreground text-xs truncate">{bestStreak.name}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-extrabold text-muted-foreground">-</p>
                  <p className="text-muted-foreground text-xs">أفضل streak</p>
                </>
              )}
            </div>
            <div>
              {bestChild ? (
                <>
                  <p className="text-2xl font-extrabold text-star">⭐</p>
                  <p className="text-muted-foreground text-xs truncate">{bestChild.name}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-extrabold text-muted-foreground">-</p>
                  <p className="text-muted-foreground text-xs">الأفضل</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="children" className="w-full" dir="rtl">
          <TabsList className="w-full flex justify-around bg-card border border-border rounded-2xl p-1.5 mb-4 gap-1">
            {[
              { value: 'children', label: 'الأطفال', Icon: Users, activeClass: 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' },
              { value: 'settings', label: 'الإعدادات', Icon: Settings2, activeClass: 'data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground' },
              { value: 'reports', label: 'التقارير', Icon: BarChart3, activeClass: 'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground' },
              { value: 'rewards', label: 'المكافآت', Icon: Gift, activeClass: 'data-[state=active]:bg-destructive/80 data-[state=active]:text-destructive-foreground' },
              { value: 'cloud', label: 'السحابة', Icon: Cloud, activeClass: 'data-[state=active]:bg-[hsl(200_70%_45%)] data-[state=active]:text-white' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`flex-1 rounded-xl font-bold transition-all min-h-[44px] gap-1.5 px-1 py-2 text-xs ${tab.activeClass}`}
              >
                <tab.Icon size={18} className="shrink-0" />
                <span className="hidden sm:inline text-[11px]">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ===== CHILDREN TAB ===== */}
          <TabsContent value="children" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">الأطفال</h2>
              <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform min-h-[44px]">
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
                  const money = getChildMoney(child.id);
                  const progressPercent = Math.min((progress.total / rewardData.goal) * 100, 100);
                  return (
                    <motion.div key={child.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`bg-card rounded-2xl p-4 border ${achieved ? 'border-primary glow-gold' : 'border-border'}`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20" />
                          <svg className="absolute -inset-1 w-16 h-16 -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                            <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 22}
                              strokeDashoffset={2 * Math.PI * 22 * (1 - progressPercent / 100)}
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-lg truncate">{child.name}</p>
                          <div className="flex gap-3 text-sm flex-wrap">
                            <span className="text-muted-foreground">اليوم: <span className="text-gold font-bold">{progress.today}/٥</span></span>
                            <span className="text-muted-foreground">⭐ <span className="text-star font-bold">{progress.total}</span></span>
                            {moneyReward.enabled && money > 0 && <span className="text-secondary font-bold text-xs">💰 {money}</span>}
                          </div>
                          {achieved && <p className="text-gold text-xs font-bold mt-1">🏆 حقق الهدف!</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => setEditChildState(child)} className="text-muted-foreground hover:text-gold p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" title="تعديل">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setResetTarget(child)} className="text-muted-foreground hover:text-gold p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" title="إعادة تعيين">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(child)} className="text-destructive/60 hover:text-destructive p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" title="حذف">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Edit specific day */}
            {children.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-center gap-2 text-gold font-bold text-sm mb-3">
                  <CalendarDays size={16} /> تعديل يوم محدد
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {children.map(c => (
                    <button key={c.id} onClick={() => setEditChildId(c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                        editChildId === c.id ? 'bg-primary/20 border border-primary text-gold' : 'bg-muted text-muted-foreground'
                      }`}>
                      <img src={AVATAR_IMAGES[c.avatarIndex]} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                      {c.name}
                    </button>
                  ))}
                </div>
                {editChildId && (
                  <>
                    <DateNavigator date={editDate} onDateChange={setEditDate} allowPast allowFuture />
                    <div className="space-y-2">
                      {PRAYER_NAMES.map(prayer => (
                        <PrayerButton
                          key={prayer.key}
                          label={prayer.label}
                          emoji={prayer.emoji}
                          colorClass={prayer.color}
                          prayerKey={prayer.key}
                          done={editLog?.[prayer.key] ?? false}
                          onToggle={() => handleEditPrayer(prayer.key)}
                          jamaahEnabled={settings.jamaahEnabled}
                          jamaahChecked={editLog?.[`${prayer.key}Jamaah` as keyof typeof editLog] as boolean ?? false}
                          onJamaahToggle={() => handleEditJamaah(prayer.key)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* ===== SETTINGS TAB ===== */}
          <TabsContent value="settings" className="space-y-4">
            {/* PIN */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">رمز الدخول</span>
              </div>
              {changingPin ? (
                <div className="flex gap-2 items-center">
                  <input value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="رمز جديد (4 أرقام)" type="tel" maxLength={4}
                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest min-h-[48px]" dir="ltr" />
                  <button onClick={handleChangePin} disabled={newPin.length !== 4} className="gradient-gold text-primary-foreground font-bold px-5 py-2 rounded-xl disabled:opacity-50 min-h-[48px]">حفظ</button>
                  <button onClick={() => { setChangingPin(false); setNewPin(''); }} className="text-muted-foreground px-3 py-2 min-h-[48px]">إلغاء</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">يمكنك تغيير رمز الدخول</p>
                  <button onClick={() => setChangingPin(true)} className="text-gold text-sm font-medium underline min-h-[44px] px-2">تغيير</button>
                </div>
              )}
              {pinSaved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-secondary text-sm mt-2 font-medium">✅ تم تغيير الرمز!</motion.p>}
            </div>

            {/* Jamaah & Past Edit Settings */}
            <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Settings2 size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">إعدادات عامة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-medium">🕌 إظهار خيار الجماعة</span>
                <button onClick={() => handleSaveSetting('jamaahEnabled', !settings.jamaahEnabled)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${settings.jamaahEnabled ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
                  {settings.jamaahEnabled ? 'مفعّل ✅' : 'معطّل'}
                </button>
              </div>
              {settings.jamaahEnabled && (
                <div className="flex gap-2 items-center">
                  <span className="text-foreground text-sm">مكافأة الجماعة:</span>
                  <input value={settings.jamaahRewardAmount} onChange={e => handleSaveSetting('jamaahRewardAmount', parseInt(e.target.value) || 0)}
                    type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center min-h-[44px]" dir="ltr" />
                  <span className="text-muted-foreground text-sm">{moneyReward.currency} لكل صلاة</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-medium">📅 السماح للطفل بتعديل أيام سابقة</span>
                <button onClick={() => handleSaveSetting('allowChildPastEdit', !settings.allowChildPastEdit)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${settings.allowChildPastEdit ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
                  {settings.allowChildPastEdit ? 'مسموح ✅' : 'غير مسموح'}
                </button>
              </div>
            </div>

            {/* Custom Activities */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">أنشطة إضافية</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">أضف أنشطة مثل: حفظ القرآن، مساعدة الأم...</p>
              {activities.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-muted rounded-xl p-3 mb-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm">{a.name}</p>
                    <p className="text-muted-foreground text-xs">+{a.starsPerCompletion} ⭐</p>
                  </div>
                  <button onClick={() => { removeCustomActivity(a.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                <input value={newActivityEmoji} onChange={e => setNewActivityEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg min-h-[44px]" maxLength={2} />
                <input value={newActivityName} onChange={e => setNewActivityName(e.target.value)} placeholder="اسم النشاط..."
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none min-h-[44px]" />
                <input value={newActivityStars} onChange={e => setNewActivityStars(e.target.value)} type="number" placeholder="نجوم"
                  className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm min-h-[44px]" dir="ltr" />
                <button onClick={handleAddActivity} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm min-h-[44px]">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Backup */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Download size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">النسخ الاحتياطي</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-primary/15 text-gold font-bold py-3 rounded-xl min-h-[48px]">
                  <Download size={16} /> تصدير البيانات
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-muted text-muted-foreground font-bold py-3 rounded-xl min-h-[48px]">
                  <Upload size={16} /> استيراد
                </button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              </div>
              {importStatus === 'success' && <p className="text-secondary text-sm mt-2 font-medium">✅ تم استيراد البيانات بنجاح!</p>}
              {importStatus === 'error' && <p className="text-destructive text-sm mt-2 font-medium">❌ فشل الاستيراد - ملف غير صالح</p>}
            </div>

            <ReminderSettings />
          </TabsContent>

          {/* ===== REPORTS TAB ===== */}
          <TabsContent value="reports" className="space-y-4">
            {children.length > 0 ? (
              <>
                {/* Heatmap */}
                <div className="space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {children.map(c => (
                      <button key={c.id} onClick={() => setHeatmapChildId(c.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap min-h-[36px] ${
                          heatmapChildId === c.id ? 'bg-primary/20 border border-primary text-gold' : 'bg-muted text-muted-foreground'
                        }`}>
                        <img src={AVATAR_IMAGES[c.avatarIndex]} alt={c.name} className="w-5 h-5 rounded-full object-cover" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {heatmapChildId && (
                    <Heatmap childId={heatmapChildId} getLogs={getYearlyHeatmapData} />
                  )}
                </div>

                {children.length >= 2 && <ComparisonChart children={children} />}
                {children.length >= 2 && <Leaderboard children={children} />}
                <WeeklyChallenges children={children} />
                <MonthlyChart children={children} />
                <ReportView children={children} />
              </>
            ) : (
              <div className="bg-card rounded-2xl p-8 text-center border border-border">
                <p className="text-muted-foreground">أضف أطفالاً أولاً لرؤية التقارير</p>
              </div>
            )}
          </TabsContent>

          {/* ===== REWARDS TAB ===== */}
          <TabsContent value="rewards" className="space-y-4">
            {/* Main Reward */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={20} className="text-lantern" />
                <span className="font-bold text-lg text-foreground">هدف المكافأة</span>
              </div>
              {editingReward ? (
                <div className="space-y-3">
                  <input value={rewardText} onChange={e => setRewardText(e.target.value)} placeholder="وصف المكافأة..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary min-h-[48px]" />
                  <div className="flex gap-2 items-center">
                    <Star size={16} className="text-star" />
                    <input value={rewardGoal} onChange={e => setRewardGoal(e.target.value)} type="number"
                      className="w-24 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none min-h-[44px]" dir="ltr" />
                    <span className="text-muted-foreground text-sm">نجمة</span>
                  </div>
                  <button onClick={saveReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl min-h-[48px]">حفظ</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{reward.text}</p>
                    <p className="text-muted-foreground text-sm">🌟 {reward.goal} نجمة</p>
                  </div>
                  <button onClick={() => setEditingReward(true)} className="text-gold text-sm font-medium underline min-h-[44px] px-2">تعديل</button>
                </div>
              )}
            </div>

            {/* Gift Tiers */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Target size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">هدايا متعددة</span>
              </div>
              {giftTiers.map(tier => (
                <div key={tier.id} className="flex items-center gap-3 bg-muted rounded-xl p-3 mb-2">
                  <span className="text-2xl">{tier.emoji}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm">{tier.name}</p>
                    <p className="text-muted-foreground text-xs">⭐ {tier.starsRequired} نجمة</p>
                  </div>
                  <button onClick={() => { removeGiftTier(tier.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                <input value={newGiftEmoji} onChange={e => setNewGiftEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg min-h-[44px]" maxLength={2} />
                <input value={newGiftName} onChange={e => setNewGiftName(e.target.value)} placeholder="اسم الهدية..."
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none min-h-[44px]" />
                <input value={newGiftStars} onChange={e => setNewGiftStars(e.target.value)} type="number" placeholder="نجوم"
                  className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm min-h-[44px]" dir="ltr" />
                <button onClick={handleAddGift} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm min-h-[44px]">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Money Reward */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Coins size={20} className="text-secondary" />
                <span className="font-bold text-lg text-foreground">المكافأة المالية</span>
              </div>
              {editingMoney ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-foreground text-sm font-medium whitespace-nowrap">تفعيل:</label>
                    <button onClick={() => setMoneyRewardState(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${moneyReward.enabled ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
                      {moneyReward.enabled ? 'مفعّل ✅' : 'معطّل'}
                    </button>
                  </div>
                  {moneyReward.enabled && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-foreground text-sm">كل</span>
                      <input value={moneyReward.prayersNeeded} onChange={e => setMoneyRewardState(prev => ({ ...prev, prayersNeeded: parseInt(e.target.value) || 5 }))}
                        type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center min-h-[44px]" dir="ltr" />
                      <span className="text-foreground text-sm">صلاة =</span>
                      <input value={moneyReward.amountPerPrayers} onChange={e => setMoneyRewardState(prev => ({ ...prev, amountPerPrayers: parseInt(e.target.value) || 10 }))}
                        type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center min-h-[44px]" dir="ltr" />
                      <input value={moneyReward.currency} onChange={e => setMoneyRewardState(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-20 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none min-h-[44px]" />
                    </div>
                  )}
                  <button onClick={saveMoneyReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl min-h-[48px]">حفظ</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    {moneyReward.enabled ? (
                      <><p className="text-foreground font-medium">كل {moneyReward.prayersNeeded} صلوات = {moneyReward.amountPerPrayers} {moneyReward.currency}</p>
                        <p className="text-muted-foreground text-sm">💰 مفعّلة</p></>
                    ) : <p className="text-muted-foreground text-sm">معطّلة</p>}
                  </div>
                  <button onClick={() => setEditingMoney(true)} className="text-gold text-sm font-medium underline min-h-[44px] px-2">تعديل</button>
                </div>
              )}
            </div>

            {/* Shop Items Management */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={20} className="text-accent" />
                <span className="font-bold text-lg text-foreground">🛍️ متجر المكافآت</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">أضف مكافآت وكوبونات يمكن للطفل شراؤها بنجومه</p>
              {shopItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-muted rounded-xl p-3 mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm">{item.name}</p>
                    <p className="text-muted-foreground text-xs">⭐ {item.cost} — {item.type === 'coupon' ? '🎫 كوبون' : '🎁 مكافأة'}</p>
                  </div>
                  <button onClick={() => { removeShopItem(item.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <button onClick={() => setNewShopType('reward')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold min-h-[36px] ${newShopType === 'reward' ? 'bg-primary/20 text-gold border border-primary' : 'bg-muted text-muted-foreground'}`}>🎁 مكافأة</button>
                  <button onClick={() => setNewShopType('coupon')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold min-h-[36px] ${newShopType === 'coupon' ? 'bg-accent/20 text-accent border border-accent' : 'bg-muted text-muted-foreground'}`}>🎫 كوبون</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <input value={newShopEmoji} onChange={e => setNewShopEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg min-h-[44px]" maxLength={2} />
                  <input value={newShopName} onChange={e => setNewShopName(e.target.value)} placeholder="اسم العنصر..." className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none min-h-[44px]" />
                  <input value={newShopCost} onChange={e => setNewShopCost(e.target.value)} type="number" placeholder="تكلفة" className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm min-h-[44px]" dir="ltr" />
                  <button onClick={() => {
                    if (!newShopName.trim()) return;
                    addShopItem({ name: newShopName.trim(), emoji: newShopEmoji, cost: parseInt(newShopCost) || 20, type: newShopType, description: newShopDesc || undefined });
                    setNewShopName(''); setNewShopEmoji('🎁'); setNewShopCost('20'); setNewShopDesc('');
                    refresh();
                  }} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm min-h-[44px]">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Parent Messages */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Star size={20} className="text-gold" />
                <span className="font-bold text-lg text-foreground">💬 رسائل تشجيعية</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">أرسل رسالة تشجيعية تظهر للطفل عند فتح التطبيق</p>
              {messages.map(msg => (
                <div key={msg.id} className="flex items-center gap-3 bg-muted rounded-xl p-3 mb-2">
                  <span className="text-xl">{msg.emoji}</span>
                  <p className="text-foreground text-sm flex-1">{msg.text}</p>
                  <button onClick={() => { removeParentMessage(msg.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                <input value={newMsgEmoji} onChange={e => setNewMsgEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg min-h-[44px]" maxLength={2} />
                <input value={newMsgText} onChange={e => setNewMsgText(e.target.value)} placeholder="اكتب رسالة تشجيعية..." className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none min-h-[44px]" />
                <button onClick={() => {
                  if (!newMsgText.trim()) return;
                  addParentMessage(newMsgText.trim(), newMsgEmoji);
                  setNewMsgText(''); setNewMsgEmoji('💪');
                  refresh();
                }} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm min-h-[44px]">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Family Challenges */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-secondary" />
                <span className="font-bold text-lg text-foreground">🏠 تحدي الأسرة</span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">أنشئ تحدياً مشتركاً لجميع الأطفال</p>
              {challenges.filter(c => c.active).map(ch => (
                <div key={ch.id} className="flex items-center gap-3 bg-secondary/10 rounded-xl p-3 mb-2 border border-secondary/30">
                  <span className="text-2xl">{ch.emoji}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm">{ch.title}</p>
                    <p className="text-muted-foreground text-xs">🎯 {ch.target} — {ch.startDate} إلى {ch.endDate}</p>
                  </div>
                  <button onClick={() => { removeFamilyChallenge(ch.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="space-y-2 mt-2">
                <div className="flex gap-2 flex-wrap">
                  <input value={newChallengeEmoji} onChange={e => setNewChallengeEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg min-h-[44px]" maxLength={2} />
                  <input value={newChallengeTitle} onChange={e => setNewChallengeTitle(e.target.value)} placeholder="عنوان التحدي..." className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none min-h-[44px]" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select value={newChallengeType} onChange={e => setNewChallengeType(e.target.value as FamilyChallenge['type'])}
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm min-h-[44px]">
                    <option value="all_prayers">جميع الصلوات</option>
                    <option value="fajr_streak">صلاة الفجر</option>
                    <option value="jamaah">صلاة الجماعة</option>
                    <option value="custom">مخصص</option>
                  </select>
                  <input value={newChallengeTarget} onChange={e => setNewChallengeTarget(e.target.value)} type="number" placeholder="هدف" className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm min-h-[44px]" dir="ltr" />
                  <input value={newChallengeDays} onChange={e => setNewChallengeDays(e.target.value)} type="number" placeholder="أيام" className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm min-h-[44px]" dir="ltr" />
                  <button onClick={() => {
                    if (!newChallengeTitle.trim()) return;
                    addFamilyChallenge(newChallengeTitle.trim(), newChallengeEmoji, parseInt(newChallengeTarget) || 5, newChallengeType, parseInt(newChallengeDays) || 7);
                    setNewChallengeTitle(''); setNewChallengeEmoji('🏠'); setNewChallengeTarget('5'); setNewChallengeDays('7');
                    refresh();
                  }} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm min-h-[44px]">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ===== CLOUD TAB ===== */}
          <TabsContent value="cloud" className="space-y-4">
            <CloudSyncPanel onDataRestored={refresh} />
          </TabsContent>
        </Tabs>
      </div>

      <AddChildDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />
      <EditChildDialog open={!!editChild} child={editChild} onClose={() => setEditChildState(null)} onSaved={refresh} />
      <ConfirmDialog open={!!deleteTarget} title="حذف الطفل" message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟`}
        confirmText="حذف" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} destructive />
      <ConfirmDialog open={!!resetTarget} title="إعادة تعيين النجوم" message={`إعادة نجوم "${resetTarget?.name}" إلى صفر؟`}
        confirmText="إعادة تعيين" onConfirm={handleReset} onCancel={() => setResetTarget(null)} />
    </div>
  );
}
