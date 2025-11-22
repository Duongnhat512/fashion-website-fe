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

    console.log("AuthContext init - token:", token);
    console.log("AuthContext init - userData:", userData);

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
      console.log("User restored:", userData);
    } else {
      console.log("No token or userData");
    }
  }, []);

  const login = (userData: User, token: string) => {
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
      // Nếu chỉ cập nhật avatar (không có các field khác), update local state thôi
      const isOnlyAvatar =
        Object.keys(userData).length === 1 && "avt" in userData;

      if (isOnlyAvatar) {
        // Chỉ cập nhật local state và localStorage, không gọi API
        const updatedUser: User = {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender,
          avt: userData.avt, // Gán avatar URL từ response
        };
        authService.saveUser(updatedUser);
        setUser(updatedUser); // React sẽ detect object mới và re-render
        return;
      }

      // Các trường khác: gọi API cập nhật
      const updateRequest: UpdateUserRequest = {
        id: user.id,
        ...userData,
      };

      // Call API to update user
      const updatedUserData = await authService.updateUser(updateRequest);

      // QUAN TRỌNG: Tạo object hoàn toàn mới với TẤT CẢ các field rõ ràng
      const updatedUser: User = {
        id: updatedUserData.id,
        fullname: updatedUserData.fullname,
        email: updatedUserData.email,
        role: updatedUserData.role,
        phone: updatedUserData.phone,
        dob: updatedUserData.dob,
        gender: updatedUserData.gender,
        avt: updatedUserData.avt || user.avt, // Giữ avatar cũ nếu API không trả về
      };

      authService.saveUser(updatedUser);
      setUser(updatedUser); // React sẽ detect object mới và re-render
    } catch (error) {
      console.error("❌ AuthContext: Update failed:", error);
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
