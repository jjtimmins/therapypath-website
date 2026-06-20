(function () {
  var HERO_FONTS = [
    "/fonts/parastorage/fonts-cache/googlefont/woff2/s/librebaskerville/v14/kmKhZrc3Hgbbcjq75U4uslyuy4kn0qNcWxEQDO-Wyrs.woff2",
    "/fonts/parastorage/fonts-cache/googlefont/woff2/s/librebaskerville/v14/kmKiZrc3Hgbbcjq75U4uslyuy4kn0qviTgY3KcC-wLOj.woff2",
    "/fonts/ufonts/c04bd5_9f2797b0468342778e780108993b3788.woff2",
    "/fonts/parastorage/v2/74290729-59ae-4129-87d0-2eec3974dce1/v1/avenir-lt-w01_85-heavy1475544.woff2",
  ];

  HERO_FONTS.forEach(function (href) {
    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  });

  var MOBILE_QUERY = "(max-width: 980px)";
  var DESKTOP_VIEWPORT_WIDTH = 1024;
  var SYNC_CLASSES = ["tp-mobile-site", "tp-home-mobile-template-page", "tp-mobile-booting", "tp-mobile-ready"];

  function isFrenchPath(path) {
    path = (path || location.pathname).toLowerCase();
    return path === "/fr" || path === "/fr.html" || path.indexOf("/fr/") === 0;
  }

  function isEnglishHome(path) {
    path = (path || location.pathname).toLowerCase();
    return !isFrenchPath(path) && (path === "/" || path === "/index.html" || path === "/index");
  }

  function isLandingPage() {
    var master = document.getElementById("masterPage");
    return !!(master && master.classList.contains("landingPage"));
  }

  function isDesktopSiteRequested() {
    var ua = navigator.userAgent || "";
    if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return true;
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
  }

  function shouldUseMobileSite() {
    if (isDesktopSiteRequested()) return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function applyDesktopViewport() {
    var viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    viewport.setAttribute("content", "width=" + DESKTOP_VIEWPORT_WIDTH);
  }

  window.__tpDesktopSiteRequested = isDesktopSiteRequested();
  window.__tpShouldUseMobileSite = shouldUseMobileSite;

  if (window.__tpDesktopSiteRequested) {
    applyDesktopViewport();
  }

  function syncBodyClasses() {
    if (!document.body) return;
    var html = document.documentElement;
    SYNC_CLASSES.forEach(function (cls) {
      if (html.classList.contains(cls)) document.body.classList.add(cls);
      else document.body.classList.remove(cls);
    });
  }

  function applyMobileBoot() {
    var html = document.documentElement;
    var mobile = shouldUseMobileSite();

    if (!mobile || isLandingPage()) {
      SYNC_CLASSES.forEach(function (cls) {
        html.classList.remove(cls);
      });
      syncBodyClasses();
      return;
    }

    html.classList.add("tp-mobile-site", "tp-mobile-booting");
    html.classList.remove("tp-mobile-ready");

    if (isEnglishHome()) html.classList.add("tp-home-mobile-template-page");
    else html.classList.remove("tp-home-mobile-template-page");

    syncBodyClasses();
  }

  function watchForBody() {
    if (document.body) {
      syncBodyClasses();
      return;
    }
    new MutationObserver(function () {
      if (document.body) syncBodyClasses();
    }).observe(document.documentElement, { childList: true });
  }

  applyMobileBoot();
  watchForBody();

  document.addEventListener("DOMContentLoaded", function () {
    applyMobileBoot();
    syncBodyClasses();
  });

  var mq = window.matchMedia(MOBILE_QUERY);
  if (mq.addEventListener) mq.addEventListener("change", applyMobileBoot);
  else if (mq.addListener) mq.addListener(applyMobileBoot);

  window.__tpMarkMobileReady = function () {
    if (!shouldUseMobileSite()) return;
    document.documentElement.classList.remove("tp-mobile-booting");
    document.documentElement.classList.add("tp-mobile-ready");
    syncBodyClasses();
  };

  setTimeout(function () {
    var html = document.documentElement;
    if (html.classList.contains("tp-mobile-booting") && !html.classList.contains("tp-mobile-ready")) {
      window.__tpMarkMobileReady();
    }
  }, 4000);
})();
