"use strict";

// ============================================================
// SHOPPAGINA (pages/categories.html)
// Bouwt alle productkaarten op uit window.PRODUCTS (products.json).
// De kaarten krijgen dezelfde class-namen als de oude HTML,
// zodat style.css, favorites.css en searchbar.js blijven werken.
//
// Laden NA products-loader.js en sale.js, en VOOR searchbar.js
// en favorites.js (zie data-then in categories.html).
// ============================================================

(function () {
  const container = document.querySelector("#products");
  const products = window.PRODUCTS || {};
  const Sale = window.Sale;

  const euro = (n) => "€ " + Number(n).toFixed(2).replace(".", ",");
  const priceNow = (product) => (Sale ? Sale.getPrice(product) : product.price);
  const onSale = (product) => (Sale ? Sale.isOnSale(product) : false);

  // Deze pagina staat in pages/, dus afbeeldingen en links gaan een map omhoog.
  const prefix = window.location.pathname.includes("/pages/") ? "../" : "";

  const built = []; // [{ card, product }]

  // ----------------------------------------------------------
  // Prijs, oude prijs en kortingslabel
  // ----------------------------------------------------------

  function renderPrice(card, product) {
    const wrapper = card.querySelector(".product-card__image-wrapper");
    const priceEl = card.querySelector(".product-card__price");
    const discounted = onSale(product);

    wrapper.querySelectorAll(".sale-badge").forEach((badge) => badge.remove());

    priceEl.textContent = euro(priceNow(product));
    priceEl.classList.toggle("is-sale", discounted);

    if (discounted) {
      const old = document.createElement("s");
      old.className = "price-old";
      old.textContent = euro(product.price);
      priceEl.appendChild(old);

      const badge = document.createElement("span");
      badge.className = "sale-badge";
      badge.textContent = `-${Sale.discountPercent(product)}%`;
      wrapper.appendChild(badge);
    }
  }

  // ----------------------------------------------------------
  // Eén kaart bouwen
  // ----------------------------------------------------------

  function createCard(id, product) {
    const url = `${prefix}product.html?id=${encodeURIComponent(id)}`;

    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = id;
    card.dataset.name = product.name;
    card.dataset.category = product.category;

    // Afbeelding (klikbaar)
    const wrapper = document.createElement("div");
    wrapper.className = "product-card__image-wrapper";

    const imageLink = document.createElement("a");
    imageLink.href = url;
    imageLink.setAttribute("aria-label", `Bekijk ${product.name}`);

    const img = document.createElement("img");
    img.src = prefix + ((product.images || [])[0] || "");
    img.alt = product.name;

    imageLink.appendChild(img);
    wrapper.appendChild(imageLink);

    // Titel (klikbaar)
    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = url;
    titleLink.textContent = product.name;
    title.appendChild(titleLink);

    // Beschrijving
    const description = document.createElement("p");
    description.className = "product-card__description";
    description.textContent = (product.description || []).join(" ") || product.summary || "";

    // Prijs en voorraad
    const footer = document.createElement("div");
    footer.className = "product-card__footer";

    const price = document.createElement("span");
    price.className = "product-card__price";
    footer.appendChild(price);

    if (typeof product.stock === "number") {
      const stock = document.createElement("p");
      const label = document.createElement("span");
      label.textContent = "Voorraad:";
      stock.append(label, ` ${product.stock}`);
      footer.appendChild(stock);
    }

    card.append(wrapper, title, description, footer);
    renderPrice(card, product);

    return card;
  }

  if (container && Object.keys(products).length > 0) {
    container.textContent = "";

    Object.entries(products).forEach(([id, product]) => {
      const card = createCard(id, product);
      container.appendChild(card);
      built.push({ card, product });
    });
  }

  window.addEventListener("flashsale:ended", () => {
    built.forEach(({ card, product }) => renderPrice(card, product));
  });

  // ----------------------------------------------------------
  // Winkelwagenteller in de navigatie
  // ----------------------------------------------------------

  function showCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      el.textContent = Array.isArray(cart) ? cart.length : 0;
    } catch (error) {
      el.textContent = "0";
    }
  }

  showCartCount();
  window.addEventListener("pageshow", showCartCount);
  window.addEventListener("storage", showCartCount);
})();
