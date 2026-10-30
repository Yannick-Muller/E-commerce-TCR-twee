"use strict";

// ============================================================
// WINKELWAGEN: PRODUCTEN VERDWIJNEN NA 3 DAGEN
//
// Elk item in localStorage "cart" krijgt een tijdstip: addedAt (ms).
// Items die langer dan MAX_AGE_DAYS in de winkelwagen staan, worden
// automatisch verwijderd.
//
// BELANGRIJK: laad dit bestand als gewone <script src="cart-expiry.js">
// in de <head>, VOOR products-loader.js. Zo is de winkelwagen al
// opgeschoond voordat script.js, cart.js of product.js hem inlezen.
//
// Hoe werkt het stempelen?
// - script.js en cart.js zetten zelf addedAt op nieuwe items.
// - Voor code die dat niet doet (zoals product.js) kijkt dit bestand
//   kort na elke klik of er nieuwe items zonder addedAt zijn en
//   stempelt ze dan met de huidige tijd.
//
// Andere scripts kunnen window.CartExpiry gebruiken:
//   CartExpiry.maxDays          -> aantal dagen (3)
//   CartExpiry.purge()          -> ruimt nu op, geeft verwijderde namen terug
//   CartExpiry.takeRemoved()    -> namen die zijn verwijderd (en wist de lijst)
//   CartExpiry.expiresAt(item)  -> tijdstip (ms) waarop het item verloopt
//
// Het event "cart:expired" wordt verstuurd als een automatische controle
// (terugkeren naar de pagina of het tabblad) iets heeft verwijderd.
// ============================================================

(function () {
  const CART_KEY = "cart";
  const MAX_AGE_DAYS = 3;
  const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  let removedNames = [];

  // Stempel nieuwe items en verwijder verlopen items.
  // silent = true: geen "cart:expired" event (voor aanroepen vanuit cart.js zelf).
  function refresh(silent) {
    let cart;

    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(saved) || saved.length === 0) return [];
      cart = saved;
    } catch (error) {
      return [];
    }

    const now = Date.now();
    const kept = [];
    const removed = [];
    let changed = false;

    cart.forEach((item) => {
      // Ongeldige items laten we met rust, cart.js filtert die zelf.
      if (!item || typeof item !== "object") {
        kept.push(item);
        return;
      }

      if (typeof item.addedAt !== "number" || !Number.isFinite(item.addedAt)) {
        item.addedAt = now;
        changed = true;
      }

      if (now - item.addedAt >= MAX_AGE_MS) {
        removed.push(item.name);
        changed = true;
      } else {
        kept.push(item);
      }
    });

    if (changed) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(kept));
      } catch (error) {
        console.warn("Winkelwagen kon niet bijgewerkt worden:", error);
      }
    }

    if (removed.length > 0) {
      removedNames = removedNames.concat(removed);

      if (!silent) {
        window.dispatchEvent(
          new CustomEvent("cart:expired", { detail: { removed } }),
        );
      }
    }

    return removed;
  }

  window.CartExpiry = {
    maxDays: MAX_AGE_DAYS,
    purge: () => refresh(true),
    takeRemoved: () => {
      const names = [...new Set(removedNames)];
      removedNames = [];
      return names;
    },
    expiresAt: (item) => Number(item && item.addedAt) + MAX_AGE_MS,
  };

  // Meteen bij het laden van de pagina (vóór de andere scripts).
  refresh(true);

  // Kort na elke klik: nieuwe items die nog geen tijdstip hebben stempelen.
  document.addEventListener("click", () => setTimeout(() => refresh(false), 50), true);

  // Terug op de pagina (terugknop) of terug in het tabblad.
  window.addEventListener("pageshow", () => refresh(false));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh(false);
  });
})();
