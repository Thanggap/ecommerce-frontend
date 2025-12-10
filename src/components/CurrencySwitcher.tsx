import React from "react";
import { Button, ButtonGroup } from "@mui/material";
import { useCurrency, CurrencyCode } from "../context/CurrencyContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const handleChange = (code: CurrencyCode) => {
    setCurrency(code);
  };

  return (
    <ButtonGroup size="small" variant="outlined">
      <Button
        onClick={() => handleChange("VND")}
        variant={currency === "VND" ? "contained" : "outlined"}
        sx={{ minWidth: "50px", fontSize: "12px" }}
      >
        VND
      </Button>
      <Button
        onClick={() => handleChange("USD")}
        variant={currency === "USD" ? "contained" : "outlined"}
        sx={{ minWidth: "50px", fontSize: "12px" }}
      >
        USD
      </Button>
    </ButtonGroup>
  );
}
