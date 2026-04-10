import { useEffect, useRef } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import DiagramRenderer from '../rich/DiagramRenderer';
import { ArrowRight, ArrowLeft, MessageCircle, BookOpen, Lightbulb, Calculator, Pencil } from 'lucide-react';

interface Props {
  card: GeneratedCard;
  onNext: () => void;
  onBack?: () => void;
  cardNumber: number;
  totalCards: number;
  onSpeak?: (text: string) => void;
  onOpenDoubt?: () => void;
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  hook: { label: 'Did you know?', icon: <Lightbulb size={12} />, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-t-amber-400' },
  concept: { label: 'Concept', icon: <BookOpen size={12} />, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-t-indigo-500' },
  formula: { label: 'Formula', icon: <Calculator size={12} />, bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-t-violet-500' },
  example: { label: 'Example', icon: <Pencil size={12} />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-t-emerald-500' },
};

export default function ConceptCard({ card, onNext, onBack, cardNumber, totalCards, onSpeak, onOpenDoubt }: Props) {
  const lastSpokenRef = useRef('');

  useEffect(() => {
    if (onSpeak && card.text && card.text !== lastSpokenRef.current) {
      lastSpokenRef.current = card.text;
      onSpeak(card.text);
    }
  }, [card.text, onSpeak]);

  const isFirstCard = cardNumber === 0;
  const typeCfg = typeConfig[card.type] ?? typeConfig.concept;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4 sm:px-6">
      {/* Segmented progress bar */}
      <div className="flex gap-1 pt-3 pb-4">
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < cardNumber
                ? 'bg-indigo-500'
                : i === cardNumber
                  ? 'bg-indigo-400 relative overflow-hidden'
                  : 'bg-[#E2E8F0]'
            }`}
          >
            {i === cardNumber && (
              <div className="absolute inset-0 animate-shimmer rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* Card container */}
      <div
        className={`flex-1 flex flex-col bg-white rounded-2xl border border-[#E2E8F0] border-t-4 ${typeCfg.border} overflow-hidden animate-fade-in-up`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Type badge */}
        <div className="px-6 pt-5 pb-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeCfg.bg} ${typeCfg.text}`}>
            {typeCfg.icon}
            {typeCfg.label}
          </span>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-6">
          {card.diagramConfig && (
            <div className="w-full mb-6 bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <DiagramRenderer diagramId={card.diagramConfig.shape} />
            </div>
          )}
          <p className="text-lg sm:text-xl text-[#1E293B] text-center leading-relaxed">
            {card.text}
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="py-4 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-3">
          {!isFirstCard && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 bg-white text-[#64748B] rounded-xl font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all btn-press"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press"
            style={{ boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)' }}
          >
            Next <ArrowRight size={18} />
          </button>
        </div>

        {onOpenDoubt && (
          <button
            onClick={onOpenDoubt}
            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors btn-press"
          >
            <MessageCircle size={16} />
            Have a doubt? Ask AI
          </button>
        )}
      </div>
    </div>
  );
}
