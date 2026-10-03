import React from 'react';
import { RoastExtras } from '../featureTypes';

export const Insights: React.FC<{ verdict?: RoastExtras['verdict'] }> = ({ verdict }) => {
  const gap = verdict?.atsGap;
  const notes = verdict?.layoutNotes;
  const hasGap = gap && (gap.matched.length > 0 || gap.missing.length > 0);
  if (!hasGap && !notes?.length) return null;
  return (
    <div className="feature-card">
      {hasGap && (
        <>
          <span className="feature-title">Keyword gap</span>
          <div className="chip-row">
            {gap!.matched.map((k) => <span key={`m-${k}`} className="chip chip-ok">{k}</span>)}
            {gap!.missing.map((k) => <span key={`x-${k}`} className="chip chip-miss">missing: {k}</span>)}
          </div>
        </>
      )}
      {notes && notes.length > 0 && (
        <>
          <span className="feature-title">Layout notes</span>
          <ul className="feature-list">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </>
      )}
    </div>
  );
};
