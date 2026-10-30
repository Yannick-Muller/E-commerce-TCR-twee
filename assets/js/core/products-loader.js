"use strict";

// ============================================================
// PRODUCTEN OPHALEN MET fetch()
//
// Haalt products.json op, zet de gegevens klaar als
//   window.PRODUCTS    -> { "id": { ...product } }
//   window.FLASH_SALE  -> { title, endsAt }
// en laadt DAARNA pas de scripts uit data-then (in die volgorde).
//
// Gebruik, bijvoorbeeld op index.html:
//   <script src="assets/js/core/products-loader.js"
//           data-then="assets/js/core/sale.js,assets/js/home/home-products.js,assets/js/home/script.js,assets/js/core/favorites.js"></script>
//
// De paden in data-then zijn relatief aan de pagina, net als een gewone <script src>.
// products.json staat in assets/data/.
// ============================================================

(function () {
  const loader = document.currentScript;
  // products.json staat in assets/data/ (twee mappen omhoog vanaf assets/js/core/).
  const jsonUrl = new URL("../../data/products.json", loader.src).href;

  const scripts = (loader.dataset.then || "")
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean);

  window.PRODUCTS = {};
  window.FLASH_SALE = {};

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  // Laad de andere scripts één voor één, in de opgegeven volgorde.
  function loadScripts() {
    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = new URL(src, document.baseURI).href;
      script.async = false; // behoudt de volgorde
      document.head.appendChild(script);
    });
  }

  function showError() {
    onReady(() => {
      const target = document.getElementById("products");
      if (!target) return;

      const message = document.createElement("p");
      message.setAttribute("role", "alert");
      message.textContent =
        "De producten konden niet geladen worden. Open de website via een server (bijvoorbeeld Live Server).";
      target.textContent = "";
      target.appendChild(message);
    });
  }

  fetch(jsonUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!data || !Array.isArray(data.products)) {
        throw new Error("products.json heeft geen lijst 'products'");
      }

      // Verwerk de lijst tot een object met het id als sleutel.
      data.products.forEach((product) => {
        if (product && product.id) window.PRODUCTS[product.id] = product;
      });

      window.FLASH_SALE = data.flashSale || {};
    })
    .catch((error) => {
      console.error("Producten konden niet geladen worden:", error);
      showError();
    })
    .finally(loadScripts);
})();
