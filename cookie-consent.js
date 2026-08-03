(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const storageKey = "orbit_cookie_consent";
  const version = String(config.cookieConsentVersion || "1.0");
  const maxAgeDays = Math.max(1, Number(config.cookieConsentMaxAgeDays) || 180);
  let lastFocused = null;

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

  function readConsent() {
    try {
      const consent = JSON.parse(localStorage.getItem(storageKey));
      if (!consent || consent.version !== version) return null;
      if (!consent.expiresAt || Date.parse(consent.expiresAt) <= Date.now()) return null;
      return {
        version,
        necessary: true,
        analytics: consent.analytics === true,
        updatedAt: consent.updatedAt || null,
        expiresAt: consent.expiresAt
      };
    } catch (error) {
      return null;
    }
  }

  function applyConsent(consent, source) {
    document.documentElement.dataset.analyticsConsent = consent.analytics ? "granted" : "denied";
    const detail = { ...consent, source };
    window.dispatchEvent(new CustomEvent("orbit:consent", { detail }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "consent_update",
        analytics_consent: consent.analytics ? "granted" : "denied",
        consent_source: source
      });
    }
  }

  const existingConsent = readConsent();
  if (existingConsent) applyConsent(existingConsent, "stored");

  function createInterface() {
    const policyHref = config.cookiesPolicyHref || "cookies-policy.html";
    const banner = document.createElement("section");
    banner.className = "cookie-consent";
    banner.id = "cookie-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = `
      <div class="cookie-consent__meta">
        <span>${escapeHtml(config.cookieBannerEyebrow || "PRIVACY / YOUR CONTROL")}</span>
        <span>${escapeHtml(config.cookieBannerStatus || "CONSENT SIGNAL")}</span>
      </div>
      <div class="cookie-consent__statement">
        <h2 id="cookie-consent-title">${escapeHtml(config.cookieBannerTitle || "YOUR CHOICE. YOUR SIGNAL.")}</h2>
        <p>${escapeHtml(config.cookieBannerText || "We use necessary browser storage to remember your choices. Optional analytics can be activated only when you allow them.")} <a href="${escapeHtml(policyHref)}">${escapeHtml(config.cookieBannerPolicyLabel || "Read the Cookies Policy")}</a>.</p>
      </div>
      <div class="cookie-consent__actions">
        <button class="cookie-consent__button cookie-consent__button--primary" type="button" data-consent="all">${escapeHtml(config.cookieBannerAccept || "ACCEPT ALL")}</button>
        <button class="cookie-consent__button" type="button" data-consent="necessary">${escapeHtml(config.cookieBannerReject || "NECESSARY ONLY")}</button>
        <button class="cookie-consent__button cookie-consent__button--manage" type="button" aria-expanded="false" aria-controls="cookie-preferences" data-consent="manage">${escapeHtml(config.cookieBannerManage || "MANAGE SETTINGS")}</button>
      </div>
      <div class="cookie-consent__preferences" id="cookie-preferences" aria-hidden="true" inert>
        <h3>${escapeHtml(config.cookiePreferencesTitle || "CONTROL THE SIGNAL.")}</h3>
        <label class="cookie-consent__category">
          <input type="checkbox" checked disabled>
          <span class="cookie-consent__switch" aria-hidden="true"></span>
          <span><strong>${escapeHtml(config.cookieNecessaryTitle || "NECESSARY")}</strong><small>${escapeHtml(config.cookieNecessaryText || "Required to remember privacy choices and keep the site working.")}</small></span>
        </label>
        <label class="cookie-consent__category">
          <input id="cookie-analytics" type="checkbox">
          <span class="cookie-consent__switch" aria-hidden="true"></span>
          <span><strong>${escapeHtml(config.cookieAnalyticsTitle || "ANALYTICS")}</strong><small>${escapeHtml(config.cookieAnalyticsText || "Allows anonymous measurement when an analytics service is configured.")}</small></span>
        </label>
        <button class="cookie-consent__button cookie-consent__button--primary cookie-consent__save" type="button" data-consent="save">${escapeHtml(config.cookieBannerSave || "SAVE CHOICES")}</button>
      </div>`;

    const settingsTrigger = document.createElement("button");
    settingsTrigger.className = "cookie-settings-trigger";
    settingsTrigger.type = "button";
    settingsTrigger.textContent = config.cookieSettingsLabel || "COOKIE SETTINGS";
    settingsTrigger.setAttribute("aria-controls", "cookie-consent");

    document.body.append(banner, settingsTrigger);

    const manageButton = banner.querySelector('[data-consent="manage"]');
    const preferences = banner.querySelector(".cookie-consent__preferences");
    const analyticsInput = banner.querySelector("#cookie-analytics");

    function setManaging(open) {
      banner.classList.toggle("is-managing", open);
      manageButton.setAttribute("aria-expanded", String(open));
      preferences.setAttribute("aria-hidden", String(!open));
      preferences.inert = !open;
      if (open) requestAnimationFrame(() => analyticsInput.focus({ preventScroll: true }));
    }

    function showBanner(managing = false, moveFocus = true) {
      lastFocused = document.activeElement;
      const consent = readConsent();
      analyticsInput.checked = consent?.analytics === true;
      settingsTrigger.classList.remove("is-visible");
      banner.classList.add("is-visible");
      setManaging(managing);
      if (moveFocus) requestAnimationFrame(() => {
        const target = managing ? analyticsInput : banner.querySelector('[data-consent="all"]');
        target.focus({ preventScroll: true });
      });
    }

    function hideBanner() {
      banner.classList.remove("is-visible", "is-managing");
      preferences.inert = true;
      preferences.setAttribute("aria-hidden", "true");
      manageButton.setAttribute("aria-expanded", "false");
      settingsTrigger.classList.add("is-visible");
      if (lastFocused && lastFocused !== document.body) lastFocused.focus?.({ preventScroll: true });
    }

    function saveConsent(analytics, source) {
      const consent = {
        version,
        necessary: true,
        analytics: analytics === true,
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + maxAgeDays * 86400000).toISOString()
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(consent));
      } catch (error) {
        // The choice still applies for the current page when storage is unavailable.
      }
      applyConsent(consent, source);
      hideBanner();
    }

    banner.addEventListener("click", (event) => {
      const action = event.target.closest("[data-consent]")?.dataset.consent;
      if (!action) return;
      if (action === "all") saveConsent(true, "accept-all");
      if (action === "necessary") saveConsent(false, "necessary-only");
      if (action === "manage") setManaging(!banner.classList.contains("is-managing"));
      if (action === "save") saveConsent(analyticsInput.checked, "custom");
    });

    settingsTrigger.addEventListener("click", () => showBanner(true));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !banner.classList.contains("is-managing")) return;
      setManaging(false);
      manageButton.focus({ preventScroll: true });
    });

    if (existingConsent) settingsTrigger.classList.add("is-visible");
    else requestAnimationFrame(() => requestAnimationFrame(() => showBanner(false, false)));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", createInterface, { once: true });
  else createInterface();
})();
