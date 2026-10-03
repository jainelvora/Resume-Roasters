import React from 'react';

export const ScoreDelta: React.FC<{ scores: number[] }> = ({ scores }) => {
  if (scores.length < 2) return null;
  const diff = scores[scores.length - 1] - scores[scores.length - 2];
  return (
    <div className="feature-card">
      <span className="feature-title">Re-roast progress</span>
      <div className="score-trail">
        {scores.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="score-arrow">→</span>}
            <span className="score-chip">Roast {i + 1}: {s}</span>
          </React.Fragment>
        ))}
      </div>
      <p className="feature-note">
        {diff > 0 ? `Up ${diff} points since the last roast.` : diff < 0 ? `Down ${-diff} points. The edits hurt.` : 'No change since the last roast.'}
      </p>
    </div>
  );
};
