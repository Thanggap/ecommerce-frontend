import React, { useState, useEffect } from "react";
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
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
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
    sizes: [],
    colors: [],
  });

  // Supplement-specific fields
  const [supplementInfo, setSupplementInfo] = useState({
    serving_size: "",
    servings_per_container: "",
    ingredients: "",
    allergen_info: "",
    usage_instructions: "",
    warnings: "",
    expiry_date: "",
    manufacturer: "",
    country_of_origin: "",
    certification: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // State for color image uploads
  const [colorImageFiles, setColorImageFiles] = useState<{ [key: number]: File }>({});
  const [colorImagePreviews, setColorImagePreviews] = useState<{ [key: number]: string }>({});
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);

  // Auto-calculate total stock from sizes
  useEffect(() => {
    if (formData.sizes && formData.sizes.length > 0) {
      const totalStock = formData.sizes.reduce((sum, sizeItem) => {
        return sum + (sizeItem.stock_quantity || 0);
      }, 0);
      
      setFormData((prev) => ({
        ...prev,
        stock: totalStock,
      }));
    }
  }, [formData.sizes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "sale_price", "stock"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSupplementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupplementInfo((prev) => ({
      ...prev,
      [name]: name === "servings_per_container" ? (value ? Number(value) : "") : value,
    }));
  };

  const handleTypeChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      product_type: e.target.value,
    }));
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

  // Handle color image selection
  const handleColorImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setColorImageFiles((prev) => ({ ...prev, [index]: file }));
      setColorImagePreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
    }
  };

  // Handle color image upload
  const handleUploadColorImage = async (index: number) => {
    const file = colorImageFiles[index];
    if (!file) return;

    setUploadingColorIndex(index);
    setError("");

    const result = await uploadProductImage(file);
    
    if (result && result.url) {
      const newColors = [...(formData.colors || [])];
      newColors[index].image_url = result.url;
      setFormData((prev) => ({ ...prev, colors: newColors }));
      
      // Clear the file after upload
      setColorImageFiles((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    } else {
      setError("Failed to upload color image");
    }

    setUploadingColorIndex(null);
  };

  const generateSlug = () => {
    const slug = formData.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now();
    
    setFormData((prev) => ({
      ...prev,
      slug: slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    // Validate required fields
    if (!formData.slug || !formData.product_name || !formData.product_type || !formData.price) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    // Merge supplement info into formData (only non-empty fields)
    const productData: any = { ...formData };
    
    if (supplementInfo.serving_size) productData.serving_size = supplementInfo.serving_size;
    if (supplementInfo.servings_per_container) productData.servings_per_container = Number(supplementInfo.servings_per_container);
    if (supplementInfo.ingredients) productData.ingredients = supplementInfo.ingredients;
    if (supplementInfo.allergen_info) productData.allergen_info = supplementInfo.allergen_info;
    if (supplementInfo.usage_instructions) productData.usage_instructions = supplementInfo.usage_instructions;
    if (supplementInfo.warnings) productData.warnings = supplementInfo.warnings;
    if (supplementInfo.expiry_date) productData.expiry_date = supplementInfo.expiry_date;
    if (supplementInfo.manufacturer) productData.manufacturer = supplementInfo.manufacturer;
    if (supplementInfo.country_of_origin) productData.country_of_origin = supplementInfo.country_of_origin;
    if (supplementInfo.certification) productData.certification = supplementInfo.certification;

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
        sizes: [],
        colors: [],
      });
      setSupplementInfo({
        serving_size: "",
        servings_per_container: "",
        ingredients: "",
        allergen_info: "",
        usage_instructions: "",
        warnings: "",
        expiry_date: "",
        manufacturer: "",
        country_of_origin: "",
        certification: "",
      });
      setImageFile(null);
      setImagePreview("");
      setColorImageFiles({});
      setColorImagePreviews({});
    } else {
      setError("Failed to create product");
    }

    setSubmitting(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Add New Product
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Product created successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Product Name */}
            <TextField
              fullWidth
              label="Product Name *"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />

            {/* Slug */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Slug *"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                helperText="URL-friendly identifier"
              />
              <Button
                variant="outlined"
                onClick={generateSlug}
                sx={{ whiteSpace: "nowrap" }}
              >
                Auto Generate
              </Button>
            </Box>

            {/* Product Type */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Product Type *</InputLabel>
              <Select
                value={formData.product_type}
                label="Product Type *"
                onChange={handleTypeChange}
              >
                {PRODUCT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {/* Supplement Information Section */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
              Supplement Information (Optional)
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Serving Size"
                name="serving_size"
                value={supplementInfo.serving_size}
                onChange={handleSupplementChange}
                placeholder="e.g., 2 capsules, 1 scoop (30g)"
              />
              <TextField
                fullWidth
                label="Servings per Container"
                name="servings_per_container"
                type="number"
                value={supplementInfo.servings_per_container}
                onChange={handleSupplementChange}
                InputProps={{ inputProps: { min: 0, step: 1 } }}
              />
            </Box>

            <TextField
              fullWidth
              label="Ingredients"
              name="ingredients"
              value={supplementInfo.ingredients}
              onChange={handleSupplementChange}
              multiline
              rows={3}
              placeholder="List all active and inactive ingredients"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Allergen Information"
              name="allergen_info"
              value={supplementInfo.allergen_info}
              onChange={handleSupplementChange}
              placeholder="e.g., Contains: Milk, Soy. May contain traces of nuts"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Usage Instructions"
              name="usage_instructions"
              value={supplementInfo.usage_instructions}
              onChange={handleSupplementChange}
              multiline
              rows={3}
              placeholder="How to use this supplement"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Warnings"
              name="warnings"
              value={supplementInfo.warnings}
              onChange={handleSupplementChange}
              multiline
              rows={2}
              placeholder="Important safety warnings"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={supplementInfo.manufacturer}
                onChange={handleSupplementChange}
                placeholder="Brand or company name"
              />
              <TextField
                fullWidth
                label="Country of Origin"
                name="country_of_origin"
                value={supplementInfo.country_of_origin}
                onChange={handleSupplementChange}
                placeholder="e.g., USA, Germany, Vietnam"
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiry_date"
                type="date"
                value={supplementInfo.expiry_date}
                onChange={handleSupplementChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Certifications"
                name="certification"
                value={supplementInfo.certification}
                onChange={handleSupplementChange}
                placeholder="e.g., GMP, FDA, Organic, Non-GMO"
                helperText="Comma-separated if multiple"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Price & Stock */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Price *"
                name="price"
                type="number"
                value={formData.price || ""}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
              <TextField
                fullWidth
                label="Sale Price"
                name="sale_price"
                type="number"
                value={formData.sale_price || ""}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                helperText="Leave empty if no sale"
              />
              <TextField
                fullWidth
                label="Stock *"
                name="stock"
                type="number"
                value={formData.stock || ""}
                onChange={handleInputChange}
                InputProps={{ 
                  inputProps: { min: 0, step: 1 },
                  readOnly: formData.sizes && formData.sizes.length > 0,
                }}
                helperText={
                  formData.sizes && formData.sizes.length > 0
                    ? "Tự tính từ tổng stock các sizes"
                    : "Số lượng tổng (nếu không có sizes)"
                }
                disabled={formData.sizes && formData.sizes.length > 0}
              />
            </Box>

            {/* Sizes Management */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Sizes & Stock by Size
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      sizes: [...(prev.sizes || []), { size: "", stock_quantity: 0 }],
                    }));
                  }}
                >
                  Add Size
                </Button>
              </Box>
              
              {formData.sizes && formData.sizes.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {formData.sizes.map((sizeItem, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        label="Size"
                        value={sizeItem.size}
                        onChange={(e) => {
                          const newSizes = [...(formData.sizes || [])];
                          newSizes[index].size = e.target.value;
                          setFormData((prev) => ({ ...prev, sizes: newSizes }));
                        }}
                        placeholder="S, M, L, XL"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Stock Quantity"
                        type="number"
                        value={sizeItem.stock_quantity}
                        onChange={(e) => {
                          const newSizes = [...(formData.sizes || [])];
                          newSizes[index].stock_quantity = Number(e.target.value);
                          setFormData((prev) => ({ ...prev, sizes: newSizes }));
                        }}
                        InputProps={{ inputProps: { min: 0, step: 1 } }}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newSizes = formData.sizes?.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, sizes: newSizes }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Nếu thêm sizes, stock sẽ được quản lý theo từng size
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Colors Management */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Colors & Images
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      colors: [...(prev.colors || []), { color: "", image_url: "" }],
                    }));
                  }}
                >
                  Add Color
                </Button>
              </Box>
              
              {formData.colors && formData.colors.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {formData.colors.map((colorItem, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "flex-start", p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          label="Color"
                          value={colorItem.color}
                          onChange={(e) => {
                            const newColors = [...(formData.colors || [])];
                            newColors[index].color = e.target.value;
                            setFormData((prev) => ({ ...prev, colors: newColors }));
                          }}
                          placeholder="Red, Blue, Black"
                          sx={{ mb: 2 }}
                        />
                        
                        {/* File input for color image */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorImageChange(index, e)}
                          style={{ marginBottom: "8px", display: "block" }}
                        />
                        
                        {colorImageFiles[index] && !colorItem.image_url && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleUploadColorImage(index)}
                            disabled={uploadingColorIndex === index}
                            sx={{ mt: 1 }}
                          >
                            {uploadingColorIndex === index ? <CircularProgress size={20} /> : "Upload Image"}
                          </Button>
                        )}
                        
                        {colorItem.image_url && (
                          <Alert severity="success" sx={{ mt: 1 }}>
                            Image uploaded
                          </Alert>
                        )}
                      </Box>
                      
                      {/* Image preview */}
                      {(colorImagePreviews[index] || colorItem.image_url) && (
                        <Box
                          component="img"
                          src={colorImagePreviews[index] || colorItem.image_url}
                          alt={`${colorItem.color} preview`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid #ddd",
                          }}
                        />
                      )}
                      
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newColors = formData.colors?.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, colors: newColors }));
                          // Clear color image files/previews for this index
                          setColorImageFiles((prev) => {
                            const updated = { ...prev };
                            delete updated[index];
                            return updated;
                          });
                          setColorImagePreviews((prev) => {
                            const updated = { ...prev };
                            delete updated[index];
                            return updated;
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Thêm các màu sắc và ảnh tương ứng cho từng màu
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Blurb */}
            <TextField
              fullWidth
              label="Short Description (Blurb)"
              name="blurb"
              value={formData.blurb}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Full Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />

            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Product Image
              </Typography>
              
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: "8px" }}
                  />
                  
                  {imageFile && !formData.image_url && (
                    <Button
                      variant="contained"
                      onClick={handleUploadImage}
                      disabled={uploading}
                      sx={{ mt: 1 }}
                    >
                      {uploading ? <CircularProgress size={24} /> : "Upload Image"}
                    </Button>
                  )}
                </Box>

                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </Box>

              {formData.image_url && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Image uploaded: {formData.image_url.substring(0, 50)}...
                </Alert>
              )}
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              sx={{
                py: 1.5,
                backgroundColor: "#1a1a2e",
                "&:hover": { backgroundColor: "#16213e" },
              }}
            >
              {submitting ? <CircularProgress size={24} /> : "Create Product"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
