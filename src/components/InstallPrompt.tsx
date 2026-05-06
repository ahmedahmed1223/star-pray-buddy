import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Hide on native platforms
    if (Capacitor.isNativePlatform()) return;
    const dismissed = storageGet('pwa-install-dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    storageSet('pwa-install-dismissed', 'true');
  };

  if (dismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        className="fixed bottom-20 left-4 right-4 z-[60] max-w-md mx-auto"
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl glow-gold">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-2.5 rounded-xl">
              <Download size={22} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-bold text-sm">ثبّت التطبيق على هاتفك 📱</p>
              <p className="text-muted-foreground text-xs mt-0.5">للوصول السريع والعمل بدون إنترنت</p>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground p-1">
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInstall}
              className="flex-1 gradient-gold text-primary-foreground font-bold text-sm py-2.5 rounded-xl"
            >
              تثبيت الآن
            </motion.button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-muted-foreground text-sm font-medium bg-muted rounded-xl"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
