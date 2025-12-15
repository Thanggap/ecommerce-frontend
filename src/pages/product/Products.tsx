import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";

// Methods
import { getProductList, IProductFilters } from "../../services/Product";
import { searchProducts, ISearchFilters } from "../../services/Search";

// Components
import ProductCard from "../../components/ui/cards/ProductCard/ProductCard";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Skeleton,
  Typography,
  Chip,
  Slider,
  Drawer,
  IconButton,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Paper,
  Pagination,
} from "@mui/material";
import {
  Search,
  FilterList,
  Close,
  GridView,
  ViewList,
  Sort,
  Home,
} from "@mui/icons-material";

const PRODUCT_TYPES = [
  { value: "", label: "product.filter.all_types" },
  // { value: "Vitamins & Minerals", label: "Vitamins & Minerals" },
  { value: "Protein & Fitness", label: "home.categories.protein" },
  { value: "Weight Management", label: "home.categories.weight_management" },
  { value: "Beauty & Skin", label: "home.categories.beauty" },
  { value: "Digestive Health", label: "home.categories.probiotics" },
  { value: "Brain & Focus", label: "Brain & Focus" },
  { value: "Immune Support", label: "home.categories.immune" },
  { value: "Omega-3", label: "home.categories.omega3" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { config: currencyConfig } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const itemsPerPage = 20;

  // Filter states
  const [search, setSearch] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [certification, setCertification] = useState<string>("");
  const [onSale, setOnSale] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<boolean>(false); // Track if using ES search

  const fetchProducts = useCallback(async (filters: IProductFilters) => {
    setLoading(true);
    try {
      const response = await getProductList(filters);
      
      // Handle array response (legacy) or object response with pagination
      if (Array.isArray(response)) {
        setProducts(response || []);
        setTotalProducts(response.length);
        setTotalPages(1);
      } else if (response && response.items) {
        setProducts(response.items || []);
        setTotalProducts(response.total || 0);
        setTotalPages(response.total_pages || Math.ceil((response.total || 0) / itemsPerPage));
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Search products using Elasticsearch
  const searchProductsES = useCallback(async (query: string, filters: ISearchFilters) => {
    setLoading(true);
    setSearchMode(true);
    try {
      const response = await searchProducts({
        q: query || undefined,
        ...filters,
      });
      
      if (response && response.items) {
        setProducts(response.items);
        setTotalProducts(response.total || 0);
        setTotalPages(response.total_pages || Math.ceil((response.total || 0) / itemsPerPage));
      } else {
        // Fallback to regular API if ES fails
        console.warn("Elasticsearch unavailable, falling back to regular API");
        await fetchProducts({
          page: filters.page || 0,
          limit: itemsPerPage,
          search: query || undefined,
          product_type: filters.product_type,
          min_price: filters.min_price,
          max_price: filters.max_price,
          on_sale: filters.on_sale,
        });
        setSearchMode(false);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, itemsPerPage]);

  // Parse URL params on mount and initialize filters
  useEffect(() => {
    const productTypeParam = searchParams.get("product_type");
    const saleParam = searchParams.get("sale");
    
    if (productTypeParam) {
      setProductType(productTypeParam);
    }
    if (saleParam === "true") {
      setOnSale(true);
    }
    setInitialized(true);
  }, [searchParams]);

  // Fetch products when filters change (after initialization)
  useEffect(() => {
    if (!initialized) return;
    
    // Reset to page 1 when filters change
    setPage(1);
    
    // If no search query, use regular API
    if (!search) {
      const filters: IProductFilters = {
        page: 0, // API uses 0-indexed pages
        limit: itemsPerPage,
        product_type: productType || undefined,
        on_sale: onSale || undefined,
        sort_by: sortBy || undefined,
      };
      fetchProducts(filters);
      setSearchMode(false);
    }
  }, [initialized, productType, onSale, search, sortBy, fetchProducts, itemsPerPage]);

  // Debounced search effect
  useEffect(() => {
    if (!initialized || !search) return;

    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      const searchFilters: ISearchFilters = {
        q: search,
        page: 0, // API uses 0-indexed
        limit: itemsPerPage,
        product_type: productType || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] / currencyConfig.rate : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] / currencyConfig.rate : undefined,
        on_sale: onSale || undefined,
        sort: sortBy as any,
      };
      searchProductsES(search, searchFilters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [initialized, search, productType, priceRange, onSale, sortBy, searchProductsES, itemsPerPage, currencyConfig.rate]);

  const handleSearch = () => {
    setPage(1); // Reset to page 1
    if (search) {
      // Use Elasticsearch search
      const searchFilters: ISearchFilters = {
        q: search,
        page: 0,
        limit: itemsPerPage,
        product_type: productType || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] / currencyConfig.rate : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] / currencyConfig.rate : undefined,
        on_sale: onSale || undefined,
        sort: sortBy as any,
      };
      searchProductsES(search, searchFilters);
    } else {
      // Use regular API
      const filters: IProductFilters = {
        page: 0,
        limit: itemsPerPage,
        product_type: productType || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] / currencyConfig.rate : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] / currencyConfig.rate : undefined,
        manufacturer: manufacturer || undefined,
        certification: certification || undefined,
        on_sale: onSale || undefined,
        sort_by: sortBy || undefined,
      };
      fetchProducts(filters);
      setSearchMode(false);
    }
    setMobileFilterOpen(false);
  };

  const handleReset = () => {
    setSearch("");
    setProductType("");
    setPriceRange([0, 10000000]);
    setSortBy("newest");
    setManufacturer("");
    setCertification("");
    setOnSale(false);
    setSearchMode(false);
    setPage(1);
    // Clear URL params
    navigate("/products", { replace: true });
    fetchProducts({ page: 0, limit: itemsPerPage });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (search) {
      const searchFilters: ISearchFilters = {
        q: search,
        page: value - 1, // API uses 0-indexed
        limit: itemsPerPage,
        product_type: productType || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] / currencyConfig.rate : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] / currencyConfig.rate : undefined,
        on_sale: onSale || undefined,
        sort: sortBy as any,
      };
      searchProductsES(search, searchFilters);
    } else {
      const filters: IProductFilters = {
        page: value - 1, // API uses 0-indexed
        limit: itemsPerPage,
        product_type: productType || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] / currencyConfig.rate : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] / currencyConfig.rate : undefined,
        manufacturer: manufacturer || undefined,
        certification: certification || undefined,
        on_sale: onSale || undefined,
        sort_by: sortBy || undefined,
      };
      fetchProducts(filters);
    }
  };

  const activeFiltersCount = [
    search,
    productType,
    priceRange[0] > 0 || priceRange[1] < 10000000,
    manufacturer,
    certification,
  ].filter(Boolean).length;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Filter sidebar content
  const filterContent = (
    <Box sx={{ p: 3, width: { xs: 280, md: "100%" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          {t("product.filter.title")}
        </Typography>
        <IconButton 
          onClick={handleReset}
          size="small"
          sx={{ display: { md: "none" } }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {t("product.filter.search")}
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("product.filter.search_placeholder")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Product Type */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          {t("product.filter.category")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {PRODUCT_TYPES.map((type) => (
            <Chip
              key={type.value}
              label={t(type.label)}
              onClick={() => setProductType(type.value)}
              color={productType === type.value ? "primary" : "default"}
              variant={productType === type.value ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          {t("product.filter.price_range")}
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, newValue) => setPriceRange(newValue as number[])}
          valueLabelDisplay="auto"
          valueLabelFormat={formatPrice}
          min={0}
          max={10000000}
          step={100000}
          sx={{ mx: 1 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatPrice(priceRange[0])}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatPrice(priceRange[1])}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Manufacturer Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Brand / Manufacturer
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          placeholder="e.g., Nature's Best, VitaGlow"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Certification Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Certifications
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {["FDA", "GMP", "NSF", "Organic", "Non-GMO", "Vegan"].map((cert) => (
            <Chip
              key={cert}
              label={cert}
              onClick={() => setCertification(cert === certification ? "" : cert)}
              color={certification === cert ? "primary" : "default"}
              variant={certification === cert ? "filled" : "outlined"}
              size="small"
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearch}
          sx={{ textTransform: "none" }}
        >
          {t("product.filter.apply")}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleReset}
          sx={{ textTransform: "none" }}
        >
          {t("product.filter.reset")}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: "white", py: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>
          <Breadcrumbs sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
            <Link
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <Home sx={{ mr: 0.5, fontSize: { xs: 16, sm: 20 } }} />
              {t("nav.home")}
            </Link>
            <Typography color="text.primary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>{t("nav.products")}</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.5, sm: 3, lg: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: "flex", gap: { md: 3 } }}>
          {/* Desktop Sidebar Filter */}
          <Paper
            sx={{
              display: { xs: "none", md: "block" },
              width: 280,
              flexShrink: 0,
              alignSelf: "flex-start",
              position: "sticky",
              top: 20,
              borderRadius: 2,
              overflow: "hidden",
            }}
            elevation={0}
          >
            {filterContent}
          </Paper>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: { xs: 1, sm: 2 } }} elevation={0}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: { xs: 1, sm: 2 } }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
                    {productType || t("product.all_products")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    {totalProducts > 0 ? (
                      <>
                        {totalProducts} {t("product.items_found")}
                        {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
                      </>
                    ) : (
                      `${products.length} ${t("product.items_found")}`
                    )}
                    {searchMode && search && (
                      <Chip 
                        label={`Search: "${search}"`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, flexWrap: "wrap" }}>
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setMobileFilterOpen(true)}
                    size="small"
                    sx={{ display: { md: "none" }, textTransform: "none", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {t("product.filter.title")}
                    {activeFiltersCount > 0 && (
                      <Chip
                        label={activeFiltersCount}
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 18, minWidth: 18, fontSize: "0.7rem" }}
                      />
                    )}
                  </Button>

                  {/* Sort */}
                  <FormControl size="small" sx={{ minWidth: 150, zIndex: 1 }}>
                    <InputLabel>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Sort fontSize="small" />
                        {t("product.sort.label")}
                      </Box>
                    </InputLabel>
                    <Select
                      value={sortBy}
                      label={t("product.sort.label")}
                      onChange={(e) => setSortBy(e.target.value)}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            zIndex: 1300, // Higher than product cards
                            mt: 1,
                          }
                        }
                      }}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* View Mode */}
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value)}
                    size="small"
                  >
                    <ToggleButton value="grid">
                      <GridView fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ViewList fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Paper>

            {/* Active Filters */}
            {(search || productType || priceRange[0] > 0 || priceRange[1] < 10000000) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {search && (
                  <Chip
                    label={`"${search}"`}
                    onDelete={() => setSearch("")}
                    size="small"
                  />
                )}
                {productType && (
                  <Chip
                    label={productType}
                    onDelete={() => setProductType("")}
                    size="small"
                  />
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                  <Chip
                    label={`${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
                    onDelete={() => setPriceRange([0, 10000000])}
                    size="small"
                  />
                )}
                <Chip
                  label={t("product.filter.clear_all")}
                  onClick={handleReset}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Box>
            )}

            {/* Products Grid */}
            {loading ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <Paper key={i} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Skeleton variant="rectangular" height={200} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : products.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: viewMode === "grid" 
                    ? { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }
                    : "1fr",
                  gap: 2,
                }}
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id || i} product={product} />
                ))}
              </Box>
            ) : (
              <Paper sx={{ p: 8, textAlign: "center", borderRadius: 2 }} elevation={0}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 3,
                    borderRadius: "50%",
                    bgcolor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search sx={{ fontSize: 40, color: "#bbb" }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t("product.no_products_found")}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {t("product.try_different_filters")}
                </Typography>
                <Button variant="contained" onClick={handleReset}>
                  {t("product.filter.reset")}
                </Button>
              </Paper>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      >
        {filterContent}
      </Drawer>
    </Box>
  );
}
