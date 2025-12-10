import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IUser } from "../types/AuthTypes";
import { getCurrentUser, isAuthenticated, logout as authLogout } from "../services/Auth";

interface AuthContextType {
  user: IUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check login status on mount
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (newUser: IUser | null) => {
    setUser(newUser);
    setIsLoggedIn(!!newUser);
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        setUser: handleSetUser,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
