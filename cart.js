// cart.js - shared cart helpers (localStorage)

// Get cart array
export function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Save cart array
export function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart badge count
export function updateCartCount(countId = "cart-count") {
  const el = document.getElementById(countId);
  if (!el) return;
  const cart = getCart();
  el.innerText = cart.length;
}

/**
 * addToCart supports:
 *  - addToCart(name, price)
 *  - addToCart(name, price, image)
 */
export function addToCart(name, price, image = null) {
  const cart = getCart();
  const item = { name, price };

  if (image) item.image = image;

  cart.push(item);
  setCart(cart);
  updateCartCount();
  alert(`${name} added to cart!`);
}

// Expose to global so onclick="addToCart(...)" still works
window.addToCart = addToCart;
window.updateCartCount = () => updateCartCount();