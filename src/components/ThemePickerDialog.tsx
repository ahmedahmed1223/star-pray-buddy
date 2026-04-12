import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CHILD_THEMES, type ChildThemeName } from '@/lib/store';
import { Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  currentTheme: ChildThemeName;
  onSelect: (theme: ChildThemeName) => void;
}

export default function ThemePickerDialog({ open, onClose, currentTheme, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl text-center">🎨 اختر ثيمك</DialogTitle>
          <DialogDescription className="text-muted-foreground text-center text-sm">
            اختر لوناً مميزاً لصفحتك
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(Object.entries(CHILD_THEMES) as [ChildThemeName, typeof CHILD_THEMES[ChildThemeName]][]).map(([key, theme]) => {
            const isActive = currentTheme === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onSelect(key); onClose(); }}
                className={`relative rounded-2xl p-4 border-2 transition-all text-center ${
                  isActive ? 'border-primary glow-gold' : 'border-border hover:border-muted-foreground/30'
                }`}
                style={{
                  background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))`,
                }}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 bg-card rounded-full p-0.5"
                  >
                    <Check size={14} className="text-gold" />
                  </motion.div>
                )}
                <span className="text-3xl block mb-1">{theme.emoji}</span>
                <span className="text-white font-bold text-sm drop-shadow-lg">{theme.label}</span>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
