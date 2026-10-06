// Сборка PDF: node research/src/build.js
// Склеивает parts/*.html по порядку, подключает style.css и графики из charts/, печатает через Chromium.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SRC = __dirname;
const OUT_HTML = path.join(SRC, 'report.html');
const OUT_PDF = path.join(SRC, '..', 'kids-ai-teaching-research.pdf');

const parts = fs.readdirSync(path.join(SRC, 'parts')).filter(f => f.endsWith('.html')).sort();
const body = parts.map(f => fs.readFileSync(path.join(SRC, 'parts', f), 'utf8')).join('\n');

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>Как учить детей ИИ — исследование</title>
<link rel="stylesheet" href="style.css">
</head><body>
${body}
</body></html>`;
fs.writeFileSync(OUT_HTML, html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + OUT_HTML, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: OUT_PDF,
    preferCSSPageSize: true,
    printBackground: true,
    outline: true,
    tagged: true,
  });
  await browser.close();
  console.log('PDF:', OUT_PDF, (fs.statSync(OUT_PDF).size / 1024).toFixed(0) + ' KB');
})();
