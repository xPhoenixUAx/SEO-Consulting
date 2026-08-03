const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const errors = [];
  const requests = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("http://127.0.0.1:4173/terms-of-service.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.click('[data-consent="necessary"]');
  await page.waitForTimeout(800);
  await page.evaluate(() => document.fonts.ready);

  const state = await page.evaluate(() => {
    const text = document.querySelector(".legal-copy").textContent;
    const toc = [...document.querySelectorAll(".legal-toc a[href^='#']")];
    return {
      tocCount: toc.length,
      brokenToc: toc.filter((link) => !document.querySelector(link.hash)).map((link) => link.hash),
      agreementListItems: document.querySelectorAll("#terms-engagement li").length,
      guaranteeItems: document.querySelectorAll("#terms-rankings li").length,
      acceptableUseItems: document.querySelectorAll("#terms-use li").length,
      intellectualPropertyParagraphs: document.querySelectorAll("#terms-ip p").length,
      liabilityParagraphs: document.querySelectorAll("#terms-liability p").length,
      generalParagraphs: document.querySelectorAll("#terms-general p").length,
      generalSubheadings: document.querySelectorAll("#terms-general h3").length,
      removedPhrasesRemain: /should be inserted|Depending on the project|animation choreography|visual systems|technical assets from external providers/i.test(text),
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });

  await page.locator("#terms-use").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, "terms-acceptable-use-desktop.png") });
  await page.locator("#terms-liability").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, "terms-liability-desktop.png") });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => errors.push(`mobile: ${error.message}`));
  await mobile.goto("http://127.0.0.1:4173/terms-of-service.html", { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(800);
  await mobile.click('[data-consent="necessary"]');
  await mobile.waitForTimeout(800);
  await mobile.locator("#terms-general").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: path.join(__dirname, "terms-general-mobile.png") });
  const mobileOverflow = await mobile.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));

  console.log(JSON.stringify({
    state,
    mobileOverflow,
    externalFontRequests: requests.filter((url) => /fonts\.googleapis|fonts\.gstatic/.test(url)),
    errors
  }, null, 2));
  await browser.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
