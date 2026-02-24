import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getChildren, getChildProgress, getReward, setReward, removeChild, resetChildStars, setPin,
  getMoneyReward, setMoneyReward, getChildMoney, getSettings, updateSettings,
  getCustomActivities, addCustomActivity, removeCustomActivity,
  getGiftTiers, addGiftTier, removeGiftTier,
  getDateLog, togglePrayerForDate, toggleJamaah,
  AVATAR_IMAGES, PRAYER_NAMES, type Child, type MoneyReward, type PrayerName
} from '@/lib/store';
import AddChildDialog from '@/components/AddChildDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import MonthlyChart from '@/components/MonthlyChart';
import ReminderSettings from '@/components/ReminderSettings';
import ReportView from '@/components/ReportView';
import DateNavigator from '@/components/DateNavigator';
import PrayerButton from '@/components/PrayerButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft, Plus, Trash2, Gift, Star, KeyRound, RotateCcw, Coins,
  Settings2, Target, BookOpen, BarChart3, CalendarDays, Users
} from 'lucide-react';

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
  const [moneyReward, setMoneyRewardState] = useState<MoneyReward>(getMoneyReward());
  const [editingMoney, setEditingMoney] = useState(false);
  const [settings, setSettingsState] = useState(getSettings());

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

  // Edit day
  const [editDate, setEditDate] = useState(new Date());
  const [editChild, setEditChild] = useState('');

  const refresh = () => {
    setChildren(getChildren());
    setActivities(getCustomActivities());
    setGiftTiersState(getGiftTiers());
    setSettingsState(getSettings());
  };
  useEffect(refresh, []);

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

  const editDateStr = editDate.toISOString().split('T')[0];
  const editLog = editChild ? getDateLog(editChild, editDateStr) : null;

  const handleEditPrayer = (prayer: PrayerName) => {
    if (!editChild) return;
    togglePrayerForDate(editChild, prayer, editDateStr);
    refresh();
  };

  const handleEditJamaah = (prayer: PrayerName) => {
    if (!editChild) return;
    toggleJamaah(editChild, prayer, editDateStr);
    refresh();
  };

  // Quick summary stats
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTodayPrayers = children.reduce((sum, c) => {
    const p = getChildProgress(c.id);
    return sum + p.today;
  }, 0);
  const bestChild = children.length > 0
    ? children.reduce((best, c) => (c.totalStars > best.totalStars ? c : best), children[0])
    : null;

  return (
    <div className="min-h-screen gradient-night p-4 pb-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="text-muted-foreground p-2 rounded-xl hover:bg-muted">
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gold">لوحة الوالدين</h1>
        </div>

        {/* Quick Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 border border-border mb-4"
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-extrabold text-gold">{children.length}</p>
              <p className="text-muted-foreground text-xs">أطفال</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-secondary">{totalTodayPrayers}</p>
              <p className="text-muted-foreground text-xs">صلاة اليوم</p>
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
          <TabsList className="w-full grid grid-cols-4 bg-card border border-border rounded-2xl h-12 mb-4">
            <TabsTrigger value="children" className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Users size={14} /> الأطفال
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Settings2 size={14} /> الإعدادات
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <BarChart3 size={14} /> التقارير
            </TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-xl text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Gift size={14} /> المكافآت
            </TabsTrigger>
          </TabsList>

          {/* ===== CHILDREN TAB ===== */}
          <TabsContent value="children" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">الأطفال</h2>
              <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform">
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
                          {/* Circular progress ring */}
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
                          <button onClick={() => setResetTarget(child)} className="text-muted-foreground hover:text-gold p-1.5" title="إعادة تعيين">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(child)} className="text-destructive/60 hover:text-destructive p-1.5" title="حذف">
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
                    <button key={c.id} onClick={() => setEditChild(c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        editChild === c.id ? 'bg-primary/20 border border-primary text-gold' : 'bg-muted text-muted-foreground'
                      }`}>
                      <img src={AVATAR_IMAGES[c.avatarIndex]} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                      {c.name}
                    </button>
                  ))}
                </div>
                {editChild && (
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
                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest" dir="ltr" />
                  <button onClick={handleChangePin} disabled={newPin.length !== 4} className="gradient-gold text-primary-foreground font-bold px-5 py-2 rounded-xl disabled:opacity-50">حفظ</button>
                  <button onClick={() => { setChangingPin(false); setNewPin(''); }} className="text-muted-foreground px-3 py-2">إلغاء</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">يمكنك تغيير رمز الدخول</p>
                  <button onClick={() => setChangingPin(true)} className="text-gold text-sm font-medium underline">تغيير</button>
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
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${settings.jamaahEnabled ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
                  {settings.jamaahEnabled ? 'مفعّل ✅' : 'معطّل'}
                </button>
              </div>
              {settings.jamaahEnabled && (
                <div className="flex gap-2 items-center">
                  <span className="text-foreground text-sm">مكافأة الجماعة:</span>
                  <input value={settings.jamaahRewardAmount} onChange={e => handleSaveSetting('jamaahRewardAmount', parseInt(e.target.value) || 0)}
                    type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center" dir="ltr" />
                  <span className="text-muted-foreground text-sm">{moneyReward.currency} لكل صلاة</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-medium">📅 السماح للطفل بتعديل أيام سابقة</span>
                <button onClick={() => handleSaveSetting('allowChildPastEdit', !settings.allowChildPastEdit)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${settings.allowChildPastEdit ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
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
                  <button onClick={() => { removeCustomActivity(a.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                <input value={newActivityEmoji} onChange={e => setNewActivityEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg" maxLength={2} />
                <input value={newActivityName} onChange={e => setNewActivityName(e.target.value)} placeholder="اسم النشاط..."
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none" />
                <input value={newActivityStars} onChange={e => setNewActivityStars(e.target.value)} type="number" placeholder="نجوم"
                  className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm" dir="ltr" />
                <button onClick={handleAddActivity} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <ReminderSettings />
          </TabsContent>

          {/* ===== REPORTS TAB ===== */}
          <TabsContent value="reports" className="space-y-4">
            {children.length > 0 ? (
              <>
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
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex gap-2 items-center">
                    <Star size={16} className="text-star" />
                    <input value={rewardGoal} onChange={e => setRewardGoal(e.target.value)} type="number"
                      className="w-24 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none" dir="ltr" />
                    <span className="text-muted-foreground text-sm">نجمة</span>
                  </div>
                  <button onClick={saveReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl">حفظ</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{reward.text}</p>
                    <p className="text-muted-foreground text-sm">🌟 {reward.goal} نجمة</p>
                  </div>
                  <button onClick={() => setEditingReward(true)} className="text-gold text-sm font-medium underline">تعديل</button>
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
                  <button onClick={() => { removeGiftTier(tier.id); refresh(); }} className="text-destructive/60 hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 flex-wrap">
                <input value={newGiftEmoji} onChange={e => setNewGiftEmoji(e.target.value)} className="w-12 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-lg" maxLength={2} />
                <input value={newGiftName} onChange={e => setNewGiftName(e.target.value)} placeholder="اسم الهدية..."
                  className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none" />
                <input value={newGiftStars} onChange={e => setNewGiftStars(e.target.value)} type="number" placeholder="نجوم"
                  className="w-16 bg-muted border border-border rounded-xl px-2 py-2 text-foreground text-center text-sm" dir="ltr" />
                <button onClick={handleAddGift} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm">
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
                      className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${moneyReward.enabled ? 'bg-secondary/20 text-secondary border border-secondary' : 'bg-muted text-muted-foreground'}`}>
                      {moneyReward.enabled ? 'مفعّل ✅' : 'معطّل'}
                    </button>
                  </div>
                  {moneyReward.enabled && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-foreground text-sm">كل</span>
                      <input value={moneyReward.prayersNeeded} onChange={e => setMoneyRewardState(prev => ({ ...prev, prayersNeeded: parseInt(e.target.value) || 5 }))}
                        type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center" dir="ltr" />
                      <span className="text-foreground text-sm">صلاة =</span>
                      <input value={moneyReward.amountPerPrayers} onChange={e => setMoneyRewardState(prev => ({ ...prev, amountPerPrayers: parseInt(e.target.value) || 10 }))}
                        type="number" className="w-16 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none text-center" dir="ltr" />
                      <input value={moneyReward.currency} onChange={e => setMoneyRewardState(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-20 bg-muted border border-border rounded-xl px-3 py-2 text-foreground outline-none" />
                    </div>
                  )}
                  <button onClick={saveMoneyReward} className="gradient-gold text-primary-foreground font-bold px-6 py-2 rounded-xl">حفظ</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    {moneyReward.enabled ? (
                      <><p className="text-foreground font-medium">كل {moneyReward.prayersNeeded} صلوات = {moneyReward.amountPerPrayers} {moneyReward.currency}</p>
                        <p className="text-muted-foreground text-sm">💰 مفعّلة</p></>
                    ) : <p className="text-muted-foreground text-sm">معطّلة</p>}
                  </div>
                  <button onClick={() => setEditingMoney(true)} className="text-gold text-sm font-medium underline">تعديل</button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddChildDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />
      <ConfirmDialog open={!!deleteTarget} title="حذف الطفل" message={`هل أنت متأكد من حذف "${deleteTarget?.name}"؟`}
        confirmText="حذف" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} destructive />
      <ConfirmDialog open={!!resetTarget} title="إعادة تعيين النجوم" message={`إعادة نجوم "${resetTarget?.name}" إلى صفر؟`}
        confirmText="إعادة تعيين" onConfirm={handleReset} onCancel={() => setResetTarget(null)} />
    </div>
  );
}
