import { useEffect, useState } from 'react';

interface Props { amount: number; onDone: () => void; }

export default function XPPopup({ amount, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-150 -translate-y-8'}`}>
      <div className="bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-lg text-xl font-bold">+{amount} XP</div>
    </div>
  );
}
