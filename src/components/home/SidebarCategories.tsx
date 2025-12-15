import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close,
  Medication,
  FitnessCenter,
  MonitorWeight,
  Spa,
  Restaurant,
  Psychology,
  HealthAndSafety,
} from "@mui/icons-material";

const categories = [
  { name: "Vitamins & Minerals", icon: <Medication />, href: "/products?category=Vitamins%20%26%20Minerals", color: "#667eea" },
  { name: "Protein & Fitness", icon: <FitnessCenter />, href: "/products?category=Protein%20%26%20Fitness", color: "#764ba2" },
  { name: "Weight Management", icon: <MonitorWeight />, href: "/products?category=Weight%20Management", color: "#0f3460" },
  { name: "Beauty & Skin", icon: <Spa />, href: "/products?category=Beauty%20%26%20Skin", color: "#e94560" },
  { name: "Digestive Health", icon: <Restaurant />, href: "/products?category=Digestive%20Health", color: "#533483" },
  { name: "Brain & Focus", icon: <Psychology />, href: "/products?category=Brain%20%26%20Focus", color: "#667eea" },
  { name: "Immune Support", icon: <HealthAndSafety />, href: "/products?category=Immune%20Support", color: "#e94560" },
];

interface SidebarCategoriesProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarCategories({ isOpen, onClose }: SidebarCategoriesProps) {

  const CategoryList = () => (
    <List sx={{ py: 1 }}>
      {categories.map((category) => (
        <Link
          key={category.name}
          to={category.href}
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={onClose}
        >
          <ListItem
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(102, 126, 234, 0.1)",
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: category.color,
              }}
            >
              {category.icon}
            </ListItemIcon>
            <ListItemText
              primary={category.name}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: "14px",
              }}
            />
          </ListItem>
        </Link>
      ))}
    </List>
  );

  // Mobile: Drawer - only render when isOpen prop is provided
  if (isOpen !== undefined) {
    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "white",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box
            component="img"
            src="/logo-e.svg"
            alt="LTK"
            sx={{ height: 40 }}
          />
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <CategoryList />
      </Drawer>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "white",
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "sticky",
        top: 100,
        alignSelf: "flex-start",
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 2,
          px: 2,
        }}
      >
        <Box sx={{ color: "white", fontWeight: 600, fontSize: "16px" }}>
          Categories
        </Box>
      </Box>
      <CategoryList />
    </Box>
  );
}

// Mobile menu button export
export function CategoryMenuButton({ onClick }: { onClick: () => void }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!isMobile) return null;

  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "fixed",
        left: 16,
        bottom: 80,
        zIndex: 1000,
        bgcolor: "#667eea",
        color: "white",
        boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
        "&:hover": {
          bgcolor: "#5a6fd6",
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  );
}
