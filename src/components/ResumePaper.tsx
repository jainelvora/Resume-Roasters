import React, { useEffect, useRef } from 'react';
import { Speaker } from '../types';

interface ResumePaperProps {
  resumeText: string;
  activeQuote: string | null;
  speaker: Speaker;
}

export const ResumePaper: React.FC<ResumePaperProps> = ({
  resumeText,
  activeQuote,
  speaker
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLElement>(null);

  // Auto-scroll to highlighted quote with smooth animation
  useEffect(() => {
    if (activeQuote && highlightRef.current && containerRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeQuote]);

  const renderContent = () => {
    if (!activeQuote || !activeQuote.trim()) {
      return <span>{resumeText}</span>;
    }

    const q = activeQuote.trim();
    const lowerResume = resumeText.toLowerCase();
    const lowerQuote = q.toLowerCase();
    const index = lowerResume.indexOf(lowerQuote);

    if (index === -1) {
      // If exact substring isn't found, try normalized whitespace
      return <span>{resumeText}</span>;
    }

    const before = resumeText.slice(0, index);
    const matched = resumeText.slice(index, index + q.length);
    const after = resumeText.slice(index + q.length);

    return (
      <>
        <span>{before}</span>
        <mark
          ref={highlightRef}
          key={q}
          className={`marker-highlight ${speaker}`}
        >
          {matched}
        </mark>
        <span>{after}</span>
      </>
    );
  };

  return (
    <div className="arena-paper" ref={containerRef}>
      {renderContent()}
    </div>
  );
};
