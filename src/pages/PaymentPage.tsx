import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // ✅ Thêm vào để lấy user từ context
import { orderService } from "../services/orderService";
import type { CreateOrderRequest } from "../services/orderService";
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
  const { user } = useAuth(); // ✅ Lấy user từ AuthContext

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

  const shippingFee = 0; // Giả sử miễn phí vận chuyển cho đơn hàng
  const grandTotal = total + shippingFee;

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Lấy user.id từ AuthContext để gửi lên backend
  const handlePlaceOrder = async () => {
    if (!user || !user.id || !user.fullname || !user.email) {
      alert("Vui lòng đăng nhập trước khi đặt hàng!");
      navigate("/login");
      return;
    }

    const orderData: CreateOrderRequest = {
      status: "unpaid", // Giá trị hợp lệ từ 'unpaid', 'paid', 'shipped', 'delivered', 'completed', 'canceled'
      discount: 0, // Giảm giá (0%)
      shippingFee, // Phí vận chuyển (được tính trong hàm này)
      isCOD: form.paymentMethod === "cod", // Kiểm tra phương thức thanh toán COD
      items: selectedItem
        ? [
            {
              product: {
                id: selectedItem.productId,
              },
              variant: {
                id: selectedItem.variantId,
              },
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
      user: {
        id: user.id,
      },
    };

    try {
      const response = await orderService.createOrder(orderData);

      // Kiểm tra kết quả trả về từ API
      if (response.id) {
        navigate("/success");
      } else {
        alert("Đặt hàng thất bại!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Có lỗi xảy ra khi đặt hàng!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- Sản phẩm --- */}
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

          {/* Form thông tin */}
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
          </div>

          {/* Nút thanh toán */}
          <div className="flex justify-between">
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
            >
              Đặt hàng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
