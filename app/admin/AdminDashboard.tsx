'use client';

import { useState } from "react";
import {
  Users,
  Package,
  ClipboardList,
  Warehouse,
  Menu,
  Percent,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  FolderTree,
} from "lucide-react";
import OverviewSection from "./components/OverviewSection";
import UserManagement from "./components/UserManagement";
import OrderManagement from "./components/OrderManagement";
import InventorySection from "./components/InventorySection";
import ProductManagement from "./components/ProductManagement";
import PromotionManagement from "./components/PromotionManagement";
import ReviewManagement from "./components/ReviewManagement";
import TaxReport from "./components/TaxReport";
import ChatManagement from "./components/ChatManagement";
import CategoryManagement from "./components/CategoryManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { key: "overview", label: "Thống kê tổng quan", icon: ClipboardList },
    { key: "chat", label: "Quản lý trò chuyện", icon: MessageSquare },
    { key: "users", label: "Quản lý người dùng", icon: Users },
    { key: "orders", label: "Quản lý đơn hàng", icon: Package },
    { key: "inventory", label: "Quản lý kho", icon: Warehouse },
    { key: "products", label: "Quản lý sản phẩm", icon: Package },
    { key: "categories", label: "Quản lý danh mục", icon: FolderTree },
    { key: "tax", label: "Báo cáo thuế", icon: FileText },
    { key: "promotions", label: "Quản lý khuyến mãi", icon: Percent },
    { key: "reviews", label: "Quản lý đánh giá", icon: Star },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "overview":
        return <OverviewSection />;
      case "chat":
        return <ChatManagement />;
      case "orders":
        return <OrderManagement />;
      case "inventory":
        return <InventorySection />;
      case "products":
        return <ProductManagement />;
      case "categories":
        return <CategoryManagement />;
      case "tax":
        return <TaxReport />;
      case "promotions":
        return <PromotionManagement />;
      case "reviews":
        return <ReviewManagement />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 bg-white shadow-xl transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-purple-600">Admin Panel</h1>
          )}
          <button
            className="hidden lg:block text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
          <button
            className="lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center w-full p-3 rounded-xl text-left transition ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <item.icon
                className={`${sidebarCollapsed ? "mx-0" : "mr-3"}`}
                size={20}
              />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          <hr className="my-4" />
        </nav>
      </div>

      {/* Nội dung chính */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-0"
        }`}
      >
        {/* Topbar */}
        <div>
          {/* Nút menu bên trái */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600 z-10"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;

