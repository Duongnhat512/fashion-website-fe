import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCart } = useCart();

  // Cập nhật số lượng
  const updateQty = (cartKey: string, newQty: number) => {
    const updatedCart = cart.map((item) =>
      item.cartKey === cartKey ? { ...item, qty: Math.max(1, newQty) } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCart();
  };

  // Xóa sản phẩm
  const removeItem = (cartKey: string) => {
    const updatedCart = cart.filter((item) => item.cartKey !== cartKey);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCart();
  };

  // Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = total >= 500000 ? 0 : 30000;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

      {cart.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/"
            className="px-4 py-2 bg-black text-white rounded shadow hover:bg-gray-800"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartKey}
                className="flex items-center gap-4 border rounded-lg p-4 bg-white shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>

                  {/* Hiển thị variant nếu có */}
                  {item.variant ? (
                    <div className="text-sm text-gray-600 mt-1">
                      <p>
                        <span className="font-medium">Phân loại:</span>{" "}
                        {item.variant.size}{" "}
                        {item.variant.color && `- ${item.variant.color}`}
                      </p>
                      {item.variant.sku && <p>Mã SP: {item.variant.sku}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Không có phân loại</p>
                  )}

                  <p className="text-gray-500 mt-1">
                    {item.price.toLocaleString("vi-VN")}₫
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      className="px-3 py-1 border rounded"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(item.cartKey, Number(e.target.value) || 1)
                      }
                      className="w-14 text-center border rounded"
                    />
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="px-3 py-1 border rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {(item.price * item.qty).toLocaleString("vi-VN")}₫
                  </p>
                  <button
                    onClick={() => removeItem(item.cartKey)}
                    className="mt-2 text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Thanh toán */}
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2">
              <span>Tạm tính</span>
              <span>{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Phí giao hàng</span>
              <span>{shippingFee === 0 ? "Miễn phí" : "30.000₫"}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 border-t pt-2">
              <span>Tổng cộng</span>
              <span>{(total + shippingFee).toLocaleString("vi-VN")}₫</span>
            </div>
            <button
              onClick={() => alert("Đi tới thanh toán...")}
              className="mt-6 w-full bg-black text-white py-3 rounded shadow hover:bg-gray-800"
            >
              Thanh toán
            </button>
            <button
              onClick={() => navigate(-1)}
              className="mt-3 w-full border py-3 rounded hover:bg-gray-100"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
