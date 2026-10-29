"use strict";
 
// Alle productgegevens op één plek.
// De sleutel (bijv. "sneakers-6999") moet gelijk zijn aan
// data-product-id in index.html en gebruikt worden in product.html?id=...
window.PRODUCTS = {
  "sneakers-6999": {
    name: "Sneakers",
    brand: "Merknaam",
    category: "schoenen", // gebruikt voor de winkelwagen
    categoryLabel: "Schoenen", // getoond op de pagina
    price: 69.99,
    summary: "Comfortabele sneakers voor elke dag.",
    description: [
      "Deze sneakers combineren comfort met een tijdloos ontwerp.",
      "Geschikt voor dagelijks gebruik, zowel in de stad als onderweg.",
    ],
    features: ["Rubberen zool", "Ademend materiaal", "Lichtgewicht"],
    images: ["images/sneakers.jpg"],
  },
 
  "tshirt-2499": {
    name: "T-shirt",
    brand: "Merknaam",
    category: "kleding",
    categoryLabel: "Kleding",
    price: 24.99,
    summary: "Zacht en comfortabel katoenen T-shirt.",
    description: [
      "Een basic T-shirt die bij bijna alles te combineren is.",
      "Wasbaar op 30 graden.",
    ],
    features: ["100% katoen", "Ronde hals", "Normale pasvorm"],
    images: ["images/tshirt.jpg"],
  },
 
  "tas-3999": {
    name: "Tas",
    brand: "Merknaam",
    category: "accessoires",
    categoryLabel: "Accessoires",
    price: 39.99,
    summary: "Ruime tas voor dagelijks gebruik.",
    description: [
      "Een praktische tas met genoeg ruimte voor al je spullen.",
      "Sterk materiaal en verstelbare band.",
    ],
    features: ["Verstelbare schouderband", "Ritssluiting", "Binnenvak"],
    images: ["images/bag.jpg"],
  },
 
  "headphones-8999": {
    name: "Koptelefoon",
    brand: "Merknaam",
    category: "elektronica",
    categoryLabel: "Elektronica",
    price: 89.99,
    summary: "Koptelefoon met helder geluid.",
    description: [
      "Een koptelefoon met krachtige bas en heldere hoge tonen.",
      "Zacht oorkussen voor urenlang luisterplezier.",
    ],
    features: ["Draadloos", "Lange accuduur", "Opvouwbaar"],
    images: ["images/headphones.jpg"],
  },
};