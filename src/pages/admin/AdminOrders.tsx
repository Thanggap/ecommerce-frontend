import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  TablePagination,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Visibility,
  ArrowBack,
  Refresh,
} from "@mui/icons-material";
import {
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  IAdminOrderListItem,
  IOrder,
} from "../../services/Order";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "confirmed", label: "Confirmed", color: "info" },
  { value: "processing", label: "Processing", color: "info" },
  { value: "shipped", label: "Shipped", color: "primary" },
  { value: "delivered", label: "Delivered", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
  { value: "return_requested", label: "Return Requested", color: "warning" },
  { value: "return_approved", label: "Return Approved", color: "info" },
  { value: "return_shipping", label: "Return In Transit", color: "primary" },
  { value: "return_received", label: "Return Received", color: "info" },
  { value: "return_rejected", label: "Return Rejected", color: "error" },
  { value: "refund_pending", label: "Refund Pending", color: "warning" },
  { value: "refunded", label: "Refunded", color: "secondary" },
] as const;

export default function AdminOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<IAdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Status update
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminGetOrders(
        page + 1,
        rowsPerPage,
        statusFilter || undefined
      );
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  const handleViewDetail = async (orderId: number) => {
    try {
      setDetailLoading(true);
      setDialogOpen(true);
      const order = await adminGetOrderDetail(orderId);
      setSelectedOrder(order);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load order");
      setDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    
    try {
      setUpdating(true);
      const updated = await adminUpdateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder(updated);
      
      // Update in list
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    return (
      <Chip
        label={statusConfig?.label || status}
        color={statusConfig?.color || "default"}
        size="small"
      />
    );
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/admin")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          {t("admin.orders", "Order Management")}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            startIcon={<Refresh />}
            onClick={fetchOrders}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
            Total: {total} orders
          </Typography>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.shipping_name}</TableCell>
                  <TableCell>{order.user_email || "-"}</TableCell>
                  <TableCell align="right">{order.items_count}</TableCell>
                  <TableCell align="right">{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetail(order.id)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order #{selectedOrder?.id} Details
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedOrder ? (
            <Grid container spacing={3}>
              {/* Status & Actions */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography fontWeight={600}>Status:</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updating}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {updating && <CircularProgress size={20} />}
                </Box>
              </Grid>

              {/* Shipping Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Shipping Information
                </Typography>
                <Typography>{selectedOrder.shipping_name}</Typography>
                <Typography color="text.secondary">{selectedOrder.shipping_phone}</Typography>
                <Typography color="text.secondary">{selectedOrder.shipping_email}</Typography>
                <Typography color="text.secondary">{selectedOrder.shipping_address}</Typography>
                {selectedOrder.note && (
                  <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                    Note: {selectedOrder.note}
                  </Typography>
                )}
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatPrice(selectedOrder.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>Shipping:</Typography>
                  <Typography>
                    {selectedOrder.shipping_fee === 0 ? "Free" : formatPrice(selectedOrder.shipping_fee)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight={600}>Total:</Typography>
                  <Typography fontWeight={600} color="primary">
                    {formatPrice(selectedOrder.total_amount)}
                  </Typography>
                </Box>
              </Grid>

              {/* Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Items ({selectedOrder.items.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {item.product_image && (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                />
                              )}
                              {item.product_name}
                            </Box>
                          </TableCell>
                          <TableCell>{item.product_size || "-"}</TableCell>
                          <TableCell align="right">{formatPrice(item.unit_price)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{formatPrice(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Timestamps */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(selectedOrder.created_at)}
                  {selectedOrder.updated_at && ` | Updated: ${formatDate(selectedOrder.updated_at)}`}
                </Typography>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
