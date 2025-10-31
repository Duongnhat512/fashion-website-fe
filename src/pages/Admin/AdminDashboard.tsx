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
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Component card nhỏ hiển thị dữ liệu tóm tắt
const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 shadow-lg flex items-center gap-4 cursor-pointer hover:shadow-2xl transition ${
      onClick ? "hover:ring-2 hover:ring-yellow-400" : ""
    }`}
  >
    <div
      className={`p-3 rounded-xl ${color} text-white flex items-center justify-center`}
    >
      <Icon size={28} />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { key: "overview", label: "Tổng quan", icon: ClipboardList },
    { key: "users", label: "Quản lý người dùng", icon: Users },
    { key: "orders", label: "Quản lý đơn hàng", icon: Package },
    { key: "inventory", label: "Quản lý kho", icon: Warehouse },
    { key: "products", label: "Quản lý sản phẩm", icon: Package },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <div>👥 Trang quản lý người dùng (User Management)</div>;
      case "orders":
        return <div>📦 Trang quản lý đơn hàng (Order Management)</div>;
      case "inventory":
        return <div>🏬 Trang quản lý kho (Inventory)</div>;
      case "products":
        return <div>🛍 Trang quản lý sản phẩm (Product Management)</div>;
      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tổng quan hệ thống
            </h2>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Người dùng"
                value="1,245"
                icon={Users}
                color="bg-gradient-to-r from-purple-500 to-indigo-500"
              />
              <StatCard
                title="Đơn hàng"
                value="328"
                icon={Package}
                color="bg-gradient-to-r from-sky-500 to-cyan-500"
              />
              <StatCard
                title="Sản phẩm"
                value="942"
                icon={ClipboardList}
                color="bg-gradient-to-r from-pink-500 to-rose-500"
              />
              <StatCard
                title="Tồn kho"
                value="6,530"
                icon={Warehouse}
                color="bg-gradient-to-r from-green-500 to-emerald-500"
              />
              {/* ✅ Khi click vào sẽ chuyển sang trang thống kê doanh thu */}
              <StatCard
                title="Doanh thu tháng"
                value="₫ 1.85B"
                icon={DollarSign}
                color="bg-gradient-to-r from-yellow-500 to-orange-500"
                onClick={() => navigate("/admin/revenue")}
              />
            </div>
          </>
        );
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

          {/* Link riêng đến trang doanh thu */}
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
