import { useState } from 'react';

interface Props { level: number; title: string; onDone: () => void; }

export default function LevelUpModal({ level, title, onDone }: Props) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => { setClosing(true); setTimeout(onDone, 300); };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.1) 0%, transparent 60%)' }} />

      <div className="relative max-w-sm mx-4 w-full animate-bounce-in">
        <div className="bg-white rounded-3xl p-8 text-center border border-[#E2E8F0] overflow-hidden relative" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.1)' }}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500 rounded-t-3xl" />

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-float" style={{ left: `${15 + Math.random() * 70}%`, top: `${15 + Math.random() * 70}%`, animationDelay: `${i * 0.4}s`, opacity: 0.4 }} />
            ))}
          </div>

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center ring-4 ring-amber-200">
              <span className="text-5xl animate-bounce-in" style={{ animationDelay: '0.2s' }}>🎉</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E293B] mb-2 animate-fade-in-up">LEVEL UP!</h2>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full mb-2 border border-indigo-100">
              <span className="text-3xl font-black">Level {level}</span>
            </div>
            <p className="text-lg text-[#64748B] font-medium mb-6">{title}</p>
            <button onClick={handleClose} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press" style={{ boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)' }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
