import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  ShoppingBag as OrderIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { orderService, IOrder } from '../../services/Order';

const OrderSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

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
          {t('order_success.title', 'Order Placed Successfully!')}
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {t('order_success.message', 'Thank you for your purchase. Your order has been confirmed.')}
        </Typography>

        <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            {t('order_success.order_details', 'Order Details')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('order_success.order_number', 'Order Number')}
              </Typography>
              <Typography fontWeight="bold">#{order.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('order_success.status', 'Status')}
              </Typography>
              <Typography 
                fontWeight="bold" 
                sx={{ 
                  color: order.status === 'pending' ? 'warning.main' : 'success.main',
                  textTransform: 'capitalize'
                }}
              >
                {order.status}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {t('order_success.shipping_to', 'Shipping To')}
              </Typography>
              <Typography fontWeight="medium">{order.shipping_name}</Typography>
              <Typography variant="body2">{order.shipping_address}</Typography>
              <Typography variant="body2">{order.shipping_phone}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Order Items */}
          <Typography variant="subtitle2" gutterBottom>
            {t('order_success.items', 'Items')} ({order.items.length})
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
                ${item.total_price.toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">${order.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="body2">
              {order.shipping_fee === 0 ? 'FREE' : `$${order.shipping_fee.toFixed(2)}`}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">Total</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              ${order.total_amount.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            startIcon={<OrderIcon />}
          >
            {t('order_success.view_orders', 'View My Orders')}
          </Button>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<HomeIcon />}
          >
            {t('order_success.continue_shopping', 'Continue Shopping')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;
