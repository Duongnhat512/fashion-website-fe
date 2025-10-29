import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cartService } from "../services/cartService";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// 🪙 Hàm định dạng tiền tệ Việt Nam
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 📦 Lấy giỏ hàng từ server
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await cartService.getCart();
        if (response.success && Array.isArray(response.data.cartItems)) {
          setCart(response.data.cartItems);
        }
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // 🔄 Cập nhật số lượng
  const updateQty = async (cartKey: string, newQty: number) => {
    if (newQty < 1) return;
    const item = cart.find((i) => i.cartKey === cartKey);
    if (!item) return;

    try {
      const payload = {
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: newQty,
      };
      const res = await cartService.updateCartItem(payload);
      if (res.success) {
        setCart((prev) =>
          prev.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: newQty } : i
          )
        );
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
    }
  };
  const removeItem = async (cartKey: string) => {
    const item = cart.find((i) => i.cartKey === cartKey);
    if (!item) return;

    try {
      const res = await cartService.removeItemFromCart({
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
      });

      if (res.success) {
        // ✅ Cập nhật state trực tiếp
        setCart((prev) => {
          const newCart = prev.filter((i) => i.cartKey !== cartKey);
          return [...newCart]; // Bảo React nhận diện sự thay đổi rõ ràng
        });
      } else {
        console.error("Không thể xóa sản phẩm:", res);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  // 🛍️ Thanh toán
  const placeOrderSingle = (item: any) => {
    navigate("/payment", { state: { selectedItem: item } });
  };

  const placeOrderAll = () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    navigate("/payment", { state: { selectedItems: cart } });
  };

  // 💰 Tính tổng tiền
  const total = cart.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const shippingFee = total >= 500000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  // ✨ Hiển thị khi đang tải
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
        <div className="animate-pulse w-full max-w-3xl space-y-6 p-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white shadow rounded-2xl p-4 flex gap-4 items-center"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-lg font-medium mt-4 flex items-center gap-2">
          <ShoppingCartIcon className="w-6 h-6 text-indigo-500 animate-bounce" />
          Đang tải giỏ hàng của bạn...
        </p>
      </div>
    );
  }

  // 🛒 Giao diện chính
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Giỏ hàng của bạn đang trống
              </h3>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 🧾 Danh sách sản phẩm */}
            <div className="xl:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant?.id || "default"}`}
                  className="bg-white rounded-2xl shadow-xl p-6 flex flex-col lg:flex-row gap-6"
                >
                  <img
                    src={item.variant?.imageUrl || item.product?.imageUrl}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-lg shadow"
                  />
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>Kích thước: {item.variant.size}</span>
                      {item.variant.color && (
                        <span>Màu: {item.variant.color}</span>
                      )}
                    </div>
                    <div className="text-gray-900 font-semibold">
                      Thành tiền:{" "}
                      <span className="text-orange-600">
                        {formatCurrency(item.variant.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQty(item.cartKey, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 border rounded-md hover:bg-gray-100"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQty(item.cartKey, Number(e.target.value))
                        }
                        min={1}
                        className="w-16 text-center border rounded-md"
                      />
                      <button
                        onClick={() =>
                          updateQty(item.cartKey, item.quantity + 1)
                        }
                        className="p-2 border rounded-md hover:bg-gray-100"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => placeOrderSingle(item)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                      >
                        Đặt hàng ngay
                      </button>
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🧮 Tóm tắt đơn hàng */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Tóm tắt đơn hàng
              </h2>
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-semibold">
                      MIỄN PHÍ
                    </span>
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
                onClick={placeOrderAll}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
              >
                Thanh toán ngay
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
