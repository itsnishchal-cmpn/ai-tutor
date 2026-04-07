import type { RichContentBlock } from '../../types/chat';
import MathExpression from '../rich/MathExpression';
import DiagramRenderer from '../rich/DiagramRenderer';
import VideoEmbed from '../rich/VideoEmbed';
import QuizQuestion from '../rich/QuizQuestion';
import LessonSummary from '../rich/LessonSummary';

interface Props {
  blocks: RichContentBlock[];
}

function renderTextWithLineBreaks(text: string) {
  // Split by double newlines for paragraphs, single newlines for line breaks
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    return (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderBoldAndItalic(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderBoldAndItalic(text: string) {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function MessageContent({ blocks }: Props) {
  return (
    <div className="text-sm leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return <div key={i}>{renderTextWithLineBreaks(block.content)}</div>;
          case 'math':
            return <MathExpression key={i} content={block.content} display={block.display} />;
          case 'diagram':
            return <DiagramRenderer key={i} diagramId={block.diagramId} />;
          case 'video':
            return <VideoEmbed key={i} videoId={block.videoId} />;
          case 'quiz':
            return <QuizQuestion key={i} quiz={block} />;
          case 'summary':
            return <LessonSummary key={i} content={block.content} keyPoints={block.keyPoints} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
