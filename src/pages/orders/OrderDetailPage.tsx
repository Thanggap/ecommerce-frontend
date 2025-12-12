import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { orderService, IOrder } from '../../services/Order';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    case 'return_requested': return 'warning';
    case 'return_approved': return 'info';
    case 'refund_pending': return 'warning';
    case 'refunded': return 'secondary';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'processing': return 'Processing';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'return_requested': return 'Return Requested';
    case 'return_approved': return 'Return Approved';
    case 'refund_pending': return 'Refund Pending';
    case 'refunded': return 'Refunded';
    default: return status;
  }
};

const OrderDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(parseInt(orderId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async (id: number) => {
    try {
      const data = await orderService.getOrderDetail(id);
      setOrder(data);
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      const updatedOrder = await orderService.cancelOrder(order.id);
      setOrder(updatedOrder);
      alert('Order cancelled successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to cancel order';
      alert(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = () => {
    if (!order) return false;
    // Can only cancel PENDING or CONFIRMED orders
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canRequestReturn = () => {
    if (!order) return false;
    // Can only return DELIVERED orders
    if (order.status !== 'delivered') return false;
    
    // Check 7-day window
    const deliveredDate = new Date(order.updated_at);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= 7;
  };

  const getCancelButtonText = () => {
    if (order?.status === 'pending') return 'Cancel Order';
    if (order?.status === 'confirmed') return 'Cancel & Refund';
    if (order?.status === 'delivered') return 'Request Return';
    return 'Cancel Order';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
        <Button component={Link} to="/orders" startIcon={<BackIcon />} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button component={Link} to="/orders" startIcon={<BackIcon />} sx={{ mr: 2 }}>
          {t('orders.back', 'Back')}
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
          {t('orders.order_detail', 'Order')} #{order.id}
        </Typography>
        <Chip
          label={getStatusLabel(order.status)}
          color={getStatusColor(order.status) as any}
          sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={8}>
          {/* Items */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('orders.items', 'Items')} ({order.items.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  py: 2,
                  borderBottom: '1px solid #eee',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  component="img"
                  src={item.product_image || 'https://via.placeholder.com/80'}
                  alt={item.product_name}
                  sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography fontWeight="medium">{item.product_name}</Typography>
                  {item.product_size && (
                    <Typography variant="body2" color="text.secondary">
                      Size: {item.product_size}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(item.unit_price)} x {item.quantity}
                  </Typography>
                </Box>
                <Typography fontWeight="bold">
                  {formatPrice(item.total_price)}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Shipping Info */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                {t('orders.shipping_info', 'Shipping Information')}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography fontWeight="medium">{order.shipping_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography fontWeight="medium">{order.shipping_phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography fontWeight="medium">{order.shipping_email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography fontWeight="medium">{order.shipping_address}</Typography>
              </Grid>
              {order.note && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Note</Typography>
                  <Typography>{order.note}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              {t('orders.summary', 'Order Summary')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatPrice(order.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography>
                {order.shipping_fee === 0 ? (
                  <span style={{ color: 'green' }}>FREE</span>
                ) : (
                  formatPrice(order.shipping_fee)
                )}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {formatPrice(order.total_amount)}
              </Typography>
            </Box>

            {order.created_at && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Order placed: {formatDate(order.created_at)}
                </Typography>
              </Box>
            )}

            {/* Return Request Info */}
            {order.return_requested_at && order.status === 'return_requested' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Return Request Pending
                </Typography>
                <Divider sx={{ mb: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Requested At:</strong> {formatDate(order.return_requested_at)}
                </Typography>
                
                {order.refund_reason && (
                  <Typography variant="body2">
                    <strong>Reason:</strong> {order.refund_reason}
                  </Typography>
                )}
                
                <Alert severity="info" sx={{ mt: 1 }}>
                  Your return request is being reviewed by admin.
                </Alert>
              </Box>
            )}

            {/* Cancel/Return Order Button */}
            {(canCancelOrder() || canRequestReturn()) && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleCancelOrder}
                disabled={cancelling}
                sx={{ mt: 2 }}
              >
                {cancelling ? 'Processing...' : getCancelButtonText()}
              </Button>
            )}

            {/* Status Messages */}
            {order.status === 'return_requested' && !order.return_requested_at && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Return request pending admin approval.
              </Alert>
            )}
            
            {order.status === 'return_approved' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Return approved! Refund is being processed.
              </Alert>
            )}
            
            {order.status === 'refund_pending' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Your refund is being processed. It may take 5-10 business days to appear in your account.
              </Alert>
            )}
            
            {order.status === 'refunded' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                This order has been refunded successfully.
              </Alert>
            )}
            
            {order.status === 'processing' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Order is being processed. Contact support to cancel.
              </Alert>
            )}
            
            {['shipped', 'delivered'].includes(order.status) && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Cannot cancel {order.status} orders. Contact support for returns.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailPage;
