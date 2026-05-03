"use client";

import { useEffect, useRef, useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathRenderer({ tex, displayMode = false, className = "" }: MathRendererProps) {
  // Parse the string into segments of text and math
  // We look for $...$ for inline math. 
  // If the string has no $, we check displayMode. 
  // If displayMode is true, we treat the whole thing as math.
  // If displayMode is false, we treat the whole thing as text.
  
  const segments = useMemo(() => {
    if (!tex.includes('$')) {
      return displayMode 
        ? [{ type: 'math', content: tex }] 
        : [{ type: 'text', content: tex }];
    }

    const parts = tex.split('$');
    return parts.map((part, index) => ({
      type: index % 2 === 0 ? 'text' : 'math',
      content: part
    })).filter(seg => seg.content.length > 0);
  }, [tex, displayMode]);

  return (
    <div className={`inline-block max-w-full ${className}`}>
      {segments.map((seg, i) => (
        <Segment key={i} segment={seg} />
      ))}
    </div>
  );
}

function Segment({ segment }: { segment: { type: string, content: string } }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (segment.type === 'math' && ref.current) {
      try {
        katex.render(segment.content, ref.current, {
          throwOnError: false,
          displayMode: false, // We always render as inline within the flow
        });
      } catch (error) {
        console.error("KaTeX error:", error);
        ref.current.textContent = segment.content;
      }
    }
  }, [segment]);

  if (segment.type === 'text') {
    return <span className="whitespace-pre-wrap">{segment.content}</span>;
  }

  return (
    <span 
      ref={ref} 
      className="inline-block max-w-full align-middle overflow-hidden text-ellipsis"
      style={{ verticalAlign: 'middle' }}
    />
  );
}
