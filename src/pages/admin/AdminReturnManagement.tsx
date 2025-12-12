import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import {
  adminGetPendingReturns,
  adminApproveReturn,
  adminRejectReturn,
  IAdminOrderListItem,
} from '../../services/Order';

const AdminReturnManagement: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  
  const [returns, setReturns] = useState<IAdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  
  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingReturns();
  }, []);

  const fetchPendingReturns = async () => {
    try {
      setLoading(true);
      const data = await adminGetPendingReturns(1, 100);
      setReturns(data.orders);
    } catch (error) {
      console.error('Failed to fetch pending returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: number) => {
    if (!window.confirm('Approve this return request and initiate refund?')) {
      return;
    }

    setProcessing(orderId);
    try {
      await adminApproveReturn(orderId);
      alert('Return approved! Refund initiated successfully.');
      fetchPendingReturns(); // Refresh list
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to approve return';
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedOrderId) return;

    setProcessing(selectedOrderId);
    try {
      await adminRejectReturn(selectedOrderId, rejectionReason);
      alert('Return request rejected.');
      setRejectDialogOpen(false);
      setRejectionReason('');
      fetchPendingReturns(); // Refresh list
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to reject return';
      alert(`Error: ${errorMsg}`);
    } finally {
      setProcessing(null);
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

  const getDaysSinceDelivery = (updatedAt: string) => {
    const deliveredDate = new Date(updatedAt);
    const now = new Date();
    return Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Return Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and process customer return requests
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h3" fontWeight="bold" color="warning.main">
            {returns.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pending Returns
          </Typography>
        </Paper>
      </Box>

      {/* Returns Table */}
      {returns.length === 0 ? (
        <Alert severity="info">No pending return requests at the moment.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Delivered</strong></TableCell>
                <TableCell><strong>Days Since</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returns.map((order) => {
                const daysSince = getDaysSinceDelivery(order.updated_at);
                const isProcessing = processing === order.id;
                
                return (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">#{order.id}</Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">{order.shipping_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.shipping_email}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography fontWeight="bold">
                        {formatPrice(order.total_amount)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.updated_at)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={`${daysSince} day${daysSince !== 1 ? 's' : ''}`}
                        size="small"
                        color={daysSince <= 3 ? 'success' : daysSince <= 5 ? 'warning' : 'error'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label="Return Requested"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Order">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Approve Return">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(order.id)}
                              disabled={isProcessing}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        
                        <Tooltip title="Reject Return">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectClick(order.id)}
                              disabled={isProcessing}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Return Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this return request:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Product condition does not meet return policy..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || processing !== null}
          >
            {processing ? 'Rejecting...' : 'Reject Return'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReturnManagement;
