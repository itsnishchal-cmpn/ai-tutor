import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  content: string;
  display: boolean;
}

export default function MathExpression({ content, display }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(content, ref.current, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      });
    } catch {
      ref.current.textContent = content;
    }
  }, [content, display]);

  if (display) {
    return (
      <div className="my-2 overflow-x-auto">
        <span ref={ref} />
      </div>
    );
  }

  return <span ref={ref} className="inline" />;
}
