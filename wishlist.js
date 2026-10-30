"use strict";

// ============================================================
// VERLANGLIJSTJE (cart.html)
//
// Toont de producten die je met het hartje hebt geliket.
// favorites.js bewaart die als lijst met product-id's in
// localStorage "favorites"; hier zoeken we de producten erbij
// in window.PRODUCTS (products.json).
//
// - "In winkelwagen" zet het product in localStorage "cart"
//   (met addedAt, zodat het na 3 dagen verloopt).
// - "Verwijderen" haalt het product van je verlanglijstje
//   (en dus ook het hartje op de andere pagina's weg).
//
// Laden NA products-loader.js, sale.js en cart.js (zie data-then in cart.html).
// ============================================================

const startWishlist = () => {
  const FAVORITES_KEY = "favorites";
  const CART_KEY = "cart";

  const listEl = document.getElementById("wishlist-list");
  const emptyEl = document.getElementById("wishlist-empty");
  const countEl = document.getElementById("wishlist-count");
  const statusEl = document.getElementById("wishlist-status");

  if (!listEl) return;

  const euro = (n) => "€ " + Number(n).toFixed(2).replace(".", ",");
  const priceNow = (product) =>
    window.Sale ? window.Sale.getPrice(product) : product.price;
  const onSale = (product) =>
    window.Sale ? window.Sale.isOnSale(product) : false;

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  // ----------------------------------------------------------
  // Opslag
  // ----------------------------------------------------------

  function loadFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
    } catch (error) {
      console.warn("Favorieten konden niet geladen worden:", error);
      return [];
    }
  }

  function saveFavorites(ids) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.warn("Winkelwagen kon niet geladen worden:", error);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn("Winkelwagen kon niet opgeslagen worden:", error);
    }

    // cart.js luistert hiernaar en tekent de winkelwagen opnieuw.
    window.dispatchEvent(new Event("cart:changed"));
  }

  const isInCart = (product) =>
    loadCart().some((item) => item && item.name === product.name);

  // ----------------------------------------------------------
  // Acties
  // ----------------------------------------------------------

  function addToCart(product) {
    if (isInCart(product)) return;

    const cart = loadCart();
    const imagePath = (product.images || [])[0] || "";

    cart.push({
      name: product.name,
      category: product.category,
      price: priceNow(product),
      image: imagePath ? new URL(imagePath, document.baseURI).href : "",
      addedAt: Date.now(),
    });

    saveCart(cart);
    setStatus(`${product.name} is toegevoegd aan je winkelwagen.`);
  }

  function removeFromWishlist(id, product) {
    saveFavorites(loadFavorites().filter((favoriteId) => favoriteId !== id));
    setStatus(`${product.name} is van je verlanglijstje gehaald.`);
    render();
  }

  // ----------------------------------------------------------
  // Weergave
  // ----------------------------------------------------------

  function createItem(id, product) {
    const url = `product.html?id=${encodeURIComponent(id)}`;

    const li = document.createElement("li");
    li.className = "wish-item";

    // Afbeelding
    const imageLink = document.createElement("a");
    imageLink.className = "wish-item-image";
    imageLink.href = url;
    imageLink.setAttribute("aria-label", `Bekijk ${product.name}`);

    const imagePath = (product.images || [])[0];
    if (imagePath) {
      const img = document.createElement("img");
      img.src = imagePath;
      img.alt = product.name;
      imageLink.appendChild(img);
    }

    // Naam en prijs
    const info = document.createElement("div");
    info.className = "wish-item-info";

    const name = document.createElement("p");
    name.className = "wish-item-name";

    const nameLink = document.createElement("a");
    nameLink.href = url;
    nameLink.textContent = product.name;
    name.appendChild(nameLink);

    const price = document.createElement("p");
    price.className = "wish-item-price";
    price.textContent = euro(priceNow(product));

    if (onSale(product)) {
      price.classList.add("is-sale");

      const old = document.createElement("s");
      old.className = "price-old";
      old.textContent = euro(product.price);
      price.appendChild(old);
    }

    // Knoppen
    const actions = document.createElement("div");
    actions.className = "wish-item-actions";

    const add = document.createElement("button");
    add.type = "button";
    add.className = "btn-primary";

    if (isInCart(product)) {
      add.textContent = "In winkelwagen ✓";
      add.disabled = true;
    } else {
      add.textContent = "In winkelwagen";
      add.setAttribute("aria-label", `${product.name} in winkelwagen zetten`);
      add.addEventListener("click", () => addToCart(product));
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn-remove";
    remove.textContent = "Verwijderen";
    remove.setAttribute("aria-label", `${product.name} van verlanglijstje verwijderen`);
    remove.addEventListener("click", () => removeFromWishlist(id, product));

    actions.append(add, remove);
    info.append(name, price, actions);
    li.append(imageLink, info);

    return li;
  }

  function render() {
    const products = window.PRODUCTS || {};

    // Alleen favorieten die nog bestaan in products.json.
    const items = loadFavorites()
      .filter((id) => products[id])
      .map((id) => [id, products[id]]);

    listEl.textContent = "";
    items.forEach(([id, product]) => listEl.appendChild(createItem(id, product)));

    if (countEl) countEl.textContent = String(items.length);
    if (emptyEl) emptyEl.hidden = items.length > 0;
  }

  // ----------------------------------------------------------
  // Synchroniseren
  // ----------------------------------------------------------

  // Winkelwagen veranderd (ook door cart.js): knoppen opnieuw bepalen.
  window.addEventListener("cart:changed", render);
  window.addEventListener("cart:expired", render);

  // Terugkomen met de terugknop, of een hartje in een ander tabblad.
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", (event) => {
    if (event.key === FAVORITES_KEY || event.key === CART_KEY || event.key === null) {
      render();
    }
  });

  // Sale afgelopen: prijzen zijn aangepast.
  window.addEventListener("flashsale:ended", render);

  render();
};

// De scripts worden pas geladen nadat products.json is opgehaald,
// dus de pagina kan al klaar zijn.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startWishlist);
} else {
  startWishlist();
}
