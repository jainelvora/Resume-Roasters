export interface DebateTurn {
  speaker: 'recruiter' | 'manager';
  text: string;
  quote: string | null;
  mood: 'smirk' | 'point' | 'laugh' | 'disappointed' | 'idle' | 'hands-up' | 'thumbs-up' | 'thinking';
  hireOdds?: number; // running 0-100 chance of getting hired after this turn
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
  extractedText?: string; // only when the resume came in as a PDF/image
}

export function validateInputResume(resume: unknown): { valid: boolean; error?: string; text: string } {
  if (typeof resume !== 'string') {
    return { valid: false, error: 'Resume must be text.', text: '' };
  }
  const trimmed = resume.trim();
  if (trimmed.length < 150) {
    return {
      valid: false,
      error: `That resume is only ${trimmed.length} characters long. We need at least 150 characters (about 25 words) for Rex and Mo to find something to argue about.`,
      text: ''
    };
  }
  if (trimmed.length > 12000) {
    return {
      valid: false,
      error: 'Resume is too long (over 12,000 characters). Please paste a condensed version or your top 2-3 roles.',
      text: ''
    };
  }
  return { valid: true, text: trimmed };
}

function cleanList(v: unknown, max: number): string[] {
  return Array.isArray(v)
    ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 60)).slice(0, max)
    : [];
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findExactSlice(resume: string, quote: string): string | null {
  const words = quote.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (words.length === 0) return null;
  const match = new RegExp(words.join('\\s+'), 'i').exec(resume);
  return match ? match[0] : null;
}

export function sanitizeAndValidateRoastJson(data: any, originalResume: string): { valid: boolean; result?: RoastResponse; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Output is not an object.' };
  }

  const { turns, verdict } = data;

  if (!Array.isArray(turns) || turns.length < 6) {
    return { valid: false, error: `Invalid turns count (${Array.isArray(turns) ? turns.length : 0}). Expected 8 to 10 turns.` };
  }
  const rawTurns = turns.slice(0, 10);

  const validRecruiterMoods = new Set(['smirk', 'point', 'laugh', 'disappointed', 'idle']);
  const validManagerMoods = new Set(['idle', 'hands-up', 'thumbs-up', 'thinking']);

  const sanitizedTurns: DebateTurn[] = [];

  for (let i = 0; i < rawTurns.length; i++) {
    const t = rawTurns[i] || {};
    // Alternation is enforced by position (Rex first), not trusted from the model.
    const speaker: 'recruiter' | 'manager' = i % 2 === 0 ? 'recruiter' : 'manager';

    const rawMood = typeof t.mood === 'string' ? t.mood.toLowerCase() : '';
    let mood: DebateTurn['mood'] = 'idle';

    if (speaker === 'recruiter') {
      mood = validRecruiterMoods.has(rawMood) ? (rawMood as DebateTurn['mood']) : 'smirk';
    } else {
      mood = validManagerMoods.has(rawMood) ? (rawMood as DebateTurn['mood']) : 'hands-up';
    }

    // Verify the quote exists in the resume; keep the exact original slice so the
    // highlighter can find it. Whitespace/newline differences are tolerated.
    const verifiedQuote: string | null =
      typeof t.quote === 'string' && t.quote.trim().length > 3
        ? findExactSlice(originalResume, t.quote)
        : null;

    sanitizedTurns.push({
      speaker,
      text: typeof t.text === 'string' ? t.text.trim().replace(/[*_#`]/g, '') : 'Let us look closer at this document.',
      quote: verifiedQuote,
      mood,
      hireOdds: Number.isFinite(Number(t.hireOdds)) ? Math.min(100, Math.max(0, Math.round(Number(t.hireOdds)))) : undefined
    });
  }

  if (!verdict || typeof verdict !== 'object') {
    return { valid: false, error: 'Missing verdict object.' };
  }

  const scoreNum = Math.min(100, Math.max(0, parseInt(verdict.score, 10) || 50));
  const headline = typeof verdict.headline === 'string' && verdict.headline.trim().length > 0
    ? verdict.headline.trim()
    : 'MIXED BAG: NEEDS CONCRETE EVIDENCE';
  const oneLiner = typeof verdict.oneLiner === 'string' && verdict.oneLiner.trim().length > 0
    ? verdict.oneLiner.trim()
    : 'Rex found the buzzwords, Mo found the promise. Time to rewrite.';

  const rawFixes = Array.isArray(verdict.fixes) ? verdict.fixes : [];
  const sanitizedFixes: FixItem[] = [];

  for (let j = 0; j < Math.min(3, rawFixes.length); j++) {
    const f = rawFixes[j];
    sanitizedFixes.push({
      title: typeof f.title === 'string' ? f.title.trim() : `Fix #${j + 1}`,
      why: typeof f.why === 'string' ? f.why.trim() : 'Recruiters skip claims that lack measurable impact.',
      before: typeof f.before === 'string' ? f.before.trim() : null,
      after: typeof f.after === 'string' ? f.after.trim() : 'Replaced passive wording with quantified impact [X%].'
    });
  }

  // Ensure exactly 3 fixes
  while (sanitizedFixes.length < 3) {
    const n = sanitizedFixes.length + 1;
    sanitizedFixes.push({
      title: `Quantify Impact in Role #${n}`,
      why: 'Vague responsibilities leave the hiring team guessing your actual contributions.',
      before: 'Responsible for day-to-day operations and team communication.',
      after: 'Led cross-functional operations across [X] team members, boosting delivery speed by [Y%].'
    });
  }

  return {
    valid: true,
    result: {
      turns: sanitizedTurns,
      verdict: {
        score: scoreNum,
        headline,
        oneLiner,
        fixes: sanitizedFixes.slice(0, 3),
        bestBurn: typeof verdict.bestBurn === 'string' && verdict.bestBurn.trim() ? verdict.bestBurn.trim().slice(0, 160) : undefined,
        atsGap: verdict.atsGap
          ? { matched: cleanList(verdict.atsGap.matched, 6), missing: cleanList(verdict.atsGap.missing, 6) }
          : undefined,
        layoutNotes: cleanList(verdict.layoutNotes, 3).length ? cleanList(verdict.layoutNotes, 3) : undefined
      }
    }
  };
}
