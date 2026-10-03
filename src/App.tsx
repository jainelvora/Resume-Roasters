import React, { useRef, useState } from 'react';
import { ScreenState, Intensity, RoastResponse } from './types';
import { IntakeScreen } from './screens/IntakeScreen';
import { ArenaScreen } from './screens/ArenaScreen';
import { VerdictScreen } from './screens/VerdictScreen';
import { SAMPLE_RESUME } from './demo/sampleResume';
import './features.css';
import { StartExtras, RoastExtras } from './featureTypes';
import { ScoreDelta } from './components/ScoreDelta';
import { Insights } from './components/Insights';
import { ShareCard } from './components/ShareCard';

// Server gives up after ~45s; the client waits a little longer so the
// server's own friendly error message arrives first.
const CLIENT_TIMEOUT_MS = 55_000;
const SAMPLE_HINT = ' You can also tap "use a sample" to watch a demo battle.';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('intake');
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [intensity, setIntensity] = useState<Intensity>('medium');
  const [battleData, setBattleData] = useState<RoastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const extrasRef = useRef<StartExtras | undefined>(undefined);
  const [scores, setScores] = useState<number[]>([]);

  const startBattle = async (
    rawResume: string,
    role: string,
    chosenIntensity: Intensity,
    extras?: StartExtras
  ) => {
    extrasRef.current = extras;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    setResumeText(rawResume);
    setTargetRole(role);
    setIntensity(chosenIntensity);
    setBattleData(null);
    setIsLoading(true);
    setErrorMessage(null);
    setScreen('arena');

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: rawResume,
          targetRole: role || undefined,
          intensity: chosenIntensity,
          file: extras?.file ? { mimeType: extras.file.mimeType, data: extras.file.data } : undefined,
          jobDescription: extras?.jobDescription || undefined
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data: RoastResponse = await response.json();

      // Demo battles are written about the sample resume, so show that resume
      // (otherwise the quote highlights would never line up with the user's text).
      const extracted = (data as unknown as RoastExtras).extractedText;
      if (data.isDemo) {
        setResumeText(SAMPLE_RESUME);
      } else {
        // For uploaded files, the transcription is what the quote highlights line up with.
        if (extracted) setResumeText(extracted);
        setScores((prev) => [...prev, data.verdict.score]);
      }
      setBattleData(data);
      setIsLoading(false);
    } catch (err: any) {
      // Superseded by a newer request or by "New resume": stay quiet.
      if (err?.name === 'AbortError' && !timedOut) return;

      console.warn('[Battle Load Error]:', err?.message || err);
      let message: string;
      if (timedOut) {
        message = 'The roast took too long to come back.';
      } else if (err instanceof TypeError) {
        message = 'Could not reach the server. Is it running (npm run dev)?';
      } else {
        message = err?.message || 'Something went wrong staging the battle.';
      }

      // Back to the form with the user's text intact, and a clear error.
      setErrorMessage(`${message} Your resume is still here, so you can try again.${SAMPLE_HINT}`);
      setIsLoading(false);
      setScreen('intake');
    } finally {
      clearTimeout(timer);
    }
  };

  const handleRunAgain = () => {
    startBattle(resumeText, targetRole, intensity, extrasRef.current);
  };

  // Back to the form with the text kept, so edits can be re-roasted and compared.
  const handleEditAndReroast = () => {
    const jd = extrasRef.current?.jobDescription;
    extrasRef.current = jd ? { jobDescription: jd } : undefined;
    setErrorMessage(null);
    setScreen('intake');
  };

  const handleNewResume = () => {
    abortRef.current?.abort();
    setBattleData(null);
    setResumeText('');
    setTargetRole('');
    setScores([]);
    extrasRef.current = undefined;
    setErrorMessage(null);
    setIsLoading(false);
    setScreen('intake');
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-nav">
        <a
          href="#"
          className="brand-badge"
          onClick={(e) => {
            e.preventDefault();
            handleNewResume();
          }}
        >
          <img
            src="/mascots/recruiter-avatar.png"
            alt="Mascot Icon"
            style={{ width: 28, height: 28, borderRadius: 4 }}
          />
          <span className="brand-title">Resume Roast Battle</span>
          <span className="brand-tag">BETA</span>
        </a>

        <div className="nav-status">
          {screen === 'intake' && 'Ready for intake'}
          {screen === 'arena' && (isLoading ? 'Evaluating resume...' : 'Debate in progress')}
          {screen === 'verdict' && 'Final committee verdict'}
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="main-view">
        {screen === 'intake' && (
          <IntakeScreen
            initialResume={resumeText}
            initialRole={targetRole}
            initialIntensity={intensity}
            initialExtras={extrasRef.current}
            onStartBattle={startBattle}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {screen === 'arena' && (
          <ArenaScreen
            battleData={battleData}
            resumeText={resumeText}
            isLoading={isLoading}
            onFinishDebate={() => setScreen('verdict')}
          />
        )}

        {screen === 'verdict' && battleData && (
          <>
            <VerdictScreen
              verdict={battleData.verdict}
              onRunAgain={handleRunAgain}
              onNewResume={handleNewResume}
            />
            <div className="feature-stack">
              <ScoreDelta scores={scores} />
              <Insights verdict={(battleData as unknown as RoastExtras).verdict} />
              <ShareCard
                score={battleData.verdict.score}
                headline={battleData.verdict.headline}
                burn={
                  (battleData as unknown as RoastExtras).verdict?.bestBurn ||
                  battleData.turns.find((t) => t.speaker === 'recruiter')?.text ||
                  ''
                }
              />
              <button type="button" className="btn btn-primary" onClick={handleEditAndReroast}>
                Edit my resume and re-roast
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
