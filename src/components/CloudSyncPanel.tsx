import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStoredClientId, setStoredClientId, isGoogleConnected, clearGoogleAuth,
  authenticateGoogle, uploadBackup, listBackups, downloadBackup, deleteBackup,
  getLastBackupDate, loadGIS, type BackupInfo
} from '@/lib/google-drive';
import { exportData, importData } from '@/lib/store';
import { Cloud, CloudUpload, CloudDownload, Trash2, LogOut, Key, RefreshCw, Check, X, Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function CloudSyncPanel({ onDataRestored }: { onDataRestored: () => void }) {
  const [clientId, setClientId] = useState(getStoredClientId());
  const [editingClientId, setEditingClientId] = useState(false);
  const [tempClientId, setTempClientId] = useState('');
  const [connected, setConnected] = useState(isGoogleConnected());
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastBackup, setLastBackup] = useState(getLastBackupDate());
  const [showBackups, setShowBackups] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) loadGIS().catch(() => {});
  }, [clientId]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveClientId = () => {
    if (!tempClientId.trim()) return;
    setStoredClientId(tempClientId.trim());
    setClientId(tempClientId.trim());
    setEditingClientId(false);
    showMsg('success', 'تم حفظ Client ID بنجاح');
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await authenticateGoogle();
      setConnected(true);
      showMsg('success', 'تم الاتصال بـ Google Drive بنجاح ✓');
    } catch (err: any) {
      showMsg('error', err.message || 'فشل الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearGoogleAuth();
    setConnected(false);
    setBackups([]);
    showMsg('success', 'تم قطع الاتصال');
  };

  const handleBackup = async () => {
    setActionLoading('backup');
    try {
      const data = exportData();
      await uploadBackup(data);
      setLastBackup(getLastBackupDate());
      showMsg('success', 'تم حفظ النسخة الاحتياطية بنجاح ☁️');
      if (showBackups) await handleListBackups();
    } catch (err: any) {
      if (err.message?.includes('فشل')) {
        clearGoogleAuth();
        setConnected(false);
      }
      showMsg('error', err.message || 'فشل النسخ الاحتياطي');
    } finally {
      setActionLoading(null);
    }
  };

  const handleListBackups = async () => {
    setActionLoading('list');
    try {
      const list = await listBackups();
      setBackups(list);
      setShowBackups(true);
    } catch (err: any) {
      if (err.message?.includes('فشل')) {
        clearGoogleAuth();
        setConnected(false);
      }
      showMsg('error', err.message || 'فشل جلب النسخ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (fileId: string) => {
    setActionLoading(`restore-${fileId}`);
    setConfirmRestore(null);
    try {
      const jsonStr = await downloadBackup(fileId);
      const success = await importData(jsonStr);
      if (success) {
        onDataRestored();
        showMsg('success', 'تم استعادة البيانات بنجاح ✓');
      } else {
        showMsg('error', 'ملف النسخة الاحتياطية غير صالح');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'فشل الاستعادة');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (fileId: string) => {
    setActionLoading(`delete-${fileId}`);
    setConfirmDelete(null);
    try {
      await deleteBackup(fileId);
      setBackups(prev => prev.filter(b => b.id !== fileId));
      showMsg('success', 'تم حذف النسخة الاحتياطية');
    } catch (err: any) {
      showMsg('error', err.message || 'فشل الحذف');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const formatSize = (bytes: string) => {
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Cloud size={20} className="text-gold" />
          <span className="font-bold text-lg text-foreground">مزامنة Google Drive</span>
          {connected && (
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium mr-auto">متصل</span>
          )}
        </div>
        <p className="text-muted-foreground text-xs mb-3">
          احفظ بياناتك على Google Drive الخاص بك واسترجعها على أي جهاز
        </p>

        {/* Setup Instructions */}
        {!clientId && (
          <div className="mb-3">
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="flex items-center gap-2 text-gold text-sm font-medium w-full"
            >
              <Info size={14} />
              <span>كيفية الإعداد</span>
              {showSetup ? <ChevronUp size={14} className="mr-auto" /> : <ChevronDown size={14} className="mr-auto" />}
            </button>
            <AnimatePresence>
              {showSetup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted rounded-xl p-3 mt-2 text-xs text-muted-foreground space-y-2" dir="rtl">
                    <p className="font-bold text-foreground">خطوات الإعداد:</p>
                    <ol className="list-decimal mr-4 space-y-1.5">
                      <li>اذهب إلى <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="text-gold underline">Google Cloud Console</a></li>
                      <li>أنشئ مشروعاً جديداً أو اختر مشروعاً موجوداً</li>
                      <li>فعّل <strong>Google Drive API</strong> من قائمة APIs</li>
                      <li>اذهب إلى <strong>Credentials</strong> ← <strong>Create Credentials</strong> ← <strong>OAuth Client ID</strong></li>
                      <li>اختر <strong>Web application</strong></li>
                      <li>أضف <code className="bg-background px-1 rounded">{window.location.origin}</code> في <strong>Authorized JavaScript origins</strong></li>
                      <li>انسخ <strong>Client ID</strong> والصقه هنا</li>
                    </ol>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      💡 يجب أيضاً إعداد <strong>OAuth consent screen</strong> وإضافة بريدك كـ Test user
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Client ID Input */}
        {!clientId || editingClientId ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">Google Client ID</span>
            </div>
            <div className="flex gap-2">
              <input
                value={tempClientId}
                onChange={e => setTempClientId(e.target.value)}
                placeholder="xxxxxxxxx.apps.googleusercontent.com"
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-xs outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                dir="ltr"
              />
              <button onClick={handleSaveClientId} disabled={!tempClientId.trim()} className="gradient-gold text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50 min-h-[44px]">
                حفظ
              </button>
              {editingClientId && (
                <button onClick={() => setEditingClientId(false)} className="text-muted-foreground px-2 min-h-[44px]">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ) : !connected ? (
          <div className="space-y-2">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 gradient-gold text-primary-foreground font-bold py-3 rounded-xl min-h-[48px] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
              {loading ? 'جاري الاتصال...' : 'الاتصال بـ Google Drive'}
            </button>
            <button
              onClick={() => { setEditingClientId(true); setTempClientId(clientId); }}
              className="text-xs text-muted-foreground underline w-full text-center min-h-[32px]"
            >
              تغيير Client ID
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Backup / Restore buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                disabled={actionLoading === 'backup'}
                className="flex-1 flex items-center justify-center gap-2 bg-primary/15 text-gold font-bold py-3 rounded-xl min-h-[48px] disabled:opacity-50"
              >
                {actionLoading === 'backup' ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                حفظ نسخة
              </button>
              <button
                onClick={handleListBackups}
                disabled={actionLoading === 'list'}
                className="flex-1 flex items-center justify-center gap-2 bg-muted text-muted-foreground font-bold py-3 rounded-xl min-h-[48px] disabled:opacity-50"
              >
                {actionLoading === 'list' ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
                استعادة
              </button>
            </div>

            {/* Last backup info */}
            {lastBackup && (
              <p className="text-xs text-muted-foreground text-center">
                آخر نسخة: {formatDate(lastBackup)}
              </p>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setEditingClientId(true); setTempClientId(clientId); }}
                className="text-xs text-muted-foreground underline min-h-[32px]"
              >
                تغيير Client ID
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive min-h-[32px]"
              >
                <LogOut size={12} /> قطع الاتصال
              </button>
            </div>
          </div>
        )}

        {/* Status message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                message.type === 'success' ? 'text-secondary' : 'text-destructive'
              }`}
            >
              {message.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backups list */}
      <AnimatePresence>
        {showBackups && connected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-foreground text-sm">النسخ الاحتياطية المتاحة</span>
                <button onClick={handleListBackups} className="text-muted-foreground p-1 min-w-[32px] min-h-[32px] flex items-center justify-center">
                  <RefreshCw size={14} className={actionLoading === 'list' ? 'animate-spin' : ''} />
                </button>
              </div>

              {backups.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">لا توجد نسخ احتياطية بعد</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backups.map((backup) => (
                    <div key={backup.id} className="bg-muted rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-foreground text-xs font-medium truncate flex-1">{backup.name}</p>
                        <span className="text-muted-foreground text-xs mr-2">{formatSize(backup.size)}</span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-2">{formatDate(backup.modifiedTime)}</p>
                      <div className="flex gap-2">
                        {confirmRestore === backup.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-destructive font-medium">استبدال البيانات الحالية؟</span>
                            <button
                              onClick={() => handleRestore(backup.id)}
                              disabled={!!actionLoading}
                              className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-lg font-bold min-h-[32px]"
                            >
                              نعم
                            </button>
                            <button
                              onClick={() => setConfirmRestore(null)}
                              className="text-xs text-muted-foreground px-2 py-1 min-h-[32px]"
                            >
                              لا
                            </button>
                          </div>
                        ) : confirmDelete === backup.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-destructive font-medium">حذف هذه النسخة؟</span>
                            <button
                              onClick={() => handleDelete(backup.id)}
                              disabled={!!actionLoading}
                              className="text-xs bg-destructive/20 text-destructive px-3 py-1 rounded-lg font-bold min-h-[32px]"
                            >
                              نعم
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-muted-foreground px-2 py-1 min-h-[32px]"
                            >
                              لا
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setConfirmRestore(backup.id)}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-primary/10 text-gold font-bold py-1.5 rounded-lg min-h-[32px] disabled:opacity-50"
                            >
                              {actionLoading === `restore-${backup.id}` ? <Loader2 size={12} className="animate-spin" /> : <CloudDownload size={12} />}
                              استعادة
                            </button>
                            <button
                              onClick={() => setConfirmDelete(backup.id)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center text-destructive/60 hover:text-destructive p-1.5 min-w-[32px] min-h-[32px] disabled:opacity-50"
                            >
                              {actionLoading === `delete-${backup.id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
