import React, { useEffect, useState } from 'react';
import { Speaker, MascotMood } from '../types';

interface MascotStageProps {
  speaker: Speaker;
  mood: MascotMood;
  isActive: boolean;
}

export const MascotStage: React.FC<MascotStageProps> = ({ speaker, mood, isActive }) => {
  const [animating, setAnimating] = useState(false);

  // Trigger 150ms squash animation whenever mood or active state changes
  useEffect(() => {
    if (isActive) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [mood, isActive]);

  const getImageSrc = () => {
    if (speaker === 'recruiter') {
      switch (mood) {
        case 'point':
          return '/mascots/recruiter-point.png';
        case 'laugh':
          return '/mascots/recruiter-laugh.png';
        case 'disappointed':
          return '/mascots/recruiter-disappointed.png';
        case 'smirk':
        case 'idle':
        default:
          return '/mascots/recruiter-idle.png';
      }
    } else {
      switch (mood) {
        case 'hands-up':
          return '/mascots/manager-hands-up.png';
        case 'thumbs-up':
          return '/mascots/manager-thumbs-up.png';
        case 'thinking':
          return '/mascots/manager-thinking.png';
        case 'idle':
        default:
          return '/mascots/manager-idle.png';
      }
    }
  };

  const isRecruiter = speaker === 'recruiter';
  const name = isRecruiter ? 'Rex' : 'Mo';
  const role = isRecruiter ? 'The Recruiter (Ruthless)' : 'The Hiring Manager (Realist)';

  return (
    <div className={`mascot-zone ${isActive ? 'active active-mobile' : 'dimmed'}`}>
      <div className="mascot-stand">
        <div className={`mascot-color-block ${isRecruiter ? 'red' : 'mustard'}`} />
        <img
          src={getImageSrc()}
          alt={`${name} — ${role}, expressing ${mood}`}
          className={`mascot-img ${animating ? 'squash' : ''}`}
        />
      </div>
      <div className="mascot-tag">
        <span className="mascot-name" style={{ color: isRecruiter ? 'var(--recruiter-red)' : '#795b00' }}>
          {name}
        </span>
        <span className="mascot-role">{role}</span>
      </div>
    </div>
  );
};
