import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ShoppingBag as EmptyIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { orderService, IOrderListItem } from '../../services/Order';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<IOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('orders.title', 'My Orders')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EmptyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('orders.empty', 'No orders yet')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t('orders.empty_message', "You haven't placed any orders yet.")}
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
          >
            {t('orders.start_shopping', 'Start Shopping')}
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>{t('orders.order_id', 'Order ID')}</strong></TableCell>
                <TableCell><strong>{t('orders.date', 'Date')}</strong></TableCell>
                <TableCell><strong>{t('orders.items', 'Items')}</strong></TableCell>
                <TableCell><strong>{t('orders.total', 'Total')}</strong></TableCell>
                <TableCell><strong>{t('orders.status', 'Status')}</strong></TableCell>
                <TableCell align="center"><strong>{t('orders.actions', 'Actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">#{order.id}</Typography>
                  </TableCell>
                  <TableCell>
                    {order.created_at && formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>{order.items_count} item(s)</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/orders/${order.id}`}
                      size="small"
                      startIcon={<ViewIcon />}
                    >
                      {t('orders.view', 'View')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrdersPage;
