# Webshop

A Dutch-language webshop (home, shop, product page, cart with wishlist).

## Run it

Open the folder in VS Code and start **Live Server** (port 5502, set in `.vscode/settings.json`).
The products are loaded with `fetch()`, so opening the HTML files directly from disk will not work.

## Folder structure

```
index.html            Home page
cart.html             Cart and wishlist
product.html          One page for every product (product.html?id=...)
pages/
  categories.html     Shop page with category filter and search
assets/
  css/                One stylesheet per page, plus favorites.css and sale.css (shared)
  data/
    products.json     All products and the flash sale end date
  js/
    core/             Used on every page: products-loader, sale, cart-expiry, favorites
    home/             index.html: script.js, home-products.js
    shop/             categories.html: shop-products, searchbar, category-filter
    cart/             cart.html: cart, wishlist
    product/          product.html: product.js
images/               Product photos, category images, logo
.vscode/              Editor settings (Live Server port)
```

## How the pages load their scripts

Every page loads `cart-expiry.js` first (plain `<script>`), then `products-loader.js`.
The loader fetches `assets/data/products.json`, fills `window.PRODUCTS` and `window.FLASH_SALE`,
and only then loads the scripts listed in its `data-then` attribute, in that order.

Adding a product = adding an entry to `assets/data/products.json` (and its photo to `images/`).
