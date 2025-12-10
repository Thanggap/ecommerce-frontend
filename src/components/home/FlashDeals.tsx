import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Rating, Chip, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, LocalFireDepartment } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { IProduct } from "../../types/types";
import { useTranslation } from "react-i18next";

interface FlashDealsProps {
  products: IProduct[];
  endTime?: Date;
}

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: { xs: 0.25, sm: 0.5 } }}>
      <Box
        sx={{
          bgcolor: "#1a1a1a",
          color: "white",
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.25, sm: 0.5 },
          borderRadius: 1,
          fontWeight: "bold",
          fontSize: { xs: "0.85rem", sm: "1.1rem" },
          minWidth: { xs: 30, sm: 40 },
          textAlign: "center",
        }}
      >
        {String(value).padStart(2, "0")}
      </Box>
      <Typography variant="caption" sx={{ color: "#666", mt: 0.5, fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <TimeBox value={timeLeft.hours} label="H" />
      <Typography sx={{ color: "#1a1a1a", fontWeight: "bold" }}>:</Typography>
      <TimeBox value={timeLeft.minutes} label="M" />
      <Typography sx={{ color: "#1a1a1a", fontWeight: "bold" }}>:</Typography>
      <TimeBox value={timeLeft.seconds} label="S" />
    </Box>
  );
}

export default function FlashDeals({ products, endTime }: FlashDealsProps) {
  const { t } = useTranslation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Default end time: end of today
  const defaultEndTime = new Date();
  defaultEndTime.setHours(23, 59, 59, 999);
  const dealEndTime = endTime || defaultEndTime;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;
      scrollRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price * 25000);
  };

  if (!products.length) return null;

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1, sm: 2 },
        background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 1.5, sm: 2 },
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
          <LocalFireDepartment sx={{ color: "white", fontSize: { xs: 24, sm: 32 } }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "white", textTransform: "uppercase", fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Flash Deals
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <Typography sx={{ color: "white", fontWeight: 500, fontSize: { xs: "0.75rem", sm: "0.875rem" }, display: { xs: "none", sm: "block" } }}>
            {t("common.endIn", "Ends in")}:
          </Typography>
          <CountdownTimer endTime={dealEndTime} />
        </Box>
      </Box>

      {/* Products Carousel */}
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 2,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            overflowX: "auto",
            scrollBehavior: "smooth",
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {products.map((product) => (
            <Paper
              key={product.id}
              component={Link}
              to={`/products/${product.slug}`}
              sx={{
                minWidth: { xs: 140, sm: 180 },
                maxWidth: { xs: 140, sm: 180 },
                p: { xs: 1, sm: 1.5 },
                textDecoration: "none",
                color: "inherit",
                borderRadius: { xs: 1, sm: 2 },
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* Discount Badge */}
              <Box sx={{ position: "relative" }}>
                <Chip
                  label="-30%"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bgcolor: "#ff424e",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    height: { xs: 18, sm: 24 },
                  }}
                />
                <Box
                  component="img"
                  src={product.image_url || "https://via.placeholder.com/160"}
                  alt={product.product_name}
                  sx={{
                    width: "100%",
                    height: { xs: 120, sm: 160 },
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  minHeight: { xs: 32, sm: 40 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {product.product_name}
              </Typography>

              <Rating
                value={4}
                size="small"
                readOnly
                sx={{ mt: 0.5, fontSize: { xs: "0.85rem", sm: "1rem" } }}
              />

              <Typography
                sx={{ color: "#ff424e", fontWeight: "bold", mt: 0.5, fontSize: { xs: "0.9rem", sm: "1.25rem" } }}
              >
                {formatPrice(product.sale_price || product.price * 0.7)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textDecoration: "line-through", color: "#999" }}
              >
                {formatPrice(product.price)}
              </Typography>

              {/* Sold Progress */}
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    height: 16,
                    bgcolor: "#ffe8e8",
                    borderRadius: 8,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      height: "100%",
                      width: `${Math.min((product.stock || 50) / 100 * 100, 100)}%`,
                      background: "linear-gradient(90deg, #ff6b6b, #ff424e)",
                      borderRadius: 8,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      width: "100%",
                      textAlign: "center",
                      color: "#ff424e",
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    {t("common.sold", "Sold")} {Math.floor(Math.random() * 50) + 10}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            bgcolor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 2,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Paper>
  );
}
