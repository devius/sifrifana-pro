const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));
  await page.goto('file:///Users/devi/Development/sifrifana-pro/index.html', { waitUntil: 'networkidle' });
  await browser.close();
})();
