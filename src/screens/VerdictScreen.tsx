import React, { useState } from 'react';
import { Verdict } from '../types';

interface VerdictScreenProps {
  verdict: Verdict;
  onRunAgain: () => void;
  onNewResume: () => void;
}

export const VerdictScreen: React.FC<VerdictScreenProps> = ({
  verdict,
  onRunAgain,
  onNewResume
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyLine = (afterText: string, index: number) => {
    navigator.clipboard.writeText(afterText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleCopyAllFixes = () => {
    const formatted = verdict.fixes
      .map(
        (f, i) =>
          `FIX #${i + 1}: ${f.title}\nWHY: ${f.why}\n${f.before ? `BEFORE: ${f.before}\n` : ''}AFTER: ${f.after}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(
      `RESUME ROAST BATTLE VERDICT\nScore: ${verdict.score}/100 — ${verdict.headline}\n"${verdict.oneLiner}"\n\n${formatted}`
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="verdict-screen">
      {/* Rubber Stamp Score & Headline */}
      <div className="stamp-wrapper">
        <div className="rubber-stamp stamp-anim">
          <span className="stamp-score">{verdict.score} / 100</span>
          <span className="stamp-headline">{verdict.headline}</span>
        </div>
      </div>

      {/* Duo Showcase: Rex & Mo Side by Side */}
      <div className="verdict-duo-card">
        <div className="duo-character">
          <img
            src="/mascots/recruiter-laugh.png"
            alt="Rex final reaction"
            className="duo-img"
          />
          <span
            className="sticker-badge red"
            style={{ fontSize: 10, padding: '3px 8px', marginTop: 8 }}
          >
            Rex (Roaster)
          </span>
        </div>

        <div className="duo-caption-box">
          <span className="duo-caption-title">Joint Committee Verdict</span>
          <p className="duo-oneliner">"{verdict.oneLiner}"</p>
        </div>

        <div className="duo-character">
          <img
            src="/mascots/manager-thumbs-up.png"
            alt="Mo final reaction"
            className="duo-img"
          />
          <span
            className="sticker-badge"
            style={{ fontSize: 10, padding: '3px 8px', marginTop: 8 }}
          >
            Mo (Supporter)
          </span>
        </div>
      </div>

      {/* The 3 Fix Cards Section */}
      <div className="fixes-section">
        <div className="section-header-pill">The Top 3 Fixes (Ordered by Impact)</div>

        <div className="fixes-grid">
          {verdict.fixes.map((fix, idx) => (
            <div key={idx} className="fix-card">
              <span className="fix-number">FIX #0{idx + 1}</span>
              <h3 className="fix-title">{fix.title}</h3>
              <p className="fix-why">{fix.why}</p>

              <div className="diff-box">
                {fix.before && (
                  <div>
                    <div className="diff-header">
                      <span className="diff-badge" style={{ color: 'var(--recruiter-red)' }}>
                        Before (Rex redline)
                      </span>
                    </div>
                    <div className="diff-line before">{fix.before}</div>
                  </div>
                )}

                <div>
                  <div className="diff-header">
                    <span className="diff-badge" style={{ color: '#795b00' }}>
                      After (Mo rewrite)
                    </span>
                    <button
                      type="button"
                      className="btn-sm btn"
                      onClick={() => handleCopyLine(fix.after, idx)}
                    >
                      {copiedIndex === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="diff-line after">{fix.after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="verdict-actions">
        <button type="button" className="btn btn-secondary" onClick={onRunAgain}>
          Run it again
        </button>

        <button type="button" className="btn btn-primary" onClick={onNewResume}>
          New resume
        </button>

        <button type="button" className="btn" onClick={handleCopyAllFixes}>
          {copiedAll ? 'All Fixes Copied!' : 'Copy all fixes'}
        </button>
      </div>
    </div>
  );
};
