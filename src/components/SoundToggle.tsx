import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getMuted, setMuted, preloadSounds } from '@/lib/sounds';

export default function SoundToggle() {
  const [muted, setM] = useState<boolean>(() => getMuted());

  useEffect(() => {
    const handler = (e: Event) => setM((e as CustomEvent<boolean>).detail);
    window.addEventListener('sound-muted-change', handler as EventListener);
    return () => window.removeEventListener('sound-muted-change', handler as EventListener);
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setM(next);
    if (!next) preloadSounds();
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      aria-pressed={muted}
      className="p-2 rounded-xl border border-border bg-card/60 backdrop-blur-sm hover:bg-card transition-colors text-foreground"
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}
