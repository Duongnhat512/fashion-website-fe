"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AuthProvider, CartProvider } from "@/contexts";
import { NotificationProvider } from "@/components/common/NotificationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress Ant Design React 19 compatibility warning
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("antd: compatible")) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </Provider>
  );
}
