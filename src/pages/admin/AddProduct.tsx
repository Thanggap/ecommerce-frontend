import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { uploadProductImage, createProduct, ICreateProduct } from "../../services/Product";
import { PRODUCT_CATEGORIES } from "../../constants";

const PRODUCT_TYPES = PRODUCT_CATEGORIES;

export default function AddProduct() {
  const [formData, setFormData] = useState<ICreateProduct>({
    slug: "",
    product_type: "",
    product_name: "",
    price: 0,
    stock: 0,
    blurb: "",
    description: "",
    image_url: "",
    sale_price: undefined,
  });

  // Supplement-specific fields
  const [supplementInfo, setSupplementInfo] = useState({
    serving_size: "",
    ingredients: "",
    usage_instructions: "",
    warnings: "",
    expiry_date: "",
    manufacturer: "",
    country_of_origin: "",
    certification: "",
  });

  // Product sizes - dynamic list
  const [sizes, setSizes] = useState<Array<{ size: string; stock_quantity: number }>>([]);
  const [newSize, setNewSize] = useState({ size: "30", stock_quantity: 0 });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    clearFieldError(name);
    
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "sale_price", "stock"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSupplementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    clearFieldError(name);
    
    setSupplementInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      product_type: e.target.value,
    }));
  };

  const generateSlug = () => {
    const slug = formData.product_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    setUploading(true);
    setError("");

    const result = await uploadProductImage(imageFile);
    
    if (result && result.url) {
      setFormData((prev) => ({
        ...prev,
        image_url: result.url,
      }));
      setSuccess(false);
    } else {
      setError("Failed to upload image");
    }

    setUploading(false);
  };

  const handleAddSize = () => {
    if (newSize.stock_quantity <= 0) {
      setError("Stock quantity must be greater than 0");
      return;
    }
    
    // Check if size already exists
    if (sizes.some(s => s.size === `${newSize.size} servings`)) {
      setError(`${newSize.size} servings size already added`);
      return;
    }
    
    setSizes(prev => [...prev, { 
      size: `${newSize.size} servings`, 
      stock_quantity: newSize.stock_quantity 
    }]);
    setNewSize({ size: "30", stock_quantity: 0 });
    setError("");
  };

  const handleRemoveSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Product Name validation
    if (!formData.product_name.trim()) {
      errors.product_name = "Product name is required";
    } else if (formData.product_name.length < 3) {
      errors.product_name = "Product name must be at least 3 characters";
    } else if (formData.product_name.length > 200) {
      errors.product_name = "Product name must not exceed 200 characters";
    }
    
    // Slug validation
    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.slug.length < 3) {
      errors.slug = "Slug must be at least 3 characters";
    } else if (formData.slug.length > 200) {
      errors.slug = "Slug must not exceed 200 characters";
    }
    
    // Product Type validation
    if (!formData.product_type) {
      errors.product_type = "Product type is required";
    }
    
    // Blurb validation
    if (!formData.blurb?.trim()) {
      errors.blurb = "Short description is required";
    } else if (formData.blurb.length < 10) {
      errors.blurb = "Short description must be at least 10 characters";
    } else if (formData.blurb.length > 500) {
      errors.blurb = "Short description must not exceed 500 characters";
    }
    
    // Description validation (optional but if provided)
    if (formData.description && formData.description.length > 5000) {
      errors.description = "Full description must not exceed 5000 characters";
    }
    
    // Image validation
    if (!formData.image_url) {
      errors.image_url = "Product image is required";
    }
    
    // Price validations
    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    } else if (formData.price > 999999999) {
      errors.price = "Price is too large";
    }
    
    // Sale price validation
    if (formData.sale_price !== undefined && formData.sale_price !== null) {
      if (formData.sale_price < 0) {
        errors.sale_price = "Sale price cannot be negative";
      } else if (formData.sale_price > formData.price) {
        errors.sale_price = "Sale price cannot be higher than regular price";
      } else if (formData.sale_price > 999999999) {
        errors.sale_price = "Sale price is too large";
      }
    }
    
    // Stock validation
    if (formData.stock < 0) {
      errors.stock = "Stock cannot be negative";
    } else if (!Number.isInteger(formData.stock)) {
      errors.stock = "Stock must be a whole number";
    } else if (formData.stock > 999999) {
      errors.stock = "Stock quantity is too large";
    }
    
    // Manufacturer validation (optional but if provided)
    if (supplementInfo.manufacturer && supplementInfo.manufacturer.length > 200) {
      errors.manufacturer = "Manufacturer name must not exceed 200 characters";
    }
    
    // Country validation (optional but if provided)
    if (supplementInfo.country_of_origin && supplementInfo.country_of_origin.length > 100) {
      errors.country_of_origin = "Country name must not exceed 100 characters";
    }
    
    // Serving size validation (optional but if provided)
    if (supplementInfo.serving_size && supplementInfo.serving_size.length > 100) {
      errors.serving_size = "Serving size must not exceed 100 characters";
    }
    
    // Ingredients validation (optional but if provided)
    if (supplementInfo.ingredients && supplementInfo.ingredients.length > 2000) {
      errors.ingredients = "Ingredients list must not exceed 2000 characters";
    }
    
    // Usage instructions validation (optional but if provided)
    if (supplementInfo.usage_instructions && supplementInfo.usage_instructions.length > 1000) {
      errors.usage_instructions = "Usage instructions must not exceed 1000 characters";
    }
    
    // Warnings validation (optional but if provided)
    if (supplementInfo.warnings && supplementInfo.warnings.length > 1000) {
      errors.warnings = "Warnings must not exceed 1000 characters";
    }
    
    // Certifications validation (optional but if provided)
    if (supplementInfo.certification && supplementInfo.certification.length > 300) {
      errors.certification = "Certifications must not exceed 300 characters";
    }
    
    // Expiry date validation
    if (supplementInfo.expiry_date) {
      const expiryDate = new Date(supplementInfo.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(expiryDate.getTime())) {
        errors.expiry_date = "Invalid date format";
      } else if (expiryDate <= today) {
        errors.expiry_date = "Expiry date must be in the future";
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fix the errors in the form before submitting");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Clear any previous errors
    setError("");
    setFieldErrors({});

    setSubmitting(true);

    const productData: any = {
      slug: formData.slug,
      product_type: formData.product_type,
      product_name: formData.product_name,
      price: formData.price,
      stock: formData.stock,
      blurb: formData.blurb,
      description: formData.description || "",
      image_url: formData.image_url,
    };

    if (formData.sale_price !== undefined && formData.sale_price > 0) {
      productData.sale_price = formData.sale_price;
    }

    // Add supplement info (only if provided)
    if (supplementInfo.serving_size) productData.serving_size = supplementInfo.serving_size;
    if (supplementInfo.ingredients) productData.ingredients = supplementInfo.ingredients;
    if (supplementInfo.usage_instructions) productData.usage_instructions = supplementInfo.usage_instructions;
    if (supplementInfo.warnings) productData.warnings = supplementInfo.warnings;
    if (supplementInfo.expiry_date) productData.expiry_date = supplementInfo.expiry_date;
    if (supplementInfo.manufacturer) productData.manufacturer = supplementInfo.manufacturer;
    if (supplementInfo.country_of_origin) productData.country_of_origin = supplementInfo.country_of_origin;
    if (supplementInfo.certification) productData.certification = supplementInfo.certification;

    // Add sizes if provided
    if (sizes.length > 0) {
      productData.sizes = sizes;
    }

    const result = await createProduct(productData);

    if (result) {
      setSuccess(true);
      // Reset form
      setFormData({
        slug: "",
        product_type: "",
        product_name: "",
        price: 0,
        stock: 0,
        blurb: "",
        description: "",
        image_url: "",
        sale_price: undefined,
      });
      setSupplementInfo({
        serving_size: "",
        ingredients: "",
        usage_instructions: "",
        warnings: "",
        expiry_date: "",
        manufacturer: "",
        country_of_origin: "",
        certification: "",
      });
      setSizes([]);
      setNewSize({ size: "30", stock_quantity: 0 });
      setImageFile(null);
      setImagePreview("");
      
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError("Failed to create product");
    }

    setSubmitting(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Add New Supplement Product
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          Product created successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            
            {/* Basic Information */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
              Basic Information
            </Typography>

            <TextField
              fullWidth
              required
              label="Product Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
              placeholder="e.g., Omega-3 Fish Oil 1000mg"
              error={!!fieldErrors.product_name}
              helperText={fieldErrors.product_name || "3-200 characters"}
              inputProps={{ maxLength: 200 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                required
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                helperText={fieldErrors.slug || "URL-friendly identifier (SEO) - lowercase, numbers, hyphens only"}
                placeholder="omega-3-fish-oil-1000mg"
                error={!!fieldErrors.slug}
                inputProps={{ maxLength: 200, pattern: "[a-z0-9-]+" }}
              />
              <Button
                variant="outlined"
                onClick={generateSlug}
                sx={{ whiteSpace: "nowrap", minWidth: 140 }}
              >
                Auto Generate
              </Button>
            </Box>

            <FormControl fullWidth required sx={{ mb: 3 }} error={!!fieldErrors.product_type}>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.product_type}
                label="Product Type"
                onChange={handleTypeChange}
              >
                {PRODUCT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.product_type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {fieldErrors.product_type}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={supplementInfo.manufacturer}
              onChange={handleSupplementChange}
              sx={{ mb: 3 }}
              placeholder="e.g., Nature's Bounty, NOW Foods"
              error={!!fieldErrors.manufacturer}
              helperText={fieldErrors.manufacturer || "Optional - max 200 characters"}
              inputProps={{ maxLength: 200 }}
            />

            <TextField
              fullWidth
              label="Country of Origin"
              name="country_of_origin"
              value={supplementInfo.country_of_origin}
              onChange={handleSupplementChange}
              sx={{ mb: 3 }}
              placeholder="e.g., USA, Vietnam, Germany"
              error={!!fieldErrors.country_of_origin}
              helperText={fieldErrors.country_of_origin || "Optional - max 100 characters"}
              inputProps={{ maxLength: 100 }}
            />

            <Divider sx={{ my: 4 }} />

            {/* Supplement Facts */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
              Supplement Facts
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Serving Size"
                name="serving_size"
                value={supplementInfo.serving_size}
                onChange={handleSupplementChange}
                placeholder="e.g., 2 capsules, 1 scoop (30g)"
                error={!!fieldErrors.serving_size}
                helperText={fieldErrors.serving_size || "Optional - max 100 characters"}
                inputProps={{ maxLength: 100 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Ingredients"
              name="ingredients"
              value={supplementInfo.ingredients}
              onChange={handleSupplementChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
              placeholder="List all active and inactive ingredients (comma-separated)"
              helperText={fieldErrors.ingredients || "Optional - max 2000 characters"}
              error={!!fieldErrors.ingredients}
              inputProps={{ maxLength: 2000 }}
            />

            <TextField
              fullWidth
              label="Usage Instructions"
              name="usage_instructions"
              value={supplementInfo.usage_instructions}
              onChange={handleSupplementChange}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              placeholder="How to use this supplement"
              helperText={fieldErrors.usage_instructions || "Optional - max 1000 characters"}
              error={!!fieldErrors.usage_instructions}
              inputProps={{ maxLength: 1000 }}
            />

            <TextField
              fullWidth
              label="Warnings"
              name="warnings"
              value={supplementInfo.warnings}
              onChange={handleSupplementChange}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              placeholder="Contraindications, side effects, precautions"
              helperText={fieldErrors.warnings || "Optional - max 1000 characters"}
              error={!!fieldErrors.warnings}
              inputProps={{ maxLength: 1000 }}
            />

            <TextField
              fullWidth
              label="Certifications"
              name="certification"
              value={supplementInfo.certification}
              onChange={handleSupplementChange}
              sx={{ mb: 3 }}
              placeholder="e.g., GMP, FDA, ISO 22000, Halal, Organic"
              helperText={fieldErrors.certification || "Optional - comma-separated, max 300 characters"}
              error={!!fieldErrors.certification}
              inputProps={{ maxLength: 300 }}
            />

            <TextField
              fullWidth
              required
              label="Expiry Date"
              name="expiry_date"
              type="date"
              value={supplementInfo.expiry_date}
              onChange={handleSupplementChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
              helperText={fieldErrors.expiry_date || "Must be a future date"}
              error={!!fieldErrors.expiry_date}
            />

            <Divider sx={{ my: 4 }} />

            {/* Pricing & Inventory */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
              Pricing & Inventory
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                required
                label="Price"
                name="price"
                type="number"
                value={formData.price || ""}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0.01, max: 999999999, step: 0.01 } }}
                helperText={fieldErrors.price || "Regular price (must be > 0)"}
                error={!!fieldErrors.price}
              />
              <TextField
                fullWidth
                label="Sale Price"
                name="sale_price"
                type="number"
                value={formData.sale_price || ""}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 999999999, step: 0.01 } }}
                helperText={fieldErrors.sale_price || "Optional - must be ≤ regular price"}
                error={!!fieldErrors.sale_price}
              />
              <TextField
                fullWidth
                required
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock || ""}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 999999, step: 1 } }}
                helperText={fieldErrors.stock || "Whole number, 0-999999"}
                error={!!fieldErrors.stock}
              />
            </Box>

            {/* Product Sizes Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Product Sizes (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add size options with their stock quantities
              </Typography>
              
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-start" }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={newSize.size}
                    label="Size"
                    onChange={(e) => setNewSize(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <MenuItem value="30">30 Servings</MenuItem>
                    <MenuItem value="60">60 Servings</MenuItem>
                    <MenuItem value="90">90 Servings</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Stock Quantity"
                  type="number"
                  value={newSize.stock_quantity || ""}
                  onChange={(e) => setNewSize(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                  InputProps={{ inputProps: { min: 0, step: 1 } }}
                  sx={{ flex: 1 }}
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleAddSize}
                  sx={{ height: 56, minWidth: 100 }}
                >
                  Add
                </Button>
              </Box>

              {sizes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}>
                    Added Sizes:
                  </Typography>
                  {sizes.map((size, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        p: 1.5, 
                        mb: 1, 
                        bgcolor: "#f5f5f5", 
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>{size.size}</strong> - Stock: {size.stock_quantity}
                      </Typography>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveSize(index)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Content & Media */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
              Content & Media
            </Typography>

            <TextField
              fullWidth
              required
              label="Short Description"
              name="blurb"
              value={formData.blurb}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 3 }}
              placeholder="Brief product summary (appears in product cards)"
              helperText={fieldErrors.blurb || "10-500 characters - keep it concise"}
              error={!!fieldErrors.blurb}
              inputProps={{ maxLength: 500 }}
            />

            <TextField
              fullWidth
              label="Full Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={6}
              sx={{ mb: 3 }}
              placeholder="Detailed product information, benefits, research, etc."
              helperText={fieldErrors.description || "Optional - max 5000 characters"}
              error={!!fieldErrors.description}
              inputProps={{ maxLength: 5000 }}
            />

            {/* Product Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Product Image *
              </Typography>
              {fieldErrors.image_url && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {fieldErrors.image_url}
                </Alert>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginBottom: "16px", display: "block" }}
              />

              {imageFile && !formData.image_url && (
                <Button
                  variant="contained"
                  onClick={handleUploadImage}
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  {uploading ? <CircularProgress size={24} /> : "Upload Image"}
                </Button>
              )}

              {formData.image_url && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Image uploaded successfully!
                </Alert>
              )}

              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Product preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    p: 1,
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Submit Button */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || !formData.image_url}
                sx={{ minWidth: 150 }}
              >
                {submitting ? <CircularProgress size={24} /> : "Create Product"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
