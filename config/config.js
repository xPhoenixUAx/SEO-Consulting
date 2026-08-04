/* CONFIG_START:
   Core deployment settings only: brand, company details, SEO metadata,
   repeated navigation/footer links, contact forms and legal controls.
   Editorial section copy stays in the HTML files.
   Keep the object below valid JSON so contact-handler.php can read it. */
window.SITE_CONFIG = Object.freeze(
{
  "siteUrl": "https://orbit-seo.com",
  "siteLanguage": "en",
  "socialImage": "https://orbit-seo.com/assets/images/orbit-social-preview-v1.webp",
  "logoMark": "OR/BIT",
  "faviconHref": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23050504'/%3E%3Ctext x='7' y='29' fill='%23f0ede4' font-family='Arial' font-weight='900' font-size='25'%3EOR%3C/text%3E%3Ctext x='7' y='53' fill='%23f0ede4' font-family='Arial' font-weight='900' font-size='25'%3EBIT%3C/text%3E%3Crect x='49' y='55' width='9' height='3' fill='%23d8ff00'/%3E%3C/svg%3E",
  "titleSuffix": "ORBIT SEO Consulting",
  "seoPages": {
    "index.html": {
      "path": "",
      "title": "BE FOUND",
      "description": "Independent SEO consulting for businesses that need practical technical fixes, a stronger content plan and steady organic growth.",
      "type": "ProfessionalService"
    },
    "audit-technical-seo.html": {
      "path": "audit-technical-seo.html",
      "title": "Audit & Technical SEO",
      "description": "A technical SEO audit that finds crawl, indexation and site-structure problems, ranks them by impact and gives developers a practical fix list.",
      "type": "Service",
      "serviceType": "SEO Audit and Technical SEO"
    },
    "content-strategy.html": {
      "path": "content-strategy.html",
      "title": "Content Strategy",
      "description": "SEO content strategy that turns customer questions and search demand into useful pages, writer-ready briefs and a focused publishing plan.",
      "type": "Service",
      "serviceType": "SEO Content Strategy"
    },
    "authority-growth.html": {
      "path": "authority-growth.html",
      "title": "Authority & Growth",
      "description": "Practical authority building through expert content, relevant publisher relationships, credible mentions and careful performance reviews.",
      "type": "Service",
      "serviceType": "SEO Authority and Growth Consulting"
    },
    "contact.html": {
      "path": "contact.html",
      "title": "Contact",
      "description": "Tell ORBIT SEO Consulting about your website, SEO problem, advertising enquiry or collaboration idea.",
      "type": "ContactPage"
    },
    "privacy-policy.html": {
      "path": "privacy-policy.html",
      "title": "Privacy Policy",
      "description": "ORBIT SEO Consulting Privacy Policy explaining how personal data is collected, used, shared, retained and protected.",
      "type": "WebPage"
    },
    "cookies-policy.html": {
      "path": "cookies-policy.html",
      "title": "Cookies Policy",
      "description": "ORBIT SEO Consulting Cookies Policy explaining consent choices, the current storage inventory and available browser controls.",
      "type": "WebPage"
    },
    "terms-of-service.html": {
      "path": "terms-of-service.html",
      "title": "Terms of Service",
      "description": "ORBIT SEO Consulting Terms of Service governing use of the website, enquiries, website content and the relationship to separate consulting agreements.",
      "type": "WebPage"
    },
    "404.html": {
      "path": "404.html",
      "title": "Page Not Found",
      "description": "The requested page could not be found. Return to ORBIT SEO Consulting or explore our SEO services.",
      "type": "WebPage",
      "noindex": true
    }
  },
  "brandName": "ORBIT",
  "brandDescriptor": "SEO CONSULTING",
  "auditPageHref": "audit-technical-seo.html",
  "contentPageHref": "content-strategy.html",
  "authorityPageHref": "authority-growth.html",
  "servicePageBackLabel": "BACK TO SERVICES",
  "servicePageBackHref": "index.html#services",
  "companyName": "ORBIT SEO CONSULTING",
  "companyAddress": "WARSAW, POLAND",
  "corporateEmail": "HELLO@ORBIT-SEO.COM",
  "corporateEmailHref": "mailto:hello@orbit-seo.com",
  "senderEmail": "no-reply@orbit-seo.com",
  "footerLegal": "© 2026 ORBIT SEO CONSULTING",
  "footerEyebrow": "ORBIT / SEO CONSULTING",
  "footerTitleOne": "BE FOUND.",
  "footerTitleTwo": "STAY UNDERSTOOD.",
  "footerCtaLabel": "START A CONVERSATION",
  "footerCtaHref": "contact.html",
  "footerExploreLabel": "EXPLORE",
  "footerServicesLabel": "SERVICES",
  "footerContactLabel": "CONTACT",
  "footerAuditLabel": "AUDIT & TECHNICAL SEO",
  "footerContentLabel": "CONTENT STRATEGY",
  "footerAuthorityLabel": "AUTHORITY & GROWTH",
  "footerPrinciple": "NO GUARANTEED RANKINGS / ONLY ACCOUNTABLE WORK",
  "footerBackToTop": "BACK TO THE TOP",
  "privacyPolicyLabel": "PRIVACY POLICY",
  "privacyPolicyHref": "privacy-policy.html",
  "cookiesPolicyLabel": "COOKIES POLICY",
  "cookiesPolicyHref": "cookies-policy.html",
  "termsOfServiceLabel": "TERMS OF SERVICE",
  "termsOfServiceHref": "terms-of-service.html",
  "legalEffectiveLabel": "EFFECTIVE DATE",
  "legalEffectiveDate": "3 AUGUST 2026",
  "legalBackLabel": "BACK HOME",
  "legalBackHref": "index.html#site-footer",
  "collaborateTitle": "ADVERTISE & COLLABORATE",
  "collaborateText": "We are always open to new opportunities, high-impact collaborations, and tailored business partnerships. Whether you want to advertise your brand to our audience, launch a joint project, or book our professional services, we are ready to bring your ideas to life. Every business is unique, and we don't believe in one-size-fits-all solutions. Please reach out to us using the contact form below, tell us a bit about your goals, and our team will get back to you with an exclusive, custom-tailored proposal designed strictly for your budget and objectives. Let’s build something great together.",
  "contactFormEndpoint": "contact-handler.php",
  "contactFormNameLabel": "YOUR NAME",
  "contactFormEmailLabel": "WORK EMAIL",
  "contactFormCompanyLabel": "COMPANY / WEBSITE",
  "contactFormInterestLabel": "I'M INTERESTED IN",
  "contactFormInterestPlaceholder": "CHOOSE ONE",
  "contactFormInterestSeo": "SEO CONSULTING",
  "contactFormInterestAdvertising": "ADVERTISING",
  "contactFormInterestCollaboration": "COLLABORATION",
  "contactFormInterestOther": "OTHER",
  "formInterestValues": {
    "seo-consulting": "SEO consulting",
    "advertising": "Advertising",
    "collaboration": "Collaboration",
    "other": "Other"
  },
  "contactFormMessageLabel": "TELL US ABOUT YOUR GOALS",
  "contactFormSubmitLabel": "SEND YOUR REQUEST",
  "contactFormSending": "SENDING YOUR REQUEST…",
  "contactFormSuccess": "Thank you! We have successfully received your request. Our team will review your information and get back to you shortly.",
  "contactFormError": "We could not send your request. Please try again or contact us by email.",
  "navDiscoverLabel": "HOME PAGE",
  "navDiscoverHref": "#top",
  "navWorkLabel": "THE WORK",
  "navWorkHref": "#work",
  "navServicesLabel": "SERVICES",
  "navServicesHref": "#services",
  "navServicesMenuLabel": "SELECT A SERVICE",
  "navProofLabel": "EVIDENCE",
  "navProofHref": "#proof",
  "navEngagementLabel": "WAYS TO WORK",
  "navEngagementHref": "#engagement",
  "navMethodLabel": "90 DAYS",
  "navMethodHref": "#process",
  "navInsightsLabel": "INSIGHTS",
  "navInsightsHref": "#insights",
  "navFaqLabel": "FAQ",
  "navFaqHref": "#faq",
  "navAboutLabel": "ABOUT",
  "navAboutHref": "#about",
  "navContactLabel": "CONTACT",
  "navContactHref": "contact.html",
  "navStatus": "SEARCH SYSTEMS / 2026",
  "cookieConsentVersion": "1.0",
  "cookieConsentMaxAgeDays": 180
}
);
/* CONFIG_END */

