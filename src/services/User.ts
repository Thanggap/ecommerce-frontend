import api from "./api";
import { IUser } from "../types/AuthTypes";

// Lay danh sach tat ca users (admin only)
export const getAllUsers = async (): Promise<IUser[]> => {
  const response = await api.get("/auth/users");
  return response.data;
};

// Nang cap user len admin
export const promoteUser = async (userId: string): Promise<IUser> => {
  const response = await api.put(`/auth/users/${userId}/promote`);
  return response.data;
};

// Ha cap admin xuong user
export const demoteUser = async (userId: string): Promise<IUser> => {
  const response = await api.put(`/auth/users/${userId}/demote`);
  return response.data;
};
