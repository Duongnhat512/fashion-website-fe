import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { orderService } from "../services/orderService";
import type { CreateOrderRequest } from "../services/orderService";
import { useNotification } from "../components/NotificationProvider";
import { authService } from "../services/authService";

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { removeFromCart, fetchCart } = useCart();
  const notify = useNotification();

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    paymentMethod: "cod", // ✅ Mặc định là thanh toán khi nhận hàng
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ✅ Fetch user profile từ API để lấy phone
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setLoadingProfile(true);
          const profile = await authService.getUserProfile(user.id);
          console.log("User profile từ API:", profile);

          setForm((prev) => ({
            ...prev,
            name: profile.fullname || "",
            phone: profile.phone || "",
          }));
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
          // Fallback về user từ context nếu API thất bại
          setForm((prev) => ({
            ...prev,
            name: user.fullname || "",
            phone: user.phone || "",
          }));
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (location.state) {
      if (location.state.selectedItem) {
        setSelectedItem(location.state.selectedItem);
      } else if (location.state.selectedItems) {
        setSelectedItems(location.state.selectedItems);
      }
    } else {
      navigate("/cart");
    }
  }, [location.state, navigate]);

  if (!selectedItem && selectedItems.length === 0) {
    return <div>Loading...</div>;
  }

  const total = selectedItem
    ? selectedItem.price * selectedItem.qty
    : selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const shippingFee = 0;
  const grandTotal = total + shippingFee;

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    if (!user || !user.id || !user.fullname || !user.email) {
      notify.error("Vui lòng đăng nhập trước khi đặt hàng!");
      navigate("/login");
      return;
    }

    const orderData: CreateOrderRequest = {
      status: "unpaid",
      discount: 0,
      shippingFee,
      isCOD: form.paymentMethod === "cod",
      items: selectedItem
        ? [
            {
              product: { id: selectedItem.productId },
              variant: { id: selectedItem.variantId },
              quantity: selectedItem.qty,
              rate: selectedItem.price,
            },
          ]
        : selectedItems.map((item) => ({
            product: { id: item.productId, name: item.name, price: item.price },
            variant: {
              id: item.variantId,
              size: item.size,
              color: item.color,
              sku: item.sku,
            },
            quantity: item.qty,
            rate: item.price,
          })),
      shippingAddress: {
        fullName: form.name,
        phone: form.phone,
        fullAddress: form.address,
        city: form.city,
        district: form.district,
        ward: form.ward,
      },
      user: { id: user.id },
    };

    try {
      const response = await orderService.createOrder(orderData);
      if (response.id) {
        // ✅ Xóa các sản phẩm đã được đặt hàng khỏi giỏ hàng
        if (selectedItem) {
          // Nếu chỉ đặt 1 sản phẩm
          await removeFromCart(selectedItem.cartKey);
        } else if (selectedItems.length > 0) {
          // Nếu đặt nhiều sản phẩm
          for (const item of selectedItems) {
            await removeFromCart(item.cartKey);
          }
        }

        // ✅ Cập nhật lại giỏ hàng từ server để badge hiển thị đúng
        await fetchCart();

        notify.success("Đặt hàng thành công!");
        navigate("/success");
      } else {
        notify.error("Đặt hàng thất bại!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      notify.error("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- Danh sách sản phẩm --- */}
        <div className="xl:col-span-2 space-y-6">
          {selectedItem && (
            <div
              key={selectedItem.cartKey}
              className="bg-white rounded-2xl shadow-xl p-6 flex flex-col lg:flex-row gap-6 hover:shadow-2xl transition"
            >
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-32 h-32 object-cover rounded-lg shadow"
              />
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                <div className="flex gap-3 text-sm text-gray-600">
                  {selectedItem.variant && (
                    <span className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs">
                      Kích thước: {selectedItem.variant.size}
                    </span>
                  )}
                  <span className="bg-orange-100 text-orange-800 rounded-md px-2 py-1 text-xs">
                    Số lượng: {selectedItem.qty}
                  </span>
                </div>
                <div className="text-gray-900 font-semibold">
                  Thành tiền:{" "}
                  <span className="text-orange-600">
                    {formatCurrency(selectedItem.price * selectedItem.qty)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedItems.length > 0 &&
            selectedItems.map((item) => (
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
                  <div className="flex gap-3 text-sm text-gray-600">
                    {item.variant && (
                      <span className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs">
                        Kích thước: {item.variant.size}
                      </span>
                    )}
                    <span className="bg-orange-100 text-orange-800 rounded-md px-2 py-1 text-xs">
                      Số lượng: {item.qty}
                    </span>
                  </div>
                  <div className="text-gray-900 font-semibold">
                    Thành tiền:{" "}
                    <span className="text-orange-600">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* --- Thanh toán --- */}
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

          {/* --- Form thông tin --- */}
          <div>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Họ tên"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="Số điện thoại"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Địa chỉ"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleFormChange}
              placeholder="Thành phố"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="text"
              name="district"
              value={form.district}
              onChange={handleFormChange}
              placeholder="Quận/Huyện"
              className="w-full p-3 border rounded-md mb-4"
            />
            <input
              type="text"
              name="ward"
              value={form.ward}
              onChange={handleFormChange}
              placeholder="Phường/Xã"
              className="w-full p-3 border rounded-md mb-4"
            />
            <textarea
              name="note"
              value={form.note}
              onChange={handleFormChange}
              placeholder="Ghi chú"
              className="w-full p-3 border rounded-md mb-4"
            />

            {/* --- Thêm phương thức thanh toán --- */}
            {/* --- Phương thức thanh toán (chỉ COD) --- */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="cod"
                name="paymentMethod"
                checked={form.paymentMethod === "cod"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentMethod: e.target.checked ? "cod" : "",
                  })
                }
                className="w-5 h-5 accent-purple-600 cursor-pointer"
              />
              <label
                htmlFor="cod"
                className="text-gray-800 cursor-pointer font-medium"
              >
                💵 Thanh toán khi nhận hàng (COD)
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
          >
            Đặt hàng ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
