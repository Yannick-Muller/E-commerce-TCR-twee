"use strict";

// ============================================================
// PRODUCTKAARTEN VOOR DE HOMEPAGE
//
// Gebruikt window.PRODUCTS.
//
// De producten worden eerst opgehaald door products-loader.js.
//
// Daarna maakt dit bestand automatisch de HTML-productkaarten.
//
// De zoekfunctie en winkelwagen worden pas daarna geladen.
// ============================================================

(function () {
  // Het gedeelte waarin alle productkaarten komen.

  const container = document.querySelector("#products");

  // Alle lokale en externe producten uit products-loader.js.

  const products = window.PRODUCTS || {};

  // Flash sale-functionaliteit.

  const Sale = window.Sale;

  // Controleer of de productcontainer bestaat
  // en of er producten beschikbaar zijn.

  if (!container || Object.keys(products).length === 0) {
    return;
  }

  // ==========================================================
  // 1. AFBEELDINGSPAD BEPALEN
  // ==========================================================

  // Lokale afbeeldingen staan relatief in onze projectmap.
  //
  // Externe API-afbeeldingen beginnen met https://.
  //
  // De externe URL mag niet worden gecombineerd
  // met het relatieve pad van de webshop.

  const prefix = window.location.pathname.includes("/pages/") ? "../" : "";

  function resolveImage(imagePath) {
    if (!imagePath) return "";

    // Controleer of het een volledig internetadres is,
    // een root-pad of een data-URL.

    if (
      /^(https?:)?\/\//i.test(imagePath) ||
      imagePath.startsWith("/") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    // Anders gebruiken we het bestaande relatieve pad.
    return prefix + imagePath;
  }

  // ==========================================================
  // 2. PRIJZEN OPMAKEN
  // ==========================================================

  // Zet bijvoorbeeld 69.99 om naar € 69,99.

  const formatPrice = (price) => {
    return "€ " + Number(price).toFixed(2).replace(".", ",");
  };

  // Sale bepaalt de huidige prijs wanneer die actief is.

  const priceNow = (product) => {
    return Sale ? Sale.getPrice(product) : product.price;
  };

  // Controleer of een product in de aanbieding is.

  const onSale = (product) => {
    return Sale ? Sale.isOnSale(product) : false;
  };

  // ==========================================================
  // 3. GEMAAKTE PRODUCTKAARTEN BIJHOUDEN
  // ==========================================================

  // Deze lijst gebruiken we om de prijzen bij te werken
  // wanneer een flashsale afgelopen is.

  const built = [];

  // ==========================================================
  // 4. PRIJS VAN EEN PRODUCTKAART WEERGEVEN
  // ==========================================================

  function renderPrice(card, product) {
    // Zoek de afbeeldingcontainer.
    const imageBox = card.querySelector(".product-image");

    // Zoek het gedeelte voor de prijs.
    const row = card.querySelector(".price-row");

    // Verwijder oude prijsgegevens.
    row.textContent = "";

    // Verwijder bestaande kortingslabels.
    imageBox.querySelectorAll(".sale-badge").forEach((badge) => badge.remove());

    // Controleer of het product korting heeft.
    const discounted = onSale(product);

    // Wanneer het product korting heeft,
    // tonen we de oude prijs.

    if (discounted) {
      const oldPrice = document.createElement("p");

      oldPrice.className = "product-price-old";

      oldPrice.textContent = formatPrice(product.price);

      row.appendChild(oldPrice);

      // Maak een kortingslabel.

      const badge = document.createElement("span");

      badge.className = "sale-badge";

      badge.textContent = `-${Sale.discountPercent(product)}%`;

      imageBox.appendChild(badge);
    }

    // De productprijs krijgt altijd de class product-price.
    //
    // script.js gebruikt deze tekst om de winkelwagenprijs
    // om te zetten naar een getal.

    const price = document.createElement("p");

    price.className = "product-price" + (discounted ? " is-sale" : "");

    price.textContent = formatPrice(priceNow(product));

    row.appendChild(price);
  }

  // ==========================================================
  // 5. OUDE PRODUCTKAARTEN VERWIJDEREN
  // ==========================================================

  // We bouwen de kaarten opnieuw op vanuit window.PRODUCTS.

  container.textContent = "";

  // ==========================================================
  // 6. POPULAIRE PRODUCTEN SELECTEREN
  // ==========================================================

  // Object.entries() zet een productobject om naar
  // een lijst met [id, product]-paren.
  //
  // filter() houdt producten met popular: true over.
  //
  // De API-producten krijgen in products-loader.js
  // ook popular: true.

  const all = Object.entries(products);

  const popular = all.filter(([, product]) => {
    return product.popular;
  });

  // Als er populaire producten zijn, tonen we deze.
  // Anders tonen we alle producten.

  const shown = popular.length ? popular : all;

  // ==========================================================
  // 7. PRODUCTKAARTEN AANMAKEN
  // ==========================================================

  shown.forEach(([id, product]) => {
    // Maak een artikel voor het product.

    const card = document.createElement("article");

    card.className = "product-card";

    // Bewaar de unieke product-ID.
    //
    // Deze ID wordt ook gebruikt door favorites.js.

    card.dataset.productId = id;

    // Productnaam bewaren voor de zoekfunctie.

    card.dataset.name = product.name;

    // Categorie bewaren voor het categoriefilter.

    card.dataset.category = product.category;

    // ========================================================
    // 7A. AFBEELDING MAKEN
    // ========================================================

    const imageBox = document.createElement("div");

    imageBox.className = "product-image";

    const img = document.createElement("img");

    // Gebruik de eerste beschikbare afbeelding.
    // resolveImage ondersteunt lokale en externe afbeeldingen.

    const imagePath = (product.images || [])[0] || "";

    img.src = resolveImage(imagePath);

    img.alt = product.name;

    imageBox.appendChild(img);

    // ========================================================
    // 7B. FAVORIETENKNOP MAKEN
    // ========================================================

    // favorites.js herkent deze class.
    // Daardoor blijft de bestaande favorietenfunctie werken.

    const favorite = document.createElement("button");

    favorite.type = "button";

    favorite.className = "favorite-button";

    favorite.textContent = "♡";

    favorite.setAttribute(
      "aria-label",
      `Voeg ${product.name} toe aan favorieten`,
    );

    favorite.setAttribute("aria-pressed", "false");

    imageBox.appendChild(favorite);

    // ========================================================
    // 7C. PRODUCTNAAM MAKEN
    // ========================================================

    const name = document.createElement("h3");

    name.className = "product-name";

    name.textContent = product.name;

    // ========================================================
    // 7D. PRIJSCONTAINER MAKEN
    // ========================================================

    const priceRow = document.createElement("div");

    priceRow.className = "price-row";

    // ========================================================
    // 7E. WINKELWAGENKNOP MAKEN
    // ========================================================

    const cartButton = document.createElement("button");

    cartButton.className = "cart-button";

    cartButton.textContent = "In winkelwagen";

    // ========================================================
    // 7F. ALLES SAMENVOEGEN
    // ========================================================

    card.append(imageBox, name, priceRow, cartButton);

    // Plaats de volledige kaart op de website.

    container.appendChild(card);

    // Vul de prijs in.

    renderPrice(card, product);

    // Bewaar de kaart en het product.
    // Dit is nodig wanneer de flashsale eindigt.

    built.push({
      card,
      product,
    });
  });

  // ==========================================================
  // 8. FLASHSALE BIJWERKEN
  // ==========================================================

  // Wanneer de flashsale eindigt, worden de prijzen
  // opnieuw berekend.

  window.addEventListener("flashsale:ended", () => {
    built.forEach(({ card, product }) => {
      renderPrice(card, product);
    });
  });

  // ==========================================================
  // EINDE HOMEPRODUCTS.JS
  // ==========================================================
})();
