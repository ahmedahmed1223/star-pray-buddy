import { storageGet, storageSet, storageRemove } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'salat-theme';

export function getStoredTheme(): 'dark' | 'light' {
  return (storageGet(THEME_KEY) as 'dark' | 'light') || 'dark';
}

export function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.toggle('light', theme === 'light');
  storageSet(THEME_KEY, theme);
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9, rotate: 180 }}
      onClick={toggle}
      className={`p-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${className}`}
      title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? <Sun size={20} className="text-gold" /> : <Moon size={20} className="text-accent" />}
      </motion.div>
    </motion.button>
  );
}
