import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles } from 'lucide-react';
import {
  SEASONAL_THEMES, getStoredSeasonalTheme, setStoredSeasonalTheme,
  detectAutoTheme, type SeasonalThemeKey,
} from '@/lib/seasonalThemes';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SeasonalThemePicker({ open, onClose }: Props) {
  const [current, setCurrent] = useState<SeasonalThemeKey>('auto');

  useEffect(() => { if (open) setCurrent(getStoredSeasonalTheme()); }, [open]);

  const auto = detectAutoTheme();
  const handleSelect = (key: SeasonalThemeKey) => {
    setStoredSeasonalTheme(key);
    setCurrent(key);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-md p-3"
          onClick={onClose}
          role="dialog" aria-modal="true" aria-label="اختر الثيم الموسمي"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            className="bg-card border border-border rounded-3xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gold flex items-center gap-2">
                  <Sparkles size={20} /> الثيم الموسمي
                </h2>
                <p className="text-muted-foreground text-xs mt-1">اختر مظهراً يناسب الموسم أو المناسبة</p>
              </div>
              <button
                onClick={onClose}
                aria-label="إغلاق"
                className="p-2 rounded-xl hover:bg-muted min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Auto option */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect('auto')}
              className={`w-full p-4 rounded-2xl mb-3 border-2 flex items-center gap-3 text-right transition-all ${
                current === 'auto' ? 'border-primary bg-primary/10 glow-gold' : 'border-border bg-muted/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl shrink-0">
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-foreground">تلقائي حسب التاريخ</p>
                <p className="text-xs text-muted-foreground truncate">
                  حالياً: {SEASONAL_THEMES[auto].emoji} {SEASONAL_THEMES[auto].label}
                </p>
              </div>
              {current === 'auto' && <Check size={20} className="text-gold shrink-0" />}
            </motion.button>

            {/* Manual themes grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(SEASONAL_THEMES).map((t) => {
                const selected = current === t.key;
                return (
                  <motion.button
                    key={t.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(t.key)}
                    className={`relative p-3 rounded-2xl border-2 text-right transition-all overflow-hidden ${
                      selected ? 'border-primary' : 'border-border'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${t.bgFrom}), hsl(${t.bgTo}))`,
                    }}
                    aria-pressed={selected}
                  >
                    {selected && (
                      <div className="absolute top-1.5 left-1.5 bg-gold rounded-full p-0.5">
                        <Check size={12} className="text-background" />
                      </div>
                    )}
                    <div className="text-3xl mb-1">{t.emoji}</div>
                    <p className="font-bold text-sm" style={{ color: `hsl(${t.glow})` }}>{t.label}</p>
                    <p className="text-[10px] leading-tight mt-0.5 opacity-80" style={{ color: `hsl(${t.glow})` }}>
                      {t.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-muted-foreground text-xs mt-4">
              💡 يُحفظ اختيارك ويُطبَّق على كل الصفحات
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
