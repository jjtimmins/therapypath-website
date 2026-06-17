(function () {
  var CA_FLAG =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><clipPath id="c"><circle cx="16" cy="16" r="16"/></clipPath></defs><g clip-path="url(#c)"><rect width="32" height="32" fill="#d52b1e"/><rect x="8" width="16" height="32" fill="#fff"/><path fill="#d52b1e" d="M16 8.5l1.1 3.4h3.6l-2.9 2.1 1.1 3.5-3-2.2-3 2.2 1.1-3.5-2.9-2.1h3.6z"/></g></svg>'
    );

  function showSentBanner() {
    if (!/sent=1/.test(location.search)) return;
    var form = document.querySelector(".tp-contact-form");
    if (!form) return;
    var note = document.createElement("p");
    note.className = "tp-contact-sent";
    note.textContent =
      document.documentElement.lang === "fr"
        ? "Merci! Votre message a ete envoye. Nous vous repondrons sous peu."
        : "Thank you! Your message has been sent. We will get back to you soon.";
    form.parentNode.insertBefore(note, form);
  }

  function ensureFormSubmitFields(form) {
    if (!form || location.protocol === "file:") return;

    var pageUrl = location.href.split("#")[0];
    var urlInput = form.querySelector('input[name="_url"]');
    if (!urlInput) {
      urlInput = document.createElement("input");
      urlInput.type = "hidden";
      urlInput.name = "_url";
      form.insertBefore(urlInput, form.firstChild);
    }
    urlInput.value = pageUrl;

    var nextInput = form.querySelector('input[name="_next"]');
    if (nextInput && !/^https?:\/\//i.test(nextInput.value)) {
      var nextPath = nextInput.value.charAt(0) === "/" ? nextInput.value : "/" + nextInput.value;
      nextInput.value = location.origin + nextPath;
    }
  }

  function initContactForm() {
    var form = document.querySelector(".tp-contact-form");
    if (!form) return;

    ensureFormSubmitFields(form);

    var captcha = form.querySelector(".Captcha3940957316__checkbox");
    if (captcha) {
      captcha.removeAttribute("required");
      captcha.checked = true;
    }

    var captchaRoot = form.querySelector("#comp-m4d2ct0y, .wixui-captcha");
    if (captchaRoot) captchaRoot.remove();

    form.addEventListener("submit", function () {
      ensureFormSubmitFields(form);

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        var label = btn.querySelector(".wixui-button__label");
        if (label) {
          label.textContent =
            document.documentElement.lang === "fr" ? "Envoi..." : "Sending...";
        }
      }
    });

    var sendButton = form.querySelector('button[type="submit"]');
    if (sendButton) {
      sendButton.addEventListener(
        "click",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
          }
          ensureFormSubmitFields(form);
        },
        true
      );
    }
  }

  function resolvePath(href) {
    var link = document.createElement("a");
    link.href = href;
    return link.pathname;
  }

  function isFrenchPage() {
    var path = window.location.pathname.toLowerCase();
    var lang = (document.documentElement.lang || "").toLowerCase();
    return (
      lang.indexOf("fr") === 0 ||
      path === "/fr" ||
      path === "/fr.html" ||
      path.indexOf("/fr/") === 0
    );
  }

  function getLanguageUrls() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('link[rel="alternate"][hreflang]')
    );
    var enLink = links.find(function (l) {
      return l.hreflang === "en-ca" || l.hreflang === "x-default";
    });
    var frLink = links.find(function (l) {
      return l.hreflang === "fr-fr";
    });

    var en = enLink ? resolvePath(enLink.href) : "/";
    var fr = frLink ? resolvePath(frLink.href) : "/fr.html";

    if (en === "/index.html") en = "/";
    if (fr === "/fr/index.html") fr = "/fr.html";

    return { en: en, fr: fr };
  }

  function initLanguageSwitcher() {
    var mount = document.getElementById("comp-m6k5baee");
    if (!mount || mount.querySelector(".tp-lang-switch")) return;

    var urls = getLanguageUrls();
    var french = isFrenchPage();
    var current = french
      ? { code: "FR", href: urls.fr }
      : { code: "EN", href: urls.en };
    var alternate = french
      ? { code: "EN", href: urls.en }
      : { code: "FR", href: urls.fr };

    var root = document.createElement("div");
    root.className = "tp-lang-switch";
    root.innerHTML =
      '<button type="button" class="tp-lang-current" aria-haspopup="listbox" aria-expanded="false">' +
      '<img class="tp-lang-flag" src="' +
      CA_FLAG +
      '" alt="" width="22" height="22" />' +
      '<span class="tp-lang-code">' +
      current.code +
      "</span>" +
      '<span class="tp-lang-chevron" aria-hidden="true">&#9662;</span>' +
      "</button>" +
      '<div class="tp-lang-menu" hidden>' +
      '<a class="tp-lang-option" href="' +
      alternate.href +
      '">' +
      '<img class="tp-lang-flag" src="' +
      CA_FLAG +
      '" alt="" width="22" height="22" />' +
      "<span>" +
      alternate.code +
      "</span>" +
      "</a>" +
      "</div>";

    mount.innerHTML = "";
    mount.appendChild(root);

    var button = root.querySelector(".tp-lang-current");
    var menu = root.querySelector(".tp-lang-menu");

    function closeMenu() {
      root.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }

    function openMenu() {
      root.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initHashScroll() {
    var hashScrollTargets = {
      "comp-m4uec27w1": "comp-m4uec27w1",
      "anchors-m4uec27r6": "comp-m4uec27w1",
      "anchors-lvfbdtjs": "comp-m4d289nf",
      "comp-m4d289nf": "comp-m4d289nf",
      "anchors-m4u9ygef6": "comp-m4u9ygeh8",
      "comp-m4u9ygeh8": "comp-m4u9ygeh8",
      "anchors-m4u9yger9": "comp-m4u9ygew",
      "comp-m4u9ygew": "comp-m4u9ygew",
      "anchors-m4u9ygfe4": "comp-m4u9ygfg2",
      "comp-m4u9ygfg2": "comp-m4u9ygfg2",
      "anchors-m4uaf2y410": "comp-m4uaf2y81",
      "join-our-team": "comp-m4uaf2y81",
      "comp-m4uaf2y81": "comp-m4uaf2y81",
      "anchors-m4u9qh0c": "comp-m4u9qh0e6",
      "comp-m4u9qh0e6": "comp-m4u9qh0e6",
      "anchors-m4u9qh0m1": "comp-m4u9qh0q1",
      "comp-m4u9qh0q1": "comp-m4u9qh0q1",
      "anchors-m4u9qh0u6": "comp-m4u9u733",
      "comp-m4u9u733": "comp-m4u9u733",
    };

    function scrollToHashTarget(hash) {
      var targetId = hashScrollTargets[hash];
      if (!targetId) return false;
      var target = document.getElementById(targetId);
      if (!target) return false;
      var top =
        target.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: top, behavior: "auto" });
      return true;
    }

    function handlePageHash() {
      var hash = location.hash.replace(/^#/, "");
      if (!hashScrollTargets[hash]) return;
      scrollToHashTarget(hash);
      window.setTimeout(function () {
        scrollToHashTarget(hash);
      }, 150);
      window.setTimeout(function () {
        scrollToHashTarget(hash);
      }, 500);
    }

    handlePageHash();
    window.addEventListener("hashchange", handlePageHash);

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || !link.href) return;
      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (err) {
        return;
      }
      var hash = url.hash.replace(/^#/, "");
      if (!hashScrollTargets[hash]) return;

      var samePage =
        url.pathname === location.pathname ||
        (url.pathname.endsWith("/therapy.html") &&
          location.pathname.endsWith("/therapy.html")) ||
        (url.pathname.endsWith("/our-team.html") &&
          location.pathname.endsWith("/our-team.html")) ||
        (url.pathname.endsWith("/our-specializations.html") &&
          location.pathname.endsWith("/our-specializations.html")) ||
        (url.pathname.endsWith("/contact-us.html") &&
          location.pathname.endsWith("/contact-us.html"));

      if (!samePage) return;

      var targetId = hashScrollTargets[hash];
      if (!document.getElementById(targetId)) return;

      event.preventDefault();
      history.pushState(null, "", url.pathname + url.search + "#" + hash);
      scrollToHashTarget(hash);
    });
  }

  function initTherapyMenuLinks() {
    var isFrench = location.pathname === "/fr.html" || location.pathname.indexOf("/fr/") === 0;
    var therapyPath = isFrench ? "/fr/services/therapy.html" : "/services/therapy.html";
    var teamPath = isFrench ? "/fr/about-us/our-team.html" : "/about-us/our-team.html";
    var specializationsPath = isFrench
      ? "/fr/about-us/our-specializations.html"
      : "/about-us/our-specializations.html";
    var contactPath = isFrench ? "/fr/contact-us.html" : "/contact-us.html";
    var targetsByText = {
      "Speech": therapyPath + "#anchors-m4u9ygef6",
      "Parole": therapyPath + "#anchors-m4u9ygef6",
      "Language": therapyPath + "#anchors-m4u9yger9",
      "Langage": therapyPath + "#anchors-m4u9yger9",
      "Assistive devices": therapyPath + "#anchors-m4u9ygfe4",
      "Appareils fonctionnels": therapyPath + "#anchors-m4u9ygfe4",
      "Join Our Team": teamPath + "#anchors-m4uaf2y410",
      "Rejoignez notre équipe": teamPath + "#anchors-m4uaf2y410",
      "Brain Injury": specializationsPath + "#anchors-m4u9qh0c",
      "Lésion cérébrale": specializationsPath + "#anchors-m4u9qh0c",
      "Learning Disabilities": specializationsPath + "#anchors-m4u9qh0m1",
      "Troubles d'apprentissage": specializationsPath + "#anchors-m4u9qh0m1",
      "Stroke": specializationsPath + "#anchors-m4u9qh0u6",
      "Accident vasculaire cérébral": specializationsPath + "#anchors-m4u9qh0u6",
    };

    document
      .querySelectorAll('#comp-m4ufk180 a.wixui-rich-text__text')
      .forEach(function (link) {
        var label = (link.textContent || "").replace(/\s+/g, " ").trim();
        var href = targetsByText[label];
        if (!href) return;
        link.setAttribute("href", href);
        link.setAttribute("target", "_self");
      });

    document
      .querySelectorAll('#comp-m4ufk180 .itemDepth12472627565__root')
      .forEach(function (link) {
        var label = (link.textContent || "").replace(/\s+/g, " ").trim();
        if (label !== "Contact Us" && label !== "Contactez nous") return;
        link.setAttribute("href", contactPath + "#anchors-lvfbdtjs");
        link.setAttribute("target", "_self");
      });
  }

  function initHelpCardButtons() {
    document.querySelectorAll('[id^="comp-m4pvn6av__"] a[href]').forEach(function (link) {
      link.setAttribute("aria-label", link.href.indexOf("assessments") >= 0
        ? "Learn more about assessments"
        : "Learn more about therapy services");

      link.addEventListener(
        "click",
        function (event) {
          var href = link.getAttribute("href");
          if (!href || href.charAt(0) === "#") return;
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(href);
        },
        true
      );
    });
  }

  function initAccessibleLinkLabels() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      if (link.getAttribute("aria-label")) return;

      var text = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (text) return;

      var img = link.querySelector("img[alt]");
      if (img && img.alt.trim()) {
        link.setAttribute("aria-label", img.alt.trim());
        return;
      }

      var href = link.getAttribute("href") || "";
      if (
        href === "/" ||
        href === "index.html" ||
        /\/index\.html$/.test(href) ||
        href.endsWith("/") && href.split("/").filter(Boolean).length <= 1
      ) {
        link.setAttribute("aria-label", "The Therapy Path home");
        return;
      }
      if (href === "fr.html" || href.endsWith("/fr.html")) {
        link.setAttribute("aria-label", "Accueil");
        return;
      }
      if (href.indexOf("facebook.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on Facebook");
        return;
      }
      if (href.indexOf("instagram.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on Instagram");
        return;
      }
      if (href.indexOf("linkedin.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on LinkedIn");
        return;
      }

      var panel =
        link.closest('[id^="comp-m4u4ll70"]') ||
        link.closest('[id^="comp-m4pvn6av"]') ||
        link.closest(".wixui-repeater__item");
      if (panel) {
        var description = panel.querySelector(".wixui-rich-text__text");
        if (description) {
          var snippet = (description.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 100);
          if (snippet) {
            link.setAttribute("aria-label", snippet);
            return;
          }
        }
      }

      if (href.indexOf("assessments") >= 0) {
        link.setAttribute("aria-label", "Learn more about assessments");
        return;
      }
      if (href.indexOf("therapy") >= 0) {
        link.setAttribute("aria-label", "Learn more about therapy services");
        return;
      }

      var titled = link.closest("[title]");
      var title = link.getAttribute("title") || (titled && titled.getAttribute("title"));
      if (title) {
        link.setAttribute(
          "aria-label",
          title
            .replace(/\.(jpe?g|png|webp|avif)$/i, "")
            .replace(/[_~-]+/g, " ")
            .trim()
        );
      }
    });
  }

  function initConsultationCardButtons() {
    document
      .querySelectorAll('[id^="comp-m6awikg0__"] a[href*="therapy.html"]')
      .forEach(function (link) {
        if (!link.getAttribute("aria-label")) {
          link.setAttribute("aria-label", "Learn more about language therapy services");
        }
        link.addEventListener(
          "click",
          function (event) {
            var href = link.getAttribute("href");
            if (!href) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.assign(href);
          },
          true
        );
      });
  }

  function loadStylesheet(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, callback) {
    if (window.L) {
      callback();
      return;
    }

    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }

    var script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initGeographicCoverageMap() {
    var mount = document.getElementById("comp-m4uh76kx");
    if (!mount || mount.dataset.tpMapReady === "true") return;
    mount.dataset.tpMapReady = "true";
    mount.innerHTML =
      '<div class="tp-coverage-map" role="img" aria-label="Map of The Therapy Path service areas across Northern Ontario"></div>';

    var mapEl = mount.querySelector(".tp-coverage-map");
    loadStylesheet("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", function () {
      if (!window.L || !mapEl) return;

      var map = L.map(mapEl, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([48.95, -81.25], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      [
        ["North Bay", 46.3091, -79.4608],
        ["Timmins", 48.4758, -81.3305],
        ["New Liskeard", 47.5095, -79.6759],
        ["Kirkland Lake", 48.1446, -80.0377],
        ["Cochrane", 49.0669, -81.0168],
        ["Iroquois Falls", 48.7675, -80.6830],
        ["Kapuskasing", 49.4169, -82.4331],
        ["Hearst", 49.6868, -83.6665],
        ["James Bay Coast", 51.2720, -80.6400],
      ].forEach(function (place) {
        L.marker([place[1], place[2]]).addTo(map).bindPopup(place[0]);
      });

      window.setTimeout(function () {
        map.invalidateSize();
      }, 250);
    });
  }

  function pinLocalImages() {
    var heroImg = document.querySelector("#img_comp-m4n0yl36 img");
    if (heroImg) {
      heroImg.src = "/images/opt/adobestock_495222202-980w.webp";
      heroImg.removeAttribute("srcset");
      heroImg.setAttribute("fetchpriority", "high");
      heroImg.setAttribute("alt", "Speech therapy session");
    }

    document.querySelectorAll('img[src*="wixstatic.com"]').forEach(function (img) {
      if (img.closest("#img_pageBackground_c1dmp")) return;
      var localSrc = img.getAttribute("data-tp-local-src");
      if (localSrc) {
        img.src = localSrc;
        img.removeAttribute("srcset");
      }
    });
  }

  showSentBanner();
  initContactForm();
  initLanguageSwitcher();
  initTherapyMenuLinks();
  initHashScroll();
  initHelpCardButtons();
  initConsultationCardButtons();
  initAccessibleLinkLabels();
  pinLocalImages();
  initGeographicCoverageMap();
})();
