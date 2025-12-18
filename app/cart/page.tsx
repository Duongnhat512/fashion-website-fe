"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "@/components/common/NotificationProvider";

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CartPage() {
  const notify = useNotification();
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelect = (cartKey: string) => {
    setSelectedItems((prev) =>
      prev.includes(cartKey)
        ? prev.filter((k) => k !== cartKey)
        : [...prev, cartKey]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.cartKey));
    }
  };

  const updateQty = (cartKey: string, newQty: number) => {
    if (newQty < 1) return;
    updateQuantity(cartKey, newQty);
  };

  const removeItem = (cartKey: string) => {
    removeFromCart(cartKey);
    setSelectedItems((prev) => prev.filter((k) => k !== cartKey));
  };

  const placeOrder = () => {
    if (selectedItems.length === 0)
      return notify.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
    const selected = cart.filter((item) =>
      selectedItems.includes(item.cartKey)
    );
    // Pass selected item keys via URL params
    const params = new URLSearchParams();
    params.set("selected", selectedItems.join(","));
    router.push(`/payment?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShoppingCartIcon className="w-12 h-12 animate-spin text-gray-400" />
        <span className="ml-4 text-gray-600">Đang tải dữ liệu giỏ hàng...</span>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng của bạn đang trống
          </h3>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const selectedProducts = cart.filter((item) =>
    selectedItems.includes(item.cartKey)
  );
  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 500000 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="w-full px-3 md:px-4 lg:px-6 grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-6 pt-4 md:pt-8 pb-20 md:pb-24">
        {/* Danh sách sản phẩm */}
        <div className="xl:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-xl divide-y divide-gray-200">
          {/* Header chọn tất cả */}
          <div className="p-3 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length === cart.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 md:w-5 md:h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm md:text-base text-gray-700 font-medium">
                Chọn tất cả
              </span>
            </div>
            <span className="text-xs md:text-sm text-gray-500">
              {selectedItems.length} / {cart.length} sản phẩm
            </span>
          </div>

          {/* Danh sách item */}
          {cart.map((item) => (
            <div
              key={item.cartKey}
              className="p-3 md:p-6 hover:bg-gray-50 transition"
            >
              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-center gap-2.5 mb-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.cartKey)}
                    onChange={() => toggleSelect(item.cartKey)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                  />

                  {/* Ảnh sản phẩm */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-28 object-cover rounded-lg shadow-md border flex-shrink-0"
                  />

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold line-clamp-2 mb-1.5 text-gray-900">
                      {item.name}
                    </h3>

                    {item.variant && (
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Kích thước: {item.variant.size}</div>
                        {item.variant.color && (
                          <div className="flex items-center gap-1">
                            <span>Màu:</span>
                            <div
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{
                                backgroundColor:
                                  typeof item.variant.color === "string"
                                    ? item.variant.color
                                    : item.variant.color.hex || "#ccc",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2">
                      {item.discountPercent && item.discountPercent > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(item.originalPrice || item.price)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded">
                              -{item.discountPercent}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icon xóa */}
                  <TrashIcon
                    onClick={() => removeItem(item.cartKey)}
                    className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition flex-shrink-0 self-center"
                  />
                </div>

                {/* Nút tăng giảm số lượng */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      min={1}
                      onChange={(e) =>
                        updateQty(item.cartKey, Number(e.target.value))
                      }
                      className="w-14 text-center border border-gray-300 rounded-lg text-sm py-1.5 font-semibold"
                    />
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-0.5">
                      Thành tiền
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between gap-6">
                {/* Bên trái: checkbox + ảnh + thông tin sản phẩm */}
                <div className="flex items-center gap-6 flex-1">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.cartKey)}
                    onChange={() => toggleSelect(item.cartKey)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />

                  {/* Ảnh sản phẩm */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-36 h-50 object-cover rounded-xl shadow-md border"
                  />

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">{item.name}</h3>

                    {item.variant && (
                      <div className="flex gap-4 text-sm text-gray-600 items-center">
                        <span className="font-semibold">
                          Kích thước: {item.variant.size}
                        </span>
                        {item.variant.color && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Màu:</span>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                                style={{
                                  backgroundColor:
                                    typeof item.variant.color === "string"
                                      ? item.variant.color
                                      : item.variant.color.hex || "#ccc",
                                }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {typeof item.variant.color === "string"
                                  ? item.variant.color
                                  : item.variant.color.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">
                          Giá bán:
                        </span>
                        {item.discountPercent && item.discountPercent > 0 ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.originalPrice || item.price)}
                            </span>
                            <span className="text-lg text-gray-900 font-bold">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                              -{item.discountPercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg text-gray-900 font-bold">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nút tăng giảm số lượng */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQty(item.cartKey, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="p-2 border rounded-md hover:bg-gray-100"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        min={1}
                        onChange={(e) =>
                          updateQty(item.cartKey, Number(e.target.value))
                        }
                        className="w-16 text-center border rounded-md"
                      />
                      <button
                        onClick={() => updateQty(item.cartKey, item.qty + 1)}
                        className="p-2 border rounded-md hover:bg-gray-100"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-bold text-lg">
                        Thành tiền:
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Icon xóa (ngang hàng với ảnh + checkbox) */}
                <TrashIcon
                  onClick={() => removeItem(item.cartKey)}
                  className="w-6 h-6 text-gray-400 hover:text-red-500 cursor-pointer transition flex-shrink-0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Phần tóm tắt */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-5 md:p-6 space-y-3.5 md:space-y-4 h-fit sticky bottom-0 xl:top-24 z-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-3 md:mb-4">
            Tóm tắt đơn hàng
          </h2>

          <div className="flex justify-between text-sm md:text-base">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm md:text-base">
            <span>Phí vận chuyển</span>
            <span>
              {shippingFee === 0 ? (
                <span className="text-green-600 font-semibold">MIỄN PHÍ</span>
              ) : (
                formatCurrency(shippingFee)
              )}
            </span>
          </div>

          <hr />
          <div className="flex justify-between font-semibold text-base md:text-lg">
            <span>Tổng cộng</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <button
            onClick={placeOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 md:py-3.5 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Đặt hàng ({selectedItems.length})
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 md:py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm md:text-base"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
