import { useEffect, useState } from 'react';

interface Props { badgeName: string; badgeIcon: string; onDone: () => void; }

export default function BadgeUnlock({ badgeName, badgeIcon, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
      />
      <div className="relative bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
        <p className="text-5xl mb-3">{badgeIcon}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-1">New Badge!</h2>
        <p className="text-lg text-brand-600 font-medium">{badgeName}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
