import { useState, useEffect } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import ConceptCard from './ConceptCard';

interface Props {
  cards: GeneratedCard[];
  currentIndex: number;
  onNext: () => void;
}

export default function CardFlow({ cards, currentIndex, onNext }: Props) {
  const [animating, setAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex !== displayIndex) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex);
        setAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayIndex]);

  const card = cards[displayIndex];
  if (!card) return null;

  return (
    <div className={`h-full transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      <ConceptCard card={card} onNext={onNext} cardNumber={displayIndex} totalCards={cards.length} />
    </div>
  );
}
