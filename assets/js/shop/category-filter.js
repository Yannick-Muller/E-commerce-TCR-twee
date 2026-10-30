"use strict";

// ============================================================
// CATEGORIEFILTER (pages/categories.html)
//
// - Haalt de categorieën uit window.PRODUCTS (products.json):
//   category (bijv. "schoenen") en categoryLabel (bijv. "Schoenen").
// - Bouwt knoppen in #category-filter, met een knop "Alle producten" als reset.
// - Het eigenlijke tonen/verbergen gebeurt in searchbar.js, zodat zoeken
//   en filteren samenwerken. Hier sturen we alleen het event "categorychange".
//
// Laden NA shop-products.js en searchbar.js (zie data-then in categories.html).
// ============================================================

(function () {
  const list = document.querySelector("#category-filter");
  const filterCount = document.querySelector("#filter-count");
  const products = Object.values(window.PRODUCTS || {});

  if (!list || products.length === 0) return;

  // Unieke categorieën met label en aantal producten.
  const categories = new Map();

  products.forEach((product) => {
    if (!product.category) return;

    if (!categories.has(product.category)) {
      categories.set(product.category, {
        label: product.categoryLabel || product.category,
        count: 0,
      });
    }

    categories.get(product.category).count += 1;
  });

  const buttons = []; // [{ button, category }]

  function createButton(category, text) {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => select(category));

    item.appendChild(button);
    list.appendChild(item);
    buttons.push({ button, category });
  }

  // Reset-knop + één knop per categorie.
  createButton(null, "Alle producten");
  categories.forEach((info, category) => {
    createButton(category, `${info.label} (${info.count})`);
  });

  let active = null;

  function select(category) {
    // Nogmaals op dezelfde categorie klikken zet het filter uit.
    active = category === active ? null : category;

    buttons.forEach(({ button, category: buttonCategory }) => {
      button.setAttribute("aria-pressed", String(buttonCategory === active));
    });

    if (filterCount) filterCount.textContent = active ? "1" : "0";

    window.dispatchEvent(
      new CustomEvent("categorychange", { detail: { category: active } }),
    );
  }

  // Beginstand: "Alle producten" is geselecteerd.
  buttons[0].button.setAttribute("aria-pressed", "true");

  // "Alle producten" markeren als er niets gekozen is.
  window.addEventListener("categorychange", () => {
    buttons[0].button.setAttribute("aria-pressed", String(active === null));
  });
})();
