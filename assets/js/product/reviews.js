"use strict";

// ============================================================
// REVIEWS OP DE PRODUCTPAGINA (product.html)
//
// - Je geeft een beoordeling van 1 tot 5 sterren (verplicht) en kunt
//   er een naam en een tekst bij zetten (allebei optioneel).
// - Je review verschijnt in het tabblad "Reviews", met een knop om hem
//   weer te verwijderen. Daarna kun je een nieuwe schrijven.
// - Bij de titel van het product staat de beoordeling met een link naar
//   het tabblad, en het tabblad zelf toont het aantal reviews.
//
// Er is geen server en geen inlog. De review wordt per product bewaard in
// localStorage "reviews" (zoals de winkelwagen en de favorieten):
//   { "sneakers-6999": { rating, name, text, createdAt }, ... }
// Je ziet dus alleen je eigen review, en maximaal één per product.
//
// Laden NA products-loader.js en product.js (zie data-then in product.html).
// ============================================================

(function () {
  const STORAGE_KEY = "reviews";
  const MAX_NAME = 40;
  const MAX_TEXT = 500;

  const productId = new URLSearchParams(window.location.search).get("id");
  const product = (window.PRODUCTS || {})[productId];

  const root = document.getElementById("reviews");
  const ratingBox = document.getElementById("product-rating");
  const reviewsTab = document.getElementById("tab-reviews");

  // Geen container of product niet gevonden (bijv. products.json niet geladen).
  if (!root || !product) return;

  // ----------------------------------------------------------
  // Kleine hulpfuncties
  // ----------------------------------------------------------

  function create(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const decimal = (n) => n.toFixed(1).replace(".", ",");
  const countText = (n) => `${n} ${n === 1 ? "review" : "reviews"}`;

  // Vijf sterren, het gekozen aantal in goud en de rest in grijs.
  function stars(value, label) {
    const filled = Math.max(0, Math.min(5, Math.round(value)));

    const box = create("span", "stars");
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", label);
    box.append(
      create("span", "stars-on", "★".repeat(filled)),
      create("span", "stars-off", "★".repeat(5 - filled)),
    );

    return box;
  }

  // ----------------------------------------------------------
  // Opslag
  // ----------------------------------------------------------

  function loadAll() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (error) {
      console.warn("Reviews konden niet geladen worden:", error);
      return {};
    }
  }

  function saveAll(all) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (error) {
      console.warn("Reviews konden niet opgeslagen worden:", error);
      return false;
    }
  }

  // Geeft de review van dit product terug, of null. Ongeldige gegevens
  // (bijv. met de hand aangepast) worden genegeerd.
  function loadReview() {
    const saved = loadAll()[productId];

    if (
      !saved ||
      !Number.isInteger(saved.rating) ||
      saved.rating < 1 ||
      saved.rating > 5
    ) {
      return null;
    }

    return {
      rating: saved.rating,
      name: typeof saved.name === "string" ? saved.name.slice(0, MAX_NAME) : "",
      text: typeof saved.text === "string" ? saved.text.slice(0, MAX_TEXT) : "",
      createdAt: Number.isFinite(saved.createdAt) ? saved.createdAt : Date.now(),
    };
  }

  function saveReview(review) {
    const all = loadAll();
    all[productId] = review;
    return saveAll(all);
  }

  function deleteReview() {
    const all = loadAll();
    delete all[productId];
    return saveAll(all);
  }

  // ----------------------------------------------------------
  // Opbouw van het tabblad
  // ----------------------------------------------------------

  const summaryEl = create("div", "reviews-summary");
  const bodyEl = create("div", "reviews-body");
  const statusEl = create("p", "review-status");

  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");

  root.textContent = "";
  root.append(summaryEl, bodyEl, statusEl);

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  // ----------------------------------------------------------
  // Samenvatting en beoordeling bij de titel
  // ----------------------------------------------------------

  function openReviewsTab() {
    if (reviewsTab) reviewsTab.click();

    const panel = document.getElementById("panel-reviews");
    if (!panel || !panel.scrollIntoView) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function renderSummary(reviews) {
    summaryEl.textContent = "";

    if (reviews.length === 0) {
      summaryEl.appendChild(create("p", "reviews-none", "Er zijn nog geen reviews. Wees de eerste!"));
      return;
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    summaryEl.append(
      create("span", "reviews-average", decimal(average)),
      stars(average, `Gemiddeld ${decimal(average)} van 5 sterren`),
      create("span", "reviews-count", countText(reviews.length)),
    );
  }

  function renderHeaderRating(reviews) {
    if (reviewsTab) {
      reviewsTab.textContent = reviews.length > 0 ? `Reviews (${reviews.length})` : "Reviews";
    }

    if (!ratingBox) return;

    ratingBox.textContent = "";

    const link = create("button", "rating-link");
    link.type = "button";

    if (reviews.length === 0) {
      link.textContent = "Nog geen reviews. Schrijf de eerste";
    } else {
      const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      link.append(
        stars(average, `Gemiddeld ${decimal(average)} van 5 sterren`),
        create("span", "rating-link-text", `${decimal(average)} · ${countText(reviews.length)}`),
      );
    }

    link.addEventListener("click", openReviewsTab);
    ratingBox.appendChild(link);
  }

  // ----------------------------------------------------------
  // Formulier: een review schrijven
  // ----------------------------------------------------------

  function buildForm() {
    const form = create("form", "review-form");
    form.id = "review-form";
    form.noValidate = true;

    const title = create("h3", "review-form-title", "Schrijf een review");
    title.id = "review-form-title";
    title.tabIndex = -1;

    // Sterren. De radioknoppen staan in omgekeerde volgorde (5 tot 1) en
    // worden met CSS weer van links naar rechts getoond, zodat de sterren
    // bij het aanwijzen en kiezen goed oplichten.
    const ratingField = create("fieldset", "review-field review-rating");
    ratingField.appendChild(create("legend", "", "Jouw beoordeling"));

    const starInput = create("div", "star-input");
    const starValue = create("span", "star-value", "Nog niet gekozen");
    starValue.setAttribute("aria-live", "polite");

    for (let value = 5; value >= 1; value--) {
      const input = create("input");
      input.type = "radio";
      input.name = "rating";
      input.value = String(value);
      input.id = `review-star-${value}`;
      input.addEventListener("change", () => {
        starValue.textContent = `${value} van 5 sterren`;
      });

      const label = create("label", "", "★");
      label.htmlFor = input.id;
      label.title = `${value} ${value === 1 ? "ster" : "sterren"}`;

      const hidden = create("span", "sr-only", `${value} ${value === 1 ? "ster" : "sterren"}`);
      label.appendChild(hidden);

      starInput.append(input, label);
    }

    ratingField.append(starInput, starValue);

    // Naam (optioneel)
    const nameField = create("div", "review-field");
    const nameLabel = create("label", "", "Naam (optioneel)");
    nameLabel.htmlFor = "review-name";
    const nameInput = create("input");
    nameInput.type = "text";
    nameInput.id = "review-name";
    nameInput.maxLength = MAX_NAME;
    nameInput.autocomplete = "off";
    nameField.append(nameLabel, nameInput);

    // Tekst (optioneel)
    const textField = create("div", "review-field");
    const textLabel = create("label", "", "Jouw review (optioneel)");
    textLabel.htmlFor = "review-text";
    const textInput = create("textarea");
    textInput.id = "review-text";
    textInput.rows = 4;
    textInput.maxLength = MAX_TEXT;
    const counter = create("span", "review-counter", `0/${MAX_TEXT}`);
    textInput.addEventListener("input", () => {
      counter.textContent = `${textInput.value.length}/${MAX_TEXT}`;
    });
    textField.append(textLabel, textInput, counter);

    const submit = create("button", "review-submit", "Review plaatsen");
    submit.type = "submit";

    form.append(title, ratingField, nameField, textField, submit);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const chosen = form.querySelector('input[name="rating"]:checked');

      if (!chosen) {
        setStatus("Kies eerst een aantal sterren.", true);
        form.querySelector('input[name="rating"]').focus();
        return;
      }

      const review = {
        rating: Number(chosen.value),
        name: nameInput.value.trim().slice(0, MAX_NAME),
        text: textInput.value.trim().slice(0, MAX_TEXT),
        createdAt: Date.now(),
      };

      if (!saveReview(review)) {
        setStatus("Je review kon niet worden opgeslagen in je browser.", true);
        return;
      }

      render();
      setStatus("Bedankt voor je review!");

      const card = bodyEl.querySelector(".review");
      if (card) card.focus();
    });

    return form;
  }

  // ----------------------------------------------------------
  // Je eigen review, met een knop om hem te verwijderen
  // ----------------------------------------------------------

  function buildReviewCard(review) {
    const card = create("article", "review");
    card.tabIndex = -1;

    const head = create("div", "review-head");

    const date = create(
      "time",
      "review-date",
      new Date(review.createdAt).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    date.dateTime = new Date(review.createdAt).toISOString();

    head.append(
      stars(review.rating, `${review.rating} van 5 sterren`),
      create("strong", "review-name", review.name || "Anoniem"),
      create("span", "review-badge", "Jouw review"),
      date,
    );

    card.appendChild(head);

    // Als tekst, nooit als HTML: wat iemand typt wordt niet uitgevoerd.
    if (review.text) card.appendChild(create("p", "review-text", review.text));

    const remove = create("button", "review-delete", "Review verwijderen");
    remove.type = "button";
    remove.addEventListener("click", () => {
      if (!window.confirm("Weet je zeker dat je je review wilt verwijderen?")) return;

      if (!deleteReview()) {
        setStatus("Je review kon niet worden verwijderd.", true);
        return;
      }

      render();
      setStatus("Je review is verwijderd.");

      // De knop is weg: zet de focus op het formulier dat terugkomt.
      const title = document.getElementById("review-form-title");
      if (title) title.focus();
    });

    card.appendChild(remove);
    return card;
  }

  // ----------------------------------------------------------
  // Alles tekenen
  // ----------------------------------------------------------

  function render() {
    const review = loadReview();
    const reviews = review ? [review] : [];

    renderSummary(reviews);
    renderHeaderRating(reviews);

    bodyEl.textContent = "";
    bodyEl.appendChild(review ? buildReviewCard(review) : buildForm());

    setStatus("");
  }

  // Review aangepast in een ander tabblad.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) render();
  });

  render();
})();
