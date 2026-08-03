const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
      version: "1.0", necessary: true, analytics: false,
      updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
    })));
    const page = await context.newPage();
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:4173/index.html#work", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const state = await page.evaluate(() => {
      const type = document.querySelector(".orbit-nav__type");
      return {
        docked: document.querySelector(".orbit-navigation").classList.contains("is-docked"),
        opacity: getComputedStyle(type).opacity,
        color: getComputedStyle(type).color,
        rect: type.getBoundingClientRect().toJSON(),
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
      };
    });
    await page.screenshot({ path: `artifacts/brand-type-${width}.png` });
    console.log(width, JSON.stringify({ errors, ...state }));
    await context.close();
  }
  await browser.close();
})();
