import { useEffect, useState } from 'react';

interface Props { amount: number; onDone: () => void; }

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function XPPopup({ amount, onDone }: Props) {
  const [phase, setPhase] = useState<'pop' | 'hold' | 'fly' | 'done'>('pop');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 300);
    const t2 = setTimeout(() => setPhase('fly'), 1300);
    const t3 = setTimeout(() => { setPhase('done'); onDone(); }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className={`absolute top-16 left-1/2 z-30 pointer-events-none ${phase === 'pop' ? 'animate-bounce-in' : ''} ${phase === 'done' ? 'hidden' : ''}`}
      style={{
        transform: `translateX(-50%) ${phase === 'fly' ? 'translateY(-64px) scale(0.75)' : ''}`,
        opacity: phase === 'fly' ? 0 : 1,
        transition: phase === 'fly' ? 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      }}
    >
      <div className="bg-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-extrabold text-sm" style={{ boxShadow: '0 3px 10px rgba(245, 158, 11, 0.4)' }}>
        <StarIcon />
        +{amount} XP
      </div>
    </div>
  );
}
