import api from "./api";

// Types
export interface ICartItem {
  id: number;
  product_id: number;
  product_name: string | null;
  product_image: string | null;
  product_slug: string | null;
  product_size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ICart {
  id: number;
  user_id: string;
  items: ICartItem[];
  subtotal: number;
  total: number;
}

export interface IAddToCartRequest {
  product_id: number;
  size: string;
  quantity: number;
}

export interface IStatusResponse {
  status: string;
}

// Get current user's cart (for hydration on login/refresh)
export const getCart = async (): Promise<ICart> => {
  const response = await api.get("/cart");
  return response.data;
};

// Add item to cart - returns full cart (FE needs new item ID)
export const addToCart = async (request: IAddToCartRequest): Promise<ICart> => {
  const response = await api.post("/cart", request);
  return response.data;
};

// Update cart item quantity - returns status only (optimistic UI)
export const updateCartItem = async (cartItemId: number, quantity: number): Promise<IStatusResponse> => {
  const response = await api.put(`/cart/${cartItemId}`, { quantity });
  return response.data;
};

// Remove item from cart - returns status only (optimistic UI)
export const removeFromCart = async (cartItemId: number): Promise<IStatusResponse> => {
  const response = await api.delete(`/cart/${cartItemId}`);
  return response.data;
};

// Clear entire cart - returns status only
export const clearCart = async (): Promise<IStatusResponse> => {
  const response = await api.delete("/cart");
  return response.data;
};

// Export as service object for convenience
export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default cartService;