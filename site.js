(function () {
  const fallbackDemoFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe-1V7lapHXlHCkdHLYJtfNWVMc6KwrdI6aMpdHjzJRgiW7rA/viewform?usp=dialog";
  const config = typeof EZ_ESTIMATES_CONFIG !== "undefined" ? EZ_ESTIMATES_CONFIG : {};

  function applyLink(selector, url) {
    if (!url) {
      return;
    }
    document.querySelectorAll(selector).forEach(function (link) {
      link.setAttribute("href", url);
      if (/^https?:\/\//.test(url)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
    });
  }

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim().slice(0, 120);
  }

  function getPageContext() {
    return {
      page_path: window.location.pathname,
      page_title: document.title
    };
  }

  function getLinkUrl(link) {
    return link.getAttribute("href") || link.href || "";
  }

  function getAnalyticsLinkUrl(url) {
    if (/^mailto:/i.test(url)) {
      return "mailto:";
    }
    return url;
  }

  function getLinkDomain(url) {
    if (/^mailto:/i.test(url)) {
      return "email";
    }
    try {
      return new URL(url, window.location.href).hostname;
    } catch (error) {
      return "";
    }
  }

  function getCtaText(link) {
    return cleanText(link.getAttribute("data-cta-label") || link.textContent || link.getAttribute("aria-label") || "link");
  }

  function getCtaLocation(link) {
    const explicitLocation = link.getAttribute("data-analytics-location");
    if (explicitLocation) {
      return cleanText(explicitLocation);
    }

    const section = link.closest("section, header, footer, nav, article");
    if (!section) {
      return "page";
    }

    if (section.id) {
      return cleanText(section.id);
    }

    const heading = section.querySelector("h1, h2, h3");
    if (heading) {
      return cleanText(heading.textContent).toLowerCase();
    }

    return (section.tagName || "page").toLowerCase();
  }

  function getPlanName(link) {
    const explicitPlanName = link.getAttribute("data-plan-name");
    if (explicitPlanName) {
      return cleanText(explicitPlanName);
    }

    const card = link.closest("article, .card, .placeholder-box, .hero-card");
    const heading = card ? card.querySelector("h1, h2, h3") : null;
    return heading ? cleanText(heading.textContent) : "";
  }

  function isExternalHttpUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
      return false;
    }

    try {
      return new URL(url, window.location.href).origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function isDemoFormLink(link, url) {
    const demoFormUrl = config.demoFormUrl || fallbackDemoFormUrl;
    return link.matches("[data-demo-form-link]") || url === demoFormUrl || /docs\.google\.com\/forms\//i.test(url);
  }

  function isPricingCta(link, url, planName) {
    const text = getCtaText(link).toLowerCase();
    const pagePath = window.location.pathname.toLowerCase();
    return pagePath.endsWith("pricing.html") || /pricing\.html$/i.test(url) || text.includes("pricing") || !!planName;
  }

  function isFounderOfferCta(link, url, planName) {
    const text = getCtaText(link).toLowerCase();
    const combined = [text, url, planName].join(" ").toLowerCase();
    return combined.includes("founder") || /founder\.html$/i.test(url);
  }

  function trackAnalyticsEvent(eventName, params) {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", eventName, Object.assign({}, getPageContext(), params));
  }

  function handleAnalyticsClick(event) {
    const link = event.target.closest("a");
    if (!link) {
      return;
    }

    const rawUrl = getLinkUrl(link);
    if (!rawUrl) {
      return;
    }

    const analyticsUrl = getAnalyticsLinkUrl(rawUrl);
    const ctaText = getCtaText(link);
    const ctaLocation = getCtaLocation(link);
    const planName = getPlanName(link);

    if (isDemoFormLink(link, rawUrl)) {
      trackAnalyticsEvent("demo_request_click", {
        cta_text: ctaText,
        cta_location: ctaLocation,
        link_url: analyticsUrl
      });
    }

    if (isPricingCta(link, rawUrl, planName)) {
      trackAnalyticsEvent("pricing_cta_click", {
        cta_text: ctaText,
        plan_name: planName || undefined,
        link_url: analyticsUrl
      });
    }

    if (isFounderOfferCta(link, rawUrl, planName)) {
      trackAnalyticsEvent("founder_offer_click", {
        cta_text: ctaText,
        link_url: analyticsUrl
      });
    }

    if (/^mailto:/i.test(rawUrl)) {
      trackAnalyticsEvent("support_contact_click", {
        contact_method: "email",
        link_url: analyticsUrl
      });
    }

    if (isExternalHttpUrl(rawUrl)) {
      trackAnalyticsEvent("outbound_link_click", {
        page_path: window.location.pathname,
        link_url: rawUrl,
        link_domain: getLinkDomain(rawUrl),
        cta_text: ctaText
      });
    }
  }

  function initAnalyticsEvents() {
    if (document.documentElement.dataset.analyticsEventsBound === "true") {
      return;
    }
    document.documentElement.dataset.analyticsEventsBound = "true";
    document.addEventListener("click", handleAnalyticsClick);
  }

  applyLink("[data-demo-form-link]", config.demoFormUrl || fallbackDemoFormUrl);
  applyLink("[data-sample-proposal-link]", config.sampleProposalUrl);
  applyLink("[data-sales-one-pager-link]", config.salesOnePagerUrl);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalyticsEvents, { once: true });
  } else {
    initAnalyticsEvents();
  }
})();
