import React from 'react';
import { Speaker } from '../types';

interface HeatBarProps {
  speaker: Speaker;
  roundNumber: number;
  totalRounds: number;
}

export const HeatBar: React.FC<HeatBarProps> = ({ speaker, roundNumber, totalRounds }) => {
  // Indicator position: Rex = 20%, Mo = 80%, transition smoothly
  const leftPercent = speaker === 'recruiter' ? 18 : 82;
  const indicatorColor = speaker === 'recruiter' ? 'var(--recruiter-red)' : 'var(--manager-mustard)';

  return (
    <div className="heat-bar-wrapper">
      <div className="heat-bar-labels">
        <span className="rex-label">← Rex (Redline)</span>
        <span>Heat Index</span>
        <span className="mo-label">Mo (Defense) →</span>
      </div>
      <div className="heat-track">
        <div
          className="heat-indicator"
          style={{
            left: `calc(${leftPercent}% - 12px)`,
            backgroundColor: indicatorColor
          }}
        />
      </div>
    </div>
  );
};
