"use strict";

// ============================================================
// FLASH SALE
// - Instellingen (einddatum) staan in products.js: window.FLASH_SALE
// - Kortingsprijs per product staat in products.js: salePrice
// - Dit bestand moet NA products.js en VOOR home-products.js,
//   script.js en product.js geladen worden.
//
// Testen zonder te wachten: voeg ?sale-test=15 aan een URL toe
// (de sale eindigt dan na 15 seconden, in dit tabblad).
// Met ?sale-test=reset ga je terug naar de echte einddatum.
// ============================================================

(function () {
  const config = window.FLASH_SALE || {};
  const TEST_KEY = "flashSaleTestEnd";

  // ----------------------------------------------------------
  // Einde van de sale bepalen
  // ----------------------------------------------------------

  function getEnd() {
    try {
      const params = new URLSearchParams(window.location.search);
      const test = params.get("sale-test");

      if (test === "reset") {
        sessionStorage.removeItem(TEST_KEY);
      } else if (test && Number(test) > 0) {
        sessionStorage.setItem(TEST_KEY, String(Date.now() + Number(test) * 1000));
      }

      const stored = Number(sessionStorage.getItem(TEST_KEY));
      if (Number.isFinite(stored) && stored > 0) return stored;
    } catch (error) {
      // sessionStorage niet beschikbaar: gebruik de echte einddatum.
    }

    const end = config.endsAt ? new Date(config.endsAt).getTime() : NaN;
    return Number.isFinite(end) ? end : null;
  }

  const endTime = getEnd();

  // ----------------------------------------------------------
  // Prijzen
  // ----------------------------------------------------------

  const isActive = () => endTime !== null && Date.now() < endTime;

  const isOnSale = (product) =>
    isActive() &&
    typeof product.salePrice === "number" &&
    product.salePrice < product.price;

  const getPrice = (product) => (isOnSale(product) ? product.salePrice : product.price);

  const discountPercent = (product) =>
    Math.round((1 - product.salePrice / product.price) * 100);

  // Zet de prijzen in de winkelwagen goed (sale begonnen of afgelopen).
  function syncCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(cart) || cart.length === 0) return;

      const all = Object.values(window.PRODUCTS || {});
      let changed = false;

      cart.forEach((item) => {
        const product = all.find((p) => p.name === item.name);
        if (!product) return;

        const price = getPrice(product);
        if (item.price !== price) {
          item.price = price;
          changed = true;
        }
      });

      if (changed) localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Winkelwagenprijzen konden niet bijgewerkt worden:", error);
    }
  }

  window.Sale = { isActive, isOnSale, getPrice, discountPercent };

  // Meteen goedzetten, voordat script.js de winkelwagen inleest.
  syncCart();

  // ----------------------------------------------------------
  // Banner met countdown
  // ----------------------------------------------------------

  function buildBanner(el) {
    el.className = "flash-sale";
    el.textContent = "";

    const title = document.createElement("strong");
    title.className = "flash-sale__title";
    title.textContent = config.title || "Flash sale";

    const label = document.createElement("span");
    label.className = "flash-sale__label";
    label.textContent = "Eindigt over";

    const timer = document.createElement("div");
    timer.className = "flash-sale__timer";
    timer.setAttribute("role", "timer");

    const values = {};
    [
      ["days", "dagen"],
      ["hours", "uur"],
      ["minutes", "min"],
      ["seconds", "sec"],
    ].forEach(([key, text]) => {
      const unit = document.createElement("div");
      unit.className = "flash-sale__unit";

      const number = document.createElement("strong");
      number.textContent = "00";

      const caption = document.createElement("span");
      caption.textContent = text;

      unit.append(number, caption);
      timer.appendChild(unit);
      values[key] = number;
    });

    const ended = document.createElement("span");
    ended.className = "flash-sale__ended";
    ended.hidden = true;
    ended.textContent = "De flash sale is afgelopen. De normale prijzen gelden weer.";

    el.append(title, label, timer, ended);
    return { el, label, timer, ended, values };
  }

  const pad = (n) => String(n).padStart(2, "0");

  function startCountdown() {
    if (endTime === null) return;

    // De banner is optioneel: ook pagina's zonder #flash-sale
    // (zoals product.html) moeten de prijzen bijwerken bij afloop.
    const target = document.getElementById("flash-sale");
    const banner = target ? buildBanner(target) : null;
    let finished = false;
    let intervalId;

    function showEnded() {
      if (!banner) return;

      banner.el.classList.remove("is-urgent");
      banner.el.classList.add("is-ended");
      banner.label.hidden = true;
      banner.timer.hidden = true;
      banner.ended.hidden = false;
    }

    function tick() {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        if (!finished) {
          finished = true;
          clearInterval(intervalId);
          showEnded();
          syncCart();
          // Laat andere scripts (kaarten, winkelwagen) zichzelf bijwerken.
          window.dispatchEvent(new Event("flashsale:ended"));
        }
        return;
      }

      if (!banner) return;

      const total = Math.floor(remaining / 1000);
      banner.values.days.textContent = String(Math.floor(total / 86400));
      banner.values.hours.textContent = pad(Math.floor((total % 86400) / 3600));
      banner.values.minutes.textContent = pad(Math.floor((total % 3600) / 60));
      banner.values.seconds.textContent = pad(total % 60);

      // Laatste uur: rode cijfers.
      banner.el.classList.toggle("is-urgent", remaining < 3600 * 1000);
    }

    if (!isActive()) {
      // Sale was al afgelopen bij het laden van de pagina.
      finished = true;
      showEnded();
      return;
    }

    tick();
    intervalId = setInterval(tick, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCountdown);
  } else {
    startCountdown();
  }
})();
