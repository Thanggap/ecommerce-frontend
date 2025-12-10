import React from "react";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";

export default function Cart() {
  const { isLoggedIn } = useAuth();
  const { itemCount } = useCart();

  return (
    <Link
      to={isLoggedIn ? "/cart" : "/login"}
      className="hover:opacity-70 flex items-center"
    >
      <Badge 
        badgeContent={itemCount} 
        color="primary"
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.7rem",
            minWidth: "18px",
            height: "18px",
          }
        }}
      >
        <ShoppingBagOutlinedIcon />
      </Badge>
    </Link>
  );
}
