// Сборка PDF.
//   node research/src/build.js                         — основной отчёт (research/src → research/kids-ai-teaching-research.pdf)
//   node research/src/build.js <папка> <файл.pdf> [заголовок] — другой отчёт на том же оформлении
// В папке: parts/*.html (склеиваются по порядку имён), charts/*.svg, необязательный extra.css.
// Оформление общее — style.css рядом с этим скриптом.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SRC = process.argv[2] ? path.resolve(process.argv[2]) : __dirname;
const OUT_PDF = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, '..', 'kids-ai-teaching-research.pdf');
const TITLE = process.argv[4] || 'Как учить детей ИИ — исследование';
const OUT_HTML = path.join(SRC, 'report.html');

const css = [path.join(__dirname, 'style.css'), path.join(SRC, 'extra.css')]
  .filter(f => fs.existsSync(f))
  .map(f => fs.readFileSync(f, 'utf8'))
  .join('\n');
const parts = fs.readdirSync(path.join(SRC, 'parts')).filter(f => f.endsWith('.html')).sort();
const body = parts.map(f => fs.readFileSync(path.join(SRC, 'parts', f), 'utf8')).join('\n');

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>${TITLE}</title>
<style>
${css}
</style>
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
