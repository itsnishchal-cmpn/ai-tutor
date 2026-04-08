import { useEffect, useState } from 'react';

interface Props { level: number; title: string; onDone: () => void; }

export default function LevelUpModal({ level, title, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
        <p className="text-4xl mb-3">🎉</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Level Up!</h2>
        <p className="text-3xl font-bold text-brand-600 mb-1">Level {level}</p>
        <p className="text-gray-500">{title}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
