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
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalShipping as ShippingIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { orderService, IOrder } from '../../services/Order';
import api from '../../services/api';

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
    case 'return_shipping': return 'primary';
    case 'return_received': return 'info';
    case 'return_rejected': return 'error';
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
    case 'return_shipping': return 'Return In Transit';
    case 'return_received': return 'Return Received';
    case 'return_rejected': return 'Return Rejected';
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
  
  // Evidence upload state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [description, setDescription] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

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

  const handlePhotoFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    setPhotoFiles([...photoFiles, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    if (uploadedPhotoUrls[index]) {
      setUploadedPhotoUrls(uploadedPhotoUrls.filter((_, i) => i !== index));
    }
  };

  const handleUploadPhotos = async () => {
    if (photoFiles.length === 0) return;

    setUploadingPhotos(true);
    const urls: string[] = [];

    try {
      for (const file of photoFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/return-evidence', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        urls.push(response.data.url);
      }

      setUploadedPhotoUrls(urls);
      alert('Photos uploaded successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to upload photos';
      alert(errorMsg);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size must be less than 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleUploadVideo = async () => {
    if (!videoFile) return;

    setUploadingVideo(true);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await api.post('/upload/return-evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedVideoUrl(response.data.url);
      alert('Video uploaded successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to upload video';
      alert(errorMsg);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!order) return;

    // Validate
    if (uploadedPhotoUrls.length === 0) {
      alert('Please upload at least 1 photo');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description of the product condition');
      return;
    }

    setSubmittingEvidence(true);
    try {
      const updatedOrder = await orderService.userConfirmShipped(order.id, {
        photos: uploadedPhotoUrls,
        video: uploadedVideoUrl || undefined,
        description: description.trim(),
      });
      
      setOrder(updatedOrder);
      alert('Evidence submitted successfully! Your return is now in transit.');
      
      // Clear form
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setUploadedPhotoUrls([]);
      setVideoFile(null);
      setVideoPreview('');
      setUploadedVideoUrl('');
      setDescription('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to submit evidence';
      alert(errorMsg);
    } finally {
      setSubmittingEvidence(false);
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
              <>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Return approved by admin! Please upload photos/video of the product and confirm shipment to proceed with the return.
                </Alert>
                
                {/* Evidence Upload Form */}
                <Paper sx={{ mt: 2, p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Upload Product Evidence
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Product Photos */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Product Photos (1-5 required) *
                    </Typography>
                    
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handlePhotoFilesChange}
                      style={{ marginBottom: '16px', display: 'block' }}
                    />

                    {photoFiles.length > 0 && uploadedPhotoUrls.length === 0 && (
                      <Button
                        variant="contained"
                        onClick={handleUploadPhotos}
                        disabled={uploadingPhotos}
                        sx={{ mb: 2 }}
                      >
                        {uploadingPhotos ? <CircularProgress size={24} /> : 'Upload Photos'}
                      </Button>
                    )}

                    {uploadedPhotoUrls.length > 0 && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {uploadedPhotoUrls.length} photo(s) uploaded successfully!
                      </Alert>
                    )}

                    {/* Photo Previews */}
                    {photoPreviews.length > 0 && (
                      <Grid container spacing={2}>
                        {photoPreviews.map((preview, index) => (
                          <Grid item xs={6} sm={4} key={index}>
                            <Box sx={{ position: 'relative' }}>
                              <Box
                                component="img"
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 150,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '1px solid #ddd',
                                }}
                              />
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleRemovePhoto(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  minWidth: 'auto',
                                  bgcolor: 'white',
                                  '&:hover': { bgcolor: 'error.light', color: 'white' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                  
                  {/* Product Video */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Product Video (optional)
                    </Typography>
                    
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileChange}
                      style={{ marginBottom: '16px', display: 'block' }}
                    />

                    {videoFile && !uploadedVideoUrl && (
                      <Button
                        variant="contained"
                        onClick={handleUploadVideo}
                        disabled={uploadingVideo}
                        sx={{ mb: 2 }}
                      >
                        {uploadingVideo ? <CircularProgress size={24} /> : 'Upload Video'}
                      </Button>
                    )}

                    {uploadedVideoUrl && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Video uploaded successfully!
                      </Alert>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                      <Box
                        component="video"
                        src={videoPreview}
                        controls
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                        }}
                      />
                    )}
                  </Box>
                  
                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Product Condition *
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Describe the product condition, any defects, damages, etc."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Box>
                  
                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleSubmitEvidence}
                    disabled={submittingEvidence || uploadedPhotoUrls.length === 0 || !description.trim()}
                  >
                    {submittingEvidence ? 'Submitting...' : 'Confirm Shipment & Submit Evidence'}
                  </Button>
                </Paper>
              </>
            )}
            
            {order.status === 'return_shipping' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Your return shipment is in transit. Admin will confirm receipt and inspect the product before processing your refund.
              </Alert>
            )}
            
            {order.status === 'return_received' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Admin has received your return and is performing quality check. Refund will be processed once QC is approved.
              </Alert>
            )}
            
            {order.status === 'return_rejected' && order.qc_notes && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>Return Rejected:</strong> {order.qc_notes}
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
