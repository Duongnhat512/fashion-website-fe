import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { orderService } from "../services/orderService"; // API của bạn
import type { Order } from "../types/order.types";

export enum OrderStatus {
  UNPAID = "unpaid",
  PENDING = "pending",
  READY_TO_SHIP = "ready_to_ship",
  SHIPPING = "shipping",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
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

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      let res;
      if (status === "all") res = await orderService.getAllOrders();
      else res = await orderService.getOrdersByStatus(status as OrderStatus);
      setOrders(res || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <p className="text-center text-gray-500">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có đơn hàng nào ở trạng thái này.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="text-gray-700 font-semibold">
                    Mã đơn: {order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái:{" "}
                    <span className="font-medium text-blue-600">
                      {order.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600 text-lg">
                    {order.total.toLocaleString("vi-VN")}₫
                  </p>
                  <button className="mt-2 px-4 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
