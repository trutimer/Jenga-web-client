import { ref, computed, watch } from 'vue';
import type { Product, PurchaseOrderCartItem } from '../models/types';
import { showToast } from '../services/toastService';

const STORAGE_KEY = 'dukapro_po_cart';

// Load initial state from localStorage
const loadSavedCart = (): PurchaseOrderCartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved PO cart:', e);
  }
  return [];
};

// Global reactive cart state
const cartItems = ref<PurchaseOrderCartItem[]>(loadSavedCart());
const showEmptyCartModal = ref(false);

// Watch for changes and persist
watch(
  cartItems,
  (newItems) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to persist PO cart:', e);
    }
  },
  { deep: true }
);

export function usePurchaseOrderCart() {
  /**
   * Add a product to the PO cart.
   * If already present, increments quantity.
   */
  const addToCart = (product: Product, quantity = 1, unitCost?: number) => {
    const existing = cartItems.value.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
      showToast(`Updated ${product.name} quantity in PO Cart (${existing.quantity})`, 'success');
    } else {
      const initialCost = unitCost !== undefined ? unitCost : (product.cost || 0);
      cartItems.value.push({
        product,
        quantity: Math.max(1, quantity),
        unitCost: initialCost,
        isWholesale: false,
        notes: ''
      });
      showToast(`Added ${product.name} to Purchase Order Cart`, 'success');
    }
  };

  /**
   * Remove a product from the cart by its ID
   */
  const removeFromCart = (productId: string) => {
    cartItems.value = cartItems.value.filter(item => item.product.id !== productId);
  };

  /**
   * Update the quantity of a specific product in the cart
   */
  const updateQuantity = (productId: string, quantity: number) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  };

  /**
   * Increment quantity by 1
   */
  const incrementQuantity = (productId: string) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item) {
      item.quantity += 1;
    }
  };

  /**
   * Decrement quantity by 1 (minimum 1)
   */
  const decrementQuantity = (productId: string) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
    }
  };

  /**
   * Update the estimated unit cost for a specific product
   */
  const updateUnitCost = (productId: string, unitCost: number) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item) {
      item.unitCost = Math.max(0, unitCost);
    }
  };

  /**
   * Toggle wholesale pricing mode for line item
   */
  const toggleWholesale = (productId: string, isWholesale: boolean) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item) {
      item.isWholesale = isWholesale;
    }
  };

  /**
   * Update line item note
   */
  const updateNotes = (productId: string, notes: string) => {
    const item = cartItems.value.find(i => i.product.id === productId);
    if (item) {
      item.notes = notes;
    }
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    cartItems.value = [];
  };

  /**
   * Check if a product is already in the cart
   */
  const isInCart = (productId: string): boolean => {
    return cartItems.value.some(item => item.product.id === productId);
  };

  /**
   * Get quantity of a product currently in the cart
   */
  const getItemQuantity = (productId: string): number => {
    const item = cartItems.value.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Distinct items count for the badge
  const cartCount = computed(() => cartItems.value.length);

  // Total units across all items
  const cartTotalUnits = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Total estimated order cost
  const cartTotalCost = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  );

  // Is cart empty
  const isCartEmpty = computed(() => cartItems.value.length === 0);

  return {
    cartItems,
    cartCount,
    cartTotalUnits,
    cartTotalCost,
    isCartEmpty,
    showEmptyCartModal,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    updateUnitCost,
    toggleWholesale,
    updateNotes,
    clearCart,
    isInCart,
    getItemQuantity
  };
}
