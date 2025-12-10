import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  IconButton,
  Divider,
  Skeleton,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import {
  Home,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { ICartItem } from "../../services/Cart";
import { getImageUrl } from "../../utils/imageUtils";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { cart, loading, error, updateQuantity, removeItem, subtotal, total } = useCart();
  const { formatPrice } = useCurrency();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, authLoading, navigate]);

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: "white", py: 2, borderBottom: "1px solid #eee" }}>
        <Container maxWidth="lg">
          <Breadcrumbs>
            <Link
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              {t("nav.home")}
            </Link>
            <Typography color="text.primary">{t("cart.title")}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          {t("cart.title")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {[1, 2, 3].map((i) => (
                <Paper key={i} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={30} />
                      <Skeleton variant="text" width="30%" />
                      <Skeleton variant="text" width="20%" />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        ) : !cart || cart.items.length === 0 ? (
          // Empty cart
          <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
            <ShoppingCart sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {t("cart.empty")}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t("cart.empty_message")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 4,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {t("cart.continue_shopping")}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                {cart.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <CartItemRow
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      formatPrice={formatPrice}
                    />
                    {index < cart.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Paper>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, position: "sticky", top: 20 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  {t("cart.order_summary")}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography color="text.secondary">
                    {t("cart.subtotal")} ({cart.items.length} {t("cart.items")})
                  </Typography>
                  <Typography fontWeight={600}>{formatPrice(subtotal)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography color="text.secondary">{t("cart.shipping")}</Typography>
                  <Typography color="success.main" fontWeight={600}>
                    {t("cart.free")}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {t("cart.total")}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatPrice(total)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/checkout")}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {t("cart.checkout")}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate("/products")}
                  sx={{ mt: 2, textTransform: "none" }}
                >
                  {t("cart.continue_shopping")}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

// Cart Item Row Component - No longer needs updating state (optimistic UI handles it)
interface CartItemRowProps {
  item: ICartItem;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  formatPrice: (price: number) => string;
}

function CartItemRow({ item, onUpdateQuantity, onRemove, formatPrice }: CartItemRowProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        gap: 3,
        transition: "opacity 0.2s",
      }}
    >
      {/* Product Image */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
          cursor: "pointer",
        }}
        onClick={() => item.product_slug && navigate(`/products/${item.product_slug}`)}
      >
        <img
          src={getImageUrl(item.product_image)}
          alt={item.product_name || "Product"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Product Info */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
          onClick={() => item.product_slug && navigate(`/products/${item.product_slug}`)}
        >
          {item.product_name || "Unknown Product"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Size: {item.product_size}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {formatPrice(item.unit_price)} each
        </Typography>

        {/* Quantity Controls - Instant response, no loading state */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            sx={{ border: "1px solid #ddd" }}
          >
            <Remove fontSize="small" />
          </IconButton>
          <Typography sx={{ minWidth: 40, textAlign: "center", fontWeight: 600 }}>
            {item.quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            sx={{ border: "1px solid #ddd" }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Price & Remove */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          {formatPrice(item.unit_price * item.quantity)}
        </Typography>
        <IconButton color="error" onClick={() => onRemove(item.id)}>
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
}
