// ============================================================
// WEBSHOP - SCRIPT.JS
// ============================================================

// ============================================================
// 1. NAVIGATIE
// ============================================================

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((navLink) => {
      navLink.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// ============================================================
// 2. PRODUCTEN SELECTEREN
// ============================================================

const productCards = document.querySelectorAll(".product-card");

const noResults = document.querySelector("#no-results");

// ============================================================
// 3. ZOEKBALK
// ============================================================

const searchInput = document.querySelector("#search-input");

let activeCategory = null;

// ============================================================
// 4. FUNCTIE: applyFilters()
// ============================================================

const applyFilters = () => {
  const searchText = searchInput.value.toLowerCase().trim();

  let visibleProducts = 0;

  productCards.forEach((product) => {
    const productName = product.dataset.name.toLowerCase();

    const productCategory = product.dataset.category;

    const matchesSearch = productName.includes(searchText);

    const matchesCategory =
      activeCategory === null || productCategory === activeCategory;

    if (matchesSearch && matchesCategory) {
      product.classList.remove("hidden");

      visibleProducts++;
    } else {
      product.classList.add("hidden");
    }
  });

  if (visibleProducts === 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }
};

// ============================================================
// 5. ZOEKEN TERWIJL IEMAND TYpt
// ============================================================

searchInput.addEventListener("input", () => {
  applyFilters();
});

// ============================================================
// 6. CATEGORIEËN
// ============================================================

const categoryButtons = document.querySelectorAll(".category-card");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const clickedCategory = button.dataset.category;

    if (activeCategory === clickedCategory) {
      activeCategory = null;

      button.classList.remove("selected");
    } else {
      activeCategory = clickedCategory;

      categoryButtons.forEach((categoryButton) => {
        categoryButton.classList.remove("selected");
      });

      button.classList.add("selected");
    }

    applyFilters();
  });
});

// ============================================================
// 7. BEKIJK ALLES - CATEGORIEËN
// ============================================================

const showAllCategories = document.querySelector("#show-all-categories");

showAllCategories.addEventListener("click", () => {
  activeCategory = null;

  categoryButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  searchInput.value = "";

  applyFilters();
});

// ============================================================
// 8. BEKIJK ALLES - PRODUCTEN
// ============================================================

const showAllProducts = document.querySelector("#show-all-products");

showAllProducts.addEventListener("click", () => {
  activeCategory = null;

  searchInput.value = "";

  categoryButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  applyFilters();
});

// ============================================================
// 9. FAVORIETEN / HARTJES
// ============================================================

const favoriteButtons = document.querySelectorAll(".favorite-button");

favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      button.textContent = "♥";
    } else {
      button.textContent = "♡";
    }
  });
});

// ============================================================
// 10. WINKELWAGEN
// ============================================================

// Haal bestaande winkelwagen op uit localStorage.
//
// Als er nog niets bestaat,
// beginnen we met een lege array.
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Selecteer alle winkelwagenknoppen.
const cartButtons = document.querySelectorAll(".cart-button");

// ============================================================
// FUNCTIE: KNOPPEN BIJWERKEN
// ============================================================

// Deze functie controleert of een product
// al in de winkelwagen staat.
//
// Zo blijven de knoppen ook correct
// nadat de pagina opnieuw geladen wordt.
const updateCartButtons = () => {
  cartButtons.forEach((button) => {
    const productCard = button.closest(".product-card");

    const productName = productCard.dataset.name;

    const productExists = cart.some((product) => {
      return product.name === productName;
    });

    if (productExists) {
      button.classList.add("added");

      button.textContent = "Toegevoegd ✓";
    } else {
      button.classList.remove("added");

      button.textContent = "In winkelwagen";
    }
  });
};

// ============================================================
// PRODUCT TOEVOEGEN OF VERWIJDEREN
// ============================================================

cartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Zoek de productkaart van deze knop.
    const productCard = button.closest(".product-card");

    // Haal de productnaam op.
    const productName = productCard.dataset.name;

    // Haal de categorie op.
    const productCategory = productCard.dataset.category;

    // Zoek het prijs-element.
    const priceText = productCard.querySelector(".product-price").textContent;

    // Maak bijvoorbeeld:
    //
    // € 69,99
    //
    // naar:
    //
    // 69.99
    const productPrice = Number(
      priceText.replace("€", "").replace(",", ".").trim(),
    );

    // Haal de afbeelding op.
    const imageElement = productCard.querySelector("img");

    const productImage = imageElement.getAttribute("src");

    // Controleer of het product al bestaat.
    const existingProduct = cart.find((product) => {
      return product.name === productName;
    });

    // ========================================================
    // PRODUCT STAAT AL IN WINKELWAGEN
    // ========================================================

    if (existingProduct) {
      // Verwijder het product.
      cart = cart.filter((product) => {
        return product.name !== productName;
      });
    }

    // ========================================================
    // PRODUCT STAAT NOG NIET IN WINKELWAGEN
    // ========================================================
    else {
      const product = {
        name: productName,

        category: productCategory,

        price: productPrice,

        image: productImage,
      };

      // Voeg product toe.
      cart.push(product);
    }

    // ========================================================
    // OPSLAAN IN LOCALSTORAGE
    // ========================================================

    localStorage.setItem("cart", JSON.stringify(cart));

    // Werk de knoppen opnieuw bij.
    updateCartButtons();

    // Handig tijdens het testen.
    console.log("Winkelwagen:", cart);
  });
});

// ============================================================
// 11. SHOP NU KNOP
// ============================================================

const shopNowButton = document.querySelector("#shop-now-button");

const productsSection = document.querySelector("#products");

shopNowButton.addEventListener("click", () => {
  productsSection.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
});

// ============================================================
// 12. PAGINA EERSTE KEER LADEN
// ============================================================

// Productfilters meteen uitvoeren.
applyFilters();

// Controleer meteen welke producten
// al in de winkelwagen staan.
updateCartButtons();
