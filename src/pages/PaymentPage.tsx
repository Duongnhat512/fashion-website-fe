import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  removeMultipleItems,
  clearSelectedItems,
} from "../store/slices/cartSlice";
import {
  orderService,
  type CreateOrderRequest,
} from "../services/orderService";

// Hàm định dạng tiền tệ Việt Nam (Thêm lại hàm này để đảm bảo component hoạt động)
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Lấy selected items từ Redux store
  const selectedItems = useAppSelector((state) => state.cart.selectedItems);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    note: "",
    paymentMethod: "cod",
    invoice: false,
  });

  useEffect(() => {
    // Nếu không có selected items, quay về trang giỏ hàng
    if (selectedItems.length === 0) {
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const removeOrderedItemsFromCart = () => {
    // Lấy danh sách cartKey của các sản phẩm đã đặt hàng
    const orderedCartKeys = selectedItems.map((item) => item.cartKey);

    // Xóa các sản phẩm này khỏi cart trong Redux
    dispatch(removeMultipleItems(orderedCartKeys));
  };

  // Tính toán phí và tổng tiền trước khi gọi API
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    // Validation
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.district ||
      !form.ward
    ) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Không có sản phẩm nào được chọn!");
      return;
    }

    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị data theo format API
      const orderData: CreateOrderRequest = {
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
        },
        status: "UNPAID",
        discount: 0,
        isCOD: form.paymentMethod === "cod",
        shippingFee: shippingFee,
        shippingAddress: {
          fullName: form.name,
          phone: form.phone,
          fullAddress: form.address,
          city: form.city,
          district: form.district,
          ward: form.ward,
        },
        items: selectedItems.map((item) => ({
          product: {
            id: item.id || item.productId,
            name: item.name,
            price: item.price,
          },
          variant: {
            id: item.variant?.id || item.variantId || "",
            size: item.variant?.size || "",
            color: item.variant?.color || "",
            sku: item.variant?.sku || "",
          },
          quantity: item.qty,
          rate: item.price,
        })),
      };

      console.log("🔄 Creating order with data:", orderData);

      // Gọi API tạo đơn hàng
      const orderResponse = await orderService.createOrder(orderData);

      console.log("✅ Order created successfully:", orderResponse);

      // Xóa sản phẩm khỏi giỏ hàng
      removeOrderedItemsFromCart();

      // Xóa selected items khỏi Redux
      dispatch(clearSelectedItems());

      alert(`Đặt hàng thành công! Mã đơn hàng: ${orderResponse.id}`);

      // Chuyển hướng về trang chủ hoặc trang đơn hàng
      navigate("/");
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Đặt hàng thất bại. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Đảm bảo chiều cao bằng nhau với min-h-[70vh] và xl:items-stretch */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:items-stretch min-h-[70vh]">
          {/* Cột trái - Thông tin giao hàng */}
          <div className="xl:col-span-2">
            {/* Thẻ nền phải có h-full và flex-col để nội dung có thể flex và fill chiều cao */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 h-full flex flex-col">
              {/* HEADER CỘT TRÁI (ĐÃ SỬA) */}
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 py-7 px-6 text-white overflow-hidden flex-shrink-0 rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">
                      Thông tin giao hàng
                    </h2>
                  </div>
                </div>
                {/* Các element trang trí nhỏ */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
              </div>
              {/* END HEADER CỘT TRÁI */}

              {/* Thêm flex-1 để nội dung này lấp đầy không gian còn lại và overflow-auto để cuộn nếu cần */}
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                {/* <div> Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    placeholder="example@gmail.com"
                  />
                </div>
                {/* Name and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      placeholder="Họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh / Thành phố *
                    </label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Tỉnh / Thành phố"
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quận / Huyện *
                    </label>
                    <input
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="Quận / Huyện"
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phường / Xã *
                    </label>
                    <input
                      name="ward"
                      value={form.ward}
                      onChange={handleChange}
                      placeholder="Phường / Xã"
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    />
                  </div>
                </div>
                {/* Specific Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường..."
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  />
                </div>
                {/* Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 h-24 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white resize-none"
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)..."
                  />
                </div>
                {/* Payment Method */}
                <div className="mt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Phương thức thanh toán
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 cursor-pointer group">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={form.paymentMethod === "cod"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
                          <svg
                            className="h-4 w-4 text-orange-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 cursor-pointer group">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vnpay"
                        checked={form.paymentMethod === "vnpay"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">
                          Thanh toán qua VNPAY / Thẻ ngân hàng
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Invoice checkbox */}
                <div className="flex items-center mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <input
                    type="checkbox"
                    name="invoice"
                    checked={form.invoice}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-medium text-gray-900">
                      Xuất hóa đơn công ty
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải - Tóm tắt đơn hàng */}
          {/* Đã loại bỏ thẻ div bọc thừa `h-full` để đơn giản hóa cấu trúc */}
          <div className="xl:col-span-1">
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col h-full">
              {/* HEADER CỘT PHẢI */}
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 py-5 px-6 text-white overflow-hidden flex-shrink-0 rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <div className="relative p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-1 rounded-xl">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                      Tóm tắt đơn hàng
                    </h3>
                  </div>
                </div>

                {/* Các element trang trí */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
              </div>

              {/* Nội dung chính - Flex column */}
              <div className="p-6 space-y-6 flex flex-col flex-1">
                {/* Danh sách sản phẩm với gradient fade effect khi có nhiều sản phẩm */}
                <div className="relative flex-1">
                  <div
                    className={`space-y-4 pr-2 ${
                      selectedItems.length > 4
                        ? "overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100"
                        : "overflow-visible"
                    }`}
                  >
                    {selectedItems.map((item, i) => (
                      <div
                        key={i}
                        className="group relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center text-xs text-gray-500 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                IMG
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate mb-1">
                              {item.name}
                            </p>
                            {item.variant && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.variant.color && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                                    {item.variant.color}
                                  </span>
                                )}
                                {item.variant.size && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                    {item.variant.size}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                SL: {item.qty}
                              </span>
                              <span className="font-bold text-gray-900">
                                {formatCurrency(item.price * item.qty)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gradient fade effect ở cuối danh sách khi có nhiều sản phẩm */}
                  {selectedItems.length > 4 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent pointer-events-none"></div>
                  )}
                </div>

                {/* Chi tiết thanh toán & Nút hành động (Đẩy xuống dưới cùng) */}
                <div className="space-y-6 flex-shrink-0 pt-4 border-t border-gray-200">
                  {/* Chi tiết thanh toán */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-1 group">
                      <span className="text-gray-700 font-medium text-base group-hover:text-purple-600 transition-colors duration-300">
                        Tổng sản phẩm
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {selectedItems.reduce((sum, item) => sum + item.qty, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 group">
                      <span className="text-gray-700 font-medium text-base group-hover:text-purple-600 transition-colors duration-300">
                        Tạm tính
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 group">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <span className="text-gray-700 font-medium text-base group-hover:text-green-600 transition-colors duration-300">
                          Phí vận chuyển
                        </span>
                      </div>
                      <span className="text-base font-semibold">
                        {shippingFee === 0 ? (
                          <span className="text-green-600 font-semibold flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>MIỄN PHÍ</span>
                          </span>
                        ) : (
                          <span className="text-gray-900">
                            {formatCurrency(shippingFee)}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Tổng cộng */}
                    <div className="relative bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-purple-200/50 overflow-hidden mt-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-blue-100/30"></div>
                      <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                            <svg
                              className="h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            Thành tiền
                          </span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="space-y-3">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className={`group relative w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                        isSubmitting
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-1"
                      }`}
                    >
                      {!isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                      <div className="relative z-10 flex items-center justify-center space-x-2">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            <span className="text-base">THANH TOÁN</span>
                            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                              ✨
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => navigate("/cart")}
                      className="group w-full border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      <span className="text-base">Quay lại giỏ hàng</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
