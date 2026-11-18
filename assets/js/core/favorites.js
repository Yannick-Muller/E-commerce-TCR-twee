"use strict";

// ==================================================
// 1. FAVORIETEN VOORBEREIDEN
// ==================================================

// const = waarde die niet opnieuw wordt toegewezen.
// Hier bewaren we de naam waaronder favorieten worden opgeslagen.
const FAVORITES_KEY = "favorites";

// let = variabele waarvan de waarde kan veranderen.
let savedFavorites = [];

// ==================================================
// 2. FAVORIETEN UIT DE BROWSER OPHALEN
// ==================================================

// localStorage bewaart gegevens in de browser.
// JSON.parse zet opgeslagen JSON-tekst om naar JavaScript.
try {
  const storedData = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

  // Controleer of de opgeslagen gegevens een array zijn.
  if (Array.isArray(storedData)) {
    // filter() houdt alleen geldige product-ID's als tekst over.
    savedFavorites = storedData.filter((id) => {
      return typeof id === "string";
    });
  }
} catch (error) {
  // catch() vangt fouten op, zodat het script niet stopt.
  console.warn("Favorieten konden niet geladen worden:", error);
}

// Set = verzameling waarin ieder product-ID maar één keer voorkomt.
const favorites = new Set(savedFavorites);

// ==================================================
// 3. PRODUCTKAARTEN OPHALEN
// ==================================================

// querySelectorAll() zoekt alle productkaarten in de HTML.
const favoriteCards = document.querySelectorAll(
  ".product-card[data-product-id]",
);

// forEach() voert de code uit voor iedere productkaart.
favoriteCards.forEach((card) => {
  // Zoek de favorietenknop binnen de huidige productkaart.
  let button = card.querySelector(".favorite-button");

  // Bestaat de knop nog niet? Maak deze dan zelf aan.
  if (!button) {
    // Zoek het gedeelte waarin de productafbeelding staat.
    const imageWrapper = card.querySelector(
      ".product-image, .product-card__image-wrapper",
    );

    // return stopt deze uitvoering als de afbeelding ontbreekt.
    if (!imageWrapper) return;

    // Maak een nieuwe HTML-knop aan.
    button = document.createElement("button");
    button.className = "favorite-button";
    button.type = "button";

    // Plaats de knop bij de productafbeelding.
    imageWrapper.appendChild(button);
  }

  // ==================================================
  // 4. KLIKKEN OP DE FAVORIETENKNOP
  // ==================================================

  // addEventListener() reageert op een klik van de gebruiker.
  button.addEventListener("click", () => {
    // dataset.productId haalt het product-ID uit de HTML.
    const productId = card.dataset.productId;

    // has() controleert of het product al favoriet is.
    if (favorites.has(productId)) {
      // delete() verwijdert het product uit de favorieten.
      favorites.delete(productId);
    } else {
      // add() voegt het product toe aan de favorieten.
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
      // Toon een waarschuwing als opslaan niet lukt.
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }

    // Werk de hartjes en de weergave direct bij.
    updateFavoritesDisplay();
  });
});

// ==================================================
// 6. FAVORIETEN WEERGEVEN
// ==================================================

function updateFavoritesDisplay() {
  // Loop door alle productkaarten.
  favoriteCards.forEach((card) => {
    const productId = card.dataset.productId;

    // Controleer of dit product in de favorieten staat.
    const isFavorite = favorites.has(productId);

    // Zoek de favorietenknop.
    const button = card.querySelector(".favorite-button");

    // Stop als er geen knop bestaat.
    if (!button) return;

    // Haal de productnaam uit de HTML.
    // Als deze ontbreekt, gebruiken we "Product".
    const productName =
      card.dataset.name ||
      card.querySelector("h3")?.textContent.trim() ||
      "Product";

    // toggle() voegt een CSS-class toe of verwijdert deze.
    card.classList.toggle("is-favorite", isFavorite);
    button.classList.toggle("active", isFavorite);

    // Toon een gevuld of leeg hartje.
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

// Toon direct de juiste favorieten bij het laden.
updateFavoritesDisplay();

// ==================================================
// 7. FAVORIETEN OPNIEUW INLADEN
// ==================================================

function reloadFavoritesFromStorage() {
  try {
    // Haal de nieuwste favorieten uit localStorage.
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");

    // clear() verwijdert eerst alle oude favorieten uit de Set.
    favorites.clear();

    // Controleer of de gegevens een array zijn.
    if (Array.isArray(stored)) {
      // Voeg alleen geldige product-ID's opnieuw toe.
      stored.forEach((id) => {
        if (typeof id === "string") {
          favorites.add(id);
        }
      });
    }
  } catch (error) {
    console.warn("Favorieten konden niet geladen worden:", error);
  }

  // Werk de zichtbare favorieten bij.
  updateFavoritesDisplay();
}

// ==================================================
// 8. AUTOMATISCH SYNCHRONISEREN
// ==================================================

// pageshow wordt uitgevoerd wanneer de pagina wordt getoond.
// Zo worden favorieten opnieuw ingeladen.
window.addEventListener("pageshow", reloadFavoritesFromStorage);

// storage reageert op wijzigingen in localStorage
// vanuit een ander browsertabblad.
window.addEventListener("storage", (event) => {
  // Controleer of de favorieten zijn gewijzigd.
  if (event.key === FAVORITES_KEY || event.key === null) {
    // Laad de nieuwste gegevens opnieuw.
    reloadFavoritesFromStorage();
  }
});
