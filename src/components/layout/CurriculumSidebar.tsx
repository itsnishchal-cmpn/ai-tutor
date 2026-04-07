import { chapters } from '../../data/curriculum';
import { useProgress } from '../../contexts/ProgressContext';
import {
  ChevronDown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  BookOpen,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  currentTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onClose?: () => void;
}

export default function CurriculumSidebar({ currentTopicId, onSelectTopic, onClose }: Props) {
  const { getTopicProgress } = useProgress();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(chapters[0]?.sections.map(s => s.id) ?? [])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-brand-600" />
          <h2 className="font-semibold text-gray-800">Curriculum</h2>
        </div>
        <p className="text-xs text-gray-400 mt-1">Class 8 — Mathematics</p>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {chapters.map(chapter => (
          <div key={chapter.id} className="mb-2">
            {/* Chapter header */}
            <div
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                chapter.locked
                  ? 'text-gray-400 bg-gray-50'
                  : 'text-gray-700 bg-brand-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {chapter.locked ? (
                  <Lock size={14} className="text-gray-300" />
                ) : (
                  <BookOpen size={14} className="text-brand-600" />
                )}
                <span>Ch {chapter.number}: {chapter.title}</span>
              </div>
            </div>

            {/* Sections & Topics */}
            {!chapter.locked &&
              chapter.sections.map(section => (
                <div key={section.id} className="ml-2 mt-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center gap-1.5 px-2 py-1.5 w-full text-left text-xs font-medium text-gray-500 hover:text-gray-700 rounded"
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    {section.title}
                  </button>

                  {expandedSections.has(section.id) && (
                    <div className="ml-3 space-y-0.5">
                      {section.topics.map(topic => {
                        const progress = getTopicProgress(topic.id);
                        const isCurrent = topic.id === currentTopicId;
                        const isCompleted = progress?.completed;

                        return (
                          <button
                            key={topic.id}
                            onClick={() => {
                              onSelectTopic(topic.id);
                              onClose?.();
                            }}
                            className={`flex items-center gap-2 px-2 py-1.5 w-full text-left text-sm rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-brand-100 text-brand-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                            ) : (
                              <Circle
                                size={14}
                                className={`shrink-0 ${
                                  isCurrent ? 'text-brand-500' : 'text-gray-300'
                                }`}
                              />
                            )}
                            <span className="truncate">{topic.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
