"use strict";

// ==================================================
// 1. FAVORIETEN VOORBEREIDEN
// ==================================================

const FAVORITES_KEY = "favorites";

let savedFavorites = [];

// ==================================================
// 2. FAVORIETEN UIT DE BROWSER OPHALEN
// ==================================================

try {
  const storedData = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

  if (Array.isArray(storedData)) {
    savedFavorites = storedData.filter((id) => {
      return typeof id === "string";
    });
  }
} catch (error) {
  console.warn("Favorieten konden niet geladen worden:", error);
}

const favorites = new Set(savedFavorites);

// ==================================================
// 3. PRODUCTKAARTEN OPHALEN
// ==================================================

const favoriteCards = document.querySelectorAll(
  ".product-card[data-product-id]",
);

favoriteCards.forEach((card) => {
  let button = card.querySelector(".favorite-button");

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

  // ==================================================
  // 4. KLIKKEN OP DE FAVORIETENKNOP
  // ==================================================

  button.addEventListener("click", () => {
    const productId = card.dataset.productId;

    if (favorites.has(productId)) {
      favorites.delete(productId);
    } else {
      favorites.add(productId);
    }

    // ==================================================
    // 5. FAVORIETEN OPSLAAN
    // ==================================================

    try {
      // JSON.stringify() zet de Set om naar JSON-tekst.
      // localStorage.setItem() bewaart de gegevens in de browser.
      favorites &&
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }

    updateFavoritesDisplay();
  });
});

// ==================================================
// 6. FAVORIETEN WEERGEVEN
// ==================================================

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

    card.classList.toggle("is-favorite", isFavorite);
    button.classList.toggle("active", isFavorite);

    button.textContent = isFavorite ? "♥" : "♡";

    // aria-pressed vertelt hulpsoftware of de knop actief is.
    button.setAttribute("aria-pressed", String(isFavorite));

    // aria-label geeft de knop een duidelijke beschrijving.
    button.setAttribute(
      "aria-label",
      isFavorite
        ? `${productName} uit favorieten verwijderen`
        : `${productName} aan favorieten toevoegen`,
    );
  });
}

updateFavoritesDisplay();

// ==================================================
// 7. FAVORIETEN OPNIEUW INLADEN
// ==================================================

function reloadFavoritesFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

    favorites.clear();

    if (Array.isArray(stored)) {
      stored.forEach((id) => {
        if (typeof id === "string") {
          favorites.add(id);
        }
      });
    }
  } catch (error) {
    console.warn("Favorieten konden niet geladen worden:", error);
  }

  updateFavoritesDisplay();
}

// ==================================================
// 8. AUTOMATISCH SYNCHRONISEREN
// ==================================================

window.addEventListener("pageshow", reloadFavoritesFromStorage);

window.addEventListener("storage", (event) => {
  if (event.key === FAVORITES_KEY || event.key === null) {
    reloadFavoritesFromStorage();
  }
});
