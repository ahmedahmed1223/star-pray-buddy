import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageCircle, X, Award, Flame, Star } from 'lucide-react';
import { Child, LEVELS, Level } from '@/lib/store';

// Sanitize text for safe SVG embedding (prevent XSS)
function escapeSVGText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface CertificateProps {
  child: Child;
  levelInfo: { level: Level; nextLevel: Level | null; progress: number; starsToNext: number };
  streak: { current: number; best: number };
  earnedBadgesCount: number;
  totalBadges: number;
  totalStars: number;
  onClose: () => void;
}

type TemplateType = 'general' | 'prayer_hero' | 'golden_streak';

const LEVEL_THEMES: Record<number, { bg1: string; bg2: string; accent: string; frame: string }> = {
  0: { bg1: '#1a2a4a', bg2: '#0d1b2a', accent: '#7ec8e3', frame: '#5ba3c9' },
  1: { bg1: '#1a3a2a', bg2: '#0d2a1a', accent: '#6ecf8e', frame: '#4aaf6e' },
  2: { bg1: '#3a2a1a', bg2: '#2a1a0d', accent: '#f0c040', frame: '#d4a017' },
  3: { bg1: '#2a1a3a', bg2: '#1a0d2a', accent: '#b388ff', frame: '#9c6aff' },
  4: { bg1: '#3a2a0a', bg2: '#2a1a05', accent: '#ffd700', frame: '#ffb300' },
};

