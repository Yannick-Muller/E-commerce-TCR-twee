"use strict";

// ============================================================
// WINKELWAGENTELLER IN DE NAVIGATIE
// Voor pagina's die verder geen eigen winkelwagencode hebben
// (pages/about.html). Leest localStorage "cart", net als de andere pagina's.
// Laad dit bestand met defer, NA cart-expiry.js.
// ============================================================

(function () {
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
