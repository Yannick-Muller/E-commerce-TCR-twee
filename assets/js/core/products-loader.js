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
//
// Bestaande bestanden zoals:
// home-products.js
// shop-products.js
// favorites.js
// script.js
// searchbar.js
// category-filter.js
//
// Kunnen daardoor met dezelfde productstructuur blijven werken.
// ============================================================

(function () {
  // Het huidige script-element ophalen.
  // Hierin staan ook de volgende scripts die geladen moeten worden.

  const loader = document.currentScript;

  // Het bestaande products.json-bestand blijft bestaan.
  // Hieruit halen we de bestaande producten en flashsale-instellingen.

  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  // ==========================================================
  // 1. VOLGENDE JAVASCRIPT-BESTANDEN BEPALEN
  // ==========================================================

  // De HTML geeft via data-then door welke scripts
  // na het ophalen van de producten uitgevoerd moeten worden.
  //
  // split(",") verdeelt de tekst in een array.
  // map() verwijdert overbodige spaties.
  // filter(Boolean) verwijdert lege waarden.

  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  // ==========================================================
  // 2. GEGEVENS VOORBEREIDEN
  // ==========================================================

  // window.PRODUCTS wordt door de andere JavaScript-bestanden gebruikt.
  // Hierin komt straks ieder product met zijn ID als sleutel.

  window.PRODUCTS = {};

  // De bestaande flashsale-instellingen blijven behouden.

  window.FLASH_SALE = {};

  // Het aantal producten dat we per API-categorie ophalen.

  const API_LIMIT = 4;

  // ==========================================================
  // 3. API-CATEGORIEËN INSTELLEN
  // ==========================================================

  // De externe API gebruikt andere categorienamen
  // dan onze webshop.
  //
  // Daarom vertalen we de API-categorieën naar
  // de vier categorieën die onze webshop al gebruikt.

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

  // We behouden de bestaande lokale productgegevens.
  //
  // Deze functie is niet afhankelijk van de externe API.
  // Zo blijven bestaande producten beschikbaar wanneer
  // de externe API tijdelijk niet bereikbaar is.

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

  // De externe API gebruikt andere veldnamen.
  //
  // Bijvoorbeeld:
  //
  // API:
  // title
  // thumbnail
  // discountPercentage
  //
  // Onze webshop:
  // name
  // images
  // salePrice
  //
  // Deze functie vertaalt de gegevens.

  function mapApiProduct(apiProduct, categoryInfo) {
    // Controleer en converteer de productprijs.
    const price = Number(apiProduct.price);

    if (!Number.isFinite(price)) {
      throw new Error(`Ongeldige prijs voor product: ${apiProduct.title}`);
    }

    // Haal het kortingspercentage uit de API.
    const discountPercentage = Number(apiProduct.discountPercentage) || 0;

    // Bereken eventueel de kortingsprijs.
    //
    // Bijvoorbeeld:
    // Originele prijs: €100
    // Korting: 10%
    // Nieuwe prijs: €90

    const salePrice =
      discountPercentage > 0
        ? Number((price * (1 - discountPercentage / 100)).toFixed(2))
        : undefined;

    // Haal alle beschikbare afbeeldingen op.
    const images = Array.isArray(apiProduct.images)
      ? apiProduct.images.filter((image) => {
          return typeof image === "string" && image.length > 0;
        })
      : [];

    // Wanneer er geen afbeeldingenlijst bestaat,
    // gebruiken we de thumbnail als reserveafbeelding.

    if (images.length === 0 && typeof apiProduct.thumbnail === "string") {
      images.push(apiProduct.thumbnail);
    }

    // De API geeft de beschrijving als gewone tekst.
    // Onze webshop verwacht een array met beschrijvingen.

    const description =
      typeof apiProduct.description === "string" ? apiProduct.description : "";

    // Maak een nieuw productobject in onze webshopstructuur.

    return {
      // Voeg api- toe om ID-conflicten met lokale producten te voorkomen.
      //
      // Bijvoorbeeld:
      // api-1
      // api-2
      // api-3

      id: `api-${apiProduct.id}`,

      // De API noemt de productnaam title.
      // Onze webshop gebruikt name.

      name: apiProduct.title,

      brand: apiProduct.brand || "Onbekend merk",

      // Gebruik de categorievertaling uit API_CATEGORIES.

      category: categoryInfo.shopCategory,

      categoryLabel: categoryInfo.categoryLabel,

      // Prijs blijft een getal en niet een tekstwaarde.

      price: price,

      // Alleen een kortingsprijs toevoegen wanneer
      // de API daadwerkelijk een korting opgeeft.

      ...(salePrice !== undefined ? { salePrice } : {}),

      // Maak de API-producten zichtbaar op de homepage.

      popular: true,

      // Voorraadgegevens uit de API.

      stock: Number(apiProduct.stock) || 0,

      // De korte beschrijving.

      summary: description,

      // Onze webshop gebruikt een array voor descriptions.

      description: description ? [description] : [],

      // Tags uit de API gebruiken we als productkenmerken.

      features: Array.isArray(apiProduct.tags) ? apiProduct.tags : [],

      // De afbeeldingen van de externe API.

      images: images,

      // Aanvullende gegevens die we later kunnen gebruiken.

      rating: Number(apiProduct.rating) || 0,

      apiCategory: apiProduct.category,
    };
  }

  // ==========================================================
  // 6. PRODUCTEN UIT ÉÉN API-CATEGORIE OPHALEN
  // ==========================================================

  // Deze functie wordt voor iedere categorie uitgevoerd.
  //
  // fetch() stuurt een verzoek naar DummyJSON.
  //
  // limit=4 betekent dat we maximaal vier producten
  // uit iedere categorie ophalen.

  async function fetchCategoryProducts(categoryInfo) {
    const apiUrl =
      `https://dummyjson.com/products/category/` +
      `${encodeURIComponent(categoryInfo.apiCategory)}` +
      `?limit=${API_LIMIT}`;

    const response = await fetch(apiUrl);

    // Controleer of het verzoek succesvol was.

    if (!response.ok) {
      throw new Error(
        `API-categorie ${categoryInfo.apiCategory}: HTTP ${response.status}`,
      );
    }

    // Zet de ontvangen JSON-tekst om naar JavaScript-gegevens.

    const data = await response.json();

    // Controleer of de API een productenlijst heeft teruggegeven.

    if (!data || !Array.isArray(data.products)) {
      throw new Error(
        `Geen geldige producten ontvangen voor ${categoryInfo.apiCategory}`,
      );
    }

    // Zet ieder API-product om naar onze eigen productstructuur.

    return data.products.map((product) => {
      return mapApiProduct(product, categoryInfo);
    });
  }

  // ==========================================================
  // 7. PRODUCTEN SAMENVOEGEN
  // ==========================================================

  // Onze webshop gebruikt één object:
  //
  // window.PRODUCTS
  //
  // We voegen daar eerst de lokale producten aan toe
  // en daarna de nieuwe API-producten.

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

      // Zoek eerst of er al een foutmelding bestaat.

      let message = document.getElementById("product-api-error");

      // Maak alleen een nieuwe melding als deze nog niet bestaat.

      if (!message) {
        message = document.createElement("p");

        message.id = "product-api-error";

        message.setAttribute("role", "alert");

        message.className = "product-api-error";

        target.before(message);
      }

      // De gebruiker krijgt een begrijpelijke melding.

      message.textContent =
        "De externe producten konden niet worden opgehaald. " +
        "Controleer je internetverbinding. " +
        "De bestaande producten blijven beschikbaar.";

      // Technische details blijven beschikbaar voor ontwikkelaars.

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

  // We laden de andere bestanden pas nadat de productgegevens
  // zijn opgehaald en verwerkt.
  //
  // De volgorde uit data-then blijft behouden.

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
    // Dit kan tegelijk met de externe API-verzoeken.

    const localDataPromise = loadLocalData();

    try {
      // --------------------------------------------------------
      // 11A. VIER API-CATEGORIEËN OPHALEN
      // --------------------------------------------------------

      // Promise.all() wacht tot alle categorieën zijn opgehaald.
      //
      // Iedere categorie levert maximaal vier producten.

      const categoryResults = await Promise.all(
        API_CATEGORIES.map((categoryInfo) => {
          return fetchCategoryProducts(categoryInfo);
        }),
      );

      // --------------------------------------------------------
      // 11B. ALLE API-PRODUCTEN SAMENVOEGEN
      // --------------------------------------------------------

      // flat() maakt van de vier productlijsten één array.

      const apiProducts = categoryResults.flat();

      // De schoolopdracht vraagt minimaal acht producten.
      //
      // Controleer daarom of er genoeg producten zijn ontvangen.

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

      // Wanneer de externe API niet werkt,
      // blijven onze bestaande lokale producten beschikbaar.

      const localData = await localDataPromise;

      window.PRODUCTS = combineProducts(localData.products, []);

      window.FLASH_SALE = localData.flashSale || {};

      // Toon een duidelijke melding aan de gebruiker.

      showError(error);
    } finally {
      // --------------------------------------------------------
      // 11F. ANDERE SCRIPTS STARTEN
      // --------------------------------------------------------

      // Ook bij een API-fout laden we de overige scripts.
      //
      // Hierdoor blijft de webshop zo veel mogelijk werken.

      loadScripts();
    }
  }

  // Start de volledige productverwerking.

  initializeProducts();
})();
