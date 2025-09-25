import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { UpdateUserRequest } from "../services/authService";

interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  avt?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = authService.getToken();
    const userData = authService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: User, token: string) => {
    console.log("AuthContext login - saving token:", token);
    console.log("AuthContext login - saving user:", userData);
    authService.saveToken(token);
    authService.saveUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error("Người dùng chưa đăng nhập");
    }

    try {
      // Prepare update request with required id
      const updateRequest: UpdateUserRequest = {
        id: user.id,
        ...userData,
      };

      // Call API to update user
      const updatedUserData = await authService.updateUser(updateRequest);

      // Update local state and storage
      const updatedUser = { ...user, ...updatedUserData };
      authService.saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Cập nhật thông tin người dùng thất bại:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
