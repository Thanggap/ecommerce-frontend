import React, { useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ProductCard from "../ui/cards/ProductCard/ProductCard";

interface ProductHighlightCarouselProps {
  title?: string;
  subtitle?: string;
  products: any[];
}

export default function ProductHighlightCarousel({
  title = "Featured Products",
  subtitle = "Handpicked just for you",
  products,
}: ProductHighlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 1.5, sm: 3 },
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#667eea",
              fontSize: { xs: "10px", sm: "12px" },
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {subtitle}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#1a1a2e",
              fontSize: { xs: "1rem", sm: "1.5rem" },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Navigation arrows */}
        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
          <IconButton
            onClick={() => scroll("left")}
            size="small"
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              "&:hover": {
                bgcolor: "#667eea",
                color: "white",
              },
              transition: "all 0.2s",
            }}
          >
            <ChevronLeft sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </IconButton>
          <IconButton
            onClick={() => scroll("right")}
            size="small"
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              width: { xs: 28, sm: 40 },
              height: { xs: 28, sm: 40 },
              "&:hover": {
                bgcolor: "#667eea",
                color: "white",
              },
              transition: "all 0.2s",
            }}
          >
            <ChevronRight sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </IconButton>
        </Box>
      </Box>

      {/* Carousel */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          mx: -1,
          px: 1,
          pb: 2,
        }}
      >
        {products.map((product, index) => (
          <Box
            key={product.id || index}
            sx={{
              flexShrink: 0,
              width: { xs: 150, sm: 200, md: 250 },
              scrollSnapAlign: "start",
            }}
          >
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
