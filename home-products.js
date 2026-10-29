"use strict";

// ============================================================
// PRODUCTKAARTEN INLADEN UIT products.js
// Werkt op index.html en op pages/categories.html.
// Dit bestand moet NA products.js en sale.js, en VOOR script.js
// en favorites.js geladen worden, zodat zoeken, filteren,
// favorieten en winkelwagen de kaarten vinden.
// ============================================================

(function () {
  const container = document.querySelector("#products");
  const products = window.PRODUCTS || {};
  const Sale = window.Sale;

  if (!container) return;

  // Op pages/categories.html staan de afbeeldingen een map hoger.
  const prefix = window.location.pathname.includes("/pages/") ? "../" : "";

  // 69.99 wordt "€ 69,99" (script.js leest dit weer terug als getal).
  const formatPrice = (price) => "€ " + Number(price).toFixed(2).replace(".", ",");

  const priceNow = (product) => (Sale ? Sale.getPrice(product) : product.price);
  const onSale = (product) => (Sale ? Sale.isOnSale(product) : false);

  const built = []; // [{ card, product }]

  // Zet prijs, oude prijs en kortingslabel van één kaart goed.
  function renderPrice(card, product) {
    const imageBox = card.querySelector(".product-image");
    const row = card.querySelector(".price-row");

    row.textContent = "";
    imageBox.querySelectorAll(".sale-badge").forEach((badge) => badge.remove());

    const discounted = onSale(product);

    if (discounted) {
      const oldPrice = document.createElement("p");
      oldPrice.className = "product-price-old";
      oldPrice.textContent = formatPrice(product.price);
      row.appendChild(oldPrice);

      const badge = document.createElement("span");
      badge.className = "sale-badge";
      badge.textContent = `-${Sale.discountPercent(product)}%`;
      imageBox.appendChild(badge);
    }

    // Let op: .product-price bevat alleen de huidige prijs,
    // want script.js leest de winkelwagenprijs uit deze tekst.
    const price = document.createElement("p");
    price.className = "product-price" + (discounted ? " is-sale" : "");
    price.textContent = formatPrice(priceNow(product));
    row.appendChild(price);
  }

  container.textContent = "";

  // Homepage: alleen producten met popular: true (of alles als er geen zijn).
  const all = Object.entries(products);
  const popular = all.filter(([, product]) => product.popular);
  const shown = popular.length ? popular : all;

  shown.forEach(([id, product]) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = id;
    card.dataset.name = product.name;
    card.dataset.category = product.category;

    // Afbeelding + favorietenknop
    const imageBox = document.createElement("div");
    imageBox.className = "product-image";

    const img = document.createElement("img");
    img.src = prefix + ((product.images || [])[0] || "");
    img.alt = product.name;
    imageBox.appendChild(img);

    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "favorite-button";
    favorite.textContent = "♡";
    favorite.setAttribute("aria-label", `Voeg ${product.name} toe aan favorieten`);
    favorite.setAttribute("aria-pressed", "false");
    imageBox.appendChild(favorite);

    // Naam, prijs en winkelwagenknop
    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;

    const priceRow = document.createElement("div");
    priceRow.className = "price-row";

    const cartButton = document.createElement("button");
    cartButton.className = "cart-button";
    cartButton.textContent = "In winkelwagen";

    card.append(imageBox, name, priceRow, cartButton);
    container.appendChild(card);

    renderPrice(card, product);
    built.push({ card, product });
  });

  // Als de sale afloopt, gaan de kaarten terug naar de normale prijs.
  window.addEventListener("flashsale:ended", () => {
    built.forEach(({ card, product }) => renderPrice(card, product));
  });
})();
