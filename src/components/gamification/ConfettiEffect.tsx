import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'square' | 'circle' | 'rect';
  size: number;
  drift: number;
  rotation: number;
}

interface Props {
  onDone?: () => void;
  size?: 'mini' | 'full';
}

const COLORS = ['#6366F1', '#818CF8', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];

function makeParticles(count: number): Particle[] {
  const shapes: Particle['shape'][] = ['square', 'circle', 'rect'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 2,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    size: 3 + Math.random() * 4,
    drift: (Math.random() - 0.5) * 60,
    rotation: Math.random() * 720,
  }));
}

export default function ConfettiEffect({ onDone, size = 'full' }: Props) {
  const count = size === 'full' ? 80 : 25;
  const duration = size === 'full' ? 4000 : 2000;
  const [particles] = useState<Particle[]>(() => makeParticles(count));

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(timer);
  }, [onDone, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => {
        const w = p.shape === 'rect' ? p.size * 0.5 : p.size;
        const h = p.shape === 'rect' ? p.size * 1.5 : p.size;
        const borderRadius = p.shape === 'circle' ? '50%' : '1px';

        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: '-2%',
              width: w,
              height: h,
              backgroundColor: p.color,
              borderRadius,
              animation: `confetti-fall ${p.duration}s ${p.delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              '--drift': `${p.drift}px`,
              '--rotation': `${p.rotation}deg`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rotation));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
