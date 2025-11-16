import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Empty, Spin, Tag, Modal, Rate, Input, Button, Upload } from "antd";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";
import { useNotification } from "../components/NotificationProvider";
import { authService } from "../services/authService";
import { API_CONFIG } from "../config/api.config";

const { TextArea } = Input;

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
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Review modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<any>(null);
  console.log("reviewingProduct", reviewingProduct);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewImages, setReviewImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await orderService.getUserOrders(user.id);
        if (activeTab === "all") setOrders(result);
        else setOrders(result.filter((o: any) => o.status === activeTab));
      } catch {
        notify.error("Không thể tải danh sách đơn hàng!");
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
        // bankCode: "NCB",
        language: "vn",
      });
      const paymentUrl =
        (res as any)?.data?.response ||
        (res as any)?.response ||
        (res as any)?.paymentUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else notify.warning("Không tìm thấy link thanh toán trong phản hồi!");
    } catch {
      notify.error("Không thể tạo link thanh toán!");
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    try {
      console.log("Đã hủy đơn hàng", orderId);
      await orderService.cancelOrder(orderId);

      notify.success("Đã hủy đơn hàng!");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {
      notify.error("Hủy đơn thất bại, vui lòng thử lại!");
    }
  };

  const handleConfirmCompleted = async (orderId: string) => {
    if (!window.confirm("Bạn xác nhận đã nhận được hàng?")) return;
    try {
      await orderService.confirmOrderAsCompleted(orderId);
      notify.success("Đã xác nhận nhận hàng thành công!");
      // Cập nhật trạng thái đơn hàng trong danh sách
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: OrderStatus.COMPLETED } : o
        )
      );
    } catch {
      notify.error("Xác nhận thất bại, vui lòng thử lại!");
    }
  };

  // Open review modal - fetch order details first
  const openReviewModal = async (orderId: string, product: any) => {
    try {
      // Gọi API để lấy chi tiết đơn hàng
      const orderDetail = await orderService.getOrderById(orderId);

      // Tìm sản phẩm trong đơn hàng để có đầy đủ thông tin
      const productInOrder = orderDetail.items.find(
        (item: any) => item.product?.id === product.id
      );

      if (productInOrder) {
        setReviewingProduct({
          ...product,
          orderId: orderId,
          orderItem: productInOrder,
          variant: productInOrder.variant,
        });
      } else {
        setReviewingProduct({
          ...product,
          orderId: orderId,
        });
      }

      setReviewRating(5);
      setReviewComment("");
      setReviewModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
      notify.error("Không thể tải thông tin đơn hàng!");
    }
  };

  // Close review modal
  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewingProduct(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewImages([]);
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewingProduct) return;

    const token = authService.getToken();
    if (!token) {
      notify.warning("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (!reviewComment.trim()) {
      notify.warning("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append("productId", reviewingProduct.id);
      formData.append("rating", reviewRating.toString());
      formData.append("comment", reviewComment.trim());
      reviewImages.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể gửi đánh giá");
      }

      const data = await response.json();

      if (data.success) {
        notify.success("Đánh giá của bạn đã được gửi!");
        closeReviewModal();
      } else {
        throw new Error(data.message || "Không thể gửi đánh giá");
      }
    } catch (error: any) {
      notify.error(error.message || "Không thể gửi đánh giá!");
    } finally {
      setSubmittingReview(false);
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
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-purple-600">
                          {formatCurrency(item.amount)}
                        </p>
                        {/* Nút đánh giá cho sản phẩm trong đơn hàng đã hoàn thành */}
                        {order.status === OrderStatus.COMPLETED && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              openReviewModal(order.id, item.product)
                            }
                            className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold rounded-lg shadow hover:opacity-90 transition-all"
                          >
                            ⭐ Đánh giá
                          </motion.button>
                        )}
                      </div>
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
                          Hủy đơn
                        </motion.button>
                      </>
                    )}

                    {(order.status === OrderStatus.PENDING ||
                      order.status === OrderStatus.READY_TO_SHIP) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancel(order.id)}
                        className="px-5 py-2 bg-red-500 text-white font-semibold rounded-xl shadow hover:bg-red-600 transition-all"
                      >
                        Hủy đơn
                      </motion.button>
                    )}

                    {order.status === OrderStatus.DELIVERED && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleConfirmCompleted(order.id)}
                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition-all"
                      >
                        ✅ Đã nhận hàng
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        title={
          <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Đánh giá sản phẩm
          </div>
        }
        open={reviewModalOpen}
        onCancel={closeReviewModal}
        footer={null}
        width={600}
      >
        {reviewingProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={
                  reviewingProduct.variant?.imageUrl ||
                  reviewingProduct.orderItem?.variant?.imageUrl ||
                  reviewingProduct.imageUrl ||
                  "https://via.placeholder.com/80"
                }
                alt={reviewingProduct.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {reviewingProduct.name}
                </p>
                {reviewingProduct.orderItem?.variant && (
                  <p className="text-sm text-gray-500">
                    {reviewingProduct.orderItem.variant.color?.name || ""} -
                    Size {reviewingProduct.orderItem.variant.size}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Đánh giá của bạn
              </label>
              <Rate
                value={reviewRating}
                onChange={setReviewRating}
                style={{ fontSize: 32 }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nội dung đánh giá
              </label>
              <TextArea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                rows={5}
                className="rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Ảnh (tùy chọn, tối đa 5 ảnh)
              </label>
              <Upload
                listType="picture-card"
                fileList={reviewImages}
                onChange={({ fileList }) => setReviewImages(fileList)}
                beforeUpload={() => false}
                multiple
                maxCount={5}
              >
                {reviewImages.length < 5 && "+ Upload"}
              </Upload>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button size="large" onClick={closeReviewModal}>
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitReview}
                loading={submittingReview}
                className="bg-gradient-to-r from-purple-600 to-blue-600 border-none"
              >
                Gửi đánh giá
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
