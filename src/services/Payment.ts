import api from "./api";

// Types
export interface ICreateCheckoutRequest {
  order_id: number;
}

export interface ICheckoutSession {
  checkout_url: string;
  session_id: string;
}

// Create Stripe checkout session for an order
export const createCheckoutSession = async (orderId: number): Promise<ICheckoutSession> => {
  const response = await api.post("/payments/create-session", { order_id: orderId });
  return response.data;
};

// Payment service object for consistency
export const paymentService = {
  createCheckoutSession,
};

export default paymentService;
