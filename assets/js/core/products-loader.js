"use strict";

// ============================================================
<<<<<<< HEAD
// PRODUCTEN OPHALEN UIT EEN EXTERNE API
//
// Externe API: DummyJSON
//
// We halen vier categorieën op:
// 1. mens-shoes
// 2. mens-shirts
// 3. womens-bags
// 4. smartphones
//
// Per categorie halen we vier producten op.
//
// Verwacht resultaat: 16 API-producten.
//
// Daarna zetten we de API-gegevens om naar de
// datastructuur die onze webshop al gebruikt.
// ============================================================

(function () {
  // Het huidige script-element ophalen.
  const loader = document.currentScript;

  // Het bestaande products.json-bestand blijft bestaan.
=======
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
>>>>>>> 205e76f47c719cc8400ed95ba89834b5002cdcc6
  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  // ==========================================================
  // 1. VOLGENDE JAVASCRIPT-BESTANDEN BEPALEN
  // ==========================================================

  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  // ==========================================================
  // 2. GEGEVENS VOORBEREIDEN
  // ==========================================================

  window.PRODUCTS = {};
  window.FLASH_SALE = {};
  window.PRODUCTS_STATUS = "loading";

<<<<<<< HEAD
  const API_LIMIT = 4;

  // ==========================================================
  // 3. API-CATEGORIEËN INSTELLEN
  // ==========================================================

  const API_CATEGORIES = [
    {
      apiCategory: "mens-shoes",
      shopCategory: "schoenen",
      categoryLabel: "Schoenen",
    },
    {
      apiCategory: "mens-shirts",
      shopCategory: "kleding",
      categoryLabel: "Kleding",
    },
    {
      apiCategory: "womens-bags",
      shopCategory: "accessoires",
      categoryLabel: "Accessoires",
    },
    {
      apiCategory: "smartphones",
      shopCategory: "elektronica",
      categoryLabel: "Elektronica",
    },
  ];

  // ==========================================================
  // 4. LOKALE PRODUCTS.JSON OPHALEN
  // ==========================================================

  async function loadLocalData() {
    try {
      const response = await fetch(jsonUrl);

      if (!response.ok) {
        throw new Error(
          `Products.json kon niet worden geladen: HTTP ${response.status}`,
        );
      }

      const data = await response.json();

      return {
        products: Array.isArray(data.products) ? data.products : [],
        flashSale: data.flashSale || {},
      };
    } catch (error) {
      console.warn("Lokale productgegevens konden niet geladen worden:", error);

      return {
        products: [],
        flashSale: {},
      };
    }
  }

  // ==========================================================
  // 5. API-GEGEVENS OMZETTEN NAAR WEBSHOPSTRUCTUUR
  // ==========================================================

  function mapApiProduct(apiProduct, categoryInfo) {
    const price = Number(apiProduct.price);

    if (!Number.isFinite(price)) {
      throw new Error(`Ongeldige prijs voor product: ${apiProduct.title}`);
    }

    const discountPercentage = Number(apiProduct.discountPercentage) || 0;

    const salePrice =
      discountPercentage > 0
        ? Number((price * (1 - discountPercentage / 100)).toFixed(2))
        : undefined;

    const images = Array.isArray(apiProduct.images)
      ? apiProduct.images.filter((image) => {
          return typeof image === "string" && image.length > 0;
        })
      : [];

    if (images.length === 0 && typeof apiProduct.thumbnail === "string") {
      images.push(apiProduct.thumbnail);
    }

    const description =
      typeof apiProduct.description === "string" ? apiProduct.description : "";

    return {
      id: `api-${apiProduct.id}`,
      name: apiProduct.title,
      brand: apiProduct.brand || "Onbekend merk",
      category: categoryInfo.shopCategory,
      categoryLabel: categoryInfo.categoryLabel,
      price: price,

      ...(salePrice !== undefined ? { salePrice } : {}),

      popular: true,
      stock: Number(apiProduct.stock) || 0,
      summary: description,
      description: description ? [description] : [],
      features: Array.isArray(apiProduct.tags) ? apiProduct.tags : [],
      images: images,
      rating: Number(apiProduct.rating) || 0,
      apiCategory: apiProduct.category,
    };
  }

  // ==========================================================
  // 6. PRODUCTEN UIT ÉÉN API-CATEGORIE OPHALEN
  // ==========================================================

  async function fetchCategoryProducts(categoryInfo) {
    const apiUrl =
      `https://dummyjson.com/products/category/` +
      `${encodeURIComponent(categoryInfo.apiCategory)}` +
      `?limit=${API_LIMIT}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `API-categorie ${categoryInfo.apiCategory}: HTTP ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.products)) {
      throw new Error(
        `Geen geldige producten ontvangen voor ${categoryInfo.apiCategory}`,
      );
    }

    return data.products.map((product) => {
      return mapApiProduct(product, categoryInfo);
    });
  }

  // ==========================================================
  // 7. PRODUCTEN SAMENVOEGEN
  // ==========================================================

  function combineProducts(localProducts, apiProducts) {
    const productMap = {};

    // Bestaande lokale producten behouden.
    localProducts.forEach((product) => {
      if (product && product.id) {
        productMap[product.id] = product;
      }
    });

    // Externe API-producten toevoegen.
    apiProducts.forEach((product) => {
      productMap[product.id] = product;
    });

    return productMap;
  }

  // ==========================================================
  // 8. DUIDELIJKE FOUTMELDING TONEN
  // ==========================================================

  function showError(error) {
    onReady(() => {
      const target = document.getElementById("products");

      if (!target) return;

      let message = document.getElementById("product-api-error");

      if (!message) {
        message = document.createElement("p");
        message.id = "product-api-error";
        message.setAttribute("role", "alert");
        message.className = "product-api-error";

        target.before(message);
      }

      message.textContent =
        "De externe producten konden niet worden opgehaald. " +
        "Controleer je internetverbinding. " +
        "De bestaande producten blijven beschikbaar.";

      console.error("API-fout:", error);
    });
  }

  // Zorg dat we de melding verwijderen als alles weer werkt.

  function clearError() {
    const message = document.getElementById("product-api-error");

    if (message) {
      message.remove();
    }
  }

  // ==========================================================
  // 9. CONTROLEREN OF DE HTML KLAAR IS
  // ==========================================================

  function hideLoading() {
    const loading = document.getElementById("products-loading");

    if (loading) {
      loading.hidden = true;
    }
  }
