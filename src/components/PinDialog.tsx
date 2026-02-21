import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPin } from '@/lib/store';
import { Lock, X } from 'lucide-react';

interface PinDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinDialog({ open, onClose, onSuccess }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (verifyPin(next)) {
        setTimeout(() => { setPin(''); onSuccess(); }, 200);
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 800);
      }
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-xs shadow-xl border border-border"
            dir="ltr"
          >
            <div className="flex justify-between items-center mb-4" dir="rtl">
              <div className="flex items-center gap-2 text-gold">
                <Lock size={20} />
                <span className="font-bold text-lg">رمز الوالدين</span>
              </div>
              <button onClick={() => { setPin(''); onClose(); }} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                    pin.length > i
                      ? error ? 'border-destructive bg-destructive/20 text-destructive' : 'border-primary bg-primary/20 text-gold'
                      : 'border-border bg-muted'
                  }`}
                >
                  {pin.length > i ? '⭐' : ''}
                </motion.div>
              ))}
            </div>

            {error && (
              <p className="text-center text-destructive text-sm mb-3">رمز خاطئ، حاول مرة أخرى!</p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((item, idx) => (
                <div key={idx}>
                  {item === null ? <div /> : item === 'del' ? (
                    <button
                      onClick={handleDelete}
                      className="w-full h-14 rounded-xl bg-muted text-foreground font-bold text-lg active:scale-95 transition-transform"
                    >
                      ←
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDigit(String(item))}
                      className="w-full h-14 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xl active:scale-95 transition-transform"
                    >
                      {item}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-muted-foreground text-xs mt-4" dir="rtl">الرمز الافتراضي: ١٢٣٤</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
