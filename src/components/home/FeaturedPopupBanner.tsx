import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  Fade,
  Backdrop,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface FeaturedPopupBannerProps {
  title?: string;
  subtitle?: string;
  discount?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  autoShowDelay?: number; // ms before auto-showing popup
  storageKey?: string; // localStorage key to track dismissal
}

export default function FeaturedPopupBanner({
  title = "Flash Sale",
  subtitle = "Limited time offer on selected items",
  discount = "Up to 50% OFF",
  ctaLabel = "Shop Now",
  ctaHref = "/products?sale=true",
  autoShowDelay = 3000,
  storageKey = "popup_dismissed",
}: FeaturedPopupBannerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if popup was dismissed today
    const dismissed = localStorage.getItem(storageKey);
    const today = new Date().toDateString();
    
    if (dismissed !== today) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, autoShowDelay);
      return () => clearTimeout(timer);
    }
  }, [autoShowDelay, storageKey]);

  const handleClose = () => {
    setOpen(false);
    // Save dismissal for today
    localStorage.setItem(storageKey, new Date().toDateString());
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: { bgcolor: "rgba(0,0,0,0.7)" },
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: 500 },
            maxWidth: 500,
            bgcolor: "white",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            outline: "none",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 10,
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": {
                bgcolor: "white",
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Header with gradient */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              py: 4,
              px: 3,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <Box
              sx={{
                position: "absolute",
                top: -30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(255,217,61,0.2)",
              }}
            />

            <Typography
              sx={{
                color: "#ffd93d",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                mb: 1,
              }}
            >
              Special Offer
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 1,
              }}
            >
              {discount}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "1.1rem",
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography
              sx={{
                color: "#666",
                fontSize: "1rem",
                mb: 3,
              }}
            >
              {subtitle}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                href={ctaHref}
                onClick={handleClose}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {ctaLabel}
              </Button>
              <Button
                variant="text"
                onClick={handleClose}
                sx={{
                  color: "#999",
                  textTransform: "none",
                  "&:hover": {
                    color: "#666",
                    bgcolor: "transparent",
                  },
                }}
              >
                Maybe Later
              </Button>
            </Box>

            {/* Urgency indicator */}
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: "1px solid #eee",
                display: "flex",
                justifyContent: "center",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#e94560",
                  animation: "pulse 1.5s infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.4 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
              <Typography sx={{ color: "#e94560", fontSize: "13px", fontWeight: 500 }}>
                Offer ends soon!
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
