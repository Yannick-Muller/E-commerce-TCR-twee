"use strict";
 
// Alle productgegevens op één plek.
// De sleutel (bijv. "sneakers-6999") moet gelijk zijn aan
// data-product-id in index.html en gebruikt worden in product.html?id=...
// Flash sale-instellingen.
// endsAt: einddatum en -tijd (jjjj-mm-ddThh:mm:ss, lokale tijd).
// Producten met een "salePrice" krijgen de korting zolang de sale loopt.
window.FLASH_SALE = {
  title: "Flash sale",
  endsAt: "2026-11-30T23:59:59",
};
 
window.PRODUCTS = {
  "sneakers-6999": {
    popular: true, // wordt getoond op de homepage
    name: "Sneakers",
    brand: "Merknaam",
    category: "schoenen", // gebruikt voor de winkelwagen
    categoryLabel: "Schoenen", // getoond op de pagina
    price: 69.99,
    salePrice: 49.99, // actieprijs tijdens de flash sale
    summary: "Comfortabele sneakers voor elke dag.",
    description: [
      "Deze sneakers combineren comfort met een tijdloos ontwerp.",
      "Geschikt voor dagelijks gebruik, zowel in de stad als onderweg.",
    ],
    features: ["Rubberen zool", "Ademend materiaal", "Lichtgewicht"],
    images: ["images/sneakers.jpg"],
  },
 
  "tshirt-2499": {
    popular: true, // wordt getoond op de homepage
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
    popular: true, // wordt getoond op de homepage
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
    popular: true, // wordt getoond op de homepage
    name: "Koptelefoon",
    brand: "Merknaam",
    category: "elektronica",
    categoryLabel: "Elektronica",
    price: 89.99,
    salePrice: 69.99, // actieprijs tijdens de flash sale
    summary: "Koptelefoon met helder geluid.",
    description: [
      "Een koptelefoon met krachtige bas en heldere hoge tonen.",
      "Zacht oorkussen voor urenlang luisterplezier.",
    ],
    features: ["Draadloos", "Lange accuduur", "Opvouwbaar"],
    images: ["images/headphones.jpg"],
  },
 
  // ----------------------------------------------------------
  // Producten van de shoppagina (pages/categories.html)
  // ----------------------------------------------------------
  // Let op: de naam moet uniek zijn, want de winkelwagen
  // telt gelijke producten samen op naam.
 
  "tas-2999": {
    name: "Tas",
    brand: "Merknaam",
    category: "accessoires",
    categoryLabel: "Accessoires",
    price: 29.99,
    summary: "Een stijlvolle en praktische tas voor onderweg.",
    description: [
      "Een stijlvolle en praktische tas voor onderweg.",
      "Ideaal om je dagelijkse benodigdheden gemakkelijk mee te nemen.",
    ],
    features: [],
    images: ["images/category-accessories.png"],
  },
 
  "tas-limited-3999": {
    name: "Tas (limited edition)",
    brand: "Merknaam",
    category: "accessoires",
    categoryLabel: "Accessoires",
    price: 39.99,
    summary: "Een exclusieve tas met een unieke uitstraling.",
    description: [
      "Een exclusieve tas met een unieke uitstraling.",
      "De perfecte keuze voor wie iets bijzonders zoekt dat stijl en functionaliteit combineert.",
    ],
    features: ["Limited edition"],
    images: ["images/bag.jpg"],
  },
 
  "sneakers-2499": {
    name: "Sneakers (basic)",
    brand: "Merknaam",
    category: "schoenen",
    categoryLabel: "Schoenen",
    price: 24.99,
    summary: "Moderne sneakers die comfort en stijl combineren.",
    description: [
      "Moderne sneakers die comfort en stijl perfect combineren.",
      "Geschikt voor dagelijks gebruik en eenvoudig te dragen bij verschillende outfits.",
    ],
    features: [],
    images: ["images/category-shoes.png"],
  },
 
  "tshirt-2399": {
    name: "T-shirt (casual)",
    brand: "Merknaam",
    category: "kleding",
    categoryLabel: "Kleding",
    price: 23.99,
    summary: "Een veelzijdig T-shirt met een casual look.",
    description: [
      "Een veelzijdig T-shirt met een casual look.",
      "Dankzij het eenvoudige design is het perfect voor een ontspannen dag of een complete streetwear-outfit.",
    ],
    features: [],
    images: ["images/tshirt.jpg"],
  },
 
  "hardloop-sneakers-4499": {
    name: "Hardloop sneakers",
    brand: "Merknaam",
    category: "schoenen",
    categoryLabel: "Schoenen",
    price: 44.99,
    summary: "Comfortabele hardloopsneakers voor je dagelijkse beweging.",
    description: [
      "Comfortabele hardloopsneakers voor je dagelijkse beweging.",
      "Ideaal voor een rondje hardlopen, een wandeling of een actieve dag onderweg.",
    ],
    features: [],
    images: ["images/sneakers.jpg"],
  },
 
  "controller-6999": {
    name: "Controller",
    brand: "Merknaam",
    category: "elektronica",
    categoryLabel: "Elektronica",
    price: 69.99,
    summary: "Verbeter je game-ervaring met deze controller.",
    description: [
      "Verbeter je game-ervaring met deze controller.",
      "Perfect voor ontspannen gamesessies en fanatieke speelmomenten met je favoriete games.",
    ],
    features: [],
    images: ["images/category-electronics.png"],
  },
};