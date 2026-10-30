"use strict";

// ============================================================
// ZOEKEN + CATEGORIEFILTER (pages/categories.html)
//
// De kaarten worden door shop-products.js gebouwd, dus we zoeken ze
// bij elke wijziging opnieuw op (niet één keer bij het laden).
//
// Zoeken en filteren werken samen: een kaart is alleen zichtbaar als hij
// bij de zoektekst EN bij de gekozen categorie past.
//
// category-filter.js stuurt het event "categorychange" met
// { detail: { category } } (category is null bij reset).
// ============================================================

(function () {
  const searchInput = document.querySelector(".nav__input input");
  const container = document.querySelector("#products");

  let activeCategory = null;

  // Melding als er niets gevonden is (staat in #products, loopt over alle kolommen).
  let emptyMessage = null;

  function getEmptyMessage() {
    if (!emptyMessage && container) {
      emptyMessage = document.createElement("p");
      emptyMessage.className = "categories__empty";
      emptyMessage.setAttribute("role", "status");
      emptyMessage.textContent = "Geen producten gevonden.";
      emptyMessage.hidden = true;
      container.appendChild(emptyMessage);
    }
    return emptyMessage;
  }

  function applyFilters() {
    const searchValue = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const cards = document.querySelectorAll(".product-card");

    let visible = 0;

    cards.forEach((card) => {
      const matchesSearch = card.textContent.toLowerCase().includes(searchValue);
      const matchesCategory =
        activeCategory === null || card.dataset.category === activeCategory;

      const show = matchesSearch && matchesCategory;
      card.hidden = !show;
      if (show) visible++;
    });

    const message = getEmptyMessage();
    if (message) message.hidden = visible > 0;
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  window.addEventListener("categorychange", (event) => {
    activeCategory = (event.detail && event.detail.category) || null;
    applyFilters();
  });

  applyFilters();
})();
