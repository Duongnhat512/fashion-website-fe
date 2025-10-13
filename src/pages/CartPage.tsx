import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAppDispatch } from "../store/hooks";
import {
  updateQuantity,
  removeFromCart,
  setSelectedItems,
} from "../store/slices/cartSlice";

import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
  CreditCardIcon,
  GiftIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

// Hàm định dạng tiền tệ Việt Nam
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useCart();

  // Cập nhật số lượng
  const updateQty = (cartKey: string, newQty: number) => {
    dispatch(updateQuantity({ cartKey, qty: Math.max(1, newQty) }));
  };

  // Xóa sản phẩm
  const removeItem = (cartKey: string) => {
    dispatch(removeFromCart(cartKey));
  };

  // Đặt hàng cho 1 sản phẩm
  const placeOrderSingle = (item: any) => {
    dispatch(setSelectedItems([item]));
    navigate("/payment");
  };

  // Đặt hàng tất cả
  const placeOrderAll = () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    dispatch(setSelectedItems(cart));
    navigate("/payment");
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = total >= 500000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Header tiếng Việt với cân đối - chỉ hiện khi có sản phẩm */}

        {cart.length === 0 ? (
          /* Trạng thái giỏ hàng trống - Thiết kế đẹp và cân đối với độ rộng bằng 2 cột kia */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-3">
              <div className="flex items-center justify-center py-20">
                <div className="max-w-2xl mx-auto w-full">
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                    {/* Icon giỏ hàng với thiết kế đẹp */}
                    <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <ShoppingCartIcon className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Nội dung chính */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Giỏ hàng của bạn đang trống
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Hãy khám phá bộ sưu tập thời trang đa dạng của chúng tôi
                      </p>
                    </div>

                    {/* Nút hành động */}
                    <div className="space-y-4">
                      <Link
                        to="/"
                        className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingBagIcon className="h-6 w-6" />
                        <span className="text-lg">Khám phá sản phẩm</span>
                      </Link>

                      {/* Thông tin bổ sung */}
                      <div className="flex items-center justify-center space-x-6 pt-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Miễn phí đổi trả</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Giao hàng nhanh</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm */}
            <div className="xl:col-span-2 space-y-6">
              {cart.map((item, index) => (
                <div
                  key={item.cartKey}
                  className="group relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transform hover:scale-[1.01] transition-all duration-300 hover:shadow-purple-500/20"
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Hình ảnh sản phẩm */}
                      <div className="relative flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 w-full lg:w-32 h-48 lg:h-32 shadow-lg">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1 min-w-0 space-y-4">
                        {/* Tên sản phẩm */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                            {item.name}
                          </h3>
                        </div>

                        {/* Thông tin phân loại */}
                        {item.variant && (
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200/50 shadow-sm">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              Kích thước: {item.variant.size}
                            </span>
                            {item.variant.color && (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200/50 shadow-sm">
                                <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                                {item.variant.color}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Giá và số lượng */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {formatCurrency(item.price)}
                              </div>
                              <div className="text-base text-gray-500 font-medium">
                                × {item.qty}
                              </div>
                            </div>
                            <div className="text-base font-semibold text-gray-900">
                              Thành tiền:{" "}
                              <span className="text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                {formatCurrency(item.price * item.qty)}
                              </span>
                            </div>
                          </div>

                          {/* Điều khiển số lượng */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
                              <button
                                onClick={() =>
                                  updateQty(item.cartKey, item.qty - 1)
                                }
                                disabled={item.qty <= 1}
                                className="p-3 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                              >
                                <MinusIcon className="h-4 w-4 text-gray-700 group-hover:text-red-600 transition-colors duration-300" />
                              </button>
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) =>
                                  updateQty(
                                    item.cartKey,
                                    Number(e.target.value) || 1
                                  )
                                }
                                className="w-16 py-3 text-center text-base font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900"
                                min="1"
                              />
                              <button
                                onClick={() =>
                                  updateQty(item.cartKey, item.qty + 1)
                                }
                                className="p-3 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
                              >
                                <PlusIcon className="h-4 w-4 text-gray-700 group-hover:text-green-600 transition-colors duration-300" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200/50">
                      <button
                        onClick={() => placeOrderSingle(item)}
                        className="flex-1 group relative flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-black rounded-xl shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 text-lg">
                          Đặt hàng ngay
                        </span>
                      </button>

                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="group relative flex items-center justify-center space-x-2 px-6 py-3 text-red-600 border-2 border-red-200 bg-red-50/50 backdrop-blur-sm rounded-xl hover:bg-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                      >
                        <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Card tóm tắt chính */}
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                  {/* Header gradient */}
                  <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-50"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="relative p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur opacity-75"></div>
                          <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-1 rounded-xl">
                            <ShoppingBagIcon className="h-5 w-5 text-white" />
                          </div>
                          <SparklesIcon className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                          Tóm tắt đơn hàng
                        </h2>
                      </div>
                    </div>

                    {/* Các element trang trí */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Chi tiết đơn hàng */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100/80 group">
                        <span className="text-gray-700 font-medium text-base group-hover:text-purple-600 transition-colors duration-300">
                          Tạm tính
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(total)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b border-gray-100/80 group">
                        <div className="flex items-center space-x-2">
                          <TruckIcon className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                          <span className="text-gray-700 font-medium text-base group-hover:text-green-600 transition-colors duration-300">
                            Phí vận chuyển
                          </span>
                        </div>
                        <span className="text-base font-semibold">
                          {shippingFee === 0 ? (
                            <span className="text-green-600 font-semibold flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>MIỄN PHÍ</span>
                            </span>
                          ) : (
                            <span className="text-gray-900">
                              {formatCurrency(shippingFee)}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Thông báo khuyến mại */}
                      {total < 500000 && (
                        <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200/50 rounded-xl p-4 overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200/20 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative z-10 flex items-start space-x-3">
                            <div className="flex-shrink-0 p-2 bg-yellow-400 rounded-full">
                              <GiftIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-yellow-800 mb-1">
                                Chỉ còn chút nữa!
                              </p>
                              <p className="text-sm text-yellow-700">
                                Mua thêm{" "}
                                <span className="font-bold text-base text-orange-600">
                                  {formatCurrency(500000 - total)}
                                </span>{" "}
                                để được{" "}
                                <span className="font-semibold">
                                  miễn phí vận chuyển!
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tổng cộng */}
                      <div className="relative bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-purple-200/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-blue-100/30"></div>
                        <div className="relative z-10 flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                              <FireIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              Tổng cộng
                            </span>
                          </div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="space-y-3">
                      <button
                        onClick={placeOrderAll}
                        className="group relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <CreditCardIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-base">Thanh toán ngay</span>
                          <div className="flex space-x-1"></div>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate("/")}
                        className="group w-full border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <ShoppingBagIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-base">Tiếp tục mua sắm</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-4 text-center shadow-lg border border-white/50 transform hover:scale-105 transition-all duration-300">
                    <div className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      {cart.length}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">
                      Sản phẩm
                    </div>
                    <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>

                  <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-4 text-center shadow-lg border border-white/50 transform hover:scale-105 transition-all duration-300">
                    <div className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                      {cart.reduce((sum, item) => sum + item.qty, 0)}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">
                      Số lượng
                    </div>
                    <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
