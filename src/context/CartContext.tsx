import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/Cart";
import { ICart, IAddToCartRequest } from "../services/Cart";

// Debounce delay in ms
const DEBOUNCE_DELAY = 400;

interface CartContextType {
  cart: ICart | null;
  loading: boolean;
  error: string | null;
  // Hydrate cart from backend (on login/refresh)
  hydrateCart: () => Promise<void>;
  // Optimistic add to cart
  addToCart: (request: IAddToCartRequest, productInfo: { name: string; image: string; slug: string }) => Promise<void>;
  // Optimistic update quantity
  updateQuantity: (itemId: number, quantity: number) => void;
  // Optimistic remove item
  removeItem: (itemId: number) => void;
  // Clear cart (after checkout)
  clearCart: () => void;
  // Cart computed values
  itemCount: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper: create empty cart
const emptyCart = (): ICart => ({
  id: 0,
  user_id: "",
  items: [],
  subtotal: 0,
  total: 0,
});

// Helper: recalculate cart totals from items
const recalculateCart = (cart: ICart): ICart => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  return {
    ...cart,
    subtotal,
    total: subtotal, // shipping is free
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timers for quantity updates
  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  // Pending quantity updates to sync
  const pendingUpdates = useRef<Map<number, number>>(new Map());

  // Computed values
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;

  // Phase 3: Hydrate cart from backend
  const hydrateCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err: any) {
      console.error("Failed to hydrate cart:", err);
      setError(err.response?.data?.detail || "Failed to load cart");
      setCart(emptyCart());
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Hydrate on login
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      hydrateCart();
    } else if (!authLoading && !isLoggedIn) {
      setCart(null);
    }
  }, [isLoggedIn, authLoading, hydrateCart]);

  // Phase 4: Debounced sync to backend
  const syncQuantityToBackend = useCallback((itemId: number, quantity: number) => {
    // Clear existing timer
    const existingTimer = debounceTimers.current.get(itemId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Store pending update
    pendingUpdates.current.set(itemId, quantity);

    // Set new debounced timer
    const timer = setTimeout(async () => {
      const qty = pendingUpdates.current.get(itemId);
      if (qty === undefined) return;

      pendingUpdates.current.delete(itemId);
      debounceTimers.current.delete(itemId);

      try {
        await cartApi.updateCartItem(itemId, qty);
        // Don't update state - UI is already correct
      } catch (err: any) {
        console.error("Failed to sync quantity:", err);
        // On error, re-hydrate to get correct state
        hydrateCart();
      }
    }, DEBOUNCE_DELAY);

    debounceTimers.current.set(itemId, timer);
  }, [hydrateCart]);

  // Phase 1: Optimistic add to cart
  const addToCart = useCallback(async (
    request: IAddToCartRequest,
    productInfo: { name: string; image: string; slug: string }
  ) => {
    if (!cart) return;

    // Check if item with same product + size exists
    const existingItem = cart.items.find(
      (item) => item.product_id === request.product_id && item.product_size === request.size
    );

    if (existingItem) {
      // Optimistic: update quantity
      const newQuantity = existingItem.quantity + request.quantity;
      const updatedItems = cart.items.map((item) =>
        item.id === existingItem.id
          ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity }
          : item
      );
      setCart(recalculateCart({ ...cart, items: updatedItems }));

      // Sync to backend (debounced)
      syncQuantityToBackend(existingItem.id, newQuantity);
    } else {
      // New item - need actual backend call to get the item ID
      try {
        const updatedCart = await cartApi.addToCart(request);
        setCart(updatedCart);
      } catch (err: any) {
        console.error("Failed to add to cart:", err);
        setError(err.response?.data?.detail || "Failed to add item");
      }
    }
  }, [cart, syncQuantityToBackend]);

  // Phase 1: Optimistic update quantity
  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (!cart || quantity < 1) return;

    // Optimistic UI update immediately
    const updatedItems = cart.items.map((item) =>
      item.id === itemId
        ? { ...item, quantity, total_price: item.unit_price * quantity }
        : item
    );
    setCart(recalculateCart({ ...cart, items: updatedItems }));

    // Debounced sync to backend
    syncQuantityToBackend(itemId, quantity);
  }, [cart, syncQuantityToBackend]);

  // Phase 1: Optimistic remove item
  const removeItem = useCallback((itemId: number) => {
    if (!cart) return;

    // Cancel any pending update for this item
    const timer = debounceTimers.current.get(itemId);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.current.delete(itemId);
    }
    pendingUpdates.current.delete(itemId);

    // Optimistic UI update
    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    setCart(recalculateCart({ ...cart, items: updatedItems }));

    // Async sync to backend
    cartApi.removeFromCart(itemId).catch((err) => {
      console.error("Failed to remove item:", err);
      hydrateCart();
    });
  }, [cart, hydrateCart]);

  // Clear cart (after checkout)
  const clearCart = useCallback(() => {
    setCart(emptyCart());
    // Backend clear is handled by order creation
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        hydrateCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
