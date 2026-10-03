import React, { useState, useEffect, useCallback } from 'react';
import { DebateTurn, RoastResponse, Speaker } from '../types';
import { MascotStage } from '../components/MascotStage';
import { SpeechBubble } from '../components/SpeechBubble';
import { ResumePaper } from '../components/ResumePaper';
import { HeatBar } from '../components/HeatBar';
import { HireMeter } from '../components/HireMeter';

interface ArenaScreenProps {
  battleData: RoastResponse | null;
  resumeText: string;
  isLoading: boolean;
  onFinishDebate: () => void;
}

const LOADING_LINES = [
  'Rex is cracking his knuckles...',
  'Mo is taking a slow sip of coffee...',
  'Both rabbits are scanning for buzzwords...'
];

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  battleData,
  resumeText,
  isLoading,
  onFinishDebate
}) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);

  // Cycle loading lines without spinner
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingLineIndex((prev) => (prev + 1) % LOADING_LINES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const turns: DebateTurn[] = battleData?.turns || [];
  const totalTurns = turns.length;
  const currentTurn: DebateTurn | undefined = turns[currentTurnIndex];

  // Handle keyboard: Space to pause/unpause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isLoading) {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

  // Handle completion of a turn's typing
  const handleTurnComplete = useCallback(() => {
    if (currentTurnIndex < totalTurns - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      // Reached the end of the battle
      onFinishDebate();
    }
  }, [currentTurnIndex, totalTurns, onFinishDebate]);

  // Skip button handler
  const handleSkip = () => {
    onFinishDebate();
  };

  const activeSpeaker: Speaker = currentTurn?.speaker || 'recruiter';
  const rexMood = activeSpeaker === 'recruiter' ? currentTurn?.mood || 'smirk' : 'idle';
  const moMood = activeSpeaker === 'manager' ? currentTurn?.mood || 'hands-up' : 'idle';

  return (
    <div className="arena-screen">
      {/* Fallback / Demo notification if active */}
      {battleData?.notice && (
        <div className="demo-notice-bar" role="status">
          {battleData.notice}
        </div>
      )}

      {/* Top Bar: Round Counter, Heat Bar & Hire Meter, Controls */}
      <div className="arena-top-bar">
        <div className="round-counter-pill">
          {isLoading ? 'PREPARING ARENA' : `Round ${currentTurnIndex + 1} of ${totalTurns}`}
        </div>

        <div className="arena-top-metrics">
          <HeatBar
            speaker={activeSpeaker}
            roundNumber={currentTurnIndex + 1}
            totalRounds={totalTurns || 8}
          />
          <HireMeter
            odds={battleData?.turns?.map((t: any) => t.hireOdds) || []}
            revealed={isLoading ? 0 : currentTurnIndex + 1}
          />
        </div>

        <div className="arena-controls">
          <span className="space-hint">Space to {isPaused ? 'play' : 'pause'}</span>

          <button
            type="button"
            className={`control-btn ${speed === 2 ? 'active' : ''}`}
            onClick={() => setSpeed((prev) => (prev === 1 ? 2 : 1))}
            title="Toggle typing playback speed"
          >
            {speed}x Speed
          </button>

          <button
            type="button"
            className="control-btn"
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            type="button"
            className="control-btn"
            onClick={handleSkip}
            title="Skip directly to Verdict"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Main 3-Zone Arena Stage */}
      <div className="arena-stage">
        {/* Zone 1: Rex on the Left */}
        <MascotStage
          speaker="recruiter"
          mood={rexMood}
          isActive={activeSpeaker === 'recruiter'}
        />

        {/* Zone 2: Middle (Speech Bubble + Scrollable Resume Paper) */}
        <div className="arena-center-zone">
          {isLoading ? (
            <div className="arena-loading-box">
              <div className="loading-punchline">{LOADING_LINES[loadingLineIndex]}</div>
              <div className="loading-subtext">Rex and Mo are reviewing the document.</div>
            </div>
          ) : (
            <>
              {currentTurn && (
                <SpeechBubble
                  key={currentTurnIndex}
                  speaker={currentTurn.speaker}
                  text={currentTurn.text}
                  speed={speed}
                  isPaused={isPaused}
                  onComplete={handleTurnComplete}
                />
              )}

              <ResumePaper
                resumeText={resumeText}
                activeQuote={currentTurn?.quote || null}
                speaker={activeSpeaker}
              />
            </>
          )}
        </div>

        {/* Zone 3: Mo on the Right */}
        <MascotStage
          speaker="manager"
          mood={moMood}
          isActive={activeSpeaker === 'manager'}
        />
      </div>
    </div>
  );
};
