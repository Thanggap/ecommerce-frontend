import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../../services/Auth";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      setUser(response.user);

      if (response.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t("auth.login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LoginIcon sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {t("auth.welcome_back", "Welcome Back")}
            </Typography>
            <Typography color="text.secondary">
              {t("auth.login_subtitle", "Sign in to continue shopping")}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: "right", mb: 3 }}>
              <Link
                to="/forgot-password"
                style={{ color: "#667eea", textDecoration: "none", fontSize: "14px" }}
              >
                {t("auth.forgot_password")}
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                },
              }}
            >
              {loading ? t("auth.logging_in", "Signing in...") : t("auth.login")}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography color="text.secondary" variant="body2">
              {t("auth.or", "or")}
            </Typography>
          </Divider>

          {/* Register Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography color="text.secondary">
              {t("auth.no_account", "Don't have an account?")}{" "}
              <Link
                to="/register"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {t("auth.register_now", "Sign up now")}
              </Link>
            </Typography>
          </Box>

          {/* Back to Home Button */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              startIcon={<HomeIcon />}
              variant="outlined"
              color="primary"
              onClick={() => navigate("/")}
              fullWidth
              sx={{
                "&:hover": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderColor: "#667eea",
                },
              }}
            >
              {t("auth.back_to_home", "Back to Home")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
