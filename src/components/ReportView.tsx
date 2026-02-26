import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getWeeklyLogs, getMonthlyLogs, getYearlyStats, getJamaahCount, getStreak, getChildProgress, AVATAR_IMAGES, type Child } from '@/lib/store';
import { Copy, Check, Trophy } from 'lucide-react';

const DAY_NAMES_SHORT = ['أحد', 'إثن', 'ثلا', 'أربع', 'خمي', 'جمع', 'سبت'];
const CHILD_COLORS = ['hsl(42, 100%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(280, 50%, 55%)', 'hsl(25, 95%, 55%)', 'hsl(200, 70%, 50%)'];

interface Props {
  children: Child[];
}

export default function ReportView({ children }: Props) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [view, setView] = useState<'weekly' | 'monthly' | 'compare'>('weekly');
  const [copied, setCopied] = useState(false);

  const weekly = selectedChild ? getWeeklyLogs(selectedChild) : [];
  const now = new Date();
  const monthly = selectedChild ? getMonthlyLogs(selectedChild, now.getFullYear(), now.getMonth()) : [];
  const jamaahTotal = selectedChild ? getJamaahCount(selectedChild) : 0;

  const weeklyChart = weekly.map(d => {
    const day = new Date(d.date);
    return { name: DAY_NAMES_SHORT[day.getDay()], صلوات: d.count };
  });

  const monthlyChart = monthly.map(d => ({
    name: String(new Date(d.date).getDate()),
    صلوات: d.count,
  }));

  const totalWeekPrayers = weekly.reduce((s, d) => s + d.count, 0);
  const fullDays = weekly.filter(d => d.count === 5).length;
  const totalMonthPrayers = monthly.reduce((s, d) => s + d.count, 0);
  const daysInMonth = monthly.length;
  const monthFullDays = monthly.filter(d => d.count === 5).length;

  const pieData = [
    { name: 'مكتملة', value: view === 'weekly' ? fullDays : monthFullDays },
    { name: 'غير مكتملة', value: view === 'weekly' ? (7 - fullDays) : (daysInMonth - monthFullDays) },
  ];

  // Multi-child comparison
  const comparisonData = children.map(child => {
    const w = getWeeklyLogs(child.id);
    const s = getStreak(child.id);
    const p = getChildProgress(child.id);
    return {
      name: child.name,
      أسبوع: w.reduce((sum, d) => sum + d.count, 0),
      streak: s.current,
      نجوم: p.total,
    };
  });

  // Leaderboard
  const leaderboard = children
    .map(child => {
      const s = getStreak(child.id);
      const p = getChildProgress(child.id);
      const w = getWeeklyLogs(child.id);
      return {
        ...child,
        streak: s.current,
        bestStreak: s.best,
        weekPrayers: w.reduce((sum, d) => sum + d.count, 0),
        totalStars: p.total,
      };
    })
    .sort((a, b) => b.totalStars - a.totalStars);

  const copyReport = () => {
    const child = children.find(c => c.id === selectedChild);
    if (!child) return;
    const streak = getStreak(selectedChild);
    const text = `📊 تقرير ${child.name}\n` +
      `⭐ النجوم: ${getChildProgress(selectedChild).total}\n` +
      `🔥 Streak: ${streak.current} يوم (أفضل: ${streak.best})\n` +
      `📅 صلوات الأسبوع: ${totalWeekPrayers}/35\n` +
      `✅ أيام كاملة: ${fullDays}/7\n` +
      `🕌 جماعة: ${jamaahTotal}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-foreground">📊 التقارير</h3>
        <button onClick={copyReport} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold min-h-[44px] px-2">
          {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
          {copied ? 'تم النسخ' : 'نسخ التقرير'}
        </button>
      </div>

      {/* Child selector */}
      {children.length > 1 && view !== 'compare' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                selectedChild === child.id ? 'bg-primary/20 border border-primary text-gold' : 'bg-muted text-muted-foreground'
              }`}
            >
              <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-6 h-6 rounded-full object-cover" />
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('weekly')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'weekly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          أسبوعي
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'monthly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          شهري
        </button>
        {children.length > 1 && (
          <button
            onClick={() => setView('compare')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'compare' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            مقارنة
          </button>
        )}
      </div>

      {/* Compare View */}
      {view === 'compare' && children.length > 1 && (
        <>
          {/* Leaderboard */}
          <div className="mb-4">
            <h4 className="text-foreground font-bold text-sm mb-3 flex items-center gap-1">
              <Trophy size={14} className="text-gold" /> لوحة الصدارة
            </h4>
            <div className="space-y-2">
              {leaderboard.map((child, i) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}
                >
                  <span className="text-lg font-extrabold text-gold w-6 text-center">{i + 1}</span>
                  <img src={AVATAR_IMAGES[child.avatarIndex]} alt={child.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-bold text-sm truncate">{child.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>⭐ {child.totalStars}</span>
                      {child.streak > 0 && <span>🔥 {child.streak}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{child.weekPrayers}/35 أسبوعي</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Comparison chart */}
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'hsl(230, 40%, 16%)', border: '1px solid hsl(230, 30%, 25%)', borderRadius: '12px', color: 'hsl(45, 100%, 95%)' }} />
                <Bar dataKey="أسبوع" fill="hsl(42, 100%, 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="نجوم" fill="hsl(160, 60%, 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Individual View */}
      {view !== 'compare' && selectedChild && (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-gold">{view === 'weekly' ? totalWeekPrayers : totalMonthPrayers}</p>
              <p className="text-xs text-muted-foreground">صلاة</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-star">{view === 'weekly' ? fullDays : monthFullDays}</p>
              <p className="text-xs text-muted-foreground">يوم كامل</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-secondary">{jamaahTotal}</p>
              <p className="text-xs text-muted-foreground">جماعة</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view === 'weekly' ? weeklyChart : monthlyChart}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'hsl(230, 40%, 16%)', border: '1px solid hsl(230, 30%, 25%)', borderRadius: '12px', color: 'hsl(45, 100%, 95%)' }} />
                <Bar dataKey="صلوات" fill="hsl(42, 100%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="flex justify-center">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? 'hsl(42, 100%, 55%)' : 'hsl(230, 30%, 25%)'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(230, 40%, 16%)', border: '1px solid hsl(230, 30%, 25%)', borderRadius: '12px', color: 'hsl(45, 100%, 95%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-2 mr-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-muted-foreground">أيام كاملة</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-sm bg-border" />
                <span className="text-muted-foreground">غير مكتملة</span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
