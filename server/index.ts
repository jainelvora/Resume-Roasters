import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { validateInputResume } from './validate';
import { generateRoastDebate, RoastError, DEFAULT_MODEL } from './gemini';
import { maskContactInfo } from './privacy';

const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const MAX_BASE64_CHARS = 7_000_000; // roughly a 5 MB file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Light rate limiter: 10 requests per minute per IP
const roastLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rex and Mo are catching their breath. Maximum 10 roasts per minute. Please wait a moment.'
  }
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL
  });
});

// Main roast battle endpoint
app.post(['/api/roast', '/roast'], roastLimiter, async (req, res) => {
  const { resume, targetRole, intensity = 'medium', file, jobDescription } = req.body || {};

  // 1. Validate: either an uploaded file, or pasted text of a sane length
  let upload: { mimeType: string; data: string } | undefined;
  if (file) {
    if (!ALLOWED_FILE_TYPES.has(file.mimeType) || typeof file.data !== 'string' || !file.data) {
      return res.status(400).json({ error: 'Upload a PDF, PNG, JPG or WebP file.' });
    }
    if (file.data.length > MAX_BASE64_CHARS) {
      return res.status(400).json({ error: 'That file is too large. Keep it under about 5 MB.' });
    }
    upload = { mimeType: file.mimeType, data: file.data };
  }
  const lengthCheck = upload ? { valid: true, text: '', error: undefined } : validateInputResume(resume);
  if (!lengthCheck.valid) {
    return res.status(400).json({ error: lengthCheck.error });
  }
  // Pasted text gets emails, phone numbers and profile links masked before it leaves the server.
  const resumeForModel = upload ? '[The resume is attached as a file.]' : maskContactInfo(lengthCheck.text);
  const cleanJd = typeof jobDescription === 'string' ? jobDescription.trim().slice(0, 4000) : '';

  const validIntensity: 'mild' | 'medium' | 'well-done' =
    intensity === 'mild' || intensity === 'well-done' ? intensity : 'medium';

  const cleanRole = typeof targetRole === 'string' ? targetRole.trim().slice(0, 100) : undefined;

  try {
    const debate = await generateRoastDebate(
      {
        resume: resumeForModel,
        targetRole: cleanRole,
        intensity: validIntensity,
        jobDescription: cleanJd || undefined,
        file: upload
      },
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL || DEFAULT_MODEL
    );

    return res.json(debate);
  } catch (err: any) {
    console.error('[Server Error in /api/roast]:', err?.message || err);
    if (err instanceof RoastError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    return res.status(500).json({
      error: 'An unexpected glitch happened while staging the battle. Please try again.'
    });
  }
});

const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === __filename);
if (!process.env.VERCEL && isDirectRun) {
  app.listen(PORT, () => {
    console.log(`[Resume Roast Battle Server] Running on http://localhost:${PORT}`);
    console.log(`[Config] Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing (Will use Demo Fallback)'}`);
    console.log(`[Config] Model: ${process.env.GEMINI_MODEL || DEFAULT_MODEL}`);
  });
}

export default app;
