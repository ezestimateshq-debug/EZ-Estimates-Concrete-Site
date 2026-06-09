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

  applyLink("[data-demo-form-link]", config.demoFormUrl || fallbackDemoFormUrl);
  applyLink("[data-sample-proposal-link]", config.sampleProposalUrl);
  applyLink("[data-sales-one-pager-link]", config.salesOnePagerUrl);
})();
