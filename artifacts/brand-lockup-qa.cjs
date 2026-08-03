const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

const cases = [
  ["index-dark", "index.html#work", ".orbit-nav__type"],
  ["index-light", "index.html#engagement", ".orbit-nav__type"],
  ["audit", "audit-technical-seo.html", ".unified-header__type"],
  ["contact", "contact.html", ".unified-header__type"],
  ["privacy", "privacy-policy.html", ".unified-header__type"],
  ["404", "404.html", ".unified-header__type"]
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const width of [1440, 390]) {
    for (const [name, path, selector] of cases) {
      const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, reducedMotion: "reduce" });
      await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
        version: "1.0", necessary: true, analytics: false,
        updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
      })));
      const page = await context.newPage();
      const errors = [];
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("http://127.0.0.1:4173/" + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const state = await page.locator(selector).evaluate(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          text: element.innerText.replace(/\n/g, " / "),
          opacity: style.opacity,
          color: style.color,
          background: style.backgroundColor,
          backdrop: style.backdropFilter || style.webkitBackdropFilter,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
          overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
        };
      });
      if (width === 1440 || ["index-light", "contact"].includes(name)) {
        await page.screenshot({ path: `artifacts/brand-lockup-${name}-${width}.png`, clip: { x: 0, y: 0, width, height: 150 } });
      }
      console.log(width, name, JSON.stringify({ errors, ...state }));
      await context.close();
    }
  }
  await browser.close();
})();
