"use strict";

// ============================================================
// PRODUCTEN OPHALEN UIT EEN EXTERNE API
// ============================================================

// We gebruiken DummyJSON als externe productendatabase.
// De producten worden opgehaald en aangepast aan onze webshopstructuur.
//afkorting IIFE = Immediately Invoked Function Expression
(function () {
  // ==========================================================
  // 1. VOLGENDE JAVASCRIPT-BESTANDEN BEPALEN
  // ==========================================================

  // currentScript haalt het script-element op dat nu wordt uitgevoerd.
  const loader = document.currentScript;

  // URL() maakt het volledige pad naar het lokale products.json-bestand.
  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  // Haal uit de HTML op welke scripts later geladen moeten worden.
  // split() maakt een array, map() verwijdert spaties en filter() lege waarden.
  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  // ==========================================================
  // 2. GEGEVENS VOORBEREIDEN
  // ==========================================================

  // window maakt gegevens beschikbaar voor andere JavaScript-bestanden.
  window.PRODUCTS = {};
  window.FLASH_SALE = {};

  // const = vaste waarde. Per categorie halen we maximaal vier producten op.
  const API_LIMIT = 4;

  // ==========================================================
  // 3. API-CATEGORIEËN INSTELLEN
  // ==========================================================

  // Koppelt de categorienamen van de API aan onze eigen webshopcategorieën.
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

  // async maakt het mogelijk om op fetch() te wachten met await.
  async function loadLocalData() {
    try {
      // fetch() haalt het lokale JSON-bestand op.
      const response = await fetch(jsonUrl);

      // Controleer of het ophalen gelukt is.
      if (!response.ok) {
        throw new Error(
          `Products.json kon niet worden geladen: HTTP ${response.status}`,
        );
      }

      // Zet de JSON-inhoud om naar JavaScript-gegevens.
      const data = await response.json();

      // Geef producten en flashsale-instellingen terug.
      return {
        products: Array.isArray(data.products) ? data.products : [],
        flashSale: data.flashSale || {},
      };
    } catch (error) {
      // Bij een fout tonen we een waarschuwing en gebruiken we lege gegevens.
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

  // De API gebruikt andere veldnamen dan onze webshop.
  // Deze functie zet een API-product om naar onze eigen structuur.
  function mapApiProduct(apiProduct, categoryInfo) {
    // Number() zet de prijs om naar een getal.
    const price = Number(apiProduct.price);

    // Controleer of de prijs een geldig getal is.
    if (!Number.isFinite(price)) {
      throw new Error(`Ongeldige prijs voor product: ${apiProduct.title}`);
    }

    // Haal het kortingspercentage op.
    const discountPercentage = Number(apiProduct.discountPercentage) || 0;
    // Bereken de kortingsprijs als er korting bestaat.
    const salePrice =
      discountPercentage > 0
        ? Number((price * (1 - discountPercentage / 100)).toFixed(2))
        : undefined;

    // filter() houdt alleen geldige afbeeldings-URL's over.
    const images = Array.isArray(apiProduct.images)
      ? apiProduct.images.filter((image) => {
          return typeof image === "string" && image.length > 0;
        })
      : [];

    // Gebruik de thumbnail als er geen afbeeldingen beschikbaar zijn.
    if (images.length === 0 && typeof apiProduct.thumbnail === "string") {
      images.push(apiProduct.thumbnail);
    }

    // Controleer of de productbeschrijving tekst bevat.
    const description =
      typeof apiProduct.description === "string" ? apiProduct.description : "";

    // return geeft het nieuwe productobject terug aan de webshop.
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

  // Deze functie haalt producten op uit één specifieke categorie.
  async function fetchCategoryProducts(categoryInfo) {
    // Bouw de API-URL op met de categorie en het aantal producten.
    const apiUrl =
      `https://dummyjson.com/products/category/` +
      `${encodeURIComponent(categoryInfo.apiCategory)}` +
      `?limit=${API_LIMIT}`;
    // Stuur het verzoek naar de externe API.
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

  // Verwijdert de foutmelding wanneer alles weer werkt.
  function clearError() {
    const message = document.getElementById("product-api-error");

    if (message) {
      message.remove();
    }
  }

  // ==========================================================
  // 9. CONTROLEREN OF DE HTML KLAAR IS
  // ==========================================================

  // Verbergt het laadbericht zodra het laden klaar is.
  function hideLoading() {
    const loading = document.getElementById("products-loading");

    if (loading) {
      loading.hidden = true;
    }
  }

  // Controleert of de HTML al geladen is.
  function onReady(callback) {
    if (document.readyState === "loading") {
      // DOMContentLoaded wordt uitgevoerd zodra de HTML klaar is.
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      // De HTML is al klaar, dus voer de functie direct uit.
      callback();
    }
  }

  // ==========================================================
  // 10. ANDERE JAVASCRIPT-BESTANDEN LADEN
  // ==========================================================

  // Laadt de overige webshopbestanden nadat de producten verwerkt zijn.
  function loadScripts() {
    // Loop door alle opgegeven scripts.
    scripts.forEach((src) => {
      // Maak een nieuw script-element aan.
      const script = document.createElement("script");

      // Stel het juiste bestandspad in.
      script.src = new URL(src, document.baseURI).href;

      // Voert dynamisch geladen scripts in de opgegeven volgorde uit.
      script.async = false;

      // Plaats het script in de HTML-pagina.
      document.head.appendChild(script);
    });
  }

  // ==========================================================
  // 11. ALLES STARTEN
  // ==========================================================

  // Deze hoofdfunctie regelt het volledige laadproces.
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

      // flat() maakt van meerdere productlijsten één grote array.
      const apiProducts = categoryResults.flat();

      // Controleer of minimaal acht producten zijn ontvangen.
      if (apiProducts.length < 8) {
        throw new Error(
          `Er zijn maar ${apiProducts.length} API-producten ontvangen. Minimaal 8 zijn vereist.`,
        );
      }

      // --------------------------------------------------------
      // 11C. LOKALE PRODUCTEN OPHALEN
      // --------------------------------------------------------

      // await wacht totdat de lokale gegevens beschikbaar zijn.
      const localData = await localDataPromise;

      // --------------------------------------------------------
      // 11D. LOKALE EN API-PRODUCTEN COMBINEREN
      // --------------------------------------------------------

      // Bewaar alle lokale en externe producten in window.PRODUCTS.
      window.PRODUCTS = combineProducts(localData.products, apiProducts);

      // Behoud de bestaande flashsale-instellingen.
      window.FLASH_SALE = localData.flashSale || {};

      // Verwijder een eventuele oude foutmelding.
      clearError();

      // Toon het aantal opgehaalde API-producten in de console.
      console.log(`${apiProducts.length} producten opgehaald uit DummyJSON.`);

      console.log(
        "Totale producten in de webshop:",
        Object.keys(window.PRODUCTS).length,
      );
    } catch (error) {
      // --------------------------------------------------------
      // 11E. FOUT BIJ HET OPHALEN VAN DE API
      // --------------------------------------------------------

      // Als de API niet werkt, behouden we de lokale producten.
      const localData = await localDataPromise;

      window.PRODUCTS = combineProducts(localData.products, []);

      // Behoud ook de flashsale-instellingen.
      window.FLASH_SALE = localData.flashSale || {};

      // Toon een foutmelding aan de gebruiker.
      showError(error);
    } finally {
      // --------------------------------------------------------
      // 11F. ANDERE SCRIPTS STARTEN
      // --------------------------------------------------------

      // Verberg de laadindicator.
      hideLoading();

      // Laad de overige webshopbestanden.
      // Dit gebeurt ook wanneer de API een fout geeft.
      loadScripts();
    }
  }

  // Start het volledige productverwerkingsproces.
  initializeProducts();
})();
