import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers, promoteUser, demoteUser } from "../../services/User";
import { IUser, getUserId } from "../../types/AuthTypes";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t("user.fetch_error", "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Check quyen admin
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [isLoggedIn, user, navigate, fetchUsers]);

  const handlePromote = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await promoteUser(userId);
      setSuccess(t("user.promoted_to_admin", "User promoted to admin successfully!"));
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || t("user.promote_error", "Failed to promote user"));
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await demoteUser(userId);
      setSuccess(t("user.demoted_to_user", "Admin demoted to user successfully!"));
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || t("user.demote_error", "Failed to demote user"));
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("admin.dashboard", "Admin Dashboard")}
      </Typography>

      {/* Quick Links */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={() => navigate("/admin/products")}>
          {t("admin.manage_products", "Manage Products")}
        </Button>
        <Button variant="contained" onClick={() => navigate("/admin/orders")}>
          {t("admin.manage_orders", "Manage Orders")}
        </Button>
        <Button variant="contained" color="warning" onClick={() => navigate("/admin/returns")}>
          {t("admin.return_requests", "Return Requests")}
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        {t("user.manage_users", "User Management")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={fetchUsers}>
          {t("common.refresh", "Refresh")}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t("auth.email", "Email")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("user.full_name", "Full Name")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("user.role", "Role")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("user.status", "Status")}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t("user.actions", "Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={getUserId(u)} hover>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.first_name || u.last_name
                    ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.role.toUpperCase()}
                    color={u.role === "admin" ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.is_active ? t("user.active", "Active") : t("user.inactive", "Inactive")}
                    color={u.is_active ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {u.role === "user" ? (
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handlePromote(getUserId(u))}
                    >
                      {t("user.promote", "Promote to Admin")}
                    </Button>
                  ) : getUserId(u) !== getUserId(user as IUser) ? (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={() => handleDemote(getUserId(u))}
                    >
                      {t("user.demote", "Demote to User")}
                    </Button>
                  ) : (
                    <Chip label={t("user.you", "You")} size="small" color="info" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
