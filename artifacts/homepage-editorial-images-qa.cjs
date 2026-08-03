const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[1440, 900], [990, 694], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
      version: "1.0", necessary: true, analytics: false,
      updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
    })));
    const page = await context.newPage();
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
    const figures = page.locator(".editorial-visual");
    const states = [];
    for (let index = 0; index < await figures.count(); index += 1) {
      const figure = figures.nth(index);
      await figure.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      states.push(await figure.evaluate(element => {
        const image = element.querySelector("img");
        const rect = element.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        return {
          className: element.className,
          src: image.getAttribute("src"),
          loaded: image.complete && image.naturalWidth > 0,
          alt: image.alt,
          width: Math.round(rect.width),
          imageWidth: Math.round(imageRect.width),
          imageHeight: Math.round(imageRect.height)
        };
      }));
      await page.screenshot({ path: `artifacts/editorial-${width}-${index + 1}.png` });
    }
    const state = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      count: document.querySelectorAll(".editorial-visual").length
    }));
    console.log(width, JSON.stringify({ errors, ...state, figures: states }, null, 2));
    await context.close();
  }
  await browser.close();
})();
