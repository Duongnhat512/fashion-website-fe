"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth/auth.service";
import type { UpdateUserRequest } from "../services/auth/auth.types";

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
  avatarUpdateKey: number;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [avatarUpdateKey, setAvatarUpdateKey] = useState<number>(0);

  useEffect(() => {
    const token = authService.getToken();
    const userData = authService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
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
      console.log("🔵 updateUser called with:", userData);
      console.log("🔵 Current user.avt:", user.avt);
      console.log("🔵 userData.avt:", userData.avt);

      const isOnlyAvatar =
        Object.keys(userData).length === 1 && "avt" in userData;

      if (isOnlyAvatar) {
        const updatedUser: User = {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender,
          avt: userData.avt,
        };
        authService.saveUser(updatedUser);
        // Force re-render by creating a new object
        setUser({ ...updatedUser });
        setAvatarUpdateKey((prev) => prev + 1); // Trigger avatar update
        return;
      }

      const updateRequest: UpdateUserRequest = {
        id: user.id,
        ...userData,
      };

      const updatedUserData = await authService.updateUser(updateRequest);

      const updatedUser: User = {
        id: updatedUserData.id,
        fullname: updatedUserData.fullname,
        email: updatedUserData.email,
        role: updatedUserData.role || user.role, // Keep current role if not returned
        phone: updatedUserData.phone,
        dob: updatedUserData.dob,
        gender: updatedUserData.gender,
        // CRITICAL: If avatar is in request data, use it (newly uploaded)
        // Otherwise use from API response, or keep current
        avt:
          userData.avt !== undefined
            ? userData.avt
            : updatedUserData.avt || user.avt,
      };

      console.log("💾 Saving user with avatar:", updatedUser.avt);
      authService.saveUser(updatedUser);
      // Force re-render by creating a new object
      setUser({ ...updatedUser });

      // Trigger avatar update if avatar is in the update data
      // Always increment when avatar is being updated, regardless of whether URL changed
      console.log("🔍 Checking if should update avatarUpdateKey...");
      console.log("🔍 userData.avt exists?", !!userData.avt);
      console.log("🔍 userData.avt value:", userData.avt);

      if (userData.avt) {
        console.log("🔄 Avatar updated, incrementing avatarUpdateKey");
        setAvatarUpdateKey((prev) => {
          const newKey = prev + 1;
          console.log(`📈 avatarUpdateKey: ${prev} → ${newKey}`);
          return newKey;
        });
      } else {
        console.log(
          "⚠️ No avatar in userData, skipping avatarUpdateKey increment"
        );
      }
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
    avatarUpdateKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
