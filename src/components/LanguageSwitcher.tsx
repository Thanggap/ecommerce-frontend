import React from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup } from "@mui/material";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language;

  return (
    <ButtonGroup size="small" variant="outlined">
      <Button
        onClick={() => changeLanguage("vi")}
        variant={currentLang === "vi" ? "contained" : "outlined"}
        sx={{ minWidth: "40px", fontSize: "12px" }}
      >
        VI
      </Button>
      <Button
        onClick={() => changeLanguage("en")}
        variant={currentLang === "en" ? "contained" : "outlined"}
        sx={{ minWidth: "40px", fontSize: "12px" }}
      >
        EN
      </Button>
    </ButtonGroup>
  );
}
