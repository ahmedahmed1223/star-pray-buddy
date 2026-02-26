import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateChild, AVATAR_IMAGES, AVATAR_LABELS, type Child } from '@/lib/store';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  child: Child | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditChildDialog({ open, child, onClose, onSaved }: Props) {
  const [name, setName] = useState(child?.name ?? '');
  const [avatarIndex, setAvatarIndex] = useState(child?.avatarIndex ?? 0);

  // Sync state when child changes
  if (child && name === '' && child.name !== '') {
    setName(child.name);
    setAvatarIndex(child.avatarIndex);
  }

  const handleSave = () => {
    if (!child || !name.trim()) return;
    updateChild(child.id, { name: name.trim(), avatarIndex });
    onSaved();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && child && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 border border-border w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">تعديل بيانات الطفل</h3>
              <button onClick={onClose} className="text-muted-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground text-sm font-medium mb-1 block">الاسم</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                  placeholder="اسم الطفل"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">الصورة</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarIndex(i)}
                      className={`rounded-xl p-1 border-2 transition-all min-w-[48px] min-h-[48px] ${
                        avatarIndex === i ? 'border-primary glow-gold' : 'border-border'
                      }`}
                    >
                      <img src={img} alt={AVATAR_LABELS[i]} className="w-full rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full gradient-gold text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-50 min-h-[48px]"
              >
                حفظ التعديلات
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
