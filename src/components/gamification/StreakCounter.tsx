interface Props { streak: number; }

function FlameIcon({ streak }: { streak: number }) {
  let color = '#FF9500';
  if (streak >= 30) color = '#1CB0F6';
  else if (streak >= 14) color = '#FF0000';
  else if (streak >= 7) color = '#FF3B00';
  else if (streak >= 3) color = '#FF6B00';

  const glowing = streak >= 7;

  return (
    <div className="relative">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={color}
        className="animate-flame"
      >
        <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.17 3.38-7.75.42-.53 1.24-.42 1.5.19.5 1.17 1.25 2.25 2.4 3.06.1-.85.4-2.1 1.22-3.5C12.78 4.83 14 3.12 14 3.12s.78 1.71 1.5 3.38c.6 1.4.9 2.65 1 3.5 1.15-.81 1.9-1.89 2.4-3.06.26-.61 1.08-.72 1.5-.19C21.65 8.33 23.78 11.31 23.78 14.5c0 4.42-4.03 8-9 8z" />
      </svg>
      {glowing && (
        <div
          className="absolute inset-0 rounded-full blur-md -z-10"
          style={{ background: color, opacity: 0.3, transform: 'scale(1.5)' }}
        />
      )}
    </div>
  );
}

export default function StreakCounter({ streak }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <FlameIcon streak={streak} />
      <span className="font-extrabold text-[#1E293B] text-lg">{streak}</span>
      <span className="text-xs text-[#64748B]">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}
