const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:4175/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: "artifacts/logo-top.png" });
  await page.evaluate(() => {
    const section = document.getElementById("scene-three");
    scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * 0.94);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "artifacts/logo-morph-94.png" });
  await browser.close();
})();
