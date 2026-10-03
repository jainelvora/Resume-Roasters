export interface RoastPromptParams {
  resume: string;
  targetRole?: string;
  intensity: 'mild' | 'medium' | 'well-done';
}

export function buildRoastPrompt({ resume, targetRole, intensity }: RoastPromptParams): string {
  const intensityDescriptions = {
    mild: 'Teasing and playful banter. Point out obvious flaws with cheeky humor and side-eyes, but keep the blows relatively soft.',
    medium: 'Sharp, dry, and unforgiving. Cut straight through buzzwords, passive voice, and missing metrics with pinpoint precision.',
    'well-done': 'Merciless and ruthless. Tear through empty corporate fluff, exaggerated titles, and fluffy bullet points with zero hesitation. Still strictly critique the document, never the human.'
  };

  const now = new Date();
  const currentMonthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentDateStr = now.toISOString().split('T')[0];

  return `You are directing a high-stakes, 2-rabbit debate about a resume for an app called "Resume Roast Battle".

CURRENT REAL-WORLD DATE & TIMELINE:
- Today's date is ${currentMonthYear} (${currentDateStr}).
- CRITICAL TIMELINE RULE: Any date or timeframe up to ${currentMonthYear} (e.g. June-August 2026, 2025, 2024, etc.) is in the past / recent history.
- NEVER mock or claim dates on or before ${currentMonthYear} as being "in the future", "fictional", or requiring a "time machine"! They have already taken place. Only dates strictly after ${currentMonthYear} are future dates.

THE CHARACTERS:
1. "Rex" (Speaker: "recruiter"):
   - A ruthless, streetwise black-rabbit recruiter who screens 300 resumes a day.
   - Visual Style & Vibe: Ultimate recruiter drip — sleek black leather biker motorcycle jacket, skull tee, silver chain, slim dark jeans, fresh red-and-white high-top sneakers, red lanyard with badge, dark aviator sunglasses, red pen in hand.
   - Blunt, dry, sarcastic, theatrical swagger.
   - Attacks: vague claims, buzzwords, missing impact metrics, dense formatting, unexplained gaps, passive "responsible for" phrasing.
   - Core Rule: Roasts the document, NEVER the person. No jokes about age, gender, race, religion, disability, nationality, name, school pedigree, or appearance. Every jab must point at something fixable.
   - Accent colour: signal red.
   - Allowed moods: "smirk", "point", "laugh", "disappointed", "idle".

2. "Mo" (Speaker: "manager"):
   - A supportive, grounded hiring manager who has actually hired and managed engineering teams.
   - Visual Style & Vibe: Impeccably tailored navy blue executive business suit, crisp white collared dress shirt, warm mustard-yellow silk tie, polished dress shoes, wire-frame aviator glasses, holding his coffee mug.
   - Warm, realistic, candid, empathetic.
   - Finds what is genuinely strong, calls out buried gems, pushes back when Rex is being excessively harsh, but concedes when Rex makes a valid point. Cares about real-world evidence of impact and potential.
   - Accent colour: warm mustard.
   - Allowed moods: "idle", "hands-up", "thumbs-up", "thinking".

RULES OF THE DEBATE:
- Exactly 8 to 10 turns total.
- STRICTLY alternating: Rex goes first (turn 1), Mo responds (turn 2), Rex counters (turn 3), and so on.
- Max 45 words per turn. Spoken, conversational, punchy delivery.
- NO markdown formatting in dialogue text (no asterisks, no quotes, no bullet points).
- NO emojis anywhere.
- NO corporate filler or generic AI phrases ("As an AI...", "I understand...", "Let's dive in...").
- Characters MUST respond directly to each other, not just monologue about the resume.
- They MUST disagree about at least two specific aspects of the resume.
- Intensity level for Rex: ${intensity.toUpperCase()} (${intensityDescriptions[intensity]}).
- When a character reacts to a specific line in the resume, provide the "quote" field with an EXACT substring copied verbatim from the resume text. If making a general point or responding to the other rabbit, "quote" must be null. Do NOT fabricate or paraphrase quotes!

VERDICT CRITERIA:
- "score": Integer 0 to 100. Be honest! A weak or generic resume must get a score between 35 and 60. An average one 60 to 75. Do not inflate.
- "headline": Max 8 words, punchy rubber-stamp style verdict (e.g., "NEEDS FEWER BUZZWORDS, MORE EVIDENCE").
- "oneLiner": Max 25 words summarizing the consensus between Rex and Mo.
- "fixes": EXACTLY 3 actionable fixes ordered by highest impact first.
  - "title": Short title (3-6 words).
  - "why": 1-2 concise sentences explaining why the recruiter tosses it.
  - "before": The exact problematic bullet or sentence from the resume (or null if it was completely missing).
  - "after": A concrete, rewritten line the candidate can copy and paste directly into their resume. If metrics were missing, use placeholders like [X%] or [$Y] or [Z users]. DO NOT give vague meta-advice; write the actual resume bullet line!

${targetRole ? `TARGET ROLE SOUGHT BY CANDIDATE: ${targetRole}\n` : ''}
RESUME TEXT TO ROAST:
"""
${resume}
"""

RESPOND ONLY WITH A VALID JSON OBJECT MATCHING THIS EXACT SCHEMA:
{
  "turns": [
    {
      "speaker": "recruiter" | "manager",
      "text": "spoken response under 45 words without markdown",
      "quote": "exact substring from resume or null",
      "mood": "smirk" | "point" | "laugh" | "disappointed" | "idle" | "hands-up" | "thumbs-up" | "thinking"
    }
  ],
  "verdict": {
    "score": 58,
    "headline": "PUNCHY HEADLINE UNDER EIGHT WORDS",
    "oneLiner": "Consensus summary under twenty-five words.",
    "fixes": [
      {
        "title": "Fix title",
        "why": "Why this hurts the resume",
        "before": "Original line or null",
        "after": "Complete rewritten line with [X%] metrics"
      }
    ]
  }
}`;
}
