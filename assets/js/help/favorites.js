"use strict";

const FAVORITES_KEY = "favorites";

let savedFavorites = [];

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

  button.addEventListener("click", () => {
    const productId = card.dataset.productId;

    if (favorites.has(productId)) {
      favorites.delete(productId);
    } else {
      favorites.add(productId);
    }

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }

    updateFavoritesDisplay();
  });
});

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
    button.setAttribute("aria-pressed", String(isFavorite));

    button.setAttribute(
      "aria-label",
      isFavorite
        ? `${productName} uit favorieten verwijderen`
        : `${productName} aan favorieten toevoegen`,
    );
  });
}

updateFavoritesDisplay();

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

window.addEventListener("pageshow", reloadFavoritesFromStorage);

window.addEventListener("storage", (event) => {
  if (event.key === FAVORITES_KEY || event.key === null) {
    reloadFavoritesFromStorage();
  }
});
