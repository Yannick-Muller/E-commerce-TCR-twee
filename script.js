// ============================================================
// WEBSHOP - SCRIPT.JS
// ============================================================

// ============================================================
// 1. NAVIGATIE
// ============================================================

// Selecteer alle navigatielinks.
//
// querySelectorAll geeft meerdere elementen terug.
const navLinks = document.querySelectorAll(".nav-link");

// Loop door alle navigatielinks.
navLinks.forEach((link) => {
  // Luister naar een klik op iedere navigatielink.
  link.addEventListener("click", () => {
    // Eerst verwijderen we "active"
    // van alle navigatielinks.
    navLinks.forEach((navLink) => {
      navLink.classList.remove("active");
    });

    // Daarna geven we alleen de aangeklikte link
    // de class "active".
    link.classList.add("active");
  });
});

// ============================================================
// 2. PRODUCTEN SELECTEREN
// ============================================================

// Selecteer alle producten.
//
// We gebruiken deze later voor:
// - zoeken
// - categorieën
const productCards = document.querySelectorAll(".product-card");

// Selecteer de tekst:
// "Geen producten gevonden."
const noResults = document.querySelector("#no-results");

// ============================================================
// 3. ZOEKBALK
// ============================================================

// Selecteer het zoekveld.
const searchInput = document.querySelector("#search-input");

// Hier bewaren we welke categorie geselecteerd is.
//
// null betekent:
// er is op dit moment geen categorie geselecteerd.
let activeCategory = null;

// ============================================================
// 4. FUNCTIE: applyFilters()
// ============================================================

// Deze functie controleert:
//
// 1. Wat heeft iemand gezocht?
// 2. Welke categorie is geselecteerd?
//
// Daarna bepaalt de functie welke producten
// zichtbaar moeten zijn.
const applyFilters = () => {
  // Haal de tekst uit de zoekbalk.
  //
  // toLowerCase():
  // maakt alles kleine letters.
  //
  // trim():
  // verwijdert spaties voor en achter de tekst.
  const searchText = searchInput.value.toLowerCase().trim();

  // Hiermee tellen we hoeveel producten
  // uiteindelijk zichtbaar zijn.
  let visibleProducts = 0;

  // Loop door ieder product.
  productCards.forEach((product) => {
    // Haal data-name uit het HTML-element.
    //
    // Bijvoorbeeld:
    //
    // data-name="Sneakers"
    const productName = product.dataset.name.toLowerCase();

    // Haal de categorie uit data-category.
    //
    // Bijvoorbeeld:
    //
    // data-category="schoenen"
    const productCategory = product.dataset.category;

    // Controleer of de productnaam
    // overeenkomt met wat er gezocht wordt.
    const matchesSearch = productName.includes(searchText);

    // Controleer de categorie.
    //
    // Als activeCategory null is,
    // mogen alle categorieën zichtbaar zijn.
    //
    // Anders moet de categorie van het product
    // hetzelfde zijn als activeCategory.
    const matchesCategory =
      activeCategory === null || productCategory === activeCategory;

    // Het product wordt alleen zichtbaar
    // als beide voorwaarden kloppen.
    if (matchesSearch && matchesCategory) {
      // Verwijder hidden.
      product.classList.remove("hidden");

      // Tel één zichtbaar product erbij.
      visibleProducts++;
    } else {
      // Verberg het product.
      product.classList.add("hidden");
    }
  });

  // Als er geen producten zichtbaar zijn,
  // laten we de melding zien.
  if (visibleProducts === 0) {
    noResults.classList.remove("hidden");
  } else {
    // Anders verbergen we de melding.
    noResults.classList.add("hidden");
  }
};

// ============================================================
// 5. ZOEKEN TERWIJL IEMAND TYpt
// ============================================================

// "input" wordt uitgevoerd iedere keer
// wanneer iemand iets in het zoekveld verandert.
searchInput.addEventListener("input", () => {
  // Voer onze filterfunctie uit.
  applyFilters();
});

// ============================================================
// 6. CATEGORIEËN
// ============================================================

// Selecteer alle categorieknoppen.
const categoryButtons = document.querySelectorAll(".category-card");

