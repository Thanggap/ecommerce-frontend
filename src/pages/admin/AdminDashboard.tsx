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
import { useAuth } from "../../context/AuthContext";
import { getAllUsers, promoteUser, demoteUser } from "../../services/User";
import { IUser, getUserId } from "../../types/AuthTypes";

export default function AdminDashboard() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
  }, [isLoggedIn, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Khong the tai danh sach user");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await promoteUser(userId);
      setSuccess("Da nang cap user thanh admin!");
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Khong the nang cap user");
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      setError("");
      setSuccess("");
      await demoteUser(userId);
      setSuccess("Da ha cap admin thanh user!");
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Khong the ha cap user");
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
        Admin Dashboard
      </Typography>

      {/* Quick Links */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={() => navigate("/admin/products")}>
          Manage Products
        </Button>
        <Button variant="contained" onClick={() => navigate("/admin/orders")}>
          Manage Orders
        </Button>
        <Button variant="contained" color="warning" onClick={() => navigate("/admin/returns")}>
          Return Requests
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        User Management
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

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" href="/admin/products" sx={{ mr: 2 }}>
          Quan ly san pham
        </Button>
        <Button variant="contained" href="/admin/add-product" sx={{ mr: 2 }}>
          Them san pham
        </Button>
        <Button variant="outlined" onClick={fetchUsers}>
          Lam moi
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Ho ten</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Trang thai</TableCell>
              <TableCell>Hanh dong</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={getUserId(u)}>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.first_name || u.last_name
                    ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.role}
                    color={u.role === "admin" ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.is_active ? "Active" : "Inactive"}
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
                      Nang cap Admin
                    </Button>
                  ) : getUserId(u) !== getUserId(user as IUser) ? (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={() => handleDemote(getUserId(u))}
                    >
                      Ha cap User
                    </Button>
                  ) : (
                    <Chip label="Ban" size="small" />
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
