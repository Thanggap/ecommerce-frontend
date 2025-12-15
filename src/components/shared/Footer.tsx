import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import FDADisclaimer from "./FDADisclaimer";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "New Arrivals", href: "/products?category=new-arrivals" },
    { label: "Sale", href: "/products?sale=true" },
  ];

  const customerService = [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
  ];

  const categories = [
    { label: "Vitamins & Minerals", href: "/products?category=Vitamins%20%26%20Minerals" },
    { label: "Protein & Fitness", href: "/products?category=Protein%20%26%20Fitness" },
    { label: "Weight Management", href: "/products?category=Weight%20Management" },
    { label: "Beauty & Skin", href: "/products?category=Beauty%20%26%20Skin" },
    { label: "Digestive Health", href: "/products?category=Digestive%20Health" },
    { label: "Brain & Focus", href: "/products?category=Brain%20%26%20Focus" },
    { label: "Immune Support", href: "/products?category=Immune%20Support" },
  ];

  return (
    <footer>
      {/* Main Footer */}
      <Box sx={{ bgcolor: "#1a1a2e", color: "white", py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {/* Brand Column */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}>
                <img
                  src="/logo-e.svg"
                  alt="LTK Ecommerce"
                  style={{ height: "60px" }}
                />
              </Box>
              <Typography
                sx={{ color: "rgba(255,255,255,0.7)", mb: 2, maxWidth: { md: 300 }, mx: { xs: "auto", md: 0 }, textAlign: { xs: "center", md: "left" }, fontSize: { xs: "0.85rem", sm: "1rem" } }}
              >
                Your trusted source for premium health supplements. Quality, 
                science-backed nutrition for a healthier you.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "center", md: "flex-start" } }}>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "#667eea" },
                  }}
                >
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "#667eea" },
                  }}
                >
                  <Instagram fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "#667eea" },
                  }}
                >
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "#667eea" },
                  }}
                >
                  <YouTube fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, color: "#ffd93d", fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                Quick Links
              </Typography>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mb: { xs: 0.75, sm: 1 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Link>
              ))}
            </Grid>

            {/* Categories */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, color: "#ffd93d", fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                Categories
              </Typography>
              {categories.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mb: { xs: 0.75, sm: 1 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Link>
              ))}
            </Grid>

            {/* Customer Service */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, color: "#ffd93d", fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                Customer Service
              </Typography>
              {customerService.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mb: { xs: 0.75, sm: 1 },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      "&:hover": { color: "white" },
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Typography>
                </Link>
              ))}
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={4} md={2}>
              <Typography
                sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, color: "#ffd93d", fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                Contact Us
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 0.75, sm: 1 } }}>
                <Email sx={{ fontSize: { xs: 16, sm: 18 }, color: "#667eea" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  support@ltk.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 0.75, sm: 1 } }}>
                <Phone sx={{ fontSize: { xs: 16, sm: 18 }, color: "#667eea" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  +84 123 456 789
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOn sx={{ fontSize: { xs: 16, sm: 18 }, color: "#667eea" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                  Ho Chi Minh City, Vietnam
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: { xs: 3, sm: 4 } }} />

          {/* FDA Disclaimer for Supplements */}
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <FDADisclaimer variant="compact" />
          </Box>

          {/* Bottom Footer */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: { xs: "0.75rem", sm: "0.875rem" }, textAlign: "center" }}>
              {currentYear} LTK Ecommerce. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 } }}>
              <Link to="/privacy" style={{ textDecoration: "none" }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&:hover": { color: "white" },
                  }}
                >
                  Privacy Policy
                </Typography>
              </Link>
              <Link to="/terms" style={{ textDecoration: "none" }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&:hover": { color: "white" },
                  }}
                >
                  Terms of Service
                </Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </footer>
  );
}
