import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  ShoppingCart as CartIcon,
  Home as HomeIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const PaymentCancelPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('order_id');

  const handleRetryPayment = () => {
    if (orderId) {
      // Could retry payment for the same order
      // For now, just go to orders to see the pending order
      navigate('/orders');
    } else {
      navigate('/cart');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {/* Cancel Icon */}
        <Box sx={{ mb: 3 }}>
          <CancelIcon sx={{ fontSize: 80, color: 'warning.main' }} />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('payment_cancel.title', 'Payment Cancelled')}
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {t('payment_cancel.message', 'Your payment was cancelled. No charges were made to your account.')}
        </Typography>

        {orderId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('payment_cancel.order_note', 'Your order #{{orderId}} is saved. You can complete the payment later from your orders page.', { orderId })}
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            onClick={handleRetryPayment}
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RetryIcon />}
            sx={{ minWidth: 250 }}
          >
            {t('payment_cancel.retry', 'Try Again')}
          </Button>
          
          <Button
            component={Link}
            to="/cart"
            variant="outlined"
            startIcon={<CartIcon />}
            sx={{ minWidth: 250 }}
          >
            {t('payment_cancel.back_to_cart', 'Back to Cart')}
          </Button>
          
          <Button
            component={Link}
            to="/"
            variant="text"
            startIcon={<HomeIcon />}
          >
            {t('payment_cancel.continue_shopping', 'Continue Shopping')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentCancelPage;
