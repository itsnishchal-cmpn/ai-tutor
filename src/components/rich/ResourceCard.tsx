import type { ResourcesBlock } from '../../types/chat';
import { ExternalLink, Video, BookOpen, PenTool } from 'lucide-react';

interface Props {
  block: ResourcesBlock;
}

const typeIcons = {
  video: Video,
  article: BookOpen,
  practice: PenTool,
};

const typeColors = {
  video: 'text-red-500 bg-red-50',
  article: 'text-blue-500 bg-blue-50',
  practice: 'text-purple-500 bg-purple-50',
};

export default function ResourceCard({ block }: Props) {
  if (block.links.length === 0) return null;

  return (
    <div className="my-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-indigo-800 text-sm">{block.heading}</h3>
      </div>

      <div className="space-y-2">
        {block.links.map((link, i) => {
          const Icon = typeIcons[link.type] ?? BookOpen;
          const colorClass = typeColors[link.type] ?? 'text-gray-500 bg-gray-50';

          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-700">
                  {link.title}
                </p>
                <p className="text-xs text-gray-400 capitalize">{link.type}</p>
              </div>
              <ExternalLink size={14} className="text-gray-300 group-hover:text-indigo-400 shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
