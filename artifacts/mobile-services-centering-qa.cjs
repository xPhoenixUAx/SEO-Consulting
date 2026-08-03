const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
    version: "1.0", necessary: true, analytics: false,
    updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
  })));
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4173/index.html#services", { waitUntil: "networkidle" });
  const media = page.locator(".service-editorial__media");
  const states = [];
  for (let index = 0; index < await media.count(); index += 1) {
    const item = media.nth(index);
    await item.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    states.push(await item.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const imageStyle = getComputedStyle(element.querySelector("img"));
      return {
        x: Math.round(rect.x), width: Math.round(rect.width),
        leftSpace: Math.round(rect.left), rightSpace: Math.round(innerWidth - rect.right),
        objectPosition: imageStyle.objectPosition
      };
    }));
    await page.screenshot({ path: `artifacts/mobile-service-centered-${index + 1}.png` });
  }
  console.log(JSON.stringify({ errors, overflow: await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)), states }, null, 2));
  await browser.close();
})();
