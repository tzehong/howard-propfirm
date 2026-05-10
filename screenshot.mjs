// screenshot.mjs — uses system Chrome via puppeteer from temp install
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire('C:/Users/PC/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/package.json');
const puppeteer = require('C:/Users/PC/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(screenshotsDir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const filename = `screenshot-${n}${label ? '-' + label : ''}.png`;
const filePath = path.join(screenshotsDir, filename);

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2200)); // wait for counter animations (1800ms)

// Force-reveal all animated elements and set final counter values
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  // Patch rAF to prevent further counter animation overrides
  document.querySelectorAll('.counter[data-target]').forEach(el => {
    el.textContent = Number(el.dataset.target).toLocaleString();
  });
});
await new Promise(r => setTimeout(r, 500));

await page.screenshot({ path: filePath, fullPage: true });
await browser.close();
console.log(`Saved: temporary screenshots/${filename}`);
