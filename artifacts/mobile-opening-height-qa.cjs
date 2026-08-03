const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
      version: "1.0", necessary: true, analytics: false,
      updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
    })));
    const page = await context.newPage();
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => [".hero-track", "#scene-two", "#scene-three"].map(selector => {
      const element = document.querySelector(selector);
      return { selector, height: Math.round(element.getBoundingClientRect().height), vh: +(element.getBoundingClientRect().height / innerHeight).toFixed(2) };
    }));

    if (width === 390) {
      for (const [selector, progress, name] of [[".hero-track", .55, "hero"], ["#scene-two", .6, "scene-two"], ["#scene-three", .62, "scene-three"]]) {
        await page.evaluate(({ selector, progress }) => {
          const element = document.querySelector(selector);
          scrollTo(0, element.offsetTop + (element.offsetHeight - innerHeight) * progress);
        }, { selector, progress });
        await page.waitForTimeout(650);
        await page.screenshot({ path: `artifacts/mobile-opening-${name}.png` });
      }
      await page.evaluate(() => {
        const element = document.querySelector("#scene-three");
        scrollTo(0, element.offsetTop + (element.offsetHeight - innerHeight) * .995);
      });
      await page.waitForTimeout(800);
    }

    const state = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      docked: document.querySelector(".orbit-navigation").classList.contains("is-docked"),
      sceneThreeProgress: getComputedStyle(document.documentElement).getPropertyValue("--logo-detail-opacity").trim()
    }));
    console.log(width, JSON.stringify({ errors, metrics, ...state }, null, 2));
    await context.close();
  }
  await browser.close();
})();
