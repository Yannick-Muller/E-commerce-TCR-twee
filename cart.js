"use strict";

// Alles zit in één functie, zodat er geen namen botsen met andere scripts.
document.addEventListener("DOMContentLoaded", () => {
  const MAX_QTY = 10;

  // ============================================================
  // WINKELWAGEN (gedeeld met script.js en product.js via
  // localStorage "cart"). Elk item is één product:
  // { name, category, price, image }
  // Hetzelfde product staat dus meerdere keren in de lijst
  // als de klant er meer dan één wil. Hier tellen we ze samen.
  // ============================================================

  const CART_KEY = "cart";

  const cartCountEl = document.getElementById("cart-count");
  const emptyBox = document.getElementById("cart-empty");
  const layoutBox = document.getElementById("cart-layout");
  const listEl = document.getElementById("cart-list");
  const summaryCount = document.getElementById("summary-count");
  const summaryTotal = document.getElementById("summary-total");
  const clearButton = document.getElementById("clear-cart");
  const checkoutButton = document.getElementById("checkout");
  const statusEl = document.getElementById("cart-status");

  const euro = (n) => "€ " + n.toFixed(2).replace(".", ",");

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(saved)) return [];

      // Alleen geldige items bewaren.
      return saved.filter((item) => item && typeof item.name === "string");
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
  }

  function priceOf(item) {
    const price = Number(item.price);
    return Number.isFinite(price) ? price : 0;
  }

  // Groepeer gelijke producten: [{ name, category, price, image, qty }]
  function groupCart(cart) {
    const groups = new Map();

    cart.forEach((item) => {
      if (groups.has(item.name)) {
        groups.get(item.name).qty += 1;
      } else {
        groups.set(item.name, {
          name: item.name,
          category: item.category || "",
          price: priceOf(item),
          image: item.image || "",
          qty: 1,
        });
      }
    });

    return [...groups.values()];
  }

  // Zoek het id in products.js, zodat de naam naar de productpagina kan linken.
  function findProductId(name) {
    const all = window.PRODUCTS || {};
    const found = Object.entries(all).find(([, p]) => p.name === name);
    return found ? found[0] : null;
  }

  // ============================================================
  // ACTIES
  // ============================================================

  // Eén stuk erbij.
  function increase(name) {
    const cart = loadCart();
    const template = cart.find((item) => item.name === name);
    if (!template) return;

    const qty = cart.filter((item) => item.name === name).length;
    if (qty >= MAX_QTY) {
      setStatus(`Je kunt maximaal ${MAX_QTY} stuks van ${name} bestellen.`);
      return;
    }

    cart.push({ ...template });
    saveCart(cart);
    setStatus("");
    render();
  }

  // Eén stuk eraf (minimaal 1; verwijderen doe je met de verwijderknop).
  function decrease(name) {
    const cart = loadCart();
    const index = cart.map((item) => item.name).lastIndexOf(name);
    const qty = cart.filter((item) => item.name === name).length;

    if (index === -1 || qty <= 1) return;

    cart.splice(index, 1);
    saveCart(cart);
    setStatus("");
    render();
  }

  // Alle stuks van één product weghalen.
  function removeProduct(name) {
    const cart = loadCart().filter((item) => item.name !== name);
    saveCart(cart);
    setStatus(`${name} is verwijderd uit je winkelwagen.`);
    render();
  }

  function clearCart() {
    saveCart([]);
    setStatus("Je winkelwagen is geleegd.");
    render();
  }

  // ============================================================
  // WEERGAVE
  // ============================================================

  function createItem(group) {
    const li = document.createElement("li");
    li.className = "cart-item";

    // Afbeelding
    const imageBox = document.createElement("div");
    imageBox.className = "cart-item-image";

    if (group.image) {
      const img = document.createElement("img");
      img.src = group.image;
      img.alt = group.name;
      imageBox.appendChild(img);
    } else {
      imageBox.textContent = "Geen afbeelding";
    }

    // Naam, prijs per stuk en knoppen
    const info = document.createElement("div");

    const name = document.createElement("p");
    name.className = "cart-item-name";

    const productId = findProductId(group.name);
    if (productId) {
      const link = document.createElement("a");
      link.href = `product.html?id=${encodeURIComponent(productId)}`;
      link.textContent = group.name;
      name.appendChild(link);
    } else {
      name.textContent = group.name;
    }

    const unit = document.createElement("p");
    unit.className = "cart-item-unit";
    unit.textContent = `${euro(group.price)} per stuk`;

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const qtyBox = document.createElement("div");
    qtyBox.className = "qty";
    qtyBox.setAttribute("role", "group");
    qtyBox.setAttribute("aria-label", `Aantal ${group.name}`);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Minder ${group.name}`);
    minus.disabled = group.qty <= 1;
    minus.addEventListener("click", () => decrease(group.name));

    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = String(group.qty);
    value.setAttribute("aria-live", "polite");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Meer ${group.name}`);
    plus.disabled = group.qty >= MAX_QTY;
    plus.addEventListener("click", () => increase(group.name));

    qtyBox.append(minus, value, plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn-remove";
    remove.textContent = "Verwijderen";
    remove.setAttribute("aria-label", `${group.name} verwijderen uit winkelwagen`);
    remove.addEventListener("click", () => removeProduct(group.name));

    actions.append(qtyBox, remove);
    info.append(name, unit, actions);

    // Regeltotaal
    const total = document.createElement("p");
    total.className = "cart-item-total";
    total.textContent = euro(group.price * group.qty);

    li.append(imageBox, info, total);
    return li;
  }

  function render() {
    const cart = loadCart();
    const groups = groupCart(cart);

    // Teller in de navigatiebalk.
    if (cartCountEl) cartCountEl.textContent = cart.length;

    const isEmpty = groups.length === 0;
    if (emptyBox) emptyBox.hidden = !isEmpty;
    if (layoutBox) layoutBox.hidden = isEmpty;

    if (listEl) {
      listEl.textContent = "";
      groups.forEach((group) => listEl.appendChild(createItem(group)));
    }

    const total = cart.reduce((sum, item) => sum + priceOf(item), 0);
    if (summaryCount) summaryCount.textContent = String(cart.length);
    if (summaryTotal) summaryTotal.textContent = euro(total);
  }

  // ============================================================
  // KNOPPEN
  // ============================================================

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (window.confirm("Weet je zeker dat je je winkelwagen wilt legen?")) {
        clearCart();
      }
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      // Er is nog geen afrekenpagina. Vervang dit later door:
      // window.location.href = "checkout.html";
      setStatus("Afrekenen is nog niet beschikbaar.");
    });
  }

  // ============================================================
  // SYNCHRONISEREN MET ANDERE PAGINA'S EN TABBLADEN
  // ============================================================

  // Terugkomen met de terugknop: lees de winkelwagen opnieuw in.
  window.addEventListener("pageshow", render);

  // Winkelwagen aangepast in een ander tabblad.
  window.addEventListener("storage", (event) => {
    if (event.key === CART_KEY || event.key === null) render();
  });

  render();
});
