import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { orderService } from '../../services/Order';
import { paymentService } from '../../services/Payment';
import FDADisclaimer from '../../components/shared/FDADisclaimer';

interface ShippingForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cart, loading: cartLoading, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState<ShippingForm>({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone_number || '',
    email: user?.email || '',
    address: user?.address || '',
    note: '',
  });

  const shippingFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    // Redirect to cart if empty
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [isLoggedIn, cart, cartLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setError(t('checkout.name_required', 'Name is required'));
      return false;
    }
    if (!form.phone.trim()) {
      setError(t('checkout.phone_required', 'Phone is required'));
      return false;
    }
    if (!form.email.trim()) {
      setError(t('checkout.email_required', 'Email is required'));
      return false;
    }
    if (!form.address.trim()) {
      setError(t('checkout.address_required', 'Address is required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    if (submitting) return;
    
    // Check stock availability
    if (cart?.items && cart.items.length > 0) {
      const outOfStockItems = cart.items.filter((item: any) => {
        // Check size stock first if available, otherwise check product stock
        const availableStock = item.product_size_info?.stock_quantity ?? item.product?.stock ?? 0;
        return availableStock < item.quantity;
      });
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map((item: any) => item.product_name).join(', ');
        setError(`Out of stock: ${itemNames}`);
        return;
      }
    }
    
    setSubmitting(true);
    try {
      // Step 1: Create order
      const order = await orderService.createOrder({
        shipping: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          note: form.note || undefined,
        }
      });
      
      // Step 2: Create Stripe checkout session
      const session = await paymentService.createCheckoutSession(order.id);
      
      // Step 3: Clear cart in context (FE state)
      clearCart();
      
      // Step 4: Redirect to Stripe Checkout
      window.location.href = session.checkout_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const cartItems = cart?.items || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('checkout.title', 'Checkout')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Shipping Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                {t('checkout.shipping_info', 'Shipping Information')}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('checkout.name', 'Full Name')}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('checkout.phone', 'Phone Number')}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('checkout.email', 'Email')}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('checkout.address', 'Shipping Address')}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('checkout.note', 'Order Note (optional)')}
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>

              {/* FDA Health Warning for Supplements */}
              <Box sx={{ mt: 3 }}>
                <FDADisclaimer variant="banner" severity="warning" />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <PaymentIcon />}
                  sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                  {submitting 
                    ? t('checkout.processing', 'Processing...') 
                    : t('checkout.proceed_to_payment', 'Proceed to Payment')
                  }
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CartIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                {t('checkout.order_summary', 'Order Summary')}
              </Typography>
            </Box>

            {/* Cart Items */}
            <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #eee' }}>
                  <Box
                    component="img"
                    src={item.product_image || 'https://via.placeholder.com/60'}
                    alt={item.product_name || 'Product'}
                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {item.product_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.product_size && `Size: ${item.product_size} | `}
                      Qty: {item.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatPrice(item.total_price || 0)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">
                {t('checkout.subtotal', 'Subtotal')}
              </Typography>
              <Typography>{formatPrice(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography color="text.secondary">
                {t('checkout.shipping', 'Shipping')}
              </Typography>
              <Typography>
                {shippingFee === 0 ? (
                  <span style={{ color: 'green' }}>FREE</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </Typography>
            </Box>
            {shippingFee > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {t('checkout.free_shipping_hint', 'Free shipping on orders over $100')}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">
                {t('checkout.total', 'Total')}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {formatPrice(total)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