;(function (config) {
  "use strict";
  if (typeof config.siteLanguage === "string" && config.siteLanguage.trim()) {
    document.documentElement.lang = config.siteLanguage.trim();
  }
  var file = location.pathname.split("/").pop() || "index.html";
  var page = config.seoPages && config.seoPages[file];
  if (!page && document.body && document.body.classList.contains("not-found-page")) {
    page = config.seoPages["404.html"];
  }
  if (!page) return;
  var base = String(config.siteUrl || location.origin).replace(/\/$/, "");
  var url = base + "/" + String(page.path || "").replace(/^\//, "");
  var ensureMeta = function (selector, attrs) {
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      document.head.appendChild(node);
    }
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
  };
  var canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
  var titleSuffix = String(config.titleSuffix || config.companyName || "").trim();
  var pageTitle = String(page.title || titleSuffix).trim();
  var documentTitle = titleSuffix && pageTitle !== titleSuffix
    ? pageTitle + " — " + titleSuffix
    : pageTitle;
  document.title = documentTitle;
  var description = document.head.querySelector('meta[name="description"]');
  if (!description) {
    description = document.createElement("meta");
    description.name = "description";
    document.head.appendChild(description);
  }
  description.content = page.description;
  ensureMeta('meta[property="og:type"]', { property: "og:type", content: page.type === "ProfessionalService" ? "website" : "article" });
  ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: config.companyName });
  ensureMeta('meta[property="og:title"]', { property: "og:title", content: documentTitle });
  ensureMeta('meta[property="og:description"]', { property: "og:description", content: page.description });
  ensureMeta('meta[property="og:url"]', { property: "og:url", content: url });
  ensureMeta('meta[property="og:image"]', { property: "og:image", content: config.socialImage });
  ensureMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: documentTitle });
  ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: documentTitle });
  ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: page.description });
  ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: config.socialImage });
  if (page.noindex) ensureMeta('meta[name="robots"]', { name: "robots", content: "noindex,follow" });
  var icons = Array.prototype.slice.call(document.head.querySelectorAll('link[rel~="icon"]'));
  var icon = icons[0] || document.createElement("link");
  icon.rel = "icon";
  if (typeof config.faviconHref === "string" && config.faviconHref.trim()) {
    icon.href = config.faviconHref.trim();
  }
  if (!icon.parentNode) document.head.appendChild(icon);
  icons.slice(1).forEach(function (item) { item.remove(); });
  var schema = {
    "@context": "https://schema.org",
    "@type": page.type,
    name: page.serviceType || documentTitle,
    url: url,
    description: page.description
  };
  if (page.type === "ProfessionalService") {
    schema.name = config.companyName;
    schema.email = String(config.corporateEmail || "").toLowerCase();
    schema.address = config.companyAddress;
    schema.areaServed = "International";
    schema.serviceType = ["SEO consulting", "Technical SEO", "SEO content strategy", "SEO authority consulting"];
  } else if (page.type === "Service") {
    schema.provider = { "@type": "ProfessionalService", name: config.companyName, url: base + "/" };
    schema.serviceType = page.serviceType;
  } else {
    schema.isPartOf = { "@type": "WebSite", name: config.companyName, url: base + "/" };
  }
  var schemaNode = document.head.querySelector('script[data-site-schema]') || document.createElement("script");
  schemaNode.type = "application/ld+json";
  schemaNode.dataset.siteSchema = "";
  schemaNode.textContent = JSON.stringify(schema);
  if (!schemaNode.parentNode) document.head.appendChild(schemaNode);
})(window.SITE_CONFIG);
