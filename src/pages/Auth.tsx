import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { signInEmail, signUpEmail, signInGoogle, resetPassword, useAuth } from '@/lib/auth';
import { hapticLight, hapticSuccess } from '@/lib/haptics';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && user) navigate('/parent', { replace: true });
  }, [user, loading, navigate]);

  const show = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4500);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    hapticLight();
    try {
      if (mode === 'signup') {
        const { error } = await signUpEmail(email, password, name || undefined);
        if (error) throw error;
        hapticSuccess();
        show('success', 'تم إنشاء الحساب! تحقق من بريدك لتأكيد التسجيل.');
      } else if (mode === 'signin') {
        const { error } = await signInEmail(email, password);
        if (error) throw error;
        hapticSuccess();
        navigate('/parent', { replace: true });
      } else {
        const { error } = await resetPassword(email);
        if (error) throw error;
        show('success', 'تم إرسال رابط استعادة كلمة المرور لبريدك.');
      }
    } catch (err: any) {
      const m = err?.message || '';
      if (m.includes('Invalid login')) show('error', 'البريد أو كلمة المرور غير صحيحة');
      else if (m.includes('already registered') || m.includes('User already')) show('error', 'هذا البريد مسجّل بالفعل');
      else show('error', m || 'حدث خطأ');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const r = await signInGoogle();
      if (r.error) throw r.error;
    } catch (err: any) {
      show('error', err?.message || 'فشل تسجيل الدخول بـ Google');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌙</div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'signup' ? 'إنشاء حساب' : mode === 'reset' ? 'استعادة كلمة المرور' : 'تسجيل الدخول'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            احفظ بيانات عائلتك في السحابة وتزامن بين الأجهزة
          </p>
        </div>

        {/* Google */}
        {mode !== 'reset' && (
          <>
            <button
              onClick={google}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-bold py-3 rounded-xl border border-border min-h-[48px] disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
              المتابعة بواسطة Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">أو</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="الاسم"
                className="w-full bg-muted border border-border rounded-xl pr-10 pl-3 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              dir="ltr"
              className="w-full bg-muted border border-border rounded-xl pr-10 pl-3 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
            />
          </div>
          {mode !== 'reset' && (
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                dir="ltr"
                className="w-full bg-muted border border-border rounded-xl pr-10 pl-3 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-bold py-3 rounded-xl min-h-[48px] disabled:opacity-50"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : mode === 'signup' ? <UserPlus size={18} /> : mode === 'reset' ? <Mail size={18} /> : <LogIn size={18} />}
            {mode === 'signup' ? 'إنشاء الحساب' : mode === 'reset' ? 'إرسال رابط الاستعادة' : 'تسجيل الدخول'}
          </button>
        </form>

        {msg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mt-3 text-sm text-center font-medium ${msg.type === 'success' ? 'text-secondary' : 'text-destructive'}`}
          >
            {msg.text}
          </motion.div>
        )}

        <div className="mt-5 space-y-2 text-center text-sm">
          {mode === 'signin' && (
            <>
              <button onClick={() => setMode('reset')} className="text-muted-foreground underline">نسيت كلمة المرور؟</button>
              <p className="text-muted-foreground">
                لا تملك حساباً؟{' '}
                <button onClick={() => setMode('signup')} className="text-gold font-bold">أنشئ واحداً</button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-muted-foreground">
              لديك حساب؟{' '}
              <button onClick={() => setMode('signin')} className="text-gold font-bold">سجّل دخول</button>
            </p>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} className="text-gold font-bold">العودة لتسجيل الدخول</button>
          )}
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowRight size={12} />
          متابعة بدون حساب
        </Link>
      </motion.div>
    </div>
  );
}
