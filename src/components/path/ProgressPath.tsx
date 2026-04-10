import { useEffect, useRef, useMemo } from 'react';
import { chapters } from '../../data/curriculum';
import { useProgress } from '../../contexts/ProgressContext';
import PathNode, { type NodeState } from './PathNode';

interface Props {
  onSelectTopic: (topicId: string) => void;
}

// Zigzag x positions with wider spread to avoid label collisions
const ZIGZAG_X = [50, 72, 50, 28, 50, 72, 50, 28, 50, 72, 50, 28];
const NODE_VERTICAL_SPACING = 170; // increased from 140 to give labels room
const PATH_TOP_PADDING = 60;

// Decorative shapes scattered along the path
const DECORATIONS = [
  { shape: 'triangle', x: 12, yOffset: 40, rotation: 15, color: '#BFF199', size: 14 },
  { shape: 'square', x: 88, yOffset: 180, rotation: 30, color: '#DDF4FF', size: 12 },
  { shape: 'pentagon', x: 10, yOffset: 380, rotation: -10, color: '#FFF4CC', size: 16 },
  { shape: 'circle', x: 90, yOffset: 550, rotation: 0, color: '#FFDFE0', size: 10 },
  { shape: 'diamond', x: 14, yOffset: 720, rotation: 45, color: '#F3E8FF', size: 13 },
  { shape: 'triangle', x: 86, yOffset: 900, rotation: -20, color: '#BFF199', size: 11 },
  { shape: 'hexagon', x: 8, yOffset: 1100, rotation: 5, color: '#DDF4FF', size: 15 },
  { shape: 'square', x: 92, yOffset: 1300, rotation: 60, color: '#FFF4CC', size: 12 },
  { shape: 'circle', x: 16, yOffset: 1500, rotation: 0, color: '#F3E8FF', size: 14 },
  { shape: 'triangle', x: 84, yOffset: 1700, rotation: 25, color: '#FFDFE0', size: 12 },
];

function DecoShape({ shape, x, yOffset, rotation, color, size }: (typeof DECORATIONS)[0]) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: yOffset,
    transform: `rotate(${rotation}deg)`,
    opacity: 0.5,
  };

  if (shape === 'circle') {
    return (
      <div style={style} className="animate-float" key={`${shape}-${x}-${yOffset}`}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: color }} />
      </div>
    );
  }
  if (shape === 'square' || shape === 'diamond') {
    return (
      <div style={{ ...style, animationDelay: '1s' }} className="animate-float" key={`${shape}-${x}-${yOffset}`}>
        <div style={{ width: size, height: size, background: color, borderRadius: 2 }} />
      </div>
    );
  }
  if (shape === 'triangle') {
    return (
      <div style={{ ...style, animationDelay: '2s' }} className="animate-float" key={`${shape}-${x}-${yOffset}`}>
        <div style={{
          width: 0, height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }} />
      </div>
    );
  }
  return (
    <div style={{ ...style, animationDelay: '3s' }} className="animate-float" key={`${shape}-${x}-${yOffset}`}>
      <div style={{ width: size, height: size, background: color, borderRadius: '30%' }} />
    </div>
  );
}