// Loop door iedere categorieknop.
categoryButtons.forEach((button) => {
  // Luister naar een klik.
  button.addEventListener("click", () => {
    // Haal de categorie uit data-category.
    //
    // Bijvoorbeeld:
    //
    // data-category="schoenen"
    const clickedCategory = button.dataset.category;

    // Controleer of iemand opnieuw
    // op dezelfde categorie klikt.
    if (activeCategory === clickedCategory) {
      // Dan zetten we de categorie weer uit.
      activeCategory = null;

      // Verwijder selected.
      button.classList.remove("selected");
    } else {
      // Er is een nieuwe categorie gekozen.
      activeCategory = clickedCategory;

      // Verwijder selected eerst
      // van alle categorieknoppen.
      categoryButtons.forEach((categoryButton) => {
        categoryButton.classList.remove("selected");
      });

      // Geef de aangeklikte knop
      // de class selected.
      button.classList.add("selected");
    }

    // Producten opnieuw filteren.
    applyFilters();
  });
});

// ============================================================
// 7. BEKIJK ALLES - CATEGORIEËN
// ============================================================

// Selecteer de knop "Bekijk alles".
const showAllCategories = document.querySelector("#show-all-categories");

// Luister naar een klik.
showAllCategories.addEventListener("click", () => {
  // Zet de geselecteerde categorie uit.
  activeCategory = null;

  // Verwijder selected
  // van alle categorieknoppen.
  categoryButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  // Maak het zoekveld leeg.
  searchInput.value = "";

  // Laat alle producten weer zien.
  applyFilters();
});

// ============================================================
// 8. BEKIJK ALLES - PRODUCTEN
// ============================================================

// Selecteer de tweede knop "Bekijk alles".
const showAllProducts = document.querySelector("#show-all-products");

// Luister naar een klik.
showAllProducts.addEventListener("click", () => {
  // Geen categorie selecteren.
  activeCategory = null;

  // Zoekveld leegmaken.
  searchInput.value = "";

  // Verwijder selected van categorieën.
  categoryButtons.forEach((button) => {
    button.classList.remove("selected");
  });

  // Laat alle producten zien.
  applyFilters();
});

// ============================================================
// 9. FAVORIETEN / HARTJES
// ============================================================

// Selecteer alle hartjes.
const favoriteButtons = document.querySelectorAll(".favorite-button");

// Loop door ieder hartje.
favoriteButtons.forEach((button) => {
  // Luister naar een klik.
  button.addEventListener("click", () => {
    // Toggle betekent:
    //
    // bestaat active niet?
    // → toevoegen
    //
    // bestaat active wel?
    // → verwijderen
    button.classList.toggle("active");

    // Controleer of active bestaat.
    if (button.classList.contains("active")) {
      // Gevuld hartje.
      button.textContent = "♥";
    } else {
      // Leeg hartje.
      button.textContent = "♡";
    }
  });
});

// ============================================================
// 10. WINKELWAGEN
// ============================================================

// Selecteer alle winkelwagenknoppen.
const cartButtons = document.querySelectorAll(".cart-button");

// Loop door alle knoppen.
cartButtons.forEach((button) => {
  // Luister naar een klik.
  button.addEventListener("click", () => {
    // Zet de class added aan of uit.
    button.classList.toggle("added");

    // Controleer of added bestaat.
    if (button.classList.contains("added")) {
      // Product is toegevoegd.
      button.textContent = "Toegevoegd ✓";
    } else {
      // Product is weer verwijderd.
      button.textContent = "In winkelwagen";
    }
  });
});

// ============================================================
// 11. SHOP NU KNOP
// ============================================================

// Selecteer de Shop nu knop.
const shopNowButton = document.querySelector("#shop-now-button");

// Selecteer de producten-container.
const productsSection = document.querySelector("#products");

// Luister naar een klik.
shopNowButton.addEventListener("click", () => {
  // Scroll netjes naar de producten.
  productsSection.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
});

// ============================================================
// 12. PAGINA EERSTE KEER LADEN
// ============================================================

// Voer de filterfunctie één keer uit.
//
// Hierdoor weten we zeker dat de producten
// vanaf het begin correct zichtbaar zijn.
applyFilters();
