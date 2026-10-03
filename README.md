# Resume Roast Battle

> Two rabbits. One brutal verdict. Let two AI personas argue about your resume line-by-line and deliver the top 3 actionable fixes.

---

## 3-Step Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and insert your Gemini API Key from [Google AI Studio](https://aistudio.google.com/):
```bash
cp .env.example .env
```
*(If no API key is set, the app runs a built-in demo battle about a sample resume. If a key is set but the live call fails, you get a clear error and your pasted resume is kept, so you can retry.)*

### 3. Run the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Tech Stack
- **Frontend**: Vite + React + TypeScript + Plain CSS (`styles.css`)
- **Backend**: Node/Express (`server/index.ts`) with Gemini Flash (`gemini-3.8-flash` by default) structured JSON output
- **Mascots**: Custom 3D character assets in `/public/mascots/` (Rex & Mo)

---

## New in this patch
- **PDF / image upload**: the file goes straight to the vision model, which transcribes it so quote highlights still work, and also critiques layout.
- **Job description box**: roast against a real posting and get a keyword gap (matched vs missing).
- **Hire odds**: every turn carries a running 0-100 `hireOdds`. `src/components/HireMeter.tsx` renders it (see below for wiring).
- **Re-roast loop**: "Edit my resume and re-roast" keeps your text and shows Roast 1 → Roast 2 score changes.
- **Roast card**: downloadable 1080x1080 PNG for LinkedIn.
- **Contact masking**: emails, phone numbers and GitHub/LinkedIn links in pasted text are masked server-side before the model sees them (`server/privacy.ts`).

### Wiring the Hire meter into ArenaScreen
```tsx
import { HireMeter } from '../components/HireMeter';
// inside ArenaScreen, where you track how many turns are visible:
<HireMeter odds={battleData.turns.map((t: any) => t.hireOdds)} revealed={visibleCount} />
```
