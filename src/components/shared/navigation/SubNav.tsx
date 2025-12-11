import React from "react";
import { Link } from "react-router-dom";
import Cart from "../cart/Cart";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Person } from "@mui/icons-material";
import { Box } from "@mui/material";

export default function SubNav() {
  const { user, isLoggedIn } = useAuth();
  const { t } = useTranslation();

  const Logo = () => (
    <Link to="/" style={{ display: "flex", alignItems: "center" }}>
      <Box
        component="img"
        src="/logo-e.svg"
        alt="LTK Ecommerce"
        sx={{
          height: { xs: "50px", sm: "70px", md: "90px" },
          width: "auto",
        }}
      />
    </Link>
  );

  return (
    <nav id="sub-nav">
      <ul>
        {!isLoggedIn ? (
          <>
            <li><Logo /></li>
            <div className="flex gap-4 items-center">
              <li>
                <Link to="/login">{t("nav.login")}</Link>
              </li>
              <Cart />
            </div>
          </>
        ) : (
          <>
            <li><Logo /></li>
            <div className="flex gap-4 items-center">
              {user?.role === "admin" && (
                <li>
                  <Link to="/admin">{t("nav.admin")}</Link>
                </li>
              )}
              <li>
                <Link to="/profile" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Person sx={{ fontSize: 18 }} />
                  {user?.first_name || user?.email?.split("@")[0]}
                </Link>
              </li>
              <Cart />
            </div>
          </>
        )}
      </ul>
    </nav>
  );
}
