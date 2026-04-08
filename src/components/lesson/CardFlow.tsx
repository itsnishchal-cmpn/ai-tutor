import { useState, useEffect, useRef } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import ConceptCard from './ConceptCard';

interface Props {
  cards: GeneratedCard[];
  currentIndex: number;
  onNext: () => void;
  onBack?: () => void;
  onSpeak?: (text: string) => void;
  onOpenDoubt?: () => void;
}

export default function CardFlow({ cards, currentIndex, onNext, onBack, onSpeak, onOpenDoubt }: Props) {
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (currentIndex === displayIndex) return;

    const goingForward = currentIndex > prevIndexRef.current;
    setDirection(goingForward ? 'forward' : 'backward');
    prevIndexRef.current = currentIndex;

    // Exit phase
    setPhase('exit');
    const exitTimer = setTimeout(() => {
      setDisplayIndex(currentIndex);
      setPhase('enter');
      const enterTimer = setTimeout(() => setPhase('idle'), 300);
      return () => clearTimeout(enterTimer);
    }, 200);

    return () => clearTimeout(exitTimer);
  }, [currentIndex, displayIndex]);

  const card = cards[displayIndex];
  if (!card) return null;

  const animClass =
    phase === 'exit'
      ? direction === 'forward'
        ? 'animate-slide-out-left'
        : 'animate-slide-out-right'
      : phase === 'enter'
        ? direction === 'forward'
          ? 'animate-slide-in-right'
          : 'animate-slide-in-left'
        : '';

  return (
    <div className={`h-full ${animClass}`}>
      <ConceptCard
        card={card}
        onNext={onNext}
        onBack={onBack}
        cardNumber={displayIndex}
        totalCards={cards.length}
        onSpeak={onSpeak}
        onOpenDoubt={onOpenDoubt}
      />
    </div>
  );
}
