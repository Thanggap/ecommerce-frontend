import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  ShoppingBag as OrderIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { orderService, IOrder } from '../../services/Order';
import { useCurrency } from '../../context/CurrencyContext';

const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();
  
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Get order_id and session_id from URL params
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (orderId) {
      fetchOrder(parseInt(orderId));
    } else {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async (id: number) => {
    try {
      const data = await orderService.getOrderDetail(id);
      setOrder(data);
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <SuccessIcon sx={{ fontSize: 80, color: 'success.main' }} />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('payment_success.title', 'Payment Successful!')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Chip 
            icon={<PaymentIcon />} 
            label={t('payment_success.paid', 'Paid')} 
            color="success" 
          />
        </Box>

        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {t('payment_success.message', 'Thank you for your payment. Your order is being processed.')}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            {t('payment_success.order_details', 'Order Details')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('payment_success.order_number', 'Order Number')}
              </Typography>
              <Typography fontWeight="bold">#{order.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('payment_success.status', 'Status')}
              </Typography>
              <Typography 
                fontWeight="bold" 
                sx={{ 
                  color: order.status === 'confirmed' ? 'success.main' : 'warning.main',
                  textTransform: 'capitalize'
                }}
              >
                {order.status === 'confirmed' ? 'Paid' : order.status}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {t('payment_success.shipping_to', 'Shipping To')}
              </Typography>
              <Typography fontWeight="medium">{order.shipping_name}</Typography>
              <Typography variant="body2">{order.shipping_address}</Typography>
              <Typography variant="body2">{order.shipping_phone}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Order Items */}
          <Typography variant="subtitle2" gutterBottom>
            {t('payment_success.items', 'Items')} ({order.items.length})
          </Typography>
          {order.items.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                py: 0.5 
              }}
            >
              <Typography variant="body2">
                {item.product_name} {item.product_size && `(${item.product_size})`} x {item.quantity}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPrice(item.total_price)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2">
              {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">Total</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatPrice(order.total_amount)}
            </Typography>
          </Box>
        </Paper>

        {/* Session ID (for reference) */}
        {sessionId && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            Transaction ID: {sessionId.substring(0, 20)}...
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            startIcon={<OrderIcon />}
          >
            {t('payment_success.view_orders', 'View My Orders')}
          </Button>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<HomeIcon />}
          >
            {t('payment_success.continue_shopping', 'Continue Shopping')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
