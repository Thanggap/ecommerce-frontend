// User type
export interface IUser {
  id?: string;
  uuid?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  role: "user" | "admin";
  is_active?: boolean;
}

// Helper de lay user id (uuid hoac id)
export const getUserId = (user: IUser): string => {
  return user.uuid || user.id || "";
};

// Login response
export interface ILoginResponse {
  access_token: string;
  token_type: string;
  user: IUser;
}

// Register request
export interface IRegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

// Login request
export interface ILoginRequest {
  email: string;
  password: string;
}
