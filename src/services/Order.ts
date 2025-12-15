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
  
  // Return evidence (NEW)
  return_evidence_photos?: string[];
  return_evidence_video?: string;
  return_evidence_description?: string;
  return_shipping_provider?: string;
  return_tracking_number?: string;
  return_shipped_at?: string;
  return_received_at?: string;
  qc_notes?: string;
  
  items?: IOrderItem[];
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
// Or request return for delivered orders (with optional evidence)
export interface IReturnRequestData {
  reason?: string;
  evidence_photos?: string[];
  evidence_video?: string;
  evidence_description?: string;
}

export const cancelOrder = async (orderId: number, returnData?: IReturnRequestData): Promise<IOrder> => {
  const response = await api.post(`/orders/${orderId}/cancel`, returnData || {});
  return response.data;
};

// User: Confirm delivery (received order)
export const userConfirmDelivery = async (orderId: number): Promise<{ message: string; order_id: number; status: string; delivered_at: string }> => {
  const response = await api.post(`/orders/${orderId}/confirm-delivery`);
  return response.data;
};

// User: Submit review for delivered order
export interface IReviewRequest {
  rating: number; // 1-5 stars
  comment: string;
  images?: string[];
  video?: string;
}

export const userSubmitReview = async (orderId: number, review: IReviewRequest): Promise<{ message: string; review_id: number }> => {
  const response = await api.post(`/orders/${orderId}/review`, review);
  return response.data;
};

// User: Confirm shipped return with evidence
export interface IReturnEvidenceRequest {
  photos: string[];
  video?: string;
  description: string;
  shipping_provider?: string;
  tracking_number?: string;
}

export const userConfirmShipped = async (orderId: number, evidence: IReturnEvidenceRequest): Promise<IOrder> => {
  const response = await api.post(`/orders/${orderId}/return/ship`, {
    evidence_photos: evidence.photos,
    evidence_description: evidence.description,
    evidence_video: evidence.video,
    shipping_provider: evidence.shipping_provider,
    tracking_number: evidence.tracking_number,
  });
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
  
  // Return evidence (for admin view)
  return_evidence_photos?: string[];
  return_evidence_video?: string;
  return_evidence_description?: string;
  return_shipping_provider?: string;
  return_tracking_number?: string;
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

// Admin: Confirm product received
export const adminConfirmReceived = async (orderId: number, qcNotes?: string): Promise<IOrder> => {
  const response = await api.post(`/admin/orders/${orderId}/return/receive`, { 
    qc_notes: qcNotes || null 
  });
  return response.data;
};

// Admin: Confirm refund after QC
export const adminConfirmRefund = async (orderId: number, refundAmount?: number): Promise<IOrder> => {
  const response = await api.post(`/admin/orders/${orderId}/return/refund`, { refund_amount: refundAmount });
  return response.data;
};

// Admin: Reject QC check
export const adminRejectQC = async (orderId: number, reason: string): Promise<IOrder> => {
  const response = await api.post(`/admin/orders/${orderId}/return/reject-qc`, { reason });
  return response.data;
};

// Export as service object for convenience
export const orderService = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  userConfirmDelivery,
  userSubmitReview,
  userConfirmShipped,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  adminGetPendingReturns,
  adminApproveReturn,
  adminRejectReturn,
  adminConfirmReceived,
  adminConfirmRefund,
  adminRejectQC,
};

export default orderService;
