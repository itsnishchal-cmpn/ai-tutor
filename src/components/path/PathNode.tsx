import { CheckCircle2, Lock, Play } from 'lucide-react';

export type NodeState = 'completed' | 'current' | 'available' | 'locked';

interface Props {
  title: string;
  state: NodeState;
  x: number;
  y: number;
  index: number;
  onClick: () => void;
  quizScore?: { correct: number; total: number } | null;
}

const stateConfig = {
  completed: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    ring: '',
    size: 56,
    textColor: 'text-emerald-600',
    labelBg: 'bg-emerald-50',
  },
  current: {
    bg: 'bg-indigo-500',
    border: 'border-indigo-400',
    ring: 'animate-pulse-glow',
    size: 72,
    textColor: 'text-indigo-600',
    labelBg: 'bg-indigo-50',
  },
  available: {
    bg: 'bg-white',
    border: 'border-indigo-300',
    ring: '',
    size: 56,
    textColor: 'text-[#1E293B]',
    labelBg: 'bg-white',
  },
  locked: {
    bg: 'bg-gray-200',
    border: 'border-gray-300',
    ring: '',
    size: 48,
    textColor: 'text-[#94A3B8]',
    labelBg: 'bg-gray-50',
  },
} as const;

export default function PathNode({ title, state, x, y, index, onClick, quizScore }: Props) {
  const config = stateConfig[state];
  const isInteractive = state !== 'locked';
  const isPerfect = quizScore && quizScore.correct === quizScore.total && quizScore.total > 0;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${x}%`,
        top: y,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Node circle */}
      <button
        onClick={isInteractive ? onClick : undefined}
        disabled={!isInteractive}
        className={`
          relative rounded-full flex items-center justify-center
          border-[3px] shadow-md
          transition-all duration-200
          ${config.bg} ${config.border} ${config.ring}
          ${isInteractive ? 'btn-press cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}
        `}
        style={{
          width: config.size,
          height: config.size,
          animationDelay: `${index * 0.05}s`,
        }}
        title={state === 'locked' ? 'Complete the previous topic first' : title}
      >
        {state === 'completed' && (
          <CheckCircle2 size={config.size * 0.45} className="text-white" strokeWidth={2.5} />
        )}
        {state === 'current' && (
          <Play size={config.size * 0.4} className="text-white ml-1" fill="white" />
        )}
        {state === 'available' && (
          <span className="text-indigo-500 font-bold text-lg">{index + 1}</span>
        )}
        {state === 'locked' && (
          <Lock size={config.size * 0.35} className="text-gray-400" />
        )}

        {/* Perfect score crown */}
        {isPerfect && state === 'completed' && (
          <span className="absolute -top-3 text-lg">👑</span>
        )}
      </button>

      {/* Topic label */}
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${config.textColor} ${config.labelBg} max-w-[180px] text-center truncate shadow-sm border border-[#E2E8F0]`}>
        {title}
      </div>

      {/* Start label for current */}
      {state === 'current' && (
        <span className="mt-1 text-[10px] font-semibold text-indigo-500 uppercase tracking-wider animate-pulse">
          Start
        </span>
      )}
    </div>
  );
}
