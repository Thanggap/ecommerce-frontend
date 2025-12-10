import api from "./api";
import { IUser, ILoginResponse, IRegisterRequest, ILoginRequest } from "../types/AuthTypes";

// Dang ky tai khoan
export const register = async (data: IRegisterRequest): Promise<IUser> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Dang nhap
export const login = async (data: ILoginRequest): Promise<ILoginResponse> => {
  const response = await api.post("/auth/login", data);
  
  // Luu token va user info
  localStorage.setItem("access_token", response.data.access_token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  
  return response.data;
};

// Dang xuat
export const logout = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Lay thong tin user hien tai tu localStorage
export const getCurrentUser = (): IUser | null => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Check da dang nhap chua
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

// Check co phai admin khong
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === "admin";
};

// Lay thong tin user tu server (verify token)
export const getMe = async (): Promise<IUser> => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Cap nhat profile
export interface IProfileUpdate {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

export const updateProfile = async (data: IProfileUpdate): Promise<IUser> => {
  const response = await api.put("/auth/profile", data);
  // Update localStorage
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

// Doi mat khau
export interface IPasswordChange {
  current_password: string;
  new_password: string;
}

export const changePassword = async (data: IPasswordChange): Promise<{ message: string }> => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};

// Forgot password - request reset link
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// Reset password with token
export interface IResetPassword {
  token: string;
  new_password: string;
}

export const resetPassword = async (data: IResetPassword): Promise<{ message: string }> => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};
