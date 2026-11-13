"use strict";

// ============================================================
// PRODUCTEN OPHALEN MET fetch() + LOADING STATE
//
// Haalt products.json op, zet de gegevens klaar als
//   window.PRODUCTS         -> { "id": { ...product } }
//   window.FLASH_SALE       -> { title, endsAt }
//   window.PRODUCTS_STATUS  -> "loading" | "ready" | "error"
// en laadt DAARNA pas de scripts uit data-then (in die volgorde).
//
// Gebruik, bijvoorbeeld op index.html:
//   <script src="assets/js/core/products-loader.js"
//           data-then="assets/js/core/sale.js,assets/js/home/home-products.js,..."></script>
//
// De paden in data-then zijn relatief aan de pagina, net als een gewone <script src>.
// products.json staat in assets/data/.
//
// LOADING STATE (stijl: assets/css/loading.css)
// - Zodra de pagina klaar is, verschijnt "Producten laden…" met een spinner.
//   Waar dat staat hangt van de pagina af (zie TARGETS):
//     #products      index.html en pages/categories.html: in het productenvak
//     #product       product.html: boven de pagina (de placeholders worden verborgen)
//     #wishlist-list cart.html: boven het verlanglijstje
// - De loading state blijft minstens MIN_LOADING_MS staan, zodat hij ook bij een
//   snelle verbinding te zien is en niet even flikkert. Zet op 0 om dat uit te zetten.
// - Gelukt: de loading state verdwijnt zodra de producten er staan.
// - Mislukt: de loading state verdwijnt en er verschijnt een foutmelding
//   met een knop "Opnieuw proberen".
//
// Testen zonder te wachten (net als ?sale-test in sale.js):
//   ?load-test=3       de loading state blijft 3 seconden staan
//   ?load-test=error   doet alsof het ophalen mislukt (foutmelding)
// ============================================================

(function () {
  const MIN_LOADING_MS = 600;

  const loader = document.currentScript;
  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  window.PRODUCTS = {};
  window.FLASH_SALE = {};
  window.PRODUCTS_STATUS = "loading";

  // ----------------------------------------------------------
  // Testopties uit de URL
  // ----------------------------------------------------------

  const loadTest = new URLSearchParams(window.location.search).get("load-test");
  const testSeconds = Number(loadTest);
  const extraDelay =
    Number.isFinite(testSeconds) && testSeconds > 0 ? testSeconds * 1000 : 0;
  const simulateError = loadTest === "error";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  // ----------------------------------------------------------
  // Loading state en foutmelding
  // ----------------------------------------------------------

  // Eerste gevonden element wint. place: "inside" = in het element zelf,
  // "before" = ervoor. hideContent: verberg het element en alles wat erna komt
  // (zo staan de placeholders van product.html niet te flikkeren).
  const TARGETS = [
    { id: "products", place: "inside" },
    { id: "product", place: "before", hideContent: true },
    { id: "wishlist-list", place: "before" },
  ];

  let target = null;
  let loadingEl = null;
  let hiddenEls = [];

  function findTarget() {
    for (const candidate of TARGETS) {
      const el = document.getElementById(candidate.id);
      if (el) return { ...candidate, el };
    }
    return null;
  }

  function placeElement(node) {
    if (!target) return;

    if (target.place === "inside") {
      target.el.textContent = "";
      target.el.appendChild(node);
    } else {
      target.el.before(node);
    }
  }

  function createLoading() {
    const box = document.createElement("div");
    box.className = "loading-state";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");

    const spinner = document.createElement("span");
    spinner.className = "loading-state__spinner";
    spinner.setAttribute("aria-hidden", "true");

    const text = document.createElement("p");
    text.className = "loading-state__text";
    text.textContent = "Producten laden…";

    box.append(spinner, text);
    return box;
  }

  function createError() {
    const box = document.createElement("div");
    box.className = "loading-error";
    box.setAttribute("role", "alert");

    const text = document.createElement("p");
    text.className = "loading-error__text";
    text.textContent =
      "De producten konden niet geladen worden. Open de website via een server (bijvoorbeeld Live Server) en probeer het opnieuw.";

    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "loading-error__retry";
    retry.textContent = "Opnieuw proberen";
    retry.addEventListener("click", () => window.location.reload());

    box.append(text, retry);
    return box;
  }

  function showLoading() {
    target = findTarget();
    if (!target) return;

    if (target.hideContent) {
      for (let el = target.el; el; el = el.nextElementSibling) {
        el.classList.add("is-loading-hidden");
        hiddenEls.push(el);
      }
    }

    target.el.setAttribute("aria-busy", "true");
    loadingEl = createLoading();
    placeElement(loadingEl);
  }

  function removeLoading() {
    if (loadingEl) loadingEl.remove();
    loadingEl = null;

    if (target) target.el.removeAttribute("aria-busy");
  }

  function revealContent() {
    hiddenEls.forEach((el) => el.classList.remove("is-loading-hidden"));
    hiddenEls = [];
  }

  function showError() {
    placeElement(createError());
  }

  // ----------------------------------------------------------
  // Gegevens en scripts laden
  // ----------------------------------------------------------

  function fetchProducts() {
    if (simulateError) {
      return Promise.reject(new Error("Gesimuleerde fout (?load-test=error)"));
    }

    return fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.products)) {
          throw new Error("products.json heeft geen lijst 'products'");
        }

        // Verwerk de lijst tot een object met het id als sleutel.
        data.products.forEach((product) => {
          if (product && product.id) window.PRODUCTS[product.id] = product;
        });

        window.FLASH_SALE = data.flashSale || {};
      });
  }

  // Laad de andere scripts één voor één, in de opgegeven volgorde.
  // De belofte is klaar als ze allemaal uitgevoerd zijn.
  function loadScripts() {
    return Promise.all(
      scripts.map(
        (src) =>
          new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = new URL(src, document.baseURI).href;
            script.async = false; // behoudt de volgorde
            script.onload = resolve;
            script.onerror = () => {
              console.error("Script kon niet geladen worden:", src);
              resolve();
            };
            document.head.appendChild(script);
          }),
      ),
    );
  }

  // ----------------------------------------------------------
  // Start
  // ----------------------------------------------------------

  onReady(showLoading);

  const minimumWait = new Promise((resolve) =>
    setTimeout(resolve, MIN_LOADING_MS + extraDelay),
  );

  let failed = false;

  // Ook een fout die direct optreedt (bijv. een browser zonder fetch) komt zo in .catch.
Promise.resolve()
    .then(fetchProducts)
    .catch((error) => {
      failed = true;
      window.PRODUCTS = {};
      window.FLASH_SALE = {};
      console.error("Producten konden niet geladen worden:", error);
    })
    .then(() => minimumWait)
    .then(() => new Promise(onReady))
    .then(() => {
      if (failed) {
        // Loading state weg, foutmelding erin. De scripts laden we toch:
        // zij laten de pagina met rust als er geen producten zijn.
        window.PRODUCTS_STATUS = "error";
        removeLoading();
        showError();
        return loadScripts();
      }

      // Pas als de kaarten gebouwd zijn verdwijnt de loading state,
      // zodat er geen lege pagina tussen zit.
      window.PRODUCTS_STATUS = "ready";
      return loadScripts().then(() => {
        removeLoading();
        revealContent();
      });
    });
})();
