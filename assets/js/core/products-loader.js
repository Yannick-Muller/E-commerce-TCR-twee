"use strict";

// ============================================================
// PRODUCTEN OPHALEN UIT EEN EXTERNE API
// ============================================================

(function () {
  // ==========================================================
  // 1. VOLGENDE JAVASCRIPT-BESTANDEN BEPALEN
  // ==========================================================

  const loader = document.currentScript;

  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  // ==========================================================
  // 2. GEGEVENS VOORBEREIDEN
  // ==========================================================

  window.PRODUCTS = {};
  window.FLASH_SALE = {};

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
      // api- voorkomt dat product-ID's botsen met lokale producten.
      id: `api-${apiProduct.id}`,

      // Zet de API-velden om naar onze eigen veldnamen.
      name: apiProduct.title,
      brand: apiProduct.brand || "Onbekend merk",
      category: categoryInfo.shopCategory,
      categoryLabel: categoryInfo.categoryLabel,
      price: price,

      // Voeg salePrice alleen toe als er daadwerkelijk korting is.
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
    // Bouw de API-URL op met de categorie en het aantal producten.
    const apiUrl =
      `https://dummyjson.com/products/category/` +
      `${encodeURIComponent(categoryInfo.apiCategory)}` +
      `?limit=${API_LIMIT}`;

    const response = await fetch(apiUrl);

    // Controleer of de API het verzoek goed heeft verwerkt.
    if (!response.ok) {
      throw new Error(
        `API-categorie ${categoryInfo.apiCategory}: HTTP ${response.status}`,
      );
    }

    // Zet het ontvangen antwoord om naar JavaScript.
    const data = await response.json();

    // Controleer of de API een geldige productenlijst teruggeeft.
    if (!data || !Array.isArray(data.products)) {
      throw new Error(
        `Geen geldige producten ontvangen voor ${categoryInfo.apiCategory}`,
      );
    }

    // map() zet ieder API-product om met mapApiProduct().
    return data.products.map((product) => {
      return mapApiProduct(product, categoryInfo);
    });
  }

  // ==========================================================
  // 7. PRODUCTEN SAMENVOEGEN
  // ==========================================================

  // Combineert de lokale producten met de producten uit de API.
  function combineProducts(localProducts, apiProducts) {
    // Hier verzamelen we alle producten in één object.
    const productMap = {};

    // Voeg eerst de bestaande lokale producten toe.
    localProducts.forEach((product) => {
      if (product && product.id) {
        productMap[product.id] = product;
      }
    });

    // Voeg daarna de externe API-producten toe.
    apiProducts.forEach((product) => {
      productMap[product.id] = product;
    });

    // Geef het complete productoverzicht terug.
    return productMap;
  }

  // ==========================================================
  // 8. DUIDELIJKE FOUTMELDING TONEN
  // ==========================================================

  // Deze functie toont een melding als de externe API niet werkt.
  function showError(error) {
    // onReady wacht totdat de HTML-pagina klaar is.
    onReady(() => {
      // Zoek het gedeelte waarin de producten worden weergegeven.
      const target = document.getElementById("products");

      if (!target) return;

      // Controleer of er al een foutmelding bestaat.
      let message = document.getElementById("product-api-error");

      // Maak een nieuwe melding als deze nog niet bestaat.
      if (!message) {
        message = document.createElement("p");
        message.id = "product-api-error";
        message.setAttribute("role", "alert");
        message.className = "product-api-error";

        target.before(message);
      }

      // Toon een begrijpelijke melding op de website.
      message.textContent =
        "De externe producten konden niet worden opgehaald. " +
        "Controleer je internetverbinding. " +
        "De bestaande producten blijven beschikbaar.";

      // Toon de technische fout in de browserconsole.
      console.error("API-fout:", error);
    });
  }

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

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  // ==========================================================
  // 10. ANDERE JAVASCRIPT-BESTANDEN LADEN
  // ==========================================================

  function loadScripts() {
    scripts.forEach((src) => {
      const script = document.createElement("script");

      script.src = new URL(src, document.baseURI).href;

      script.async = false;

      document.head.appendChild(script);
    });
  }

  // ==========================================================
  // 11. ALLES STARTEN
  // ==========================================================

  async function initializeProducts() {
    // Start alvast het ophalen van de lokale productgegevens.
    const localDataPromise = loadLocalData();

    try {
      // --------------------------------------------------------
      // 11A. VIER API-CATEGORIEËN OPHALEN
      // --------------------------------------------------------

      // Promise.all() wacht totdat alle categorieën zijn opgehaald.
      // map() start voor iedere categorie een API-verzoek.
      const categoryResults = await Promise.all(
        API_CATEGORIES.map((categoryInfo) => {
          return fetchCategoryProducts(categoryInfo);
        }),
      );

      // --------------------------------------------------------
      // 11B. ALLE API-PRODUCTEN SAMENVOEGEN
      // --------------------------------------------------------

      const apiProducts = categoryResults.flat();

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

      window.FLASH_SALE = localData.flashSale || {};

      clearError();

      console.log(`${apiProducts.length} producten opgehaald uit DummyJSON.`);

      console.log(
        "Totale producten in de webshop:",
        Object.keys(window.PRODUCTS).length,
      );
    } catch (error) {
      // --------------------------------------------------------
      // 11E. FOUT BIJ HET OPHALEN VAN DE API
      // --------------------------------------------------------

      const localData = await localDataPromise;

      window.PRODUCTS = combineProducts(localData.products, []);

      window.FLASH_SALE = localData.flashSale || {};

      showError(error);
    } finally {
      // --------------------------------------------------------
      // 11F. ANDERE SCRIPTS STARTEN
      // --------------------------------------------------------

      hideLoading();

      loadScripts();
    }
  }

  initializeProducts();
})();
