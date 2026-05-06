import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, Check, BookOpen } from 'lucide-react';
import { AZKAR_SECTIONS, getSection, type AzkarSection } from '@/lib/azkar';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { storageGet, storageSet } from '@/lib/storage';
import ThemeToggle from '@/components/ThemeToggle';
import SoundToggle from '@/components/SoundToggle';
import BottomNav from '@/components/BottomNav';
import { localDateStr } from '@/lib/store';

const lastResetKey = (sectionId: string, childId: string) => `azkar-reset-${childId}-${sectionId}`;
const countersKey = (sectionId: string, childId: string) => `azkar-counters-${childId}-${sectionId}`;

function loadCounters(sectionId: string, childId: string): Record<string, number> {
  const today = localDateStr();
  const last = storageGet(lastResetKey(sectionId, childId));
  if (last !== today) {
    // new day → reset
    storageSet(lastResetKey(sectionId, childId), today);
    storageSet(countersKey(sectionId, childId), '{}');
    return {};
  }
  try { return JSON.parse(storageGet(countersKey(sectionId, childId)) || '{}'); }
  catch { return {}; }
}

function saveCounters(sectionId: string, childId: string, counters: Record<string, number>) {
  storageSet(countersKey(sectionId, childId), JSON.stringify(counters));
}

function SectionList({ childId }: { childId: string }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-3 px-4 pt-4 pb-32" dir="rtl">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="text-gold" size={22} />
        <h1 className="text-2xl font-bold text-foreground">الأذكار</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">من حصن المسلم — ذكر الله طمأنينة للقلب 💚</p>
      {AZKAR_SECTIONS.map((s, i) => (
        <motion.button
          key={s.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { hapticLight(); navigate(`/azkar/${childId}/${s.id}`); }}
          className="w-full bg-card hover:bg-muted/50 active:bg-muted border border-border rounded-2xl p-4 flex items-center gap-3 text-right transition-colors"
        >
          <div className="text-3xl">{s.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
            <div className="text-xs text-gold mt-1">{s.items.length} ذكر</div>
          </div>
          <ChevronRight className="text-muted-foreground rotate-180" size={20} />
        </motion.button>
      ))}
    </div>
  );
}

function SectionReader({ section, childId }: { section: AzkarSection; childId: string }) {
  const navigate = useNavigate();
  const [counters, setCounters] = useState<Record<string, number>>(() => loadCounters(section.id, childId));

  useEffect(() => { saveCounters(section.id, childId, counters); }, [counters, section.id, childId]);

  const completedCount = useMemo(
    () => section.items.filter(z => (counters[z.id] ?? 0) >= z.count).length,
    [counters, section.items]
  );
  const allDone = completedCount === section.items.length;
  const progress = (completedCount / section.items.length) * 100;

  function tap(z: { id: string; count: number }) {
    const cur = counters[z.id] ?? 0;
    if (cur >= z.count) return;
    const next = cur + 1;
    if (next >= z.count) hapticSuccess(); else hapticLight();
    setCounters({ ...counters, [z.id]: next });
  }

  function reset(id: string) {
    hapticLight();
    setCounters({ ...counters, [id]: 0 });
  }

  function resetAll() {
    hapticLight();
    setCounters({});
  }

  return (
    <div className="px-4 pt-4 pb-32" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="رجوع"
          className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={22} />
        </button>
        <div className="text-center flex-1">
          <div className="text-xl">{section.emoji}</div>
          <h1 className="font-bold text-foreground">{section.title}</h1>
        </div>
        <button
          onClick={resetAll}
          aria-label="إعادة الكل"
          className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="إعادة العدّ"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">التقدم</span>
          <span className="text-gold font-bold">{completedCount} / {section.items.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-gold to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-primary/15 border border-primary/30 text-gold rounded-2xl p-4 mb-4 text-center font-bold"
            role="status"
            aria-live="polite"
          >
            ✨ جزاك الله خيراً، أتممت {section.title} ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items */}
      <div className="space-y-3">
        {section.items.map((z, i) => {
          const cur = counters[z.id] ?? 0;
          const done = cur >= z.count;
          return (
            <motion.div
              key={z.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`relative rounded-2xl border p-4 transition-all ${
                done
                  ? 'bg-secondary/10 border-secondary/40'
                  : 'bg-card border-border'
              }`}
            >
              <p className="text-foreground leading-loose text-[15px]" style={{ fontFamily: '"Cairo", "Amiri", serif' }}>
                {z.text}
              </p>
              {z.fadl && (
                <p className="text-xs text-muted-foreground mt-2 border-r-2 border-gold/40 pr-2">
                  💡 {z.fadl}
                </p>
              )}
              {z.source && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">— {z.source}</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => tap(z)}
                  disabled={done}
                  aria-label={done ? 'مكتمل' : `زيادة العدّ، الحالي ${cur} من ${z.count}`}
                  className={`flex-1 min-h-[48px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    done
                      ? 'bg-secondary/20 text-secondary cursor-default'
                      : 'gradient-gold text-primary-foreground active:opacity-90'
                  }`}
                >
                  {done ? (
                    <><Check size={18} /> تم</>
                  ) : (
                    <span className="text-lg tabular-nums">{cur} / {z.count}</span>
                  )}
                </motion.button>
                {cur > 0 && !done && (
                  <button
                    onClick={() => reset(z.id)}
                    aria-label="إعادة"
                    className="min-w-[44px] min-h-[48px] rounded-xl bg-muted text-muted-foreground flex items-center justify-center"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Azkar() {
  const { childId = 'guest', sectionId } = useParams();
  const section = sectionId ? getSection(sectionId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto relative">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md flex items-center justify-end gap-2 px-3 py-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
        {section ? (
          <SectionReader section={section} childId={childId} />
        ) : (
          <SectionList childId={childId} />
        )}
        <BottomNav childId={childId} />
      </div>
    </div>
  );
}
