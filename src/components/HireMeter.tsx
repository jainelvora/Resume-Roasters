import React from 'react';

// Drop into the arena: <HireMeter odds={turns.map(t => t.hireOdds)} revealed={visibleTurnCount} />
export const HireMeter: React.FC<{ odds: (number | undefined)[]; revealed: number }> = ({ odds, revealed }) => {
  let current = 50;
  for (let i = 0; i < Math.min(revealed, odds.length); i++) {
    if (typeof odds[i] === 'number') current = odds[i] as number;
  }
  return (
    <div className="hire-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={current} aria-label="Hire odds">
      <div className="hire-meter-labels"><span>NO HIRE</span><strong>{current}%</strong><span>HIRE</span></div>
      <div className="hire-meter-track"><div className="hire-meter-fill" style={{ width: `${current}%` }} /></div>
    </div>
  );
};
