import React, { useState } from "react";
import {
  Users,
  Package,
  ClipboardList,
  Warehouse,
  Menu,
  LogOut,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OverviewSection from "./components/OverviewSection";
import UserManagement from "./components/UserManagement";
import OrderManagement from "./components/OrderManagement";
import InventorySection from "./components/InventorySection";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { key: "overview", label: "Tổng quan hệ thống", icon: ClipboardList },
    { key: "users", label: "Quản lý người dùng", icon: Users },
    { key: "orders", label: "Quản lý đơn hàng", icon: Package },
    { key: "inventory", label: "Quản lý kho", icon: Warehouse },
    { key: "products", label: "Quản lý sản phẩm", icon: Package },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "orders":
        return <OrderManagement />;
      case "inventory":
        return <InventorySection />;
      case "products":
        return <div>🛍 Trang quản lý sản phẩm (Product Management)</div>;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      {/* Sidebar */}
      <div
        className={`fixed lg:static z-20 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-white shadow-xl transition-transform duration-300`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Admin Panel</h1>
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
              }`}
            >
              <item.icon className="mr-3" size={20} />
              {item.label}
            </button>
          ))}

          <button
            onClick={() => navigate("/admin/revenue")}
            className="flex items-center w-full p-3 rounded-xl text-left hover:bg-gray-100 text-gray-700 transition"
          >
            <DollarSign className="mr-3" size={20} />
            Thống kê doanh thu
          </button>

          <hr className="my-4" />
          <button
            onClick={() => navigate("/")}
            className="flex items-center w-full p-3 rounded-xl text-left text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3" size={20} />
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between bg-white shadow-md px-6 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-700">
            {menuItems.find((m) => m.key === activeTab)?.label || "Tổng quan"}
          </h2>
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/8.x/identicon/svg?seed=admin"
              className="w-10 h-10 rounded-full border"
              alt="avatar"
            />
            <span className="font-semibold text-gray-700">Admin</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
