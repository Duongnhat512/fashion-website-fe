import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatBot from "./ChatBot";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow relative z-0">{children}</main>
      <Footer />
      {user?.role !== "admin" && <ChatBot />}
    </div>
  );
}
