const searchInput = document.querySelector('.nav__input input');
const products = document.querySelectorAll('.product-card');

searchInput.addEventListener('input', () => {
  const searchValue = searchInput.value.toLowerCase().trim();

  products.forEach((product) => {
    const productText = product.textContent.toLowerCase();

    product.style.display = productText.includes(searchValue)
      ? '' : 'none';
  });
});
