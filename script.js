"use strict";

// ============================================================
// 1. NAVIGATIE
// ============================================================

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// ============================================================
// 2. PRODUCTEN EN ZOEKBALK
// ============================================================

const productCards = document.querySelectorAll(".product-card");
const noResults = document.querySelector("#no-results");
const searchInput = document.querySelector("#search-input");

let activeCategory = null;

// Filter de producten op naam en categorie.
const applyFilters = () => {
  const searchText = (searchInput?.value || "").toLowerCase().trim();

  let visibleProducts = 0;

  productCards.forEach((product) => {
    const name = (product.dataset.name || "").toLowerCase();
    const category = product.dataset.category;

    const matchesSearch = name.includes(searchText);

    const matchesCategory =
      activeCategory === null || category === activeCategory;

    if (matchesSearch && matchesCategory) {
      product.classList.remove("hidden");
      visibleProducts++;
    } else {
      product.classList.add("hidden");
    }
  });

  // Alleen uitvoeren als de melding bestaat.
  if (noResults) {
    noResults.classList.toggle("hidden", visibleProducts > 0);
  }
};

// Zoek terwijl iemand typt.
if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

// ============================================================
// 3. CATEGORIEËN
// ============================================================

const categoryButtons = document.querySelectorAll(".category-card");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    // Dezelfde categorie opnieuw klikken schakelt hem uit.
    activeCategory = activeCategory === category ? null : category;

    categoryButtons.forEach((item) => {
      item.classList.toggle(
        "selected",
        item.dataset.category === activeCategory,
      );
    });

    applyFilters();
  });
});

// ============================================================
// 4. BEKIJK ALLES - CATEGORIEËN
// ============================================================

// Deze knop ontbreekt momenteel in nikans HTML.
// Daarom controleren we eerst of hij bestaat.

const showAllCategories = document.querySelector("#show-all-categories");

if (showAllCategories) {
  showAllCategories.addEventListener("click", () => {
    activeCategory = null;

    if (searchInput) {
      searchInput.value = "";
    }

    categoryButtons.forEach((button) => {
      button.classList.remove("selected");
    });

    applyFilters();
  });
}

// ============================================================
// 5. SHOP PAGINA
// ============================================================

// Relatief pad vanaf index.html.
// De map "pages" moet naast index.html staan.

const openShop = () => {
  window.location.href = "pages/categories.html";
};

// Deze knop ontbreekt ook in de nieuwe HTML.
const showAllProducts = document.querySelector("#show-all-products");

if (showAllProducts) {
  showAllProducts.addEventListener("click", openShop);
}

// Shop nu knop
const shopNowButton = document.querySelector("#shop-now-button");

if (shopNowButton) {
  shopNowButton.addEventListener("click", openShop);
}

// ============================================================
// 6. FAVORIETEN
// ============================================================

const favoriteButtons = document.querySelectorAll(".favorite-button");

favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");

    const isFavorite = button.classList.contains("active");

    button.textContent = isFavorite ? "♥" : "♡";
  });
});

// ============================================================
// 7. WINKELWAGEN OPHALEN
// ============================================================

let cart = [];

// Probeer opgeslagen producten uit de browser te halen.
try {
  const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

  cart = Array.isArray(savedCart) ? savedCart : [];
} catch (error) {
  console.warn("Winkelwagen kon niet geladen worden:", error);
}

// ============================================================
// 8. WINKELWAGENSTATUS TONEN
// ============================================================

const productsSection = document.querySelector("#products");

let cartInfo = document.querySelector("#cart-info");

// Voeg automatisch een teller toe boven de producten.
if (!cartInfo && productsSection) {
  cartInfo = document.createElement("p");
  cartInfo.id = "cart-info";

  productsSection.before(cartInfo);
}

// Selecteer alle winkelwagenknoppen.
const cartButtons = document.querySelectorAll(".cart-button");

// ============================================================
// 9. WINKELWAGEN BIJWERKEN
// ============================================================

const updateCart = () => {
  // Bereken de totaalprijs van alle producten.
  const total = cart.reduce((sum, product) => {
    return sum + product.price;
  }, 0);

  // Laat het aantal en de totaalprijs zien.
  if (cartInfo) {
    cartInfo.textContent =
      `Winkelwagen: ${cart.length} producten | ` +
      `Totaal: €${total.toFixed(2).replace(".", ",")}`;
  }

  // Pas elke winkelwagenknop aan.
  cartButtons.forEach((button) => {
    const card = button.closest(".product-card");

    if (!card) return;

    const name = card.dataset.name;

    const isAdded = cart.some((product) => {
      return product.name === name;
    });

    button.classList.toggle("added", isAdded);

    button.textContent = isAdded ? "Toegevoegd ✓" : "In winkelwagen";
  });
};

// ============================================================
// 10. PRODUCT TOEVOEGEN OF VERWIJDEREN
// ============================================================

cartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Zoek de productkaart bij de aangeklikte knop.
    const card = button.closest(".product-card");

    if (!card) return;

    // Productgegevens ophalen.
    const name = card.dataset.name;
    const category = card.dataset.category;

    const priceText = card.querySelector(".product-price")?.textContent || "";

    // Maak van "€ 69,99" het getal 69.99.
    const price = Number(priceText.replace("€", "").replace(",", ".").trim());

    if (!Number.isFinite(price)) {
      console.error("Ongeldige productprijs:", priceText);
      return;
    }

    const image = card.querySelector(".product-image img")?.src || "";

    // Zoek of het product al in de winkelwagen zit.
    const existingProduct = cart.find((product) => {
      return product.name === name;
    });

    if (existingProduct) {
      // Verwijder het product bij opnieuw klikken.
      cart = cart.filter((product) => {
        return product.name !== name;
      });
    } else {
      // Voeg het product echt toe.
      cart.push({
        name: name,
        category: category,
        price: price,
        image: image,
      });
    }

    // Probeer de winkelwagen te bewaren.
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Winkelwagen kon niet opgeslagen worden:", error);
    }

    // Werk teller en knoppen bij.
    updateCart();

    // Laat zien wat er in de winkelwagen zit.
    console.log("Winkelwagen:", cart);
  });
});

// ============================================================
// 11. PAGINA STARTEN
// ============================================================

applyFilters();
updateCart();

console.log("Webshop JavaScript geladen!");
