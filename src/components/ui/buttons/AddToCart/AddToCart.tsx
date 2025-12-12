import React, { useState } from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "../../../../types/types";
import { useAuth } from "../../../../context/AuthContext";
import { useCart } from "../../../../context/CartContext";

interface IAddToCart {
  product: Product;
  size: string;
  color: string;
}

export default function AddToCart({ product, size, color }: IAddToCart) {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  async function handleAddToCart() {
    // Prevent double-click
    if (loading) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      await addToCart(
        {
          product_id: product.id,
          size: size,
          quantity: 1,
        },
        {
          name: product.product_name,
          image: product.image_url,
          slug: product.slug || "",
        }
      );
      setSnackbar({ open: true, message: t("cart.item_added"), severity: "success" });
    } catch (err: any) {
      let message = t("common.error");
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        // FastAPI validation error format: [{type, loc, msg, input}]
        message = detail.map((e: any) => e.msg).join(", ");
      }
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {product ? (
        <Button
          variant="contained"
          onClick={handleAddToCart}
          disabled={loading}
          sx={{
            bgcolor: "#1a1a1a",
            "&:hover": { bgcolor: "#333" },
            py: 1.5,
            px: 4,
            fontWeight: 600,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t("product.add_to_cart")}
        </Button>
      ) : (
        <Button variant="contained" disabled>
          {t("product.out_of_stock")}
        </Button>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
