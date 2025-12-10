import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea, Box, Chip } from "@mui/material";
import { getImageUrl } from "../../../../utils/imageUtils";
import { useCurrency } from "../../../../context/CurrencyContext";

export default function ProductCard({ product }: any) {
  const { formatPrice } = useCurrency();
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: { xs: "8px", sm: "12px" },
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: "1px solid #eee",
        "&:hover": {
          transform: { xs: "none", sm: "translateY(-8px)" },
          boxShadow: { xs: "none", sm: "0 12px 24px rgba(0,0,0,0.15)" },
        },
      }}
    >
      <CardActionArea href={`/products/${product.slug}`}>
        {/* Image Container */}
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <CardMedia
            component="img"
            sx={{
              height: { xs: 160, sm: 200, md: 220 },
              objectFit: "cover",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            image={getImageUrl(product.image_url)}
            alt={product.product_name}
          />
          {/* Discount Badge */}
          {hasDiscount && (
            <Chip
              label={`-${discountPercent}%`}
              size="small"
              sx={{
                position: "absolute",
                top: { xs: 8, sm: 12 },
                left: { xs: 8, sm: 12 },
                backgroundColor: "#e94560",
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "10px", sm: "12px" },
                height: { xs: 20, sm: 24 },
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {/* Product Name */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "13px", sm: "15px" },
              lineHeight: 1.4,
              height: { xs: "36px", sm: "42px" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {product.product_name}
          </Typography>

          {/* Blurb - hide on mobile */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "11px", sm: "13px" },
              height: { xs: "32px", sm: "40px" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: { xs: "none", sm: "-webkit-box" },
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            {product.blurb || "No description"}
          </Typography>

          {/* Price Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasDiscount ? (
              <>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "14px", sm: "18px" },
                    color: "#e94560",
                  }}
                >
                  {formatPrice(product.sale_price)}
                </Typography>
                <Typography
                  sx={{
                    textDecoration: "line-through",
                    color: "#999",
                    fontSize: { xs: "11px", sm: "14px" },
                  }}
                >
                  {formatPrice(product.price)}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "14px", sm: "18px" },
                  color: "#1a1a2e",
                }}
              >
                {formatPrice(product.price)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
