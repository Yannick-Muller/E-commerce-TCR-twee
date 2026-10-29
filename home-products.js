"use strict";

// ============================================================
// PRODUCTKAARTEN INLADEN UIT products.js
// Werkt op index.html en op pages/categories.html.
// Dit bestand moet VOOR script.js en favorites.js geladen worden,
// zodat zoeken, filteren, favorieten en winkelwagen de kaarten vinden.
// ============================================================

(function () {
  const container = document.querySelector("#products");
  const products = window.PRODUCTS || {};

  if (!container) return;

  // Op pages/categories.html staan de afbeeldingen een map hoger.
  const prefix = window.location.pathname.includes("/pages/") ? "../" : "";

  // 69.99 wordt "€ 69,99" (script.js leest dit weer terug als getal).
  const formatPrice = (price) => "€ " + Number(price).toFixed(2).replace(".", ",");

  container.textContent = "";

  Object.entries(products).forEach(([id, product]) => {
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

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const cartButton = document.createElement("button");
    cartButton.className = "cart-button";
    cartButton.textContent = "In winkelwagen";

    card.append(imageBox, name, price, cartButton);
    container.appendChild(card);
  });
})();
