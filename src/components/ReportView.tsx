import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { getWeeklyLogs, getMonthlyLogs, getYearlyStats, getJamaahCount, getStreak, getChildProgress, getPrayerAnalysis, AVATAR_IMAGES, PRAYER_NAMES, type Child } from '@/lib/store';
import { Copy, Check, Trophy, Download, TrendingUp, TrendingDown } from 'lucide-react';

const DAY_NAMES_SHORT = ['أحد', 'إثن', 'ثلا', 'أربع', 'خمي', 'جمع', 'سبت'];
const CHILD_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
};

interface Props {
  children: Child[];
}

export default function ReportView({ children }: Props) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [view, setView] = useState<'weekly' | 'monthly' | 'compare'>('weekly');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const weekly = selectedChild ? getWeeklyLogs(selectedChild) : [];
  const now = new Date();
  const monthly = selectedChild ? getMonthlyLogs(selectedChild, now.getFullYear(), now.getMonth()) : [];
  const jamaahTotal = selectedChild ? getJamaahCount(selectedChild) : 0;
  const prayerAnalysis = selectedChild ? getPrayerAnalysis(selectedChild) : null;

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

  // Radar chart data for prayer analysis
  const radarData = prayerAnalysis ? [
    { prayer: 'الفجر', نسبة: prayerAnalysis.fajr },
    { prayer: 'الظهر', نسبة: prayerAnalysis.dhuhr },
    { prayer: 'العصر', نسبة: prayerAnalysis.asr },
    { prayer: 'المغرب', نسبة: prayerAnalysis.maghrib },
    { prayer: 'العشاء', نسبة: prayerAnalysis.isha },
  ] : [];

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

  // Export report as PNG using Canvas API
  const exportAsPng = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const el = reportRef.current;
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = el.offsetWidth * scale;
      canvas.height = el.offsetHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.scale(scale, scale);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
        ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--background').trim()})`
        : '#1a1a2e'; // theme-allow: PNG export fallback when CSS vars unavailable
      ctx.fillRect(0, 0, el.offsetWidth, el.offsetHeight);

      // Use html-to-image approach via SVG foreignObject
      const data = new XMLSerializer().serializeToString(el);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.offsetWidth}" height="${el.offsetHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
        </foreignObject>
      </svg>`;
      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => {
          if (!b) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(b);
          a.download = `تقرير-الصلاة.png`;
          a.click();
          URL.revokeObjectURL(a.href);
          setExporting(false);
        }, 'image/png');
      };
      img.onerror = () => {
        // Fallback: just copy text
        copyReport();
        setExporting(false);
      };
      img.src = url;
    } catch {
      setExporting(false);
    }
  }, [selectedChild]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-foreground">📊 التقارير</h3>
        <div className="flex items-center gap-1">
          <button onClick={exportAsPng} disabled={exporting} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold min-h-[44px] px-2" aria-label="تصدير كصورة">
            <Download size={14} />
            {exporting ? 'جاري...' : 'تصدير PNG'}
          </button>
          <button onClick={copyReport} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold min-h-[44px] px-2" aria-label="نسخ التقرير">
            {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>
        </div>
      </div>

      {/* Child selector */}
      {children.length > 1 && view !== 'compare' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" role="tablist" aria-label="اختيار الطفل">
          {children.map(child => (
            <button
              key={child.id}
              role="tab"
              aria-selected={selectedChild === child.id}
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
      <div className="flex gap-2 mb-4" role="tablist" aria-label="نوع التقرير">
        <button
          role="tab"
          aria-selected={view === 'weekly'}
          onClick={() => setView('weekly')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'weekly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          أسبوعي
        </button>
        <button
          role="tab"
          aria-selected={view === 'monthly'}
          onClick={() => setView('monthly')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'monthly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          شهري
        </button>
        {children.length > 1 && (
          <button
            role="tab"
            aria-selected={view === 'compare'}
            onClick={() => setView('compare')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${view === 'compare' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            مقارنة
          </button>
        )}
      </div>

      <div ref={reportRef}>
        {/* Compare View */}
        {view === 'compare' && children.length > 1 && (
          <>
            {/* Leaderboard */}
            <div className="mb-4">
              <h4 className="text-foreground font-bold text-sm mb-3 flex items-center gap-1">
                <Trophy size={14} className="text-gold" /> لوحة الصدارة
              </h4>
              <div className="space-y-2" role="list" aria-label="ترتيب الأطفال">
                {leaderboard.map((child, i) => (
                  <motion.div
                    key={child.id}
                    role="listitem"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}
                  >
                    <span className="text-lg font-extrabold text-gold w-6 text-center" aria-label={`المركز ${i + 1}`}>{i + 1}</span>
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
            <div className="h-48 mb-4" aria-label="رسم بياني للمقارنة">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="أسبوع" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="نجوم" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
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

            {/* Prayer Analysis - Strongest/Weakest */}
            {prayerAnalysis && prayerAnalysis.totalDays > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-center">
                  <TrendingUp size={18} className="text-secondary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-0.5">أقوى صلاة</p>
                  <p className="font-bold text-secondary text-sm">
                    {PRAYER_LABELS[prayerAnalysis.strongest]} {PRAYER_NAMES.find(p => p.key === prayerAnalysis.strongest)?.emoji}
                  </p>
                  <p className="text-xs text-muted-foreground">{prayerAnalysis[prayerAnalysis.strongest]}%</p>
                </div>
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center">
                  <TrendingDown size={18} className="text-destructive mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-0.5">أضعف صلاة</p>
                  <p className="font-bold text-destructive text-sm">
                    {PRAYER_LABELS[prayerAnalysis.weakest]} {PRAYER_NAMES.find(p => p.key === prayerAnalysis.weakest)?.emoji}
                  </p>
                  <p className="text-xs text-muted-foreground">{prayerAnalysis[prayerAnalysis.weakest]}%</p>
                </div>
              </div>
            )}

            {/* Radar Chart - Prayer Performance */}
            {prayerAnalysis && prayerAnalysis.totalDays > 0 && (
              <div className="h-48 mb-4" aria-label="تحليل أداء الصلوات">
                <p className="text-xs text-muted-foreground text-center mb-1">📈 تحليل أداء الصلوات</p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="prayer" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Radar name="نسبة" dataKey="نسبة" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view === 'weekly' ? weeklyChart : monthlyChart}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="صلوات" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
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
                        <Cell key={i} fill={i === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--border))'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} />
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
      </div>
    </motion.div>
  );
}
