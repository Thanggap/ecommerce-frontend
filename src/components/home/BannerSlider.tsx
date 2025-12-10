import React, { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

interface BannerSliderProps {
  banners?: {
    id: number;
    imageUrl: string;
    link: string;
    alt: string;
  }[];
  autoPlayInterval?: number;
}

const defaultBanners = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&h=400&fit=crop",
    link: "/products?sale=true",
    alt: "Health Supplements Sale - Up to 50% Off",
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop",
    link: "/products?category=Vitamins & Minerals",
    alt: "Premium Vitamins & Minerals",
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop",
    link: "/products?category=Protein & Fitness",
    alt: "Protein & Fitness Supplements",
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=400&fit=crop",
    link: "/products",
    alt: "Shop Health Supplements",
  },
];

export default function BannerSlider({
  banners = defaultBanners,
  autoPlayInterval = 4000,
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <Box sx={{ position: "relative", borderRadius: { xs: 1, sm: 2 }, overflow: "hidden" }}>
      {/* Main Banner */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: { xs: "50%", sm: "40%", md: "33.33%" }, // Taller on mobile
          bgcolor: "#f0f0f0",
        }}
      >
        {banners.map((banner, index) => (
          <Box
            key={banner.id}
            component="a"
            href={banner.link}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: index === currentIndex ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={banner.imageUrl}
              alt={banner.alt}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={goToPrev}
        size="small"
        sx={{
          position: "absolute",
          left: { xs: 4, sm: 8 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          "&:hover": { bgcolor: "white" },
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          width: { xs: 28, sm: 40 },
          height: { xs: 28, sm: 40 },
        }}
      >
        <ChevronLeft sx={{ fontSize: { xs: 18, sm: 24 } }} />
      </IconButton>
      <IconButton
        onClick={goToNext}
        size="small"
        sx={{
          position: "absolute",
          right: { xs: 4, sm: 8 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          "&:hover": { bgcolor: "white" },
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          width: { xs: 28, sm: 40 },
          height: { xs: 28, sm: 40 },
        }}
      >
        <ChevronRight sx={{ fontSize: { xs: 18, sm: 24 } }} />
      </IconButton>

      {/* Dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 6, sm: 12 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {banners.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: index === currentIndex ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
