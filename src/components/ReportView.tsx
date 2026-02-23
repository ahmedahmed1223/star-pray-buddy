import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getWeeklyLogs, getMonthlyLogs, getYearlyStats, getJamaahCount, AVATAR_IMAGES, type Child } from '@/lib/store';

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAY_NAMES_SHORT = ['أحد', 'إثن', 'ثلا', 'أربع', 'خمي', 'جمع', 'سبت'];
const COLORS = ['hsl(42, 100%, 55%)', 'hsl(160, 60%, 40%)', 'hsl(280, 50%, 55%)', 'hsl(25, 95%, 55%)', 'hsl(200, 70%, 50%)'];

interface Props {
  children: Child[];
}

export default function ReportView({ children }: Props) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '');
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

  const weekly = selectedChild ? getWeeklyLogs(selectedChild) : [];
  const now = new Date();
  const monthly = selectedChild ? getMonthlyLogs(selectedChild, now.getFullYear(), now.getMonth()) : [];
  const yearly = selectedChild ? getYearlyStats(selectedChild) : [];
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
      <h3 className="font-bold text-lg text-foreground mb-3">📊 التقارير</h3>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
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
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'weekly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          أسبوعي
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'monthly' ? 'gradient-gold text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          شهري
        </button>
      </div>

      {selectedChild && (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-gold">{view === 'weekly' ? totalWeekPrayers : totalMonthPrayers}</p>
              <p className="text-[10px] text-muted-foreground">صلاة</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-star">{view === 'weekly' ? fullDays : monthFullDays}</p>
              <p className="text-[10px] text-muted-foreground">يوم كامل</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-secondary">{jamaahTotal}</p>
              <p className="text-[10px] text-muted-foreground">جماعة</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view === 'weekly' ? weeklyChart : monthlyChart}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fill: 'hsl(230, 20%, 65%)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(230, 40%, 16%)', border: '1px solid hsl(230, 30%, 25%)', borderRadius: '12px', color: 'hsl(45, 100%, 95%)' }}
                />
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
