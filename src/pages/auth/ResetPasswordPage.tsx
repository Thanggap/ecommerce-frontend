import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Container,
  Alert,
  Link,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import { resetPassword } from "../../services/Auth";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token") || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t("auth.passwords_not_match"));
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError(t("auth.password_min_length"));
      return;
    }

    if (!token) {
      setError(t("auth.reset_token_missing"));
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({ token, new_password: newPassword });
      setSuccess(response.message || t("auth.password_reset_success"));
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t("auth.reset_token_invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <Container maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
          }}
        >
          <Typography component="h1" variant="h5">
            {t("auth.reset_password")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
            {t("auth.reset_password_desc")}
          </Typography>
          
          {!token && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {t("auth.reset_token_missing")}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label={t("auth.new_password")}
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!token}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t("auth.confirm_password")}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!token}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !token || !newPassword || !confirmPassword}
            >
              {loading ? t("common.loading") : t("auth.reset_password")}
            </Button>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link href="/login" underline="hover">
                {t("auth.back_to_login")}
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </AuthPage>
  );
}
