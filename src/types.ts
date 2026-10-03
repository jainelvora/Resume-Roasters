export type Speaker = 'recruiter' | 'manager';

export type RecruiterMood = 'smirk' | 'point' | 'laugh' | 'disappointed' | 'idle';
export type ManagerMood = 'idle' | 'hands-up' | 'thumbs-up' | 'thinking';
export type MascotMood = RecruiterMood | ManagerMood;

export interface DebateTurn {
  speaker: Speaker;
  text: string;
  quote: string | null;
  mood: MascotMood;
  hireOdds?: number;
}

export interface FixItem {
  title: string;
  why: string;
  before: string | null;
  after: string;
}

export interface Verdict {
  score: number;
  headline: string;
  oneLiner: string;
  fixes: FixItem[];
  bestBurn?: string;
  atsGap?: { matched: string[]; missing: string[] };
  layoutNotes?: string[];
}

export interface RoastResponse {
  turns: DebateTurn[];
  verdict: Verdict;
  isDemo?: boolean;
  notice?: string;
  extractedText?: string;
}

export type Intensity = 'mild' | 'medium' | 'well-done';

export type ScreenState = 'intake' | 'arena' | 'verdict';
