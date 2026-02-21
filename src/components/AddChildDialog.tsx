import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addChild, AVATARS } from '@/lib/store';
import { X, UserPlus } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddChildDialog({ open, onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;
    addChild(name.trim(), avatarIndex);
    setName('');
    setAvatarIndex(0);
    onAdded();
    onClose();
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
          >
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2 text-gold">
                <UserPlus size={20} />
                <span className="font-bold text-lg">Add Child</span>
              </div>
              <button onClick={onClose} className="text-muted-foreground"><X size={20} /></button>
            </div>

            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Child's name..."
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-lg font-medium mb-5 outline-none focus:ring-2 focus:ring-primary"
            />

            <p className="text-sm text-muted-foreground mb-2 font-medium">Choose an Avatar:</p>
            <div className="grid grid-cols-6 gap-2 mb-6">
              {AVATARS.map((av, i) => (
                <button
                  key={i}
                  onClick={() => setAvatarIndex(i)}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    avatarIndex === i
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="w-full gradient-gold text-primary-foreground font-bold text-lg py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              Add ⭐
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