export default function ProgressPath({ onSelectTopic }: Props) {
  const { progress, getTopicProgress } = useProgress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  // Flatten topics from the unlocked chapter
  const topics = useMemo(() => {
    const allTopics: { id: string; title: string; sectionId: string; sectionTitle: string }[] = [];
    for (const chapter of chapters) {
      if (chapter.locked) continue;
      for (const section of chapter.sections) {
        for (const topic of section.topics) {
          allTopics.push({
            id: topic.id,
            title: topic.title,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        }
      }
    }
    return allTopics;
  }, []);

  // Determine node states
  const nodeStates = useMemo(() => {
    const states: NodeState[] = [];
    let foundFirstIncomplete = false;
    for (let i = 0; i < topics.length; i++) {
      const tp = getTopicProgress(topics[i].id);
      if (tp?.completed) {
        states.push('completed');
      } else if (!foundFirstIncomplete) {
        states.push('current');
        foundFirstIncomplete = true;
      } else if (i > 0 && (states[i - 1] === 'completed' || states[i - 1] === 'current' || states[i - 1] === 'available')) {
        states.push('available');
      } else {
        states.push('locked');
      }
    }
    return states;
  }, [topics, progress]);

  const currentIndex = nodeStates.indexOf('current');

  // Auto-scroll to current node on mount
  useEffect(() => {
    if (currentNodeRef.current && scrollRef.current) {
      const nodeRect = currentNodeRef.current.getBoundingClientRect();
      const containerRect = scrollRef.current.getBoundingClientRect();
      const scrollTop = scrollRef.current.scrollTop + nodeRect.top - containerRect.top - containerRect.height / 3;
      scrollRef.current.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Calculate node positions — place section headers in the spacing between nodes
  // Add extra vertical gap before each section header
  const { nodePositions, sectionBreaks, totalHeight } = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const breaks: { sectionTitle: string; y: number }[] = [];
    let lastSection = '';
    let currentY = PATH_TOP_PADDING;

    topics.forEach((topic, i) => {
      // Check if new section
      if (topic.sectionId !== lastSection) {
        if (i > 0) {
          // Add extra space before section header (except first section)
          currentY += 30;
        }
        breaks.push({
          sectionTitle: topic.sectionTitle,
          y: currentY,
        });
        currentY += 40; // space for the section header itself
        lastSection = topic.sectionId;
      }

      positions.push({
        x: ZIGZAG_X[i % ZIGZAG_X.length],
        y: currentY,
      });
      currentY += NODE_VERTICAL_SPACING;
    });

    return {
      nodePositions: positions,
      sectionBreaks: breaks,
      totalHeight: currentY + 120, // extra space for trophy
    };
  }, [topics]);

  // Chapter info
  const activeChapter = chapters.find(c => !c.locked);

  // Split path into segments for coloring
  const getSegmentState = (i: number): 'completed' | 'current' | 'locked' => {
    if (nodeStates[i] === 'completed' && nodeStates[i + 1] === 'completed') return 'completed';
    if (
      (nodeStates[i] === 'completed' && (nodeStates[i + 1] === 'current' || nodeStates[i + 1] === 'available')) ||
      (nodeStates[i] === 'current' && nodeStates[i + 1] === 'available')
    ) return 'current';
    return 'locked';
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-graph-paper"
    >
      {/* Chapter title */}
      <div className="text-center pt-5 pb-1">
        <h1 className="text-lg font-bold text-[#1E293B]">
          Ch {activeChapter?.number}: {activeChapter?.title}
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Class 8 - NCERT Mathematics
        </p>
      </div>

      {/* Path container */}
      <div className="relative mx-auto" style={{ maxWidth: 440, height: totalHeight }}>
        {/* SVG connecting path */}
        <svg
          className="absolute inset-0 w-full"
          style={{ height: totalHeight }}
          viewBox={`0 0 440 ${totalHeight}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {nodePositions.slice(0, -1).map((pos, i) => {
            const next = nodePositions[i + 1];
            const px = (pos.x / 100) * 440;
            const py = pos.y + 28;
            const nx = (next.x / 100) * 440;
            const ny = next.y + 28;
            const midY = (py + ny) / 2;
            const segState = getSegmentState(i);

            return (
              <path
                key={i}
                d={`M ${px} ${py} C ${px} ${midY}, ${nx} ${midY}, ${nx} ${ny}`}
                stroke={
                  segState === 'completed' ? '#10B981' :
                  segState === 'current' ? '#6366F1' : '#D4D4D4'
                }
                strokeWidth={segState === 'locked' ? 2 : 4}
                strokeDasharray={segState === 'locked' ? '8 6' : segState === 'current' ? '10 5' : 'none'}
                strokeLinecap="round"
                className={segState === 'current' ? 'animate-dash-flow' : ''}
                opacity={segState === 'locked' ? 0.4 : 1}
              />
            );
          })}
        </svg>

        {/* Decorative shapes */}
        {DECORATIONS.map((deco, i) => (
          <DecoShape key={i} {...deco} />
        ))}

        {/* Section break labels */}
        {sectionBreaks.map((sb, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full border border-[#EBEBEB] shadow-sm text-[11px] font-semibold text-[#999] whitespace-nowrap z-10 uppercase tracking-wide"
            style={{ top: sb.y }}
          >
            {sb.sectionTitle}
          </div>
        ))}

        {/* Path nodes */}
        {topics.map((topic, i) => (
          <div key={topic.id} ref={i === currentIndex ? currentNodeRef : undefined}>
            <PathNode
              title={topic.title}
              state={nodeStates[i]}
              x={nodePositions[i].x}
              y={nodePositions[i].y}
              index={i}
              onClick={() => onSelectTopic(topic.id)}
              quizScore={
                getTopicProgress(topic.id)?.quizResults
                  ? {
                      correct: getTopicProgress(topic.id)!.quizResults.filter(r => r.isCorrect).length,
                      total: getTopicProgress(topic.id)!.quizResults.length,
                    }
                  : null
              }
            />
          </div>
        ))}

        {/* Trophy at the end */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: totalHeight - 100 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-reward-100 border-2 border-reward-300 flex items-center justify-center text-3xl shadow-md">
            🏆
          </div>
          <span className="text-xs font-semibold text-reward-600 mt-2">Chapter Complete!</span>
        </div>
      </div>
    </div>
  );
}
