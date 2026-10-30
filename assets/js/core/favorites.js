"use strict";

// ============================================================
// FAVORIETEN
// Werkt op index.html en pages/categories.html.
// ============================================================

// Beide pagina's gebruiken dezelfde opslagnaam.
const FAVORITES_KEY = "favorites";

// ============================================================
// 1. OPGESLAGEN FAVORIETEN OPHALEN
// ============================================================

let savedFavorites = [];

try {
  const storedData = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

  // Controleer of de opgeslagen gegevens een lijst zijn.
  if (Array.isArray(storedData)) {
    savedFavorites = storedData.filter((id) => {
      return typeof id === "string";
    });
  }
} catch (error) {
  console.warn("Favorieten konden niet geladen worden:", error);
}

// Een Set voorkomt dubbele product-ID's.
const favorites = new Set(savedFavorites);

// Selecteer alleen productkaarten met een product-ID.
const favoriteCards = document.querySelectorAll(
  ".product-card[data-product-id]",
);

// ============================================================
// 2. FAVORIETENKNOPPEN INSTELLEN
// ============================================================

favoriteCards.forEach((card) => {
  let button = card.querySelector(".favorite-button");

  // Op de shoppagina zijn nog geen hartjes aanwezig.
  // Daarom maken we een knop als deze ontbreekt.
  if (!button) {
    const imageWrapper = card.querySelector(
      ".product-image, .product-card__image-wrapper",
    );

    if (!imageWrapper) return;

    button = document.createElement("button");

    button.className = "favorite-button";
    button.type = "button";

    imageWrapper.appendChild(button);
  }

  // ==========================================================
  // 3. FAVORIET TOEVOEGEN OF VERWIJDEREN
  // ==========================================================

  button.addEventListener("click", () => {
    const productId = card.dataset.productId;

    if (favorites.has(productId)) {
      // Het product is al favoriet: verwijder het.
      favorites.delete(productId);
    } else {
      // Het product is nog geen favoriet: voeg het toe.
      favorites.add(productId);
    }

    // Na iedere wijziging de volledige lijst opslaan.
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }

    // Werk de hartjes en productranden bij.
    updateFavoritesDisplay();
  });
});

// ============================================================
// 4. FAVORIETEN VISUEEL HERKENBAAR MAKEN
// ============================================================

function updateFavoritesDisplay() {
  favoriteCards.forEach((card) => {
    const productId = card.dataset.productId;

    const isFavorite = favorites.has(productId);

    const button = card.querySelector(".favorite-button");

    if (!button) return;

    const productName =
      card.dataset.name ||
      card.querySelector("h3")?.textContent.trim() ||
      "Product";

    // Een favoriet product krijgt een extra CSS-class.
    card.classList.toggle("is-favorite", isFavorite);

    // De knop krijgt een actieve of niet-actieve toestand.
    button.classList.toggle("active", isFavorite);

    // Toon een gevuld of leeg hartje.
    button.textContent = isFavorite ? "♥" : "♡";

    // Maak de toestand ook herkenbaar voor schermlezers.
    button.setAttribute("aria-pressed", String(isFavorite));

    button.setAttribute(
      "aria-label",
      isFavorite
        ? `${productName} uit favorieten verwijderen`
        : `${productName} aan favorieten toevoegen`,
    );
  });
}

// ============================================================
// 5. OPGESLAGEN FAVORIETEN METEEN TONEN
// ============================================================

// Deze functie wordt ook uitgevoerd na het vernieuwen.
updateFavoritesDisplay();

// ============================================================
// 6. FAVORIETEN OPNIEUW LADEN BIJ TERUGKEREN NAAR DE PAGINA
// ============================================================

// Leest de lijst opnieuw uit localStorage en tekent de hartjes opnieuw.
function reloadFavoritesFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

    favorites.clear();

    if (Array.isArray(stored)) {
      stored.forEach((id) => {
        if (typeof id === "string") favorites.add(id);
      });
    }
  } catch (error) {
    console.warn("Favorieten konden niet geladen worden:", error);
  }

  updateFavoritesDisplay();
}

// Werkt ook als je met de terugknop terugkomt op de pagina.
window.addEventListener("pageshow", reloadFavoritesFromStorage);

// Werkt ook als je de site in een ander tabblad hebt openstaan.
window.addEventListener("storage", (event) => {
  if (event.key === FAVORITES_KEY || event.key === null) {
    reloadFavoritesFromStorage();
  }
});