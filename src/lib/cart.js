// Cart management using localStorage
export class Cart {
  constructor() {
    this.storageKey = 'ironbox_cart';
  }

  // Get cart from localStorage
  getCart() {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(this.storageKey);
    return cart ? JSON.parse(cart) : [];
  }

  // Save cart to localStorage
  saveCart(cart) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(cart));

    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { cart, count: this.getItemCount() }
    }));
  }

  // Add item to cart
  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.src || '',
        slug: product.slug,
        sku: product.sku || `CONT-${product.id}`,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    return cart;
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }

    return cart;
  }

  // Remove item from cart
  removeItem(productId) {
    const cart = this.getCart();
    const filteredCart = cart.filter(item => item.id !== productId);
    this.saveCart(filteredCart);
    return filteredCart;
  }

  // Clear entire cart
  clearCart() {
    this.saveCart([]);
    return [];
  }

  // Get total item count
  getItemCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Get cart total price
  getTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  }
}

// Create singleton instance
export const cart = new Cart();
