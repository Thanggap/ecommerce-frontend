import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  getProductList,
  deleteProduct,
  updateProduct,
  IUpdateProduct,
} from "../../services/Product";

interface IProduct {
  id: number;
  slug: string;
  product_name: string;
  product_type: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  blurb?: string;
  description?: string;
}

export default function AdminProducts() {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [editForm, setEditForm] = useState<IUpdateProduct>({});

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchProducts();
  }, [isLoggedIn, user, navigate, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProductList({ page: page - 1, limit });
      if (data) {
        setProducts(data);
        // Estimate total pages (if backend returns total count, use that)
        setTotalPages(Math.ceil(data.length / limit) || 1);
      }
    } catch (err: any) {
      setError(t("product.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditProduct(product);
    setEditForm({
      product_name: product.product_name,
      product_type: product.product_type,
      price: product.price,
      sale_price: product.sale_price,
      blurb: product.blurb,
      description: product.description,
      image_url: product.image_url,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editProduct) return;
    try {
      setError("");
      await updateProduct(editProduct.slug, editForm);
      setSuccess(t("product.updated"));
      setEditOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleDeleteClick = (slug: string) => {
    setDeleteSlug(slug);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError("");
      await deleteProduct(deleteSlug);
      setSuccess(t("product.deleted"));
      setDeleteOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">{t("admin.products")}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/add-product")}
        >
          {t("admin.add_product")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>{t("product.name")}</TableCell>
              <TableCell>{t("product.category")}</TableCell>
              <TableCell>{t("product.price")}</TableCell>
              <TableCell>{t("product.sale_price")}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                      />
                    )}
                    {product.product_name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={product.product_type} size="small" />
                </TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>
                  {product.sale_price ? `$${product.sale_price}` : "-"}
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(product.slug)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("admin.edit_product")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("product.name")}
            value={editForm.product_name || ""}
            onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t("product.category")}
            value={editForm.product_type || ""}
            onChange={(e) => setEditForm({ ...editForm, product_type: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label={t("product.price")}
            value={editForm.price || ""}
            onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label={t("product.sale_price")}
            value={editForm.sale_price || ""}
            onChange={(e) => setEditForm({ ...editForm, sale_price: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Blurb"
            value={editForm.blurb || ""}
            onChange={(e) => setEditForm({ ...editForm, blurb: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("product.description")}
            value={editForm.description || ""}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Image URL"
            value={editForm.image_url || ""}
            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t("common.confirm")}</DialogTitle>
        <DialogContent>
          <Typography>{t("common.delete")} product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
