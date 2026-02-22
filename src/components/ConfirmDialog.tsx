import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({ open, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', onConfirm, onCancel, destructive }: Props) {
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
            className="bg-card rounded-2xl p-6 w-full max-w-xs shadow-xl border border-border text-center"
          >
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="text-foreground font-bold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground mb-5">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 bg-muted text-foreground font-bold py-3 rounded-xl active:scale-95 transition-transform"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 font-bold py-3 rounded-xl active:scale-95 transition-transform ${
                  destructive
                    ? 'bg-destructive text-destructive-foreground'
                    : 'gradient-gold text-primary-foreground'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
