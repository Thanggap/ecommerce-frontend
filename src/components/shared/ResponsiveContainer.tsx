import React from "react";
import { Box, BoxProps } from "@mui/material";

interface ResponsiveContainerProps extends BoxProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  noPadding?: boolean;
}

const maxWidthMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
};

export default function ResponsiveContainer({
  children,
  maxWidth = "xl",
  noPadding = false,
  sx,
  ...props
}: ResponsiveContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: maxWidthMap[maxWidth],
        mx: "auto",
        px: noPadding ? 0 : { xs: 2, sm: 3, lg: 4 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
