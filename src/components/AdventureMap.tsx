import { memo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  totalStars: number;
}

const STATIONS = [
  { stars: 0, label: 'البداية', emoji: '🏠', color: 'hsl(var(--muted-foreground))' },
  { stars: 10, label: 'الحديقة', emoji: '🌳', color: 'hsl(var(--secondary))' },
  { stars: 25, label: 'المكتبة', emoji: '📚', color: 'hsl(var(--accent))' },
  { stars: 50, label: 'المسجد', emoji: '🕌', color: 'hsl(var(--gold))' },
  { stars: 75, label: 'المدرسة', emoji: '🏫', color: 'hsl(var(--fajr-from))' },
  { stars: 100, label: 'القمة', emoji: '⛰️', color: 'hsl(var(--secondary))' },
  { stars: 150, label: 'النجوم', emoji: '🌟', color: 'hsl(var(--star-yellow))' },
  { stars: 200, label: 'القصر', emoji: '🏰', color: 'hsl(var(--gold))' },
  { stars: 300, label: 'الجنة', emoji: '🌈', color: 'hsl(var(--accent))' },
];

function AdventureMapImpl({ totalStars }: Props) {
  const currentStationIdx = STATIONS.reduce((acc, s, i) => totalStars >= s.stars ? i : acc, 0);
  const nextStation = STATIONS[currentStationIdx + 1];
  const progressToNext = nextStation
    ? Math.min(((totalStars - STATIONS[currentStationIdx].stars) / (nextStation.stars - STATIONS[currentStationIdx].stars)) * 100, 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border mb-4"
    >
      <h3 className="font-bold text-foreground text-sm mb-3">🗺️ خريطة المغامرة</h3>
      
      {/* Progress to next station */}
      {nextStation && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{STATIONS[currentStationIdx].emoji} {STATIONS[currentStationIdx].label}</span>
            <span>{nextStation.emoji} {nextStation.label} ({nextStation.stars}⭐)</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full gradient-gold"
            />
          </div>
        </div>
      )}

      {/* Stations map - horizontal scroll */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {STATIONS.map((station, i) => {
          const unlocked = totalStars >= station.stars;
          const isCurrent = i === currentStationIdx;
          return (
            <div key={i} className="flex items-center flex-shrink-0">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? [1, 1.12, 1] : 1 }}
                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                className={`flex flex-col items-center w-10 ${unlocked ? '' : 'opacity-30 grayscale'}`}
              >
                <span className={`text-lg ${isCurrent ? 'drop-shadow-lg' : ''}`}>{station.emoji}</span>
                <span className="text-[8px] text-muted-foreground leading-tight text-center mt-0.5">{station.label}</span>
                {isCurrent && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-gold mt-0.5"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.div>
              {i < STATIONS.length - 1 && (
                <div className={`w-3 h-0.5 mx-0.5 rounded-full ${i < currentStationIdx ? 'bg-gold' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default memo(AdventureMapImpl);
