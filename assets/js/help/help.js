"use strict";

// ============================================================
// HELPPAGINA (pages/help.html)
// - Zoekt in de veelgestelde vragen terwijl je typt.
// - Laat de teller in de navigatie zien (zoals op de andere pagina's).
// - Vult het aantal dagen van de winkelwagen in (uit cart-expiry.js).
// - Opent de vraag uit de URL, bijvoorbeeld help.html#flash-sale.
//
// Wordt met defer geladen, dus de pagina is al opgebouwd.
// ============================================================

(function () {
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

  // ----------------------------------------------------------
  // Aantal dagen dat een product in de winkelwagen blijft staan
  // ----------------------------------------------------------

  if (window.CartExpiry) {
    document.querySelectorAll("[data-cart-days]").forEach((el) => {
      el.textContent = String(window.CartExpiry.maxDays);
    });
  }

  // ----------------------------------------------------------
  // Zoeken in de vragen
  // ----------------------------------------------------------

  const input = document.getElementById("search-input");
  const items = [...document.querySelectorAll(".faq-item")];
  const groups = [...document.querySelectorAll(".faq-group")];
  const empty = document.getElementById("faq-empty");

  function applyFilter() {
    const query = (input ? input.value : "").toLowerCase().trim();
    let visible = 0;

    items.forEach((item) => {
      const matches = query === "" || item.textContent.toLowerCase().includes(query);

      item.hidden = !matches;

      // Zoeken klapt de treffers open, leegmaken klapt alles weer dicht.
      item.open = query !== "" && matches;

      if (matches) visible++;
    });

    // Een kopje zonder zichtbare vragen verdwijnt ook.
    groups.forEach((group) => {
      group.hidden = !group.querySelector(".faq-item:not([hidden])");
    });

    if (empty) empty.hidden = visible > 0;
  }

  if (input) input.addEventListener("input", applyFilter);

  // ----------------------------------------------------------
  // Vraag openen via de URL
  // ----------------------------------------------------------

  let wanted = null;

  try {
    wanted = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch (error) {
    // Een kapotte URL (bijv. %E0%A4%A) mag de pagina niet storen.
  }

  if (wanted && wanted.tagName === "DETAILS") {
    wanted.open = true;
    wanted.scrollIntoView();
  }
})();
