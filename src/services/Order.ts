import api from "./api";

// Types
export interface IShippingInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
}

export interface ICreateOrderRequest {
  shipping: IShippingInfo;
}

export interface IOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface IOrder {
  id: number;
  user_id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: string;
  note: string | null;
  
  // Payment & Refund info
  payment_intent_id?: string;
  refund_id?: string;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
  
  // Return tracking
  return_requested_at?: string;
  
  items: IOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface IOrderListItem {
  id: number;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
}

// Create order from cart
export const createOrder = async (request: ICreateOrderRequest): Promise<IOrder> => {
  const response = await api.post("/orders", request);
  return response.data;
};

// Get user's orders
export const getMyOrders = async (): Promise<IOrderListItem[]> => {
  const response = await api.get("/orders");
  return response.data;
};

// Get order detail
export const getOrderDetail = async (orderId: number): Promise<IOrder> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Cancel order (user can cancel if status is Pending or Confirmed)
export const cancelOrder = async (orderId: number): Promise<IOrder> => {
  const response = await api.post(`/orders/${orderId}/cancel`);
  return response.data;
};

// =====================
// Admin APIs
// =====================

export interface IAdminOrderListItem {
  id: number;
  user_id: string;
  user_email: string | null;
  shipping_name: string;
  shipping_email: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface IAdminOrdersResponse {
  orders: IAdminOrderListItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

// Get all orders (admin)
export const adminGetOrders = async (
  page: number = 1,
  size: number = 20,
  status?: string
): Promise<IAdminOrdersResponse> => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);
  
  const response = await api.get(`/admin/orders?${params.toString()}`);
  return response.data;
};

// Get order detail (admin)
export const adminGetOrderDetail = async (orderId: number): Promise<IOrder> => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

// Update order status (admin)
export const adminUpdateOrderStatus = async (orderId: number, status: string): Promise<IOrder> => {
  const response = await api.put(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};

// Admin: Get pending return requests
export const adminGetPendingReturns = async (page: number = 1, size: number = 20): Promise<IAdminOrdersResponse> => {
  const response = await api.get('/admin/orders/returns/pending', {
    params: { page, size }
  });
  return response.data;
};

// Admin: Approve return request
export const adminApproveReturn = async (orderId: number): Promise<any> => {
  const response = await api.post(`/admin/orders/${orderId}/returns/approve`);
  return response.data;
};

// Admin: Reject return request
export const adminRejectReturn = async (orderId: number, rejectionReason?: string): Promise<any> => {
  const response = await api.post(`/admin/orders/${orderId}/returns/reject`, null, {
    params: { rejection_reason: rejectionReason }
  });
  return response.data;
};

// Export as service object for convenience
export const orderService = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  adminGetPendingReturns,
  adminApproveReturn,
  adminRejectReturn,
};

export default orderService;
