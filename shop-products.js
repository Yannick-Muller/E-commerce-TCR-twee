"use strict";

// ============================================================
// SHOPPAGINA (pages/categories.html)
// - Maakt afbeelding en naam klikbaar naar ../product.html?id=...
// - Zet prijzen uit products.js (met flash sale) in de kaarten
// - Werkt de teller "Cart (n)" in de navigatie bij
//
// Laden NA products.js en sale.js, en VOOR searchbar.js en favorites.js.
// ============================================================

(function () {
  const products = window.PRODUCTS || {};
  const Sale = window.Sale;

  const euro = (n) => "€ " + Number(n).toFixed(2).replace(".", ",");
  const priceNow = (product) => (Sale ? Sale.getPrice(product) : product.price);
  const onSale = (product) => (Sale ? Sale.isOnSale(product) : false);

  const built = []; // [{ card, product }]

  // ----------------------------------------------------------
  // Links naar de productpagina
  // ----------------------------------------------------------

  function addLinks(card, id, product) {
    const url = `../product.html?id=${encodeURIComponent(id)}`;

    const wrapper = card.querySelector(".product-card__image-wrapper");
    const img = wrapper && wrapper.querySelector("img");

    if (img && !img.closest("a")) {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("aria-label", `Bekijk ${product.name}`);
      img.replaceWith(link);
      link.appendChild(img);
    }

    const title = card.querySelector("h3");

    if (title && !title.querySelector("a")) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = title.textContent;
      title.textContent = "";
      title.appendChild(link);
    }
  }

  // ----------------------------------------------------------
  // Prijs, oude prijs en kortingslabel
  // ----------------------------------------------------------

  function renderPrice(card, product) {
    const wrapper = card.querySelector(".product-card__image-wrapper");
    const priceEl = card.querySelector(".product-card__price");
    const discounted = onSale(product);

    if (wrapper) {
      wrapper.querySelectorAll(".sale-badge").forEach((badge) => badge.remove());
    }

    if (priceEl) {
      priceEl.textContent = euro(priceNow(product));
      priceEl.classList.toggle("is-sale", discounted);

      if (discounted) {
        const old = document.createElement("s");
        old.className = "price-old";
        old.textContent = euro(product.price);
        priceEl.appendChild(old);
      }
    }

    if (discounted && wrapper) {
      const badge = document.createElement("span");
      badge.className = "sale-badge";
      badge.textContent = `-${Sale.discountPercent(product)}%`;
      wrapper.appendChild(badge);
    }
  }

  document.querySelectorAll(".product-card[data-product-id]").forEach((card) => {
    const id = card.dataset.productId;
    const product = products[id];

    // Onbekend product (staat niet in products.js): kaart blijft zoals hij is.
    if (!product) {
      console.warn(`Product "${id}" staat niet in products.js.`);
      return;
    }

    card.dataset.name = product.name;
    card.dataset.category = product.category;

    addLinks(card, id, product);
    renderPrice(card, product);
    built.push({ card, product });
  });

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
