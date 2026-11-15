"use strict";

// ============================================================
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
})();
