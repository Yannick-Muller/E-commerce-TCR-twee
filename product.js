"use strict";

// Alles zit in één functie, zodat er geen namen botsen met script.js of favorites.js.
document.addEventListener("DOMContentLoaded", () => {
  const MAX_QTY = 10;
  const MIN_QTY = 1;

  // ============================================================
  // WINKELWAGEN (gedeeld met script.js via localStorage "cart")
  // Elk product is een object: { name, category, price, image }
  // ============================================================

  const cartCountEl = document.getElementById("cart-count");
  const status = document.getElementById("form-status");

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.warn("Winkelwagen kon niet geladen worden:", error);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Winkelwagen kon niet opgeslagen worden:", error);
    }
  }

  function showCartCount() {
    if (cartCountEl) cartCountEl.textContent = loadCart().length;
  }

  // Voeg een product 'amount' keer toe (script.js telt elk item los).
  function addToCart(product, amount) {
    const cart = loadCart();
    for (let i = 0; i < amount; i++) {
      cart.push({
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
      });
    }
    saveCart(cart);
    showCartCount();
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  showCartCount();

  // ============================================================
  // PRODUCTGEGEVENS (uit data-attributen op <section id="product">)
  // ============================================================

  const productEl = document.getElementById("product");

  function getMainProduct() {
    const d = productEl ? productEl.dataset : {};
    const price = Number(d.price);
    return {
      name: d.name || "Product",
      category: d.category || "",
      price: Number.isFinite(price) ? price : 0,
      image: d.image || "",
    };
  }

  // ============================================================
  // PRODUCT LADEN UIT DE URL (product.html?id=sneakers-6999)
  // Gegevens komen uit products.js.
  // ============================================================

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const allProducts = window.PRODUCTS || {};
  const currentProduct = allProducts[productId];

  const euro = (n) => "€ " + n.toFixed(2).replace(".", ",");

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
    return el;
  }

   const priceNow = (p) => (window.Sale ? window.Sale.getPrice(p) : p.price);

   function renderMainPrice() {
     if (!currentProduct) return;

     const sale = window.Sale;
     const priceEl = setText("product-price", euro(priceNow(currentProduct)));
     const discounted = sale && sale.isOnSale(currentProduct);

     if (priceEl) {
       priceEl.classList.toggle("is-sale", Boolean(discounted));

       if (discounted) {
         const old = document.createElement("s");
         old.className = "price-old";
         old.textContent = euro(currentProduct.price);

         const badge = document.createElement("span");
         badge.className = "sale-badge";
         badge.textContent = `-${sale.discountPercent(currentProduct)}%`;

         priceEl.append(old, badge);
       }
     }

     const section = document.getElementById("product");
     if (section) section.dataset.price = String(priceNow(currentProduct));
   }

  function renderProduct() {
    const section = document.getElementById("product");

    if (!currentProduct) {
      // Geen of onbekend id: laat de placeholders staan en meld het.
      if (productId) setText("product-title", "Product niet gevonden");
      return;
    }

    document.title = `${currentProduct.name} | Webshop`;

    setText("product-title", currentProduct.name);
    setText("breadcrumb-name", currentProduct.name);
    renderMainPrice();
    setText("product-summary", currentProduct.summary || "");

    const brand = setText("product-brand", currentProduct.brand || "");
    const tag = setText("product-category", currentProduct.categoryLabel || "");
    if (brand) brand.classList.add("is-filled");
    if (tag) tag.classList.add("is-filled");

    // Gegevens voor de winkelwagen.
    if (section) {
      section.dataset.name = currentProduct.name;
      section.dataset.category = currentProduct.category;
      section.dataset.price = String(priceNow(currentProduct))
      section.dataset.image = (currentProduct.images || [])[0] || "";
    }

    // Beschrijving en kenmerken.
    const desc = document.getElementById("product-description");
    if (desc) {
      desc.textContent = "";
      (currentProduct.description || []).forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        desc.appendChild(p);
      });
      if ((currentProduct.features || []).length) {
        const ul = document.createElement("ul");
        currentProduct.features.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          ul.appendChild(li);
        });
        desc.appendChild(ul);
      }
    }

    // Afbeeldingen.
    const images = currentProduct.images || [];
    const main = document.getElementById("main-image");
    const thumbsBox = document.getElementById("gallery-thumbs");

    if (main && images.length) {
      main.textContent = "";
      main.classList.remove("placeholder");
      main.classList.add("has-image");
      main.setAttribute("aria-label", `${currentProduct.name} afbeelding 1`);

      const img = document.createElement("img");
      img.src = images[0];
      img.alt = currentProduct.name;
      main.appendChild(img);
    }

    if (thumbsBox) {
      thumbsBox.textContent = "";
      // Bij één afbeelding zijn miniaturen overbodig.
      thumbsBox.hidden = images.length < 2;

      images.forEach((src, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "thumb" + (index === 0 ? " is-active" : "");
        btn.dataset.src = src;
        btn.dataset.alt = `${currentProduct.name} afbeelding ${index + 1}`;
        btn.setAttribute("aria-pressed", String(index === 0));
        btn.setAttribute("aria-label", `Toon afbeelding ${index + 1}`);

        const thumbImg = document.createElement("img");
        thumbImg.src = src;
        thumbImg.alt = "";
        btn.appendChild(thumbImg);

        thumbsBox.appendChild(btn);
      });
    }

    // Gerelateerde producten: de andere producten uit products.js.
    const relatedGrid = document.getElementById("related-grid");
    if (relatedGrid) {
      relatedGrid.textContent = "";

      Object.entries(allProducts)
        .filter(([id]) => id !== productId)
        .slice(0, 4)
        .forEach(([id, p]) => {
          const card = document.createElement("article");
          card.className = "card";
          card.dataset.productId = id;

          const imageBox = document.createElement("div");
          imageBox.className = "card-image";
          if (p.images && p.images[0]) {
            const img = document.createElement("img");
            img.src = p.images[0];
            img.alt = p.name;
            imageBox.appendChild(img);
          }

          const body = document.createElement("div");
          body.className = "card-body";

          const h3 = document.createElement("h3");
          h3.className = "card-title";
          const link = document.createElement("a");
          link.href = `product.html?id=${encodeURIComponent(id)}`;
          link.textContent = p.name;
          h3.appendChild(link);

          const meta = document.createElement("p");
          meta.className = "card-meta";
          meta.textContent = p.summary || "";

          const price = document.createElement("p");
          price.className = "card-price";
          price.textContent = euro(priceNow(p));

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn-card";
          btn.textContent = "Add to Cart";
          btn.dataset.name = p.name;
          btn.dataset.category = p.category;
          btn.dataset.price = String(priceNow(p));
          btn.dataset.image = (p.images || [])[0] || "";

          body.append(h3, meta, price, btn);
          card.append(imageBox, body);
          relatedGrid.appendChild(card);
        });
    }
  }

  renderProduct();

     window.addEventListener("flashsale:ended", () => {
     renderMainPrice();

     document
       .querySelectorAll("#related-grid .card[data-product-id]")
       .forEach((card) => {
         const p = allProducts[card.dataset.productId];
         if (!p) return;

         const priceEl = card.querySelector(".card-price");
         if (priceEl) priceEl.textContent = euro(priceNow(p));

         const button = card.querySelector(".btn-card");
         if (button) button.dataset.price = String(priceNow(p));
       });
   });
  // ============================================================
  // GALERIJ
  // ============================================================

  const mainImage = document.getElementById("main-image");
  const mainImageLabel = document.getElementById("main-image-label");
  const thumbs = document.querySelectorAll(".thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      thumb.classList.add("is-active");
      thumb.setAttribute("aria-pressed", "true");

      if (mainImageLabel) mainImageLabel.textContent = thumb.dataset.label;
      if (mainImage) mainImage.setAttribute("aria-label", thumb.dataset.alt);

      const bigImg = mainImage && mainImage.querySelector("img");
      if (bigImg && thumb.dataset.src) {
        bigImg.src = thumb.dataset.src;
        bigImg.alt = thumb.dataset.alt;
      }
    });
  });


  // ============================================================
  // AANTAL
  // ============================================================

  const qtyInput = document.getElementById("qty-input");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");

  function clampQty() {
    if (!qtyInput) return;
    let value = parseInt(qtyInput.value, 10);
    if (Number.isNaN(value)) value = MIN_QTY;
    qtyInput.value = Math.min(MAX_QTY, Math.max(MIN_QTY, value));
  }

  function changeQty(step) {
    if (!qtyInput) return;
    qtyInput.value = (parseInt(qtyInput.value, 10) || MIN_QTY) + step;
    clampQty();
  }

  if (qtyMinus) qtyMinus.addEventListener("click", () => changeQty(-1));
  if (qtyPlus) qtyPlus.addEventListener("click", () => changeQty(1));
  if (qtyInput) qtyInput.addEventListener("change", clampQty);

  // ============================================================
  // FORMULIER: IN WINKELWAGEN
  // ============================================================

  const form = document.getElementById("product-form");
  const addButton = document.getElementById("add-to-cart");
  let resetTimer;

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clampQty();

      const data = new FormData(form);
      const size = data.get("size");
      const quantity = parseInt(data.get("quantity"), 10) || MIN_QTY;

      if (!size) {
        setStatus("Kies eerst een maat.");
        return;
      }

      const product = getMainProduct();
      addToCart(product, quantity);
      setStatus(
        `${quantity} × ${product.name} ${size}) toegevoegd aan je winkelwagen.`,
      );

      if (addButton) {
        addButton.textContent = "Toegevoegd";
        addButton.classList.add("is-added");
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          addButton.textContent = "Add to Cart";
          addButton.classList.remove("is-added");
        }, 1500);
      }
    });
  }

  // ============================================================
  // VERLANGLIJSTJE
  // ============================================================

  const wishButton = document.getElementById("wishlist");
  const FAVORITES_KEY = "favorites"; // dezelfde naam als in favorites.js

  function loadFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      return Array.isArray(saved)
        ? saved.filter((id) => typeof id === "string")
        : [];
    } catch (error) {
      console.warn("Favorieten konden niet geladen worden:", error);
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    } catch (error) {
      console.warn("Favorieten konden niet opgeslagen worden:", error);
    }
  }

  // Zet het hartje goed (gevuld of leeg).
  function showWishState(isSaved) {
    if (!wishButton) return;
    wishButton.setAttribute("aria-pressed", String(isSaved));
    wishButton.textContent = isSaved ? "♥" : "♡";
    wishButton.setAttribute(
      "aria-label",
      isSaved ? "Remove from wishlist" : "Add to wishlist",
    );
  }

  if (wishButton && productId) {
    // Bij het laden: staat dit product al in de favorieten?
    showWishState(loadFavorites().includes(productId));

    wishButton.addEventListener("click", () => {
      const favorites = loadFavorites();
      const isSaved = favorites.includes(productId);

      const updated = isSaved
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      saveFavorites(updated);
      showWishState(!isSaved);

      setStatus(
        isSaved
          ? "Verwijderd van je verlanglijstje."
          : "Opgeslagen op je verlanglijstje.",
      );
    });
  }

  // ============================================================
  // TABS
  // ============================================================

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

  function selectTab(selected) {
    tabs.forEach((tab) => {
      const isSelected = tab === selected;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));

      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;

      if (panel) {
        panel.hidden = !isSelected;
        panel.classList.toggle("is-active", isSelected);
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));

    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft")
        next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (next) {
        event.preventDefault();
        next.focus();
        selectTab(next);
      }
    });
  });

  // ============================================================
  // GERELATEERDE PRODUCTEN
  // ============================================================

  document.querySelectorAll(".btn-card").forEach((button) => {
    button.addEventListener("click", () => {
      const price = Number(button.dataset.price);

      addToCart(
        {
          name: button.dataset.name || "Product",
          category: button.dataset.category || "",
          price: Number.isFinite(price) ? price : 0,
          image: button.dataset.image || "",
        },
        1,
      );
      setStatus(`${button.dataset.name} toegevoegd aan je winkelwagen.`);

      const original = button.textContent;
      button.textContent = "Toegevoegd";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    });
  });
});
