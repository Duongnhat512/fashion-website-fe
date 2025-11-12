import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "../components/NotificationProvider";

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CartPage() {
  const notify = useNotification();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Toggle chọn từng sản phẩm
  const toggleSelect = (cartKey: string) => {
    setSelectedItems((prev) =>
      prev.includes(cartKey)
        ? prev.filter((k) => k !== cartKey)
        : [...prev, cartKey]
    );
  };

  // Toggle chọn tất cả
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
    navigate("/payment", { state: { selectedItems: selected } });
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
            to="/products"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // Tính tổng dựa trên sản phẩm được chọn
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
      <div className="w-full px-2 lg:px-4 grid grid-cols-1 xl:grid-cols-3 gap-6 pt-8 pb-24">
        {/* Danh sách sản phẩm */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl divide-y divide-gray-200">
          {/* Header chọn tất cả */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length === cart.length}
                onChange={toggleSelectAll}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Chọn tất cả</span>
            </div>
            <span className="text-sm text-gray-500">
              {selectedItems.length} / {cart.length} sản phẩm được chọn
            </span>
          </div>

          {/* Danh sách item */}
          {cart.map((item) => (
            <div
              key={item.cartKey}
              className="p-6 flex items-center justify-between gap-6 hover:bg-gray-50 transition"
            >
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
                  className="w-32 h-32 object-cover rounded-lg shadow"
                />

                {/* Thông tin sản phẩm */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold">{item.name}</h3>

                  {item.variant && (
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>Kích thước: {item.variant.size}</span>
                      {item.variant.color && (
                        <span>Màu: {item.variant.color}</span>
                      )}
                    </div>
                  )}

                  <div className="text-gray-900 font-semibold">
                    Thành tiền:{" "}
                    <span className="text-orange-600">
                      {formatCurrency(item.price * item.qty)}
                    </span>
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
                </div>
              </div>

              {/* Icon xóa (ngang hàng với ảnh + checkbox) */}
              <TrashIcon
                onClick={() => removeItem(item.cartKey)}
                className="w-6 h-6 text-gray-400 hover:text-red-500 cursor-pointer transition flex-shrink-0"
              />
            </div>
          ))}
        </div>

        {/* Phần tóm tắt */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4 h-fit">
          <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>

          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
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
          <div className="flex justify-between font-semibold text-lg">
            <span>Tổng cộng</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <button
            onClick={placeOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
          >
            Đặt hàng các sản phẩm đã chọn
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
