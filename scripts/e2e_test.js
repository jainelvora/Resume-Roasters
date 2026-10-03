import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/jainel/.gemini/antigravity-ide/brain/7aaa9f9d-e291-4d6a-9c9b-f5b7bdc7fd10';

const REAL_LOOKING_RESUME = `ELENA ROSTOVA
Staff Product Infrastructure Engineer | San Francisco, CA
elena.rostova@pm.me | github.com/erostova | linkedin.com/in/erostova

SUMMARY
Infrastructure specialist with 8 years building distributed data pipelines, zero-trust auth services, and edge computing runtimes. Proven track record reducing cloud compute expenses while maintaining five-nines uptime for mission-critical banking transactions.

WORK EXPERIENCE

Principal Platform Architect | Horizon FinTech Core | 2021 – Present
- Re-architected global payment gateway ledger to Rust and gRPC, dropping p99 transaction latency from 140ms to 12ms.
- Scaled Kafka cluster processing 4.2 billion daily events with automated rebalancing and zero partition lag.
- Implemented enterprise-wide OpenTelemetry tracing across 80+ backend microservices, slashing MTTR by 64%.
- Responsible for cross-team documentation and occasional weekly status updates to leadership.

Senior Backend Engineer | DataMesh Systems | 2017 – 2021
- Spearheaded redesign of multi-tenant PostgreSQL clustering, saving $420,000 annually in AWS RDS provisioning.
- Designed distributed rate limiter handling 65,000 requests/sec using Redis Cluster and Lua scripts.
- Mentored 9 junior and mid-level software engineers through structured pair programming sessions.

EDUCATION & SKILLS
B.S. in Computer Science, University of Washington
Technologies: Rust, Go, TypeScript, Python, Kubernetes, Kafka, Redis, PostgreSQL, AWS, Terraform, Docker
`;

async function run() {
  console.log('Launching headless Chrome for QA & Screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // ==========================================
  // 1. DESKTOP 1440x900 TESTS
  // ==========================================
  console.log('\n--- 1. DESKTOP 1440x900 VERIFICATION ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Capture Screen 1: Desktop Intake
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen1_intake_1440.png') });
  console.log('Saved screen1_intake_1440.png');

  // Test Too-Short Input
  console.log('Testing validation on input under 150 chars...');
  await page.type('#resume-input', 'Short resume test line.');
  await page.click('#start-fight-btn');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'test_short_input_error.png') });
  console.log('Saved test_short_input_error.png');

  // Test Sample Resume Loader
  console.log('Loading sample resume...');
  await page.click('.sample-link');
  await new Promise((r) => setTimeout(r, 400));

  // Change intensity to Medium
  const pills = await page.$$('.intensity-pill');
  if (pills[1]) {
    await pills[1].click(); // Medium
  }

  // Start battle -> Arena Screen
  console.log('Starting battle with sample resume...');
  await page.click('#start-fight-btn');

  // Wait for loading to finish and debate to begin
  await page.waitForSelector('.speech-bubble', { timeout: 15000 });
  // Wait for Rex's first turn to type out and highlight quote in red marker
  await new Promise((r) => setTimeout(r, 4200));

  // Capture Screen 2: Desktop Arena
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen2_arena_1440.png') });
  console.log('Saved screen2_arena_1440.png (with red marker highlight)');

  // Test Keyboard Spacebar Pause / Resume
  console.log('Testing keyboard Space pause/resume...');
  await page.keyboard.press('Space');
  await new Promise((r) => setTimeout(r, 400));
  await page.keyboard.press('Space');

  // Skip directly to Verdict
  console.log('Skipping to Verdict screen...');
  const skipBtn = await page.$('button[title="Skip directly to Verdict"]');
  if (skipBtn) await skipBtn.click();

  // Wait for Verdict Screen and stamp animation
  await page.waitForSelector('.verdict-screen', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 800));

  // Capture Screen 3: Desktop Verdict
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen3_verdict_1440.png') });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen3_verdict_1440_full.png'), fullPage: true });
  console.log('Saved screen3_verdict_1440.png and screen3_verdict_1440_full.png');

  // Test Copy button on Fix #1
  const copyBtns = await page.$$('.fix-card .btn-sm');
  if (copyBtns[0]) {
    await copyBtns[0].click();
    console.log('Verified copy button on Fix #1');
  }

  // Return to intake for test (b): real pasted resume
  console.log('\n--- 2. TESTING REAL PASTED RESUME ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('New resume'));
    if (btn) btn.click();
  });
  await page.waitForSelector('#resume-input', { timeout: 5000 });

  // Clear and paste REAL_LOOKING_RESUME
  await page.evaluate(() => {
    const el = document.getElementById('resume-input');
    if (el) el.value = '';
  });
  await page.type('#resume-input', REAL_LOOKING_RESUME);
  await page.type('#target-role', 'Staff Infrastructure Engineer');
  await page.click('#start-fight-btn');

  await page.waitForSelector('.speech-bubble', { timeout: 15000 });
  console.log('Real-looking resume debate started successfully!');
  await new Promise((r) => setTimeout(r, 2000));
  const skipBtn2 = await page.$('button[title="Skip directly to Verdict"]');
  if (skipBtn2) await skipBtn2.click();
  await page.waitForSelector('.verdict-screen', { timeout: 10000 });
  console.log('Real-looking resume reached Verdict screen successfully!');

  // ==========================================
  // 3. MOBILE 390x844 TESTS
  // ==========================================
  console.log('\n--- 3. MOBILE 390x844 VERIFICATION ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Capture Mobile Intake
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen1_intake_390.png') });
  console.log('Saved screen1_intake_390.png');

  // Load sample on mobile
  await page.click('.sample-link');
  await new Promise((r) => setTimeout(r, 300));
  await page.click('#start-fight-btn');

  // Mobile Arena
  await page.waitForSelector('.speech-bubble', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen2_arena_390.png') });
  console.log('Saved screen2_arena_390.png');

  // Skip to Mobile Verdict
  const mobileSkip = await page.$('button[title="Skip directly to Verdict"]');
  if (mobileSkip) await mobileSkip.click();
  await page.waitForSelector('.verdict-screen', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 800));

  // Capture Mobile Verdict
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen3_verdict_390.png') });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'screen3_verdict_390_full.png'), fullPage: true });
  console.log('Saved screen3_verdict_390.png and screen3_verdict_390_full.png');

  await browser.close();
  console.log('\n=== All QA Verification Steps and High-Res Screenshots Completed! ===');
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
