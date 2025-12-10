import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";

interface TopBannerProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaAction?: () => void;
  ctaHref?: string;
}

export default function TopBanner({
  title = "Discover Your Best Health",
  subtitle = "Explore our science-backed collection of premium supplements",
  imageUrl,
  ctaLabel = "Shop Now",
  ctaAction,
  ctaHref = "/products",
}: TopBannerProps) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: 300, sm: 350, md: 400 },
        borderRadius: 3,
        overflow: "hidden",
        background: imageUrl
          ? `linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%), url(${imageUrl})`
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Decorative Pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ maxWidth: 500, py: 4, px: { xs: 2, md: 0 } }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            New Collection 2024
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              mb: 3,
            }}
          >
            {subtitle}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              href={ctaHref}
              onClick={ctaAction}
              sx={{
                bgcolor: "#ffd93d",
                color: "#1a1a2e",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: "50px",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#ffcd00",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(255,217,61,0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {ctaLabel}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/products?category=new-arrivals"
              sx={{
                borderColor: "white",
                color: "white",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: "50px",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderColor: "white",
                },
              }}
            >
              New Arrivals
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Floating decorative elements */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: -50, md: 50 },
          top: "50%",
          transform: "translateY(-50%)",
          width: { xs: 200, md: 300 },
          height: { xs: 200, md: 300 },
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
          display: { xs: "none", sm: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: { xs: 0, md: 150 },
          bottom: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255,217,61,0.2)",
          display: { xs: "none", sm: "block" },
        }}
      />
    </Box>
  );
}
