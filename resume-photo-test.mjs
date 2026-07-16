import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:3000/tools/resume-builder';

const results = [];
function pass(n, msg) { results.push({ n, ok: true, msg }); console.log(`  ✅ T${n}: ${msg}`); }
function fail(n, msg) { results.push({ n, ok: false, msg }); console.log(`  ❌ T${n}: ${msg}`); }

// Valid 10x10 solid-color PNG (confirmed working minimal PNG)
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

function writePng() {
  const buf = Buffer.from(PNG_B64, 'base64');
  fs.writeFileSync('/tmp/test-photo.png', buf);
}

function writeLargeFile() {
  fs.writeFileSync('/tmp/large-photo.png', Buffer.alloc(6 * 1024 * 1024, 0xff));
}

async function findBtn(page, textMatch) {
  const btns = await page.$$('button');
  for (const btn of btns) {
    const txt = await btn.evaluate(el => el.textContent?.trim().toLowerCase() ?? '');
    if (txt.includes(textMatch)) return btn;
  }
  return null;
}

async function run() {
  writePng();
  writeLargeFile();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-gpu',
      '--use-gl=swiftshader',
    ],
  });

  let jsErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', e => jsErrors.push(e.message));
    const consoleLogs = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleLogs.push(msg.text()); });
    await page.setViewport({ width: 1440, height: 900 });

    // Clear state
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => localStorage.removeItem('gulffit-resume-v1'));
    await page.reload({ waitUntil: 'networkidle0' });

    console.log('\n=== RESUME BUILDER PHOTO UPLOAD TESTS ===\n');

    // ── T1: File input present ─────────────────────────────────────────────────
    const fileInput = await page.$('input[type="file"][accept*="image"]');
    if (fileInput) pass(1, 'Photo file input present in ContactSection');
    else { fail(1, 'No photo file input found'); }

    // ── T2: Upload triggers crop UI ────────────────────────────────────────────
    if (fileInput) {
      await fileInput.uploadFile('/tmp/test-photo.png');
      await new Promise(r => setTimeout(r, 1500)); // wait for FileReader + img.onload

      const saveBtn = await findBtn(page, 'save photo');
      if (saveBtn) pass(2, 'Crop UI appeared with "Save photo" button');
      else {
        const allBtnTexts = await page.evaluate(() =>
          Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim())
        );
        fail(2, `"Save photo" button not found. Buttons present: ${allBtnTexts.join(' | ')}`);
      }
    } else fail(2, 'Skipped — no file input');

    // ── T3: Save crop → preview + Remove button ────────────────────────────────
    const saveBtn3 = await findBtn(page, 'save photo');
    if (saveBtn3) {
      // Use DOM click to ensure React onClick fires
      await page.evaluate(btn => btn.click(), saveBtn3);
      await new Promise(r => setTimeout(r, 1200));

      // Debug: check if canvas worked by inspecting what happened
      const debugInfo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 10; canvas.height = 10;
        const ctx = canvas.getContext('2d');
        return {
          canvasWorks: !!ctx,
          toDataUrlWorks: ctx ? canvas.toDataURL('image/jpeg', 0.5).startsWith('data:') : false,
        };
      });
      if (!debugInfo.canvasWorks) {
        fail(3, `Canvas 2D context not available in headless — canvas.getContext('2d') returned null`);
      } else {
        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasRemove = /remove/i.test(bodyText);
        const hasKB = /\d+\s*KB/i.test(bodyText);
        if (hasRemove) pass(3, `Photo saved — Remove button visible${hasKB ? ' and KB size shown' : ''}`);
        else {
          const consoleErrs = consoleLogs.join('; ');
          fail(3, `After save: no Remove. canvasWorks=${debugInfo.canvasWorks} toDataUrl=${debugInfo.toDataUrlWorks} consoleErrors="${consoleErrs}" bodyEnd="${bodyText.slice(bodyText.lastIndexOf('Contact'), bodyText.lastIndexOf('Contact') + 200)}"`);
        }
      }
    } else fail(3, 'Save photo button not found (T2 likely failed)');

    // ── T4: Modern template shows photo in preview ─────────────────────────────
    const modernPhoto = await page.$('.resume-page img');
    if (modernPhoto) {
      const src = await modernPhoto.evaluate(el => el.getAttribute('src') ?? '');
      if (src.startsWith('data:image')) pass(4, 'Modern template preview shows photo (data URI img)');
      else fail(4, `Modern img src unexpected: ${src.slice(0, 80)}`);
    } else fail(4, 'No <img> inside .resume-page for Modern template');

    // ── T5: Classic shows passport photo ──────────────────────────────────────
    const classicBtn = await findBtn(page, 'classic');
    if (classicBtn) {
      await classicBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const classicPhoto = await page.$('.resume-page img');
      if (classicPhoto) {
        const src = await classicPhoto.evaluate(el => el.getAttribute('src') ?? '');
        if (src.startsWith('data:image')) pass(5, 'Classic template shows photo');
        else fail(5, `Classic img src: ${src.slice(0, 80)}`);
      } else fail(5, 'No <img> in .resume-page after switching to Classic');
    } else fail(5, 'Classic button not found');

    // ── T6: Minimal → no photo ────────────────────────────────────────────────
    const minimalBtn = await findBtn(page, 'minimal');
    if (minimalBtn) {
      await minimalBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const minPhoto = await page.$('.resume-page img');
      if (!minPhoto) pass(6, 'Minimal template correctly shows NO photo');
      else fail(6, 'Minimal template unexpectedly shows a photo');
    } else fail(6, 'Minimal button not found');

    // ── T7: Persist on refresh ────────────────────────────────────────────────
    const modernBtn7 = await findBtn(page, 'modern');
    if (modernBtn7) { await modernBtn7.click(); await new Promise(r => setTimeout(r, 300)); }
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    const photoAfterReload = await page.$('.resume-page img');
    if (photoAfterReload) {
      const src = await photoAfterReload.evaluate(el => el.getAttribute('src') ?? '');
      if (src.startsWith('data:image')) pass(7, 'Photo persists after reload (localStorage works)');
      else fail(7, `Photo img after reload has wrong src`);
    } else fail(7, 'Photo did NOT persist after reload');

    // ── T8-T10: PDF download ──────────────────────────────────────────────────
    const savedPhoto = await page.evaluate(() => {
      try {
        const d = JSON.parse(localStorage.getItem('gulffit-resume-v1') || '{}');
        return d?.contact?.photo ?? null;
      } catch { return null; }
    });

    const resumePayload = {
      contact: {
        fullName: 'Test User', jobTitle: 'Engineer', email: 'test@t.com',
        phone: '050 000 0000', location: 'Dubai, UAE',
        photo: savedPhoto,
      },
      summary: 'A test summary.',
      experience: [], education: [], skills: ['JavaScript'],
      projects: [], languages: [], certifications: [],
    };

    for (const [tpl, tNum] of [['modern', 8], ['classic', 9], ['minimal', 10]]) {
      const resp = await page.evaluate(async ([resumeData, template]) => {
        const r = await fetch('/api/tools/resume-builder/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeData, template }),
        });
        return { status: r.status, ct: r.headers.get('content-type') };
      }, [resumePayload, tpl]);

      if (resp.status === 200 && resp.ct?.includes('pdf'))
        pass(tNum, `PDF ${tpl} template → HTTP 200, application/pdf`);
      else
        fail(tNum, `PDF ${tpl}: status=${resp.status}, content-type=${resp.ct}`);
    }

    // ── T11: Remove photo ─────────────────────────────────────────────────────
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    const removeBtn = await findBtn(page, 'remove');
    if (removeBtn) {
      await page.evaluate(btn => btn.click(), removeBtn);
      await new Promise(r => setTimeout(r, 600));
      const photoGone = await page.$('.resume-page img');
      if (!photoGone) pass(11, 'Remove clears photo from preview');
      else fail(11, 'Photo still in preview after Remove click');
    } else {
      const bodyText11 = await page.evaluate(() => document.body.innerText);
      fail(11, `Remove button not found. Sample: "${bodyText11.slice(0, 200)}"`);
    }

    // ── T12: 6 MB file → error message ───────────────────────────────────────
    const fileInput12 = await page.$('input[type="file"][accept*="image"]');
    if (fileInput12) {
      await fileInput12.uploadFile('/tmp/large-photo.png');
      await new Promise(r => setTimeout(r, 800));
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (/5MB|under 5|too large/i.test(bodyText)) pass(12, 'Error shown for 6MB file (>5MB limit enforced)');
      else fail(12, `No 5MB error. Body snippet: "${bodyText.slice(0, 300)}"`);
    } else fail(12, 'File input not found');

    // ── T13: Drag in crop frame → no JS errors ────────────────────────────────
    jsErrors = [];
    const fileInput13 = await page.$('input[type="file"][accept*="image"]');
    if (fileInput13) {
      await fileInput13.uploadFile('/tmp/test-photo.png');
      await new Promise(r => setTimeout(r, 1200));

      // Crop frame: the rounded div with cursor-move class/style
      const cropFrame = await page.$('div.cursor-move, div[style*="cursor"]');
      if (cropFrame) {
        const box = await cropFrame.boundingBox();
        if (box) {
          const cx = box.x + box.width / 2;
          const cy = box.y + box.height / 2;
          await page.mouse.move(cx, cy);
          await page.mouse.down();
          await page.mouse.move(cx + 15, cy + 10, { steps: 5 });
          await page.mouse.move(cx - 10, cy - 5, { steps: 5 });
          await page.mouse.up();
          await new Promise(r => setTimeout(r, 200));
        }
      }
      if (jsErrors.length === 0) pass(13, 'Drag in crop frame produces no JS errors');
      else fail(13, `JS error during drag: ${jsErrors[0]}`);
    } else fail(13, 'File input not found for drag test');

    // ── T14: Save button still present after drag ─────────────────────────────
    const saveBtn14 = await findBtn(page, 'save photo');
    if (saveBtn14) pass(14, '"Save photo" button present after drag interaction');
    else fail(14, '"Save photo" button missing after drag');

    // ── T15: Cancel dismisses crop UI ────────────────────────────────────────
    const cancelBtn15 = await findBtn(page, 'cancel');
    if (cancelBtn15) {
      await page.evaluate(btn => btn.click(), cancelBtn15);
      await new Promise(r => setTimeout(r, 800));
      const cropStillOpen = await findBtn(page, 'save photo');
      if (!cropStillOpen) pass(15, 'Cancel dismisses crop UI');
      else fail(15, 'Crop UI still open after Cancel click');
    } else fail(15, 'Cancel button not found');

  } finally {
    await browser.close();
    try { fs.unlinkSync('/tmp/test-photo.png'); } catch {}
    try { fs.unlinkSync('/tmp/large-photo.png'); } catch {}
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== RESULTS ===');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`Passed: ${passed}/15   Failed: ${failed}/15\n`);
  if (failed > 0) {
    console.log('FAILURES:');
    results.filter(r => !r.ok).forEach(r => console.log(`  T${r.n}: ${r.msg}`));
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('\nTest runner crashed:', e.message, e.stack); process.exit(1); });
