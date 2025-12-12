import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getProductInfo } from "../../services/Product";
import { getProductReviews, IReviewListResponse } from "../../services/Review";
import { useCurrency } from "../../context/CurrencyContext";

import AddToCart from "../../components/ui/buttons/AddToCart/AddToCart";
import RadioProduct from "../../components/ui/buttons/RadioProduct/RadioProduct";
import FDADisclaimer from "../../components/shared/FDADisclaimer";

import {
  Typography,
  Button,
  Box,
  Paper,
  Skeleton,
  Rating,
  Divider,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Avatar,
  Alert,
} from "@mui/material";
import {
  Home,
  FavoriteBorder,
  Share,
  Verified,
  Loop,
  Security,
} from "@mui/icons-material";
import { getImageUrl } from "../../utils/imageUtils";

import { Product } from "../../types/types";

export default function ProductPage() {
  const { productSlug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [productInfo, setProductInfo] = useState<Product>();
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [tabValue, setTabValue] = useState(0);
  
  // Review state
  const [reviews, setReviews] = useState<IReviewListResponse | null>(null);

  // Get product images: main image + color images
  const productImages = React.useMemo(() => {
    if (!productInfo) return [];
    const images = [productInfo.image_url];
    if (productInfo.colors && productInfo.colors.length > 0) {
      productInfo.colors.forEach(c => {
        if (c.image_url) images.push(c.image_url);
      });
    }
    return images;
  }, [productInfo]);

  // Get current color image
  const currentColorImage = React.useMemo(() => {
    if (!productInfo?.colors || !color) return productInfo?.image_url;
    const selectedColor = productInfo.colors.find(c => c.color.toLowerCase() === color.toLowerCase());
    return selectedColor?.image_url || productInfo.image_url;
  }, [productInfo, color]);

  React.useEffect(() => {
    const fetchProduct = async () => {
      if (productSlug) {
        const response = await getProductInfo(productSlug);
        const product = new Product(response);
        setProductInfo(product);
        
        // Set default color and size
        if (product.colors && product.colors.length > 0) {
          setColor(product.colors[0].color);
        }
        if (product.sizes && product.sizes.length > 0) {
          setSize(product.sizes[0].size);
        }
        
        // Fetch reviews
        if (product.slug) {
          const reviewData = await getProductReviews(product.slug);
          setReviews(reviewData);
        }
        
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  // Update main image when color changes
  React.useEffect(() => {
    if (color && productInfo?.colors) {
      const colorIndex = productInfo.colors.findIndex(c => c.color.toLowerCase() === color.toLowerCase());
      if (colorIndex !== -1 && productInfo.colors[colorIndex].image_url) {
        // Set to color image (index 1+ in productImages array)
        setSelectedImage(colorIndex + 1);
      } else {
        // Fallback to main image
        setSelectedImage(0);
      }
    }
  }, [color, productInfo]);

  const discountPercent = productInfo?.sale_price
    ? Math.round(((productInfo.price - productInfo.sale_price) / productInfo.price) * 100)
    : 0;

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: "white", py: 2, borderBottom: "1px solid #eee" }}>
        <Box className="container mx-auto px-4">
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
            <Link
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/products")}
            >
              {t("nav.products")}
            </Link>
            {productInfo && (
              <Typography color="text.primary">{productInfo.product_name}</Typography>
            )}
          </Breadcrumbs>
        </Box>
      </Box>

      <Box className="container mx-auto px-4 py-6">
        {loading ? (
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: "flex", gap: 4, flexWrap: { xs: "wrap", md: "nowrap" } }}>
              <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
                  ))}
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" height={40} width="80%" />
                <Skeleton variant="text" height={30} width="40%" />
                <Skeleton variant="text" height={50} width="30%" sx={{ my: 2 }} />
                <Skeleton variant="rectangular" height={100} />
              </Box>
            </Box>
          </Paper>
        ) : productInfo ? (
          <>
            {/* Main Product Section */}
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: "flex", gap: 4, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                {/* Product Images */}
                <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "#f8f8f8",
                      mb: 2,
                    }}
                  >
                    <img
                      src={getImageUrl(currentColorImage || productImages[selectedImage])}
                      alt={productInfo.product_name}
                      style={{
                        width: "100%",
                        height: "500px",
                        objectFit: "cover",
                      }}
                    />
                    {productInfo.sale_price && (
                      <Chip
                        label={`-${discountPercent}%`}
                        color="error"
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 1 }}>
                      <IconButton sx={{ bgcolor: "white", "&:hover": { bgcolor: "#f5f5f5" } }}>
                        <FavoriteBorder />
                      </IconButton>
                      <IconButton sx={{ bgcolor: "white", "&:hover": { bgcolor: "#f5f5f5" } }}>
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>
                  {/* Thumbnail images */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {productImages.map((img, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: "hidden",
                          cursor: "pointer",
                          border: selectedImage === idx ? "2px solid #1976d2" : "2px solid transparent",
                          opacity: selectedImage === idx ? 1 : 0.6,
                          transition: "all 0.2s ease",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`${productInfo.product_name} ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Product Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    {productInfo.product_name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Rating 
                      value={reviews?.average_rating || 0} 
                      precision={0.1} 
                      readOnly 
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({reviews?.total_reviews || 0} {t("review.title")})
                    </Typography>
                    {productInfo.stock > 0 ? (
                      <Chip
                        icon={<Verified sx={{ fontSize: 16 }} />}
                        label={`${t("product.in_stock")} (${productInfo.stock})`}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={t("product.out_of_stock")}
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    {productInfo.sale_price ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="h4" color="error" fontWeight={700}>
                          {formatPrice(productInfo.sale_price)}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ textDecoration: "line-through", color: "#999" }}
                        >
                          {formatPrice(productInfo.price)}
                        </Typography>
                        <Chip
                          label={`-${Math.round(((productInfo.price - productInfo.sale_price) / productInfo.price) * 100)}%`}
                          color="error"
                          size="small"
                        />
                      </Box>
                    ) : (
                      <Typography variant="h4" fontWeight={700}>
                        {formatPrice(productInfo.price)}
                      </Typography>
                    )}
                  </Box>

                  <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                    {productInfo.blurb}
                  </Typography>

                  {/* Supplement-Specific Information */}
                  {(productInfo as any).serving_size && (
                    <Box sx={{ mb: 3 }}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: "#1976d2" }}>
                          Supplement Facts
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Serving Size
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {(productInfo as any).serving_size}
                            </Typography>
                          </Box>
                          {(productInfo as any).servings_per_container && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Servings Per Container
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {(productInfo as any).servings_per_container}
                              </Typography>
                            </Box>
                          )}
                          {(productInfo as any).manufacturer && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Manufacturer
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {(productInfo as any).manufacturer}
                              </Typography>
                            </Box>
                          )}
                          {(productInfo as any).country_of_origin && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Made In
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {(productInfo as any).country_of_origin}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {(productInfo as any).certification && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Certifications
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {(productInfo as any).certification.split(",").map((cert: string, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={cert.trim()}
                                  size="small"
                                  icon={<Verified />}
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  )}

                  {/* Warnings Alert */}
                  {(productInfo as any).warnings && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Important Safety Information
                      </Typography>
                      <Typography variant="body2">
                        {(productInfo as any).warnings}
                      </Typography>
                    </Alert>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Color Selection */}
                  {productInfo.colors && productInfo.colors.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                        {t("product.color")}: <span style={{ fontWeight: 400 }}>{color}</span>
                      </Typography>
                      <RadioProduct 
                        value={productInfo.colors.map(c => c.color)} 
                        setState={setColor} 
                      />
                    </Box>
                  )}

                  {/* Size Selection */}
                  {productInfo.sizes && productInfo.sizes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                        {t("product.size")}: <span style={{ fontWeight: 400 }}>{size ? size.toUpperCase() : ''}</span>
                      </Typography>
                      <RadioProduct 
                        value={productInfo.sizes.map(s => s.size)} 
                        setState={setSize} 
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Add to Cart */}
                  <Box sx={{ mb: 3 }}>
                    <AddToCart product={productInfo} size={size} color={color} />
                  </Box>

                  {/* Trust badges */}
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Loop color="primary" />
                      <Typography variant="body2">7-Day Returns</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Security color="primary" />
                      <Typography variant="body2">Secure Payment</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Description & Reviews Tabs */}
            <Paper sx={{ borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: "1px solid #eee", px: 3 }}
              >
                <Tab label={t("product.description")} />
                <Tab label={`${t("review.title")} (${reviews?.total_reviews || 0})`} />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <Box>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                      {productInfo.description || "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
                    </Typography>

                    {/* Ingredients Section */}
                    {(productInfo as any).ingredients && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Ingredients
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                          <Typography variant="body2" color="text.secondary">
                            {(productInfo as any).ingredients}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Usage Instructions */}
                    {(productInfo as any).usage_instructions && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          How to Use
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd", borderColor: "#1976d2" }}>
                          <Typography variant="body2" color="text.primary">
                            {(productInfo as any).usage_instructions}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Allergen Info */}
                    {(productInfo as any).allergen_info && (productInfo as any).allergen_info !== "None" && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Allergen Information
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body2">
                            {(productInfo as any).allergen_info}
                          </Typography>
                        </Alert>
                      </Box>
                    )}

                    {/* FDA Disclaimer for Supplements */}
                    {(productInfo as any).serving_size && (
                      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #eee" }}>
                        <FDADisclaimer variant="standard" />
                      </Box>
                    )}
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box>
                    {/* Reviews List */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Customer Reviews
                      </Typography>
                      {reviews && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Rating value={reviews.average_rating} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({reviews.total_reviews} {reviews.total_reviews === 1 ? 'review' : 'reviews'})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {reviews && reviews.reviews.length > 0 ? (
                      reviews.reviews.map((review) => (
                        <Box key={review.id} sx={{ py: 2, borderBottom: "1px solid #eee" }}>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Avatar>
                              {review.author.display_name?.[0] || review.author.email[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography fontWeight={600}>
                                  {review.author.display_name || review.author.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                              <Typography color="text.secondary" sx={{ mb: 2 }}>
                                {review.content}
                              </Typography>
                              
                              {/* Review Images */}
                              {review.images && review.images.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                  {review.images.map((imageUrl, idx) => (
                                    <Box
                                      key={idx}
                                      component="img"
                                      src={imageUrl}
                                      alt={`Review image ${idx + 1}`}
                                      sx={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: '1px solid #ddd',
                                        '&:hover': { opacity: 0.8 }
                                      }}
                                      onClick={() => window.open(imageUrl, '_blank')}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              {/* Review Video */}
                              {review.video && (
                                <Box sx={{ mt: 1, maxWidth: 400 }}>
                                  <video
                                    src={review.video}
                                    controls
                                    style={{
                                      width: '100%',
                                      maxHeight: '250px',
                                      borderRadius: '8px',
                                      border: '1px solid #ddd'
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                        No reviews yet. Be the first to review this product!
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 8, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {t("product.not_found")}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/products")}>
              {t("cart.continue_shopping")}
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
