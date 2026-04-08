import { useEffect, useState } from 'react';

interface Props { amount: number; onDone: () => void; }

export default function XPPopup({ amount, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="bg-brand-600 text-white px-4 py-1.5 rounded-full shadow-md text-sm font-bold">
        +{amount} XP
      </div>
    </div>
  );
}
