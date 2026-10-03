import React, { useEffect, useState } from 'react';
import { Speaker } from '../types';

interface SpeechBubbleProps {
  speaker: Speaker;
  text: string;
  speed: number; // 1 or 2
  isPaused: boolean;
  onComplete?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  speaker,
  text,
  speed,
  isPaused,
  onComplete
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  // Reset when text changes
  useEffect(() => {
    setDisplayedLength(0);
  }, [text]);

  useEffect(() => {
    if (isPaused) return;

    if (displayedLength >= text.length) {
      if (onComplete) {
        // slight pause after finishing sentence
        const settleTimer = setTimeout(() => {
          onComplete();
        }, 1200 / speed);
        return () => clearTimeout(settleTimer);
      }
      return;
    }

    // Base typing speed ~35 chars/sec -> ~28ms per char
    // With jitter: 20-36ms, scaled by speed
    const baseDelay = (28 + (Math.random() * 14 - 7)) / speed;
    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(text.length, prev + 1));
    }, Math.max(10, baseDelay));

    return () => clearTimeout(timer);
  }, [displayedLength, text, speed, isPaused, onComplete]);

  const isRecruiter = speaker === 'recruiter';
  const speakerName = isRecruiter ? 'Rex' : 'Mo';
  const isTyping = displayedLength < text.length;

  return (
    <div className="speech-bubble-wrapper" aria-live="polite">
      <div className={`speech-bubble ${speaker}`}>
        <div className={`speaker-pill ${speaker}`}>{speakerName}</div>
        <div className="bubble-text">
          {text.slice(0, displayedLength)}
          {isTyping && <span className="typing-cursor" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
};
