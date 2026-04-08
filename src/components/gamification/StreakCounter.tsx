interface Props { streak: number; }

export default function StreakCounter({ streak }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg ${streak > 0 ? 'animate-pulse' : ''}`}>🔥</span>
      <span className="font-bold text-gray-800">{streak}</span>
      <span className="text-xs text-gray-500">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}
