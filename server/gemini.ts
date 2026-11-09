import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildRoastPrompt, RoastPromptParams } from './prompts.js';
import { sanitizeAndValidateRoastJson, RoastResponse } from './validate.js';
import { SERVER_DEMO_BATTLE } from './demoBattle.js';

export const DEFAULT_MODEL = 'gemini-3-flash-preview';

export type RoastInput = RoastPromptParams & {
  jobDescription?: string;
  file?: { mimeType: string; data: string }; // base64 PDF or image
};

// Extra fields layered on top of the base prompt, so the original prompt stays untouched.
function buildAddendum(p: RoastInput): string {
  const lines = [
    'EXTRA OUTPUT FIELDS (add these to the same JSON object; every rule above still applies):',
    '- Every turn also gets "hireOdds": an integer 0-100, the committee\'s running chance of hiring this candidate after that turn. Start near 50 and move it by the argument that just landed.',
    '- verdict also gets "bestBurn" (the single funniest recruiter line, under 20 words) and "atsGap": {"matched": up to 6 keywords the resume already covers, "missing": up to 6 keywords the target role or job description wants that the resume lacks}.'
  ];
  if (p.jobDescription) {
    lines.push(`TARGET JOB DESCRIPTION. Judge the resume against it and base atsGap on it:\n${p.jobDescription}`);
  }
  if (p.file) {
    lines.push(
      'The resume is the ATTACHED FILE, not text. First transcribe it faithfully into a top-level "extractedText" string, leaving out phone numbers, emails and street addresses. Every "quote" must be copied verbatim from extractedText. Also add verdict.layoutNotes: 2-3 short notes on visual layout (hierarchy, density, fonts, whitespace).'
    );
  }
  return lines.join('\n');
}

// One shared time budget for the whole request, so the user never waits
// more than ~45s no matter how many retries happen.
const TOTAL_BUDGET_MS = 45_000;
const FIRST_ATTEMPT_MS = 30_000;
const MIN_RETRY_MS = 8_000;

export type RoastErrorCode = 'TIMEOUT' | 'RATE_LIMIT' | 'MODEL_REJECTED' | 'MODEL_ERROR' | 'BAD_OUTPUT';

export class RoastError extends Error {
  constructor(
    public code: RoastErrorCode,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'RoastError';
  }
}

function toRoastError(err: unknown): RoastError {
  if (err instanceof RoastError) return err;
  const msg = String((err as any)?.message || err);
  if (/\b429\b|quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(msg)) {
    return new RoastError('RATE_LIMIT', 'The model is rate-limited right now. Wait a minute and try again.', 429);
  }
  if (/\b(400|401|403|404)\b|API key|not found|PERMISSION_DENIED|INVALID_ARGUMENT/i.test(msg)) {
    return new RoastError(
      'MODEL_REJECTED',
      'The model rejected the request. Check GEMINI_API_KEY and GEMINI_MODEL in the server .env.',
      502
    );
  }
  return new RoastError('MODEL_ERROR', 'The model call failed. Please try again.', 502);
}

export async function generateRoastDebate(
  params: RoastInput,
  apiKey?: string,
  modelName: string = DEFAULT_MODEL
): Promise<RoastResponse> {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
  const effectiveModel = modelName || process.env.GEMINI_MODEL || DEFAULT_MODEL;

  // Demo mode is ONLY for "no key configured". Real failures throw (see below)
  // so a pre-written battle is never played over someone's actual resume.
  if (!effectiveKey) {
    console.log('[Gemini] No GEMINI_API_KEY set. Serving the demo battle.');
    return {
      ...SERVER_DEMO_BATTLE,
      isDemo: true,
      notice: 'Demo mode: no API key is configured, so this is a pre-written battle about a sample resume.'
    };
  }

  // Optional: lower "thinking" effort to cut latency (e.g. GEMINI_THINKING_LEVEL=low).
  // Left unset by default.
  const thinkingLevel = process.env.GEMINI_THINKING_LEVEL;
  const generationConfig: any = {
    responseMimeType: 'application/json',
    temperature: 0.8,
    ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {})
  };

  const genAI = new GoogleGenerativeAI(effectiveKey);
  const model = genAI.getGenerativeModel({ model: effectiveModel, generationConfig });

  const promptText = `${buildRoastPrompt(params)}\n\n${buildAddendum(params)}`;

  const runAttempt = async (prompt: string, timeoutMs: number): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await model.generateContent(
        params.file ? [{ text: prompt }, { inlineData: params.file }] : prompt,
        { signal: controller.signal }
      );
      return res.response.text();
    } catch (err) {
      if (controller.signal.aborted) {
        throw new RoastError('TIMEOUT', 'The roast took too long. Please try again.', 504);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };

  const started = Date.now();
  const remaining = () => TOTAL_BUDGET_MS - (Date.now() - started);
  let lastProblem = '';

  // Attempt 1, plus at most one retry when the output is unusable.
  for (let attempt = 0; attempt < 2; attempt++) {
    const budget = attempt === 0 ? Math.min(FIRST_ATTEMPT_MS, remaining()) : remaining();
    if (attempt > 0 && budget < MIN_RETRY_MS) break;

    const prompt =
      attempt === 0
        ? promptText
        : `${promptText}\n\nCRITICAL FIX NEEDED: ${lastProblem} Return ONLY a raw JSON object: 8 to 10 strictly alternating turns (recruiter first) and exactly 3 fixes, each with title, why, before, and after.`;

    console.log(`[Gemini] ${effectiveModel} attempt ${attempt + 1} (budget ${Math.round(budget / 1000)}s)`);

    let raw: string;
    try {
      raw = await runAttempt(prompt, budget);
    } catch (err: any) {
      console.error('[Gemini] Call error:', err?.message || err);
      const isTransient = /503|unavailable|high demand|overloaded|fetch failed/i.test(String(err?.message || err));
      if (isTransient && attempt === 0 && remaining() > MIN_RETRY_MS) {
        console.log('[Gemini] Transient error, waiting 2s before retry...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw toRoastError(err);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
      lastProblem = 'Your previous response was not valid JSON.';
      console.warn('[Gemini] JSON parse failed.');
      continue;
    }

    // For uploaded files, quotes are checked against the model's own transcription.
    const source = params.file ? String(parsed?.extractedText ?? '') : params.resume;
    if (params.file && source.trim().length < 80) {
      lastProblem = 'extractedText was missing or too short. Transcribe the whole attached resume.';
      continue;
    }
    const validation = sanitizeAndValidateRoastJson(parsed, source);
    if (validation.valid && validation.result) {
      return params.file ? { ...validation.result, extractedText: source.trim() } : validation.result;
    }
    lastProblem = `Your previous response failed validation: ${validation.error}.`;
    console.warn(`[Gemini] Validation failed: ${validation.error}`);
  }

  throw new RoastError('BAD_OUTPUT', 'The model returned a battle we could not use. Please try again.', 502);
}
