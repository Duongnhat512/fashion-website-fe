import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const OrderStatus = {
  UNPAID: "unpaid",
  PENDING: "pending",
  READY_TO_SHIP: "ready_to_ship",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
}

const ORDER_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ thanh toán", value: OrderStatus.UNPAID },
  { label: "Chờ xác nhận", value: OrderStatus.PENDING },
  { label: "Chuẩn bị hàng", value: OrderStatus.READY_TO_SHIP },
  { label: "Đang giao", value: OrderStatus.SHIPPING },
  { label: "Đã giao", value: OrderStatus.DELIVERED },
  { label: "Hoàn tất", value: OrderStatus.COMPLETED },
  { label: "Đã hủy", value: OrderStatus.CANCELLED },
];

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: "bg-yellow-100 text-yellow-700",
  [OrderStatus.PENDING]: "bg-orange-100 text-orange-700",
  [OrderStatus.READY_TO_SHIP]: "bg-blue-100 text-blue-700",
  [OrderStatus.SHIPPING]: "bg-indigo-100 text-indigo-700",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-700",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-700",
  [OrderStatus.COMPLETED]: "bg-emerald-100 text-emerald-700",
};

// 🔹 Fake dữ liệu mẫu
const MOCK_ORDERS: Order[] = [
  {
    id: "DH001",
    createdAt: "2025-10-28T10:00:00Z",
    total: 1500000,
    status: OrderStatus.UNPAID,
  },
  {
    id: "DH002",
    createdAt: "2025-10-29T11:00:00Z",
    total: 299000,
    status: OrderStatus.PENDING,
  },
  {
    id: "DH003",
    createdAt: "2025-10-27T09:30:00Z",
    total: 1200000,
    status: OrderStatus.SHIPPING,
  },
  {
    id: "DH004",
    createdAt: "2025-10-25T08:00:00Z",
    total: 450000,
    status: OrderStatus.COMPLETED,
  },
  {
    id: "DH005",
    createdAt: "2025-10-26T14:15:00Z",
    total: 780000,
    status: OrderStatus.CANCELLED,
  },
];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (activeTab === "all") setOrders(MOCK_ORDERS);
    else
      setOrders(
        MOCK_ORDERS.filter((o) => o.status === (activeTab as OrderStatus))
      );
  }, [activeTab]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🧾 Đơn hàng của tôi
        </h1>

        {/* Tabs trạng thái */}
        <div className="flex flex-wrap gap-3 mb-8">
          {ORDER_TABS.map((tab) => (
            <motion.button
              key={tab.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Danh sách đơn hàng */}
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có đơn hàng nào ở trạng thái này.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="text-gray-700 font-semibold">
                    Mã đơn: {order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày đặt:{" "}
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLOR_MAP[order.status]
                      }`}
                    >
                      {ORDER_TABS.find((t) => t.value === order.status)?.label}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-purple-600 text-lg">
                    {formatCurrency(order.total)}
                  </p>
                  <button className="mt-2 px-4 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition">
                    Xem chi tiết
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
