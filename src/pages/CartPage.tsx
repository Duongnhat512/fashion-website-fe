import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import {
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// Hàm định dạng tiền tệ Việt Nam
const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  const updateQty = (cartKey: string, newQty: number) => {
    if (newQty < 1) return;
    updateQuantity(cartKey, newQty);
  };

  const removeItem = (cartKey: string) => {
    removeFromCart(cartKey);
  };

  const placeOrderSingle = (item: any) =>
    navigate("/payment", { state: { selectedItem: item } });

  const placeOrderAll = () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    navigate("/payment", { state: { selectedItems: cart } });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = total >= 500000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  if (!cart) {
    // skeleton loading nếu muốn
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShoppingCartIcon className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShoppingCartIcon className="w-12 h-12 animate-spin text-gray-400" />
        <span className="ml-4 text-gray-600">
          Đang tải dữ liệu giỏ hàng của bạn...
        </span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={item.cartKey}
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col lg:flex-row gap-6 hover:shadow-2xl transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-lg shadow"
              />
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

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => placeOrderSingle(item)}
                    type="button"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                  >
                    Đặt hàng ngay
                  </button>
                  <button
                    onClick={() => removeItem(item.cartKey)}
                    type="button"
                    className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatCurrency(total)}</span>
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
            onClick={placeOrderAll}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
          >
            Đặt hàng ngay
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
