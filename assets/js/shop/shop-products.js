"use strict";

// ============================================================
// PRODUCTKAARTEN VOOR DE SHOPPAGINA
//
// De productgegevens komen uit window.PRODUCTS.
//
// Dit bestand maakt alle productkaarten voor categories.html.
//
// De categorieën komen uit de API en products.json.
//
// De volgende bestanden worden daarna geladen:
// searchbar.js
// category-filter.js
// favorites.js
// ============================================================

(function () {
  // Zoek de productcontainer.

  const container = document.querySelector("#products");

  // Haal alle productgegevens op.

  const products = window.PRODUCTS || {};

  // Flash sale-functionaliteit.

  const Sale = window.Sale;

  // ==========================================================
  // 1. AFBEELDINGSPAD BEPALEN
  // ==========================================================

  // Productafbeeldingen kunnen lokaal of extern zijn.
  //
  // Lokale afbeeldingen hebben soms ../ nodig omdat
  // categories.html in de map pages staat.
  //
  // Externe API-afbeeldingen hebben al een volledige URL.

  const prefix = window.location.pathname.includes("/pages/") ? "../" : "";

  function resolveImage(imagePath) {
    if (!imagePath) return "";

    if (
      /^(https?:)?\/\//i.test(imagePath) ||
      imagePath.startsWith("/") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    return prefix + imagePath;
  }

  // ==========================================================
  // 2. PRIJZEN OPMAKEN
  // ==========================================================

  // 69.99 wordt € 69,99.

  const euro = (price) => {
    return "€ " + Number(price).toFixed(2).replace(".", ",");
  };

  // De huidige prijs ophalen.

  const priceNow = (product) => {
    return Sale ? Sale.getPrice(product) : product.price;
  };

  // Controleren of een product korting heeft.

  const onSale = (product) => {
    return Sale ? Sale.isOnSale(product) : false;
  };

  // Bijhouden welke kaarten we hebben aangemaakt.

  const built = [];

  // ==========================================================
  // 3. PRIJS EN KORTING WEERGEVEN
  // ==========================================================

  function renderPrice(card, product) {
    // Zoek de afbeeldingcontainer.
    const wrapper = card.querySelector(".product-card__image-wrapper");

    // Zoek het element waarin de prijs komt.
    const priceEl = card.querySelector(".product-card__price");

    // Controleer of het product korting heeft.
    const discounted = onSale(product);

    // Verwijder eventuele oude kortingslabels.

    wrapper.querySelectorAll(".sale-badge").forEach((badge) => badge.remove());

    // Toon de actuele prijs.

    priceEl.textContent = euro(priceNow(product));

    priceEl.classList.toggle("is-sale", discounted);

    // Wanneer het product korting heeft,
    // tonen we ook de oorspronkelijke prijs.

    if (discounted) {
      // Oude prijs maken.

      const old = document.createElement("s");

      old.className = "price-old";

      old.textContent = euro(product.price);

      priceEl.appendChild(old);

      // Kortingspercentage tonen.

      const badge = document.createElement("span");

      badge.className = "sale-badge";

      badge.textContent = `-${Sale.discountPercent(product)}%`;

      wrapper.appendChild(badge);
    }
  }

  // ==========================================================
  // 4. PRODUCTKAART AANMAKEN
  // ==========================================================

  function createCard(id, product) {
    // Maak de link naar de productdetailpagina.
    //
    // De product-ID wordt in de URL geplaatst.

    const url = `${prefix}product.html?id=${encodeURIComponent(id)}`;

    // Nieuwe productkaart maken.

    const card = document.createElement("article");

    card.className = "product-card";

    // Unieke product-ID bewaren.

    card.dataset.productId = id;

    // Productnaam bewaren.

    card.dataset.name = product.name;

    // Categorie bewaren voor het filter.

    card.dataset.category = product.category;

    // ========================================================
    // 4A. AFBEELDINGCONTAINER MAKEN
    // ========================================================

    const wrapper = document.createElement("div");

    wrapper.className = "product-card__image-wrapper";

    // De productafbeelding krijgt een link.

    const imageLink = document.createElement("a");

    imageLink.href = url;

    imageLink.setAttribute("aria-label", `Bekijk ${product.name}`);

    const img = document.createElement("img");

    // Gebruik de eerste beschikbare afbeelding.
    // Zowel absolute API-URLs als lokale bestanden werken.

    const imagePath = (product.images || [])[0] || "";

    img.src = resolveImage(imagePath);

    img.alt = product.name;

    imageLink.appendChild(img);

    wrapper.appendChild(imageLink);

    // ========================================================
    // 4B. PRODUCTTITEL MAKEN
    // ========================================================

    const title = document.createElement("h3");

    const titleLink = document.createElement("a");

    titleLink.href = url;

    titleLink.textContent = product.name;

    title.appendChild(titleLink);

    // ========================================================
    // 4C. BESCHRIJVING MAKEN
    // ========================================================

    const description = document.createElement("p");

    description.className = "product-card__description";

    // De API geeft description als tekst.
    // Onze webshop gebruikt een array.
    //
    // join(" ") voegt alle delen samen tot één tekst.

    description.textContent =
      (product.description || []).join(" ") || product.summary || "";

    // ========================================================
    // 4D. PRIJS EN VOORRAAD MAKEN
    // ========================================================

    const footer = document.createElement("div");

    footer.className = "product-card__footer";

    // Element waarin de prijs verschijnt.

    const price = document.createElement("span");

    price.className = "product-card__price";

    footer.appendChild(price);

    // Wanneer er een voorraadwaarde bestaat,
    // tonen we die onder de prijs.

    if (typeof product.stock === "number") {
      const stock = document.createElement("p");

      const label = document.createElement("span");

      label.textContent = "Voorraad:";

      stock.append(label, ` ${product.stock}`);

      footer.appendChild(stock);
    }

    // ========================================================
    // 4E. DE VOLLEDIGE PRODUCTKAART SAMENVOEGEN
    // ========================================================

    card.append(wrapper, title, description, footer);

    // Voeg de prijs toe.

    renderPrice(card, product);

    // Geef de volledig gemaakte kaart terug.

    return card;
  }

  // ==========================================================
  // 5. ALLE PRODUCTEN OP DE SHOPPAGINA TONEN
  // ==========================================================

  if (container && Object.keys(products).length > 0) {
    // Verwijder eventuele oude inhoud.

    container.textContent = "";

    // Object.entries() geeft een lijst van:
    // [product-ID, productobject]
    //
    // We maken voor iedere entry een productkaart.

    Object.entries(products).forEach(([id, product]) => {
      const card = createCard(id, product);

      // Plaats de kaart op de pagina.

      container.appendChild(card);

      // Bewaar de kaart voor de flashsale.

      built.push({
        card,
        product,
      });
    });
  }

  // ==========================================================
  // 6. FLASHSALE BIJWERKEN
  // ==========================================================

  window.addEventListener("flashsale:ended", () => {
    built.forEach(({ card, product }) => {
      renderPrice(card, product);
    });
  });

  // ==========================================================
  // 7. WINKELWAGENTELLER TONEN
  // ==========================================================

  function showCartCount() {
    // Zoek de teller in de navigatie.

    const el = document.getElementById("cart-count");

    if (!el) return;

    try {
      // Haal de winkelwagen op uit LocalStorage.

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Toon het aantal winkelwagenproducten.

      el.textContent = Array.isArray(cart) ? cart.length : 0;
    } catch (error) {
      // Als de gegevens niet goed gelezen kunnen worden,
      // tonen we nul.

      el.textContent = "0";
    }
  }

  // Toon de teller wanneer de pagina opent.

  showCartCount();

  // Werk de teller bij wanneer iemand terugkomt.

  window.addEventListener("pageshow", showCartCount);

  // Werk de teller bij wanneer een ander tabblad
  // de winkelwagen verandert.

  window.addEventListener("storage", showCartCount);

  // ==========================================================
  // EINDE SHOP-PRODUCTS.JS
  // ==========================================================
})();