=======
  // ----------------------------------------------------------
  // Testopties uit de URL
  // ----------------------------------------------------------

  const loadTest = new URLSearchParams(window.location.search).get("load-test");
  const testSeconds = Number(loadTest);
  const extraDelay =
    Number.isFinite(testSeconds) && testSeconds > 0 ? testSeconds * 1000 : 0;
  const simulateError = loadTest === "error";
>>>>>>> 205e76f47c719cc8400ed95ba89834b5002cdcc6

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

<<<<<<< HEAD
  // ==========================================================
  // 10. ANDERE JAVASCRIPT-BESTANDEN LADEN
  // ==========================================================

  function loadScripts() {
    scripts.forEach((src) => {
      const script = document.createElement("script");

      script.src = new URL(src, document.baseURI).href;

      // Zorgt dat dynamisch geladen scripts
      // in de opgegeven volgorde worden uitgevoerd.
      script.async = false;

      document.head.appendChild(script);
    });
  }

  // ==========================================================
  // 11. ALLES STARTEN
  // ==========================================================

  async function initializeProducts() {
    // Begin alvast met het ophalen van de lokale gegevens.
    const localDataPromise = loadLocalData();

    try {
      // --------------------------------------------------------
      // 11A. VIER API-CATEGORIEËN OPHALEN
      // --------------------------------------------------------

      const categoryResults = await Promise.all(
        API_CATEGORIES.map((categoryInfo) => {
          return fetchCategoryProducts(categoryInfo);
        }),
      );

      // --------------------------------------------------------
      // 11B. ALLE API-PRODUCTEN SAMENVOEGEN
      // --------------------------------------------------------

      const apiProducts = categoryResults.flat();

      // Controleer of er genoeg producten zijn ontvangen.
      if (apiProducts.length < 8) {
        throw new Error(
          `Er zijn maar ${apiProducts.length} API-producten ontvangen. Minimaal 8 zijn vereist.`,
        );
      }

      // --------------------------------------------------------
      // 11C. LOKALE PRODUCTEN OPHALEN
      // --------------------------------------------------------

      const localData = await localDataPromise;

      // --------------------------------------------------------
      // 11D. LOKALE EN API-PRODUCTEN COMBINEREN
      // --------------------------------------------------------

      window.PRODUCTS = combineProducts(localData.products, apiProducts);

      // Bestaande flashsale-instellingen behouden.
      window.FLASH_SALE = localData.flashSale || {};

      // Verwijder eventuele oude foutmelding.
      clearError();

      // Toon in de console hoeveel API-producten geladen zijn.
      console.log(`${apiProducts.length} producten opgehaald uit DummyJSON.`);

      console.log(
        "Totale producten in de webshop:",
        Object.keys(window.PRODUCTS).length,
      );
    } catch (error) {
      // --------------------------------------------------------
      // 11E. FOUT BIJ HET OPHALEN VAN DE API
      // --------------------------------------------------------

      // Lokale producten blijven beschikbaar.
      const localData = await localDataPromise;

      window.PRODUCTS = combineProducts(localData.products, []);

      window.FLASH_SALE = localData.flashSale || {};

      // Toon een duidelijke melding aan de gebruiker.
      showError(error);
    } finally {
      // --------------------------------------------------------
      // 11F. ANDERE SCRIPTS STARTEN
      // --------------------------------------------------------

      // Verberg de laadindicator.
      hideLoading();

      // Ook bij een API-fout laden we de overige scripts.
      loadScripts();
    }
  }

  // Start de volledige productverwerking.
  initializeProducts();
=======
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
>>>>>>> 205e76f47c719cc8400ed95ba89834b5002cdcc6
})();
