import { useEffect, useRef } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import DiagramRenderer from '../rich/DiagramRenderer';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  card: GeneratedCard;
  onNext: () => void;
  onBack?: () => void;
  cardNumber: number;
  totalCards: number;
  onSpeak?: (text: string) => void;
}

export default function ConceptCard({ card, onNext, onBack, cardNumber, totalCards, onSpeak }: Props) {
  const lastSpokenRef = useRef('');

  useEffect(() => {
    // Only speak if card text changed (prevents double-speak on re-renders)
    if (onSpeak && card.text && card.text !== lastSpokenRef.current) {
      lastSpokenRef.current = card.text;
      onSpeak(card.text);
    }
  }, [card.text, onSpeak]);

  const isFirstCard = cardNumber === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center gap-1.5 py-3">
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < cardNumber ? 'bg-brand-600' : i === cardNumber ? 'bg-brand-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-lg mx-auto w-full">
        {card.diagramConfig && (
          <div className="w-full mb-6">
            <DiagramRenderer diagramId={card.diagramConfig.shape} />
          </div>
        )}
        <p className="text-lg text-gray-800 text-center leading-relaxed mb-8">{card.text}</p>
      </div>
      <div className="p-4 flex justify-center gap-3">
        {!isFirstCard && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
