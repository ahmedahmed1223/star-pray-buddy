import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudUpload, CloudDownload, Trash2, LogOut, LogIn, Loader2, Check, X, RefreshCw, User as UserIcon, Users, Link2Off, ShieldCheck } from 'lucide-react';
import { useAuth, signOut } from '@/lib/auth';
import { listBackups, uploadBackup, restoreBackup, deleteBackup, type CloudBackup, isAutoSyncEnabled, setAutoSyncEnabled } from '@/lib/cloudSync';
import { listFamilyKids, syncKidsToCloud, unlinkFamilyKid, type FamilyKidRow } from '@/lib/familySync';
import { supabase } from '@/integrations/supabase/client';

export default function CloudAccountPanel({ onDataRestored }: { onDataRestored: () => void }) {
  const { user, loading } = useAuth();
  const [backups, setBackups] = useState<CloudBackup[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [auto, setAuto] = useState(isAutoSyncEnabled());
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const show = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const refresh = async () => {
    setBusy('list');
    try {
      const list = await listBackups();
      setBackups(list);
    } catch (e: any) {
      show('error', e.message || 'فشل الجلب');
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (user) {
      refresh();
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle().then(({ data }) => {
        setProfileName(data?.display_name || user.email?.split('@')[0] || '');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleBackup = async () => {
    setBusy('backup');
    try {
      await uploadBackup();
      show('success', 'تم رفع النسخة بنجاح ☁️');
      await refresh();
    } catch (e: any) {
      show('error', e.message || 'فشل الرفع');
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async (id: string) => {
    setBusy('restore-' + id);
    setConfirmRestore(null);
    try {
      const ok = await restoreBackup(id);
      if (ok) { onDataRestored(); show('success', 'تم الاستعادة بنجاح ✓'); }
      else show('error', 'النسخة غير صالحة');
    } catch (e: any) {
      show('error', e.message || 'فشل الاستعادة');
    } finally { setBusy(null); }
  };

  const handleDelete = async (id: string) => {
    setBusy('del-' + id);
    setConfirmDelete(null);
    try {
      await deleteBackup(id);
      setBackups(b => b.filter(x => x.id !== id));
      show('success', 'تم الحذف');
    } catch (e: any) {
      show('error', e.message || 'فشل الحذف');
    } finally { setBusy(null); }
  };

  const toggleAuto = (v: boolean) => { setAuto(v); setAutoSyncEnabled(v); };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' });
  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(1)} MB`;

  if (loading) {
    return <div className="bg-card rounded-2xl p-5 border border-border flex items-center justify-center"><Loader2 className="animate-spin text-gold" /></div>;
  }

  if (!user) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Cloud size={20} className="text-gold" />
          <span className="font-bold text-lg text-foreground">حساب العائلة السحابي</span>
        </div>
        <p className="text-muted-foreground text-xs">
          سجّل دخولك لمزامنة بيانات الأطفال بين أجهزتك ولحفظ نسخ احتياطية تلقائياً.
        </p>
        <Link to="/auth" className="w-full flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-bold py-3 rounded-xl min-h-[48px]">
          <LogIn size={18} /> تسجيل الدخول / إنشاء حساب
        </Link>
        <p className="text-[11px] text-muted-foreground text-center">التطبيق يعمل كاملاً بدون تسجيل — الحساب اختياري</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Cloud size={20} className="text-gold" />
          <span className="font-bold text-lg text-foreground">حساب العائلة السحابي</span>
          <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium mr-auto">متصل</span>
        </div>

        <div className="flex items-center gap-2 bg-muted rounded-xl p-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <UserIcon size={18} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{profileName || 'مستخدم'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button onClick={() => signOut()} className="text-destructive/70 hover:text-destructive p-2" title="خروج">
            <LogOut size={16} />
          </button>
        </div>

        <label className="flex items-center justify-between bg-muted rounded-xl p-3 mb-3 cursor-pointer">
          <span className="text-sm text-foreground">مزامنة تلقائية يومية</span>
          <input type="checkbox" checked={auto} onChange={e => toggleAuto(e.target.checked)} className="w-5 h-5 accent-[hsl(var(--gold))]" />
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleBackup}
            disabled={busy === 'backup'}
            className="flex-1 flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-bold py-3 rounded-xl min-h-[48px] disabled:opacity-50"
          >
            {busy === 'backup' ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
            رفع نسخة الآن
          </button>
          <button
            onClick={refresh}
            disabled={busy === 'list'}
            className="bg-muted text-muted-foreground font-bold px-4 rounded-xl min-h-[48px] disabled:opacity-50"
          >
            <RefreshCw size={16} className={busy === 'list' ? 'animate-spin' : ''} />
          </button>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`mt-3 flex items-center gap-2 text-sm font-medium ${msg.type === 'success' ? 'text-secondary' : 'text-destructive'}`}>
              {msg.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <p className="font-bold text-sm text-foreground mb-3">النسخ السحابية ({backups.length})</p>
        {backups.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">لا توجد نسخ بعد. اضغط "رفع نسخة الآن".</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {backups.map(b => (
              <div key={b.id} className="bg-muted rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-foreground text-xs font-medium truncate flex-1">{b.name}</p>
                  <span className="text-muted-foreground text-xs mr-2">{fmtSize(b.size_bytes)}</span>
                </div>
                <p className="text-muted-foreground text-xs mb-2">{fmtDate(b.created_at)}</p>
                <div className="flex gap-2">
                  {confirmRestore === b.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-destructive font-medium">استبدال البيانات الحالية؟</span>
                      <button onClick={() => handleRestore(b.id)} className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-lg font-bold">نعم</button>
                      <button onClick={() => setConfirmRestore(null)} className="text-xs text-muted-foreground px-2">لا</button>
                    </div>
                  ) : confirmDelete === b.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-destructive font-medium">حذف نهائي؟</span>
                      <button onClick={() => handleDelete(b.id)} className="text-xs bg-destructive/20 text-destructive px-3 py-1 rounded-lg font-bold">نعم</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-muted-foreground px-2">لا</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmRestore(b.id)}
                        disabled={!!busy}
                        className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary/10 text-gold font-bold py-1.5 rounded-lg min-h-[32px] disabled:opacity-50"
                      >
                        {busy === 'restore-' + b.id ? <Loader2 size={12} className="animate-spin" /> : <CloudDownload size={12} />}
                        استعادة
                      </button>
                      <button
                        onClick={() => setConfirmDelete(b.id)}
                        disabled={!!busy}
                        className="flex items-center justify-center text-destructive/60 hover:text-destructive p-1.5 min-w-[32px] min-h-[32px] disabled:opacity-50"
                      >
                        {busy === 'del-' + b.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
