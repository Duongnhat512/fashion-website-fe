import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { orderService } from "../services/orderService";
import type { CreateOrderRequest } from "../services/orderService";
import { useNotification } from "../components/NotificationProvider";
import { authService } from "../services/authService";
import { Modal } from "antd";

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
    paymentMethod: "cod",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // ✅ Lấy thông tin người dùng từ API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setLoadingProfile(true);
          const profile = await authService.getUserProfile(user.id);
          setForm((prev) => ({
            ...prev,
            name: profile.fullname || "",
            phone: profile.phone || "",
          }));
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
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

  // ✅ Nhận dữ liệu từ CartPage
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
        if (selectedItem) {
          await removeFromCart(selectedItem.cartKey);
        } else if (selectedItems.length > 0) {
          for (const item of selectedItems) {
            await removeFromCart(item.cartKey);
          }
        }
        await fetchCart();
        notify.success("Đặt hàng thành công!");
        setSuccessModalVisible(true);
      } else {
        notify.error("Đặt hàng thất bại!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      notify.error("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-300">
      <div className="w-full px-2 lg:px-4 grid grid-cols-1 xl:grid-cols-3 gap-6 pt-8 pb-24">
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
                <div className="flex gap-3 text-sm text-gray-600 items-center">
                  {selectedItem.variant && (
                    <>
                      <span className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs font-semibold">
                        Kích thước: {selectedItem.variant.size}
                      </span>
                      {selectedItem.variant.color && (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1">
                          <span className="text-xs font-semibold">Màu:</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                              style={{
                                backgroundColor:
                                  typeof selectedItem.variant.color === "string"
                                    ? selectedItem.variant.color
                                    : selectedItem.variant.color.hex || "#ccc",
                              }}
                            />
                            <span className="text-xs font-medium text-gray-900">
                              {typeof selectedItem.variant.color === "string"
                                ? selectedItem.variant.color
                                : selectedItem.variant.color.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 rounded-md px-2 py-1 text-xs">
                    Số lượng: {selectedItem.qty} x{" "}
                    {formatCurrency(selectedItem.price)}
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
                  <div className="flex gap-3 text-sm text-gray-600 items-center">
                    {item.variant && (
                      <>
                        <span className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-xs font-semibold">
                          Kích thước: {item.variant.size}
                        </span>
                        {item.variant.color && (
                          <div className="flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1">
                            <span className="text-xs font-semibold">Màu:</span>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{
                                  backgroundColor:
                                    typeof item.variant.color === "string"
                                      ? item.variant.color
                                      : item.variant.color.hex || "#ccc",
                                }}
                              />
                              <span className="text-xs font-medium text-gray-900">
                                {typeof item.variant.color === "string"
                                  ? item.variant.color
                                  : item.variant.color.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-800 rounded-md px-2 py-1 text-xs">
                      Số lượng: {item.qty} x {formatCurrency(item.price)}
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
              name="city"
              value={form.city}
              onChange={handleFormChange}
              placeholder="Tỉnh/Thành phố"
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
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Địa chỉ"
              className="w-full p-3 border rounded-md mb-4"
            />
            <textarea
              name="note"
              value={form.note}
              onChange={handleFormChange}
              placeholder="Ghi chú"
              className="w-full p-3 border rounded-md mb-4"
            />

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

      {/* Modal đặt hàng thành công */}
      <Modal
        title={null}
        open={successModalVisible}
        onCancel={() => {
          setSuccessModalVisible(false);
          navigate("/cart");
        }}
        footer={null}
        centered
        width={500}
        className="success-modal"
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h2>

          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong
            thời gian sớm nhất.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccessModalVisible(false);
                navigate("/");
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Tiếp tục mua sắm
            </button>

            <button
              onClick={() => {
                setSuccessModalVisible(false);
                navigate("/orders");
              }}
              className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition"
            >
              Xem đơn hàng của tôi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentPage;
