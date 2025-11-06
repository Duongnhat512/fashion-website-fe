import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { message, Empty, Spin, Tag } from "antd";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";

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

const STATUS_LABELS: Record<string, string> = {
  unpaid: "Chờ thanh toán",
  pending: "Chờ xác nhận",
  ready_to_ship: "Chuẩn bị hàng",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const STATUS_COLOR_MAP: Record<string, string> = {
  unpaid: "orange",
  pending: "gold",
  ready_to_ship: "blue",
  shipping: "cyan",
  delivered: "green",
  completed: "success",
  cancelled: "red",
};

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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await orderService.getUserOrders(user.id);
        if (activeTab === "all") setOrders(result);
        else setOrders(result.filter((o: any) => o.status === activeTab));
      } catch {
        message.error("Không thể tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const handlePayNow = async (orderId: string, amount: number) => {
    try {
      const res = await paymentService.createPaymentUrl({
        orderId,
        amount,
        orderDescription: `Thanh toán cho đơn hàng ${orderId}`,
        orderType: "billpayment",
        bankCode: "NCB",
        language: "vn",
      });
      const paymentUrl =
        (res as any)?.data?.response ||
        (res as any)?.response ||
        (res as any)?.paymentUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else message.warning("Không tìm thấy link thanh toán trong phản hồi!");
    } catch {
      message.error("Không thể tạo link thanh toán!");
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    try {
      await orderService.cancelOrder(orderId);
      message.success("Đã hủy đơn hàng!");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {
      message.error("Hủy đơn thất bại, vui lòng thử lại!");
    }
  };

  const handleConfirmCompleted = async (orderId: string) => {
    if (!window.confirm("Bạn xác nhận đã nhận được hàng?")) return;
    try {
      await orderService.confirmOrderAsCompleted(orderId);
      message.success("Đã xác nhận nhận hàng thành công!");
      // Cập nhật trạng thái đơn hàng trong danh sách
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o
        )
      );
    } catch {
      message.error("Xác nhận thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          🧾 Quản lý đơn hàng
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {ORDER_TABS.map((tab) => (
            <motion.button
              key={tab.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </div>
        ) : orders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có đơn hàng nào"
          />
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg bg-gradient-to-r from-white to-slate-50 transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">
                      Mã đơn:{" "}
                      <span className="text-purple-600">{order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày đặt:{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    {order.isCOD ? (
                      <Tag color="orange" className="mt-2">
                        💵 Thanh toán khi nhận hàng
                      </Tag>
                    ) : order.status === "pending" ? (
                      <Tag color="green" className="mt-2">
                        ✅ Đã thanh toán
                      </Tag>
                    ) : null}
                  </div>

                  <Tag
                    color={STATUS_COLOR_MAP[order.status] || "default"}
                    className="text-sm font-semibold"
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </Tag>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.variant?.imageUrl ||
                            item.product?.imageUrl ||
                            "https://via.placeholder.com/60"
                          }
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SL: {item.quantity} ×{" "}
                            {formatCurrency(item.amount / item.quantity)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-purple-600">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Tổng cộng ({order.items.length} sản phẩm):
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    {order.status === OrderStatus.UNPAID && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handlePayNow(order.id, order.totalAmount)
                          }
                          className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition-all"
                        >
                          💳 Thanh toán ngay
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancel(order.id)}
                          className="px-5 py-2 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition-all"
                        >
                          ❌ Hủy đơn
                        </motion.button>
                      </>
                    )}

                    {order.status === OrderStatus.DELIVERED && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleConfirmCompleted(order.id)}
                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition-all"
                      >
                        Xác nhận
                      </motion.button>
                    )}
                  </div>
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
