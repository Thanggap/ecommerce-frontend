import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Link } from "react-router-dom";

interface CategoryBanner {
  id: number;
  name: string;
  imageUrl: string;
  link: string;
  bgColor?: string;
}

const defaultCategories: CategoryBanner[] = [
  {
    id: 1,
    name: "Vitamins & Minerals",
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=200&fit=crop",
    link: "/products?category=Vitamins & Minerals",
    bgColor: "#e3f2fd",
  },
  {
    id: 2,
    name: "Protein & Fitness",
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=200&fit=crop",
    link: "/products?category=Protein & Fitness",
    bgColor: "#fce4ec",
  },
  {
    id: 3,
    name: "Weight Management",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    link: "/products?category=Weight Management",
    bgColor: "#fff3e0",
  },
  {
    id: 4,
    name: "Beauty & Skin",
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=200&fit=crop",
    link: "/products?category=Beauty & Skin",
    bgColor: "#e8f5e9",
  },
  {
    id: 5,
    name: "Digestive Health",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=200&fit=crop",
    link: "/products?category=Digestive Health",
    bgColor: "#f3e5f5",
  },
  {
    id: 6,
    name: "Immune Support",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
    link: "/products?category=Immune Support",
    bgColor: "#ffebee",
  },
];

interface CategoryBannersProps {
  categories?: CategoryBanner[];
}

export default function CategoryBanners({
  categories = defaultCategories,
}: CategoryBannersProps) {
  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: { xs: 1, sm: 2 } }}>
      <Typography sx={{ mb: { xs: 1.5, sm: 2 }, fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        Shop by Category
      </Typography>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {categories.map((category) => (
          <Grid item key={category.id} xs={4} sm={4} md={4}>
            <Box
              component={Link}
              to={category.link}
              sx={{
                display: "block",
                textDecoration: "none",
                borderRadius: { xs: 1, sm: 2 },
                overflow: "hidden",
                bgcolor: category.bgColor || "#f5f5f5",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  paddingTop: { xs: "80%", sm: "70%" },
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={category.imageUrl}
                  alt={category.name}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
              </Box>
              <Box sx={{ p: { xs: 0.75, sm: 1.5 }, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: { xs: "0.7rem", sm: "0.95rem" },
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