function generateSVG(
  template: TemplateType,
  child: Child,
  levelInfo: CertificateProps['levelInfo'],
  streak: CertificateProps['streak'],
  earnedBadgesCount: number,
  totalBadges: number,
  totalStars: number
): string {
  const theme = LEVEL_THEMES[levelInfo.level.id] || LEVEL_THEMES[0];
  const date = new Date().toLocaleDateString('ar-SA');

  const templateTitles: Record<TemplateType, string> = {
    general: '🏆 شهادة إنجاز 🏆',
    prayer_hero: '🕌 بطل الصلاة 🕌',
    golden_streak: '🔥 السلسلة الذهبية 🔥',
  };

  const templateSubtitles: Record<TemplateType, string> = {
    general: 'يُمنح هذا التقدير لـ',
    prayer_hero: 'يُمنح لقب بطل الصلاة لـ',
    golden_streak: `حقق سلسلة مذهلة من ${streak.best} يوم متواصل`,
  };

  // Decorative stars scattered
  const stars = Array.from({ length: 18 }, (_, i) => {
    const x = 50 + Math.random() * 700;
    const y = 30 + Math.random() * 500;
    const size = 2 + Math.random() * 4;
    const opacity = 0.2 + Math.random() * 0.5;
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="${theme.accent}" opacity="${opacity}"/>`;
  }).join('');

  // Islamic geometric border pattern
  const borderPattern = `
    <defs>
      <pattern id="islamicBorder" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="${theme.frame}" stroke-width="0.8" opacity="0.4"/>
        <circle cx="20" cy="20" r="3" fill="${theme.frame}" opacity="0.3"/>
      </pattern>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${theme.bg1}"/>
        <stop offset="100%" style="stop-color:${theme.bg2}"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${theme.frame}"/>
        <stop offset="50%" style="stop-color:${theme.accent}"/>
        <stop offset="100%" style="stop-color:${theme.frame}"/>
      </linearGradient>
      <linearGradient id="sealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${theme.accent}"/>
        <stop offset="100%" style="stop-color:${theme.frame}"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  // Mosque silhouette at bottom
  const mosque = `
    <g opacity="0.15" transform="translate(250, 460)">
      <!-- Central dome -->
      <path d="M150 100 Q150 40 200 20 Q250 0 300 20 Q350 40 350 100 Z" fill="${theme.accent}"/>
      <!-- Left minaret -->
      <rect x="100" y="30" width="20" height="80" fill="${theme.accent}" rx="3"/>
      <circle cx="110" cy="25" r="12" fill="${theme.accent}"/>
      <!-- Right minaret -->
      <rect x="380" y="30" width="20" height="80" fill="${theme.accent}" rx="3"/>
      <circle cx="390" cy="25" r="12" fill="${theme.accent}"/>
      <!-- Crescent on dome -->
      <path d="M245 10 Q255 -5 265 10 Q255 5 245 10Z" fill="${theme.accent}"/>
      <!-- Base -->
      <rect x="80" y="100" width="340" height="15" fill="${theme.accent}" rx="3"/>
    </g>
  `;

  // Lanterns
  const lanternLeft = `
    <g transform="translate(60, 40)" opacity="0.6">
      <line x1="20" y1="0" x2="20" y2="15" stroke="${theme.accent}" stroke-width="1.5"/>
      <path d="M10 15 Q10 10 20 8 Q30 10 30 15 L28 45 Q20 50 12 45 Z" fill="${theme.accent}" opacity="0.5"/>
      <ellipse cx="20" cy="28" rx="4" ry="6" fill="${theme.accent}" opacity="0.8"/>
    </g>
  `;
  const lanternRight = `
    <g transform="translate(700, 40)" opacity="0.6">
      <line x1="20" y1="0" x2="20" y2="15" stroke="${theme.accent}" stroke-width="1.5"/>
      <path d="M10 15 Q10 10 20 8 Q30 10 30 15 L28 45 Q20 50 12 45 Z" fill="${theme.accent}" opacity="0.5"/>
      <ellipse cx="20" cy="28" rx="4" ry="6" fill="${theme.accent}" opacity="0.8"/>
    </g>
  `;

  // Crescent moon top center
  const crescent = `
    <g transform="translate(380, 30)" filter="url(#glow)">
      <path d="M0 20 Q5 0 20 0 Q12 5 12 20 Q12 35 20 40 Q5 40 0 20Z" fill="${theme.accent}" opacity="0.7"/>
    </g>
  `;

  // Achievement seal
  const seal = `
    <g transform="translate(640, 380)">
      <circle cx="50" cy="50" r="45" fill="url(#sealGrad)" opacity="0.2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="${theme.accent}" stroke-width="0.5" opacity="0.5"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 50 + 35 * Math.cos(angle);
        const y1 = 50 + 35 * Math.sin(angle);
        const x2 = 50 + 42 * Math.cos(angle);
        const y2 = 50 + 42 * Math.sin(angle);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${theme.accent}" stroke-width="1.5" opacity="0.6"/>`;
      }).join('')}
      <text x="50" y="45" text-anchor="middle" fill="${theme.accent}" font-size="16" font-family="Cairo, Arial">✓</text>
      <text x="50" y="63" text-anchor="middle" fill="${theme.accent}" font-size="9" font-family="Cairo, Arial" font-weight="700">محقق</text>
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
    ${borderPattern}
    
    <!-- Background -->
    <rect width="800" height="560" fill="url(#bgGrad)" rx="24"/>
    
    <!-- Islamic geometric border overlay -->
    <rect x="8" y="8" width="784" height="544" fill="url(#islamicBorder)" rx="20" opacity="0.3"/>
    
    <!-- Decorative frame -->
    <rect x="20" y="20" width="760" height="520" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" rx="16"/>
    <rect x="30" y="30" width="740" height="500" fill="none" stroke="${theme.frame}" stroke-width="0.8" rx="12" opacity="0.4"/>
    
    <!-- Scattered stars -->
    ${stars}
    
    <!-- Decorative elements -->
    ${mosque}
    ${lanternLeft}
    ${lanternRight}
    ${crescent}
    
    <!-- Corner ornaments -->
    <path d="M50 50 Q70 50 70 70" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M50 50 Q50 70 70 70" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M750 50 Q730 50 730 70" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M750 50 Q750 70 730 70" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M50 510 Q70 510 70 490" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M50 510 Q50 490 70 490" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M750 510 Q730 510 730 490" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    <path d="M750 510 Q750 490 730 490" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
    
    <!-- Separator lines with diamonds -->
    <line x1="200" y1="105" x2="350" y2="105" stroke="url(#goldGrad)" stroke-width="1" opacity="0.6"/>
    <polygon points="400,100 405,105 400,110 395,105" fill="${theme.accent}" opacity="0.8"/>
    <line x1="450" y1="105" x2="600" y2="105" stroke="url(#goldGrad)" stroke-width="1" opacity="0.6"/>
    
    <!-- Title -->
    <text x="400" y="85" text-anchor="middle" fill="${theme.accent}" font-size="32" font-family="Cairo, Arial" font-weight="900" filter="url(#glow)">
      ${templateTitles[template]}
    </text>
    
    <!-- Subtitle -->
    <text x="400" y="140" text-anchor="middle" fill="#e8e8f0" font-size="22" font-family="Cairo, Arial" font-weight="600">
      ${templateSubtitles[template]}
    </text>
    
    <!-- Child name -->
    <text x="400" y="190" text-anchor="middle" fill="${theme.accent}" font-size="40" font-family="Cairo, Arial" font-weight="900" filter="url(#glow)">
      ${escapeSVGText(child.name)}
    </text>
    
    <!-- Level info -->
    <text x="400" y="235" text-anchor="middle" fill="#d0d0e0" font-size="20" font-family="Cairo, Arial" font-weight="600">
      ${levelInfo.level.icon} المستوى: ${escapeSVGText(levelInfo.level.name)}
    </text>
    
    <!-- Separator -->
    <line x1="200" y1="255" x2="600" y2="255" stroke="url(#goldGrad)" stroke-width="0.8" opacity="0.4"/>
    
    <!-- Stats boxes -->
    <!-- Stars -->
    <rect x="80" y="275" width="180" height="80" rx="12" fill="${theme.bg1}" stroke="${theme.frame}" stroke-width="1" opacity="0.8"/>
    <text x="170" y="310" text-anchor="middle" fill="${theme.accent}" font-size="28" font-family="Cairo, Arial" font-weight="900">${totalStars}</text>
    <text x="170" y="340" text-anchor="middle" fill="#aaa" font-size="14" font-family="Cairo, Arial">⭐ نجمة</text>
    
    <!-- Streak -->
    <rect x="310" y="275" width="180" height="80" rx="12" fill="${theme.bg1}" stroke="${theme.frame}" stroke-width="1" opacity="0.8"/>
    <text x="400" y="310" text-anchor="middle" fill="#ff6b6b" font-size="28" font-family="Cairo, Arial" font-weight="900">${streak.best}</text>
    <text x="400" y="340" text-anchor="middle" fill="#aaa" font-size="14" font-family="Cairo, Arial">🔥 أفضل سلسلة</text>
    
    <!-- Badges -->
    <rect x="540" y="275" width="180" height="80" rx="12" fill="${theme.bg1}" stroke="${theme.frame}" stroke-width="1" opacity="0.8"/>
    <text x="630" y="310" text-anchor="middle" fill="${theme.accent}" font-size="28" font-family="Cairo, Arial" font-weight="900">${earnedBadgesCount}/${totalBadges}</text>
    <text x="630" y="340" text-anchor="middle" fill="#aaa" font-size="14" font-family="Cairo, Arial">🏅 شارة</text>
    
    <!-- Seal -->
    ${seal}
    
    <!-- Footer -->
    <text x="400" y="420" text-anchor="middle" fill="#999" font-size="14" font-family="Cairo, Arial">
      متابع الصلاة - ${date}
    </text>
    
    <!-- Motivational message -->
    <text x="400" y="460" text-anchor="middle" fill="${theme.accent}" font-size="18" font-family="Cairo, Arial" font-weight="700" opacity="0.8">
      ${template === 'golden_streak' ? '🤲 ثابر على الصلاة فأنت بطل!' : template === 'prayer_hero' ? '🌟 أنت قدوة في المحافظة على الصلاة!' : '🤲 ماشاء الله! بارك الله فيك'}
    </text>
    
    <!-- App branding -->
    <text x="400" y="500" text-anchor="middle" fill="#555" font-size="11" font-family="Cairo, Arial">
      تم إنشاؤها بواسطة تطبيق متابع الصلاة للأطفال ⭐
    </text>
  </svg>`;
}

async function svgToPng(svgString: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 560;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    };
    img.src = url;
  });
}

export default function CertificateGenerator({
  child, levelInfo, streak, earnedBadgesCount, totalBadges, totalStars, onClose
}: CertificateProps) {
  const [template, setTemplate] = useState<TemplateType>('general');
  const [downloading, setDownloading] = useState(false);

  const templates: { type: TemplateType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'general', label: 'إنجاز عام', icon: <Award size={20} />, description: 'شهادة شاملة بجميع الإنجازات' },
    { type: 'prayer_hero', label: 'بطل الصلاة', icon: <Star size={20} />, description: 'لبطل المحافظة على الصلاة' },
    { type: 'golden_streak', label: 'سلسلة ذهبية', icon: <Flame size={20} />, description: `أفضل سلسلة: ${streak.best} يوم` },
  ];

  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      const svg = generateSVG(template, child, levelInfo, streak, earnedBadgesCount, totalBadges, totalStars);
      const blob = await svgToPng(svg);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `شهادة-${child.name}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🏆 شهادة إنجاز لـ ${child.name}\n${levelInfo.level.icon} المستوى: ${levelInfo.level.name}\n⭐ النجوم: ${totalStars}\n🔥 أفضل سلسلة: ${streak.best} يوم\n🏅 الشارات: ${earnedBadgesCount}/${totalBadges}\n\nماشاء الله! بارك الله فيه 🤲`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const previewSVG = generateSVG(template, child, levelInfo, streak, earnedBadgesCount, totalBadges, totalStars);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-card rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gold">📜 شهادة الإنجاز</h2>
            <button onClick={onClose} className="text-muted-foreground p-2 rounded-xl hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>

          {/* Template selection */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {templates.map(t => (
              <motion.button
                key={t.type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTemplate(t.type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap min-h-[44px] transition-all ${
                  template === t.type
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {t.icon}
                {t.label}
              </motion.button>
            ))}
          </div>

          {/* Preview */}
          <div className="rounded-xl overflow-hidden mb-4 border border-border">
            <div dangerouslySetInnerHTML={{ __html: previewSVG }} className="w-full [&>svg]:w-full [&>svg]:h-auto" />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-primary/20 text-gold font-bold py-3 rounded-xl border border-primary/30 min-h-[48px] disabled:opacity-50"
            >
              <Download size={18} />
              <span className="text-sm">{downloading ? 'جاري...' : 'تحميل PNG'}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 bg-secondary/20 text-secondary font-bold py-3 rounded-xl border border-secondary/30 min-h-[48px]"
            >
              <MessageCircle size={18} />
              <span className="text-sm">واتساب</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
