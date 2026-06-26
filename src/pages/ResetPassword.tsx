import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase auto-handles recovery hash; nothing to do here.
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('تم تحديث كلمة المرور بنجاح');
    setTimeout(() => navigate('/parent'), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-3"
      >
        <h1 className="text-xl font-bold text-foreground text-center">كلمة مرور جديدة</h1>
        <div className="relative">
          <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة" dir="ltr"
            className="w-full bg-muted border border-border rounded-xl pr-10 pl-3 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
          />
        </div>
        <button disabled={busy} className="w-full gradient-gold text-primary-foreground font-bold py-3 rounded-xl min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 size={16} className="animate-spin" />} حفظ
        </button>
        {msg && <p className="text-sm text-secondary text-center">{msg}</p>}
        {err && <p className="text-sm text-destructive text-center">{err}</p>}
      </motion.form>
    </div>
  );
}
