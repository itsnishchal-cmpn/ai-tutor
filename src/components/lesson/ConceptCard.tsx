import { useEffect } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import DiagramRenderer from '../rich/DiagramRenderer';
import { ArrowRight } from 'lucide-react';

interface Props {
  card: GeneratedCard;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  onSpeak?: (text: string) => void;
}

export default function ConceptCard({ card, onNext, cardNumber, totalCards, onSpeak }: Props) {
  // Auto-speak card text when card appears
  useEffect(() => {
    if (onSpeak && card.text) {
      onSpeak(card.text);
    }
  }, [card.text, onSpeak]);

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
      <div className="p-4 flex justify-center">
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
