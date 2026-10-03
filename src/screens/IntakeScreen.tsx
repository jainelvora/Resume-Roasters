import React, { useState } from 'react';
import { Intensity } from '../types';
import { StartExtras, UploadedFile } from '../featureTypes';
import { SAMPLE_RESUME } from '../demo/sampleResume';
import { HandUnderline } from '../components/HandUnderline';
import { TapeStrip } from '../components/TapeStrip';

interface IntakeScreenProps {
  initialResume?: string;
  initialRole?: string;
  initialIntensity?: Intensity;
  initialExtras?: StartExtras;
  onStartBattle: (resume: string, targetRole: string, intensity: Intensity, extras?: StartExtras) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const IntakeScreen: React.FC<IntakeScreenProps> = ({
  initialResume = '',
  initialRole = '',
  initialIntensity = 'medium',
  initialExtras,
  onStartBattle,
  isLoading,
  errorMessage
}) => {
  const [resumeText, setResumeText] = useState(initialResume);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [intensity, setIntensity] = useState<Intensity>(initialIntensity);
  const [localError, setLocalError] = useState<string | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(initialExtras?.file ?? null);
  const [jd, setJd] = useState(initialExtras?.jobDescription ?? '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(f.type)) {
      setLocalError('Upload a PDF, PNG, JPG or WebP file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setLocalError('That file is over 5 MB. Try a smaller export.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(',')[1] || '';
      setFile({ name: f.name, mimeType: f.type, data });
      setLocalError(null);
    };
    reader.onerror = () => setLocalError('Could not read that file.');
    reader.readAsDataURL(f);
  };

  const handleUseSample = () => {
    setResumeText(SAMPLE_RESUME);
    setTargetRole('Lead Full-Stack Systems Architect');
    setLocalError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = resumeText.trim();
    if (file) {
      setLocalError(null);
      onStartBattle(trimmed, targetRole.trim(), intensity, { file, jobDescription: jd.trim() || undefined });
      return;
    }
    if (trimmed.length < 150) {
      setLocalError(
        `That resume is only ${trimmed.length} characters long. We need at least 150 characters (about 25 words) for Rex and Mo to find something to argue about.`
      );
      return;
    }
    if (trimmed.length > 12000) {
      setLocalError('Resume is too long (over 12,000 characters). Please paste a condensed version.');
      return;
    }
    setLocalError(null);
    onStartBattle(trimmed, targetRole.trim(), intensity, jd.trim() ? { jobDescription: jd.trim() } : undefined);
  };

  const activeError = localError || errorMessage;

  return (
    <div className="intake-screen">
      {/* Left Column: Hero & Persona Peeks */}
      <div className="intake-hero">
        <div>
          <span className="sticker-badge">NOT A REAL RECRUITER</span>
        </div>

        <h1 className="intake-headline">
          Let two rabbits{' '}
          <span className="underline-wrapper">
            tear
            <HandUnderline />
          </span>{' '}
          your resume apart.
        </h1>

        <p className="intake-subcopy">
          Paste it in. One of them will be mean. The other one will be right.
        </p>

        {/* Mascot Peeking Stage */}
        <div className="intake-peeks">
          <div className="peek-card">
            <div className="peek-color-block red" />
            <img
              src="/mascots/recruiter-idle.png"
              alt="Rex - The Recruiter"
              className="peek-img"
            />
            <span className="peek-label" style={{ color: 'var(--recruiter-red)' }}>
              Rex (Ruthless)
            </span>
          </div>

          <div className="peek-card">
            <div className="peek-color-block mustard" />
            <img
              src="/mascots/manager-idle.png"
              alt="Mo - The Hiring Manager"
              className="peek-img"
            />
            <span className="peek-label" style={{ color: '#F2B705' }}>
              Mo (Realist)
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Sheet of Paper Form */}
      <div className="intake-form-column">
        <form onSubmit={handleSubmit} className="form-controls">
          <div className="paper-sheet-container">
            <TapeStrip position="top-center" />
            <div className="paper-header">
              <span className="paper-label">Candidate Resume (Raw Text)</span>
              <button
                type="button"
                className="sample-link"
                onClick={handleUseSample}
                disabled={isLoading}
              >
                no resume handy? use a sample
              </button>
            </div>

            <textarea
              id="resume-input"
              className="resume-textarea"
              placeholder="Paste your resume here (Summary, Experience, Projects, Skills)..."
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={isLoading}
              rows={12}
            />

            <div className="char-counter">
              {resumeText.trim().length} / 12,000 chars (min. 150)
            </div>

            <div className="upload-row">
              <label className="sample-link" style={{ cursor: 'pointer' }}>
                or upload a PDF / screenshot
                <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleFile} disabled={isLoading} hidden />
              </label>
              {file && (
                <>
                  <span className="file-name">{file.name} (used instead of the pasted text)</span>
                  <button type="button" className="sample-link" onClick={() => setFile(null)} disabled={isLoading}>remove</button>
                </>
              )}
            </div>
          </div>

          {/* Role You're Aiming For */}
          <div className="field-group">
            <label htmlFor="target-role" className="field-label">
              Role you're aiming for (optional)
            </label>
            <input
              id="target-role"
              type="text"
              className="text-input"
              placeholder="e.g. Senior Frontend Engineer or Staff Systems Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Optional job description */}
          <div className="field-group">
            <label htmlFor="job-description" className="field-label">
              Job description (optional, unlocks the keyword gap)
            </label>
            <textarea
              id="job-description"
              className="text-input jd-textarea"
              placeholder="Paste the job posting you are applying to..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 3-Way Intensity Switch */}
          <div className="field-group">
            <span className="field-label">Roast Intensity</span>
            <div className="intensity-selector" role="radiogroup" aria-label="Roast Intensity">
              <button
                type="button"
                className={`intensity-pill ${intensity === 'mild' ? 'active mild' : ''}`}
                onClick={() => setIntensity('mild')}
                disabled={isLoading}
              >
                Mild
              </button>
              <button
                type="button"
                className={`intensity-pill ${intensity === 'medium' ? 'active medium' : ''}`}
                onClick={() => setIntensity('medium')}
                disabled={isLoading}
              >
                Medium
              </button>
              <button
                type="button"
                className={`intensity-pill ${intensity === 'well-done' ? 'active well-done' : ''}`}
                onClick={() => setIntensity('well-done')}
                disabled={isLoading}
              >
                Well-done
              </button>
            </div>
          </div>

          {activeError && (
            <div className="error-banner" role="alert">
              {activeError}
            </div>
          )}

          <div className="form-footer">
            <button
              id="start-fight-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Setting up the arena...' : 'Start the fight'}
            </button>
            <div className="privacy-note">Sent to the model, not saved. Pasted text has emails, phones and profile links masked first; uploaded files can't be masked.</div>
          </div>
        </form>
      </div>
    </div>
  );
};
