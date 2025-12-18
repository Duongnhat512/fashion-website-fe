"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useDispatch } from "react-redux";
import { removeMultipleItems } from "@/store/slices/cartSlice";
import { orderService } from "@/services/order/order.service";
import type { CreateOrderRequest } from "@/services/order/order.types";
import { useNotification } from "@/components/common/NotificationProvider";
import { authService } from "@/services/auth/auth.service";
import { addressService } from "@/services/address/address.service";
import type { Address } from "@/services/address/address.types";
import { Modal, Card, Tag, List, Form, Input, Button } from "antd";
import voucherService, {
  type Voucher,
} from "@/services/voucher/voucher.service";
import {
  getProvinces,
  searchProvinces,
  searchWards,
  type Province,
  type Ward,
} from "@/lib/addressUtils";
import LoginDialog from "@/components/common/LoginDialog";

const formatCurrency = (amount: number) =>
  amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart, removeFromCart, fetchCart } = useCart();
  const dispatch = useDispatch();
  const notify = useNotification();

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    note: "",
    paymentMethod: "cod",
  });

  const [newAddressForm, setNewAddressForm] = useState({
    fullAddress: "",
    city: "",
    ward: "",
    district: "",
    isDefault: false,
  });
  const [provinceSuggestions, setProvinceSuggestions] = useState<Province[]>(
    []
  );
  const [wardSuggestions, setWardSuggestions] = useState<Ward[]>([]);
  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [showWardSuggestions, setShowWardSuggestions] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [cityInput, setCityInput] = useState("");
  const [wardInput, setWardInput] = useState("");
  const [submittingAddress, setSubmittingAddress] = useState(false);

  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [autoAppliedVoucher, setAutoAppliedVoucher] = useState(false);

  useEffect(() => {}, [successModalVisible]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const profileData = await authService.getUserProfile(user.id);
          setForm((prev) => ({
            ...prev,
            fullName: profileData.fullname || prev.fullName,
            phone: profileData.phone || prev.phone,
          }));
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
          setForm((prev) => ({
            ...prev,
            fullName: user.fullname || prev.fullName,
            phone: user.phone || prev.phone,
          }));
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await addressService.getAllAddresses();
        if (response.success && Array.isArray(response.data)) {
          const addresses = response.data as Address[];
          setAllAddresses(addresses);
          const defaultAddr = addresses.find((addr) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          } else if (addresses.length > 0) {
            setSelectedAddress(addresses[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách địa chỉ:", error);
      }
    };

    if (user?.id) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    setProvinceSuggestions(getProvinces());
  }, []);

  useEffect(() => {
    const filtered = searchProvinces(cityInput);
    setProvinceSuggestions(filtered);
  }, [cityInput]);

  useEffect(() => {
    if (selectedProvinceCode) {
      const filtered = searchWards(selectedProvinceCode, wardInput);
      setWardSuggestions(filtered);
    }
  }, [selectedProvinceCode, wardInput]);

  const handleAddNewAddress = async () => {
    if (!newAddressForm.fullAddress.trim()) {
      notify.error("Vui lòng nhập địa chỉ cụ thể!");
      return;
    }
    if (!newAddressForm.city.trim()) {
      notify.error("Vui lòng chọn tỉnh/thành phố!");
      return;
    }
    if (!newAddressForm.ward.trim()) {
      notify.error("Vui lòng chọn phường/xã!");
      return;
    }

    try {
      setSubmittingAddress(true);
      const response = await addressService.createAddress({
        fullName: form.fullName,
        phone: form.phone,
        fullAddress: newAddressForm.fullAddress,
        city: newAddressForm.city,
        district: newAddressForm.district,
        ward: newAddressForm.ward,
        isDefault: newAddressForm.isDefault,
      });

      if (response.success) {
        notify.success("Thêm địa chỉ thành công!");

        setNewAddressForm({
          fullAddress: "",
          city: "",
          ward: "",
          district: "",
          isDefault: false,
        });
        setCityInput("");
        setWardInput("");
        setSelectedProvinceCode("");

        const updatedResponse = await addressService.getAllAddresses();
        if (updatedResponse.success && Array.isArray(updatedResponse.data)) {
          const addresses = updatedResponse.data as Address[];
          setAllAddresses(addresses);

          const newAddress = addresses.find(
            (addr) => addr.fullAddress === newAddressForm.fullAddress
          );
          if (newAddress) {
            setSelectedAddress(newAddress);
          }
        }

        setShowAddAddressModal(false);
        setShowAddressModal(true);
      }
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      notify.error("Không thể thêm địa chỉ!");
    } finally {
      setSubmittingAddress(false);
    }
  };

  useEffect(() => {
    if (cart && cart.length > 0) {
      const selectedKeys = searchParams.get("selected")?.split(",") || [];

      if (selectedKeys.length > 0) {
        const selectedCartItems = cart.filter((item) =>
          selectedKeys.includes(item.cartKey)
        );
        setSelectedItems(selectedCartItems);
      } else {
        setSelectedItems(cart);
      }
    } else if (!successModalVisible && !isPlacingOrder) {
      router.push("/cart");
    }
  }, [cart, searchParams, router, successModalVisible, isPlacingOrder]);

  const total = useMemo(() => {
    if (selectedItem) {
      return selectedItem.price * selectedItem.qty;
    }
    return selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [selectedItem, selectedItems]);

  useEffect(() => {
    if (
      (selectedItem || selectedItems.length > 0) &&
      !autoAppliedVoucher &&
      total > 0
    ) {
      autoApplyBestVoucher(total);
    }
  }, [selectedItem, selectedItems, total]);

  if (!selectedItem && selectedItems.length === 0) {
    return <div>Loading...</div>;
  }

  const shippingFee = 0;
  const discountAmount = selectedVoucher
    ? Math.min(
        voucherDiscount,
        selectedVoucher.maxDiscountValue || voucherDiscount
      )
    : 0;
  const grandTotal = Math.max(total - discountAmount + shippingFee, 0);

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

  const loadVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await voucherService.getAll(1, 50, undefined, true);
      setVouchers(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách voucher:", error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const autoApplyBestVoucher = async (orderTotal: number) => {
    try {
      const response = await voucherService.getAll(1, 50, undefined, true);
      const availableVouchers = response.data;

      const validVouchers = availableVouchers.filter((voucher) => {
        const isNotExpired = new Date(voucher.endDate) >= new Date();
        const hasUsageLeft =
          !voucher.usageLimit || voucher.usedCount < voucher.usageLimit;
        const meetsMinOrder = orderTotal >= (voucher.minOrderValue || 0);
        const isActive = voucher.isActive;

        return isNotExpired && hasUsageLeft && meetsMinOrder && isActive;
      });

      if (validVouchers.length === 0) {
        return;
      }

      const vouchersWithDiscount = validVouchers.map((voucher) => {
        const calculatedDiscount =
          orderTotal * (voucher.discountPercentage / 100);
        const actualDiscount = Math.min(
          calculatedDiscount,
          voucher.maxDiscountValue || calculatedDiscount
        );
        return { voucher, actualDiscount };
      });

      const bestVoucher = vouchersWithDiscount.reduce((best, current) => {
        return current.actualDiscount > best.actualDiscount ? current : best;
      });

      setSelectedVoucher(bestVoucher.voucher);
      setVoucherDiscount(bestVoucher.actualDiscount);
      setAutoAppliedVoucher(true);
      notify.success(
        `Voucher ${
          bestVoucher.voucher.code
        } đã được áp dụng - Giảm ${formatCurrency(bestVoucher.actualDiscount)}`
      );
    } catch (error) {
      console.error("Lỗi khi tự động áp dụng voucher:", error);
    }
  };

  const handleOpenVoucherModal = () => {
    setVoucherModalVisible(true);
    loadVouchers();
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    if (new Date(voucher.endDate) < new Date()) {
      notify.error("Voucher đã hết hạn");
      return;
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      notify.error("Voucher đã hết lượt sử dụng");
      return;
    }

    if (total < (voucher.minOrderValue || 0)) {
      notify.error(
        `Đơn hàng phải có giá trị tối thiểu ${formatCurrency(
          voucher.minOrderValue || 0
        )} để áp dụng voucher này`
      );
      return;
    }

    const calculatedDiscount = total * (voucher.discountPercentage / 100);
    const actualDiscount = Math.min(
      calculatedDiscount,
      voucher.maxDiscountValue || calculatedDiscount
    );

    setSelectedVoucher(voucher);
    setVoucherDiscount(actualDiscount);
    setAutoAppliedVoucher(true); // Đánh dấu là đã chọn voucher thủ công
    setVoucherModalVisible(false);
    notify.success(`Đã áp dụng voucher ${voucher.code}`);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherDiscount(0);
    setAutoAppliedVoucher(false); // Reset để có thể tự động áp dụng lại
    notify.info("Đã bỏ áp dụng voucher");
  };

  const handlePlaceOrder = async () => {
    if (!user || !user.id || !user.fullname || !user.email) {
      notify.error("Vui lòng đăng nhập trước khi đặt hàng!");
      setShowLoginDialog(true);
      return;
    }

    if (!form.fullName.trim()) {
      notify.error("Vui lòng nhập họ và tên!");
      return;
    }

    if (!form.phone.trim()) {
      notify.error("Vui lòng nhập số điện thoại!");
      return;
    }

    if (!/^0[0-9]{9}$/.test(form.phone.trim())) {
      notify.error("Số điện thoại phải bắt đầu từ 0 và gồm 10 chữ số!");
      return;
    }

    if (!selectedAddress) {
      notify.error("Vui lòng chọn địa chỉ giao hàng!");
      setShowAddressModal(true);
      return;
    }

    const orderData: CreateOrderRequest = {
      status: "unpaid",
      discount: selectedVoucher ? selectedVoucher.discountPercentage : 0,
      shippingFee,
      isCOD: form.paymentMethod === "cod",
      voucherCode: selectedVoucher?.code,
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
      addressId: selectedAddress.id,
      user: { id: user.id },
    };

    try {
      setIsPlacingOrder(true);
      const response = await orderService.createOrder(orderData);

      const cartKeysToRemove = selectedItem
        ? [selectedItem.cartKey]
        : selectedItems.map((item) => item.cartKey);

      dispatch(removeMultipleItems(cartKeysToRemove));

      notify.success("Đặt hàng thành công!");

      const status = form.paymentMethod === "cod" ? "pending" : "unpaid";
      router.push(`/orders?status=${status}`);
    } catch (error) {
      console.error("Error placing order:", error);
      notify.error("Có lỗi xảy ra khi đặt hàng!");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* Voucher Section */}
          <div className="space-y-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">%</span>
                <span className="font-medium text-gray-900">Voucher</span>
              </div>
              {selectedVoucher ? (
                <div className="flex items-center gap-2">
                  <Tag color="green" className="font-medium">
                    {selectedVoucher.code}
                  </Tag>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-red-500 hover:text-red-700 text-sm underline"
                  >
                    Bỏ voucher
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenVoucherModal}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
                >
                  <span>%</span>
                  Chọn voucher
                </button>
              )}
            </div>
            {selectedVoucher && (
              <div className="bg-white rounded-md p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-600 text-lg">
                      Giảm {selectedVoucher.discountPercentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedVoucher.title || "Voucher giảm giá"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      -
                      {formatCurrency(
                        Math.min(
                          voucherDiscount,
                          selectedVoucher.maxDiscountValue || voucherDiscount
                        )
                      )}
                    </p>
                    {selectedVoucher.maxDiscountValue &&
                      voucherDiscount > selectedVoucher.maxDiscountValue && (
                        <p className="text-xs text-gray-500">
                          (đã áp dụng giới hạn tối đa)
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr />

          <div className="flex justify-between font-semibold text-lg bg-gray-50 rounded-lg p-4 border">
            <span>Tổng cộng</span>
            <div className="text-right">
              {selectedVoucher && discountAmount > 0 && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(total + shippingFee)}
                </div>
              )}
              <div className="text-xl text-green-600 font-bold">
                {formatCurrency(grandTotal)}
              </div>
              {selectedVoucher && discountAmount > 0 && (
                <div className="text-sm text-green-600">
                  Tiết kiệm: {formatCurrency(discountAmount)}
                </div>
              )}
            </div>
          </div>

          {/* --- Form thông tin giao hàng --- */}
          <div>
            {/* Họ và tên */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nhập họ và tên"
                className="w-full p-3 border rounded-md"
                required
              />
            </div>

            {/* Số điện thoại */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="w-full p-3 border rounded-md"
                required
              />
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedAddress ? "Thay đổi" : "Chọn địa chỉ"}
                </button>
              </div>

              {selectedAddress ? (
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Tỉnh/Thành phố:
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedAddress.city}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Phường/Xã:
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedAddress.ward}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Địa chỉ:
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedAddress.fullAddress}
                        </span>
                      </div>

                      {selectedAddress.isDefault && (
                        <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500 mb-3">
                    Chưa chọn địa chỉ giao hàng
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Chọn địa chỉ giao hàng →
                  </button>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleFormChange}
                placeholder="Ghi chú cho người bán (tùy chọn)"
                className="w-full p-3 border rounded-md"
                rows={3}
              />
            </div>

            {/* Phương thức thanh toán */}
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

      {/* Modal chọn voucher */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Chọn Voucher</span>
            <Tag color="blue">{vouchers.length} voucher</Tag>
          </div>
        }
        open={voucherModalVisible}
        onCancel={() => setVoucherModalVisible(false)}
        footer={null}
        width={700}
        styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      >
        <div className="space-y-4">
          {loadingVouchers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                Đang tải danh sách voucher...
              </p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 text-gray-400">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có voucher khả dụng
              </h3>
              <p className="text-gray-500">
                Hiện tại không có voucher phù hợp với đơn hàng của bạn.
              </p>
            </div>
          ) : (
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={vouchers}
              renderItem={(voucher) => {
                const isExpired = new Date(voucher.endDate) < new Date();
                const isUsageLimitReached =
                  voucher.usageLimit && voucher.usedCount >= voucher.usageLimit;
                const isDisabled =
                  !voucher.isActive || isExpired || isUsageLimitReached;

                return (
                  <List.Item>
                    <Card
                      hoverable={!isDisabled}
                      className={`transition-all duration-200 ${
                        isDisabled
                          ? "opacity-60 bg-gray-50 border-gray-200"
                          : "hover:shadow-lg border-blue-200 hover:border-blue-300"
                      }`}
                      onClick={() =>
                        !isDisabled && handleSelectVoucher(voucher)
                      }
                      styles={{ body: { padding: "16px" } }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-lg">
                              %
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 truncate mb-1">
                              {voucher.code}
                            </h3>

                            {voucher.title && (
                              <p className="text-gray-700 font-medium mb-2">
                                {voucher.title}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                              {voucher.isActive &&
                                !isExpired &&
                                !isUsageLimitReached && (
                                  <Tag color="green">Có thể dùng</Tag>
                                )}
                              {isExpired && <Tag color="red">Hết hạn</Tag>}
                              {isUsageLimitReached && (
                                <Tag color="orange">Hết lượt</Tag>
                              )}
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-green-600">
                                  Giảm {voucher.discountPercentage}%
                                </span>
                                {voucher.maxDiscountValue && (
                                  <span className="text-gray-500">
                                    (tối đa{" "}
                                    {formatCurrency(voucher.maxDiscountValue)})
                                  </span>
                                )}
                              </div>

                              {voucher.minOrderValue &&
                                voucher.minOrderValue > 0 && (
                                  <div className="text-sm text-gray-600">
                                    Đơn tối thiểu:{" "}
                                    {formatCurrency(voucher.minOrderValue)}
                                  </div>
                                )}

                              <div className="text-sm text-gray-600">
                                Hết hạn:{" "}
                                {new Date(voucher.endDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {!isDisabled && (
                            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm">
                              Áp dụng
                            </button>
                          )}
                          {isDisabled && (
                            <div className="text-center">
                              <div className="text-gray-400 text-sm font-medium">
                                Không khả dụng
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Modal>

      {/* Modal chọn địa chỉ */}
      <Modal
        title="Chọn địa chỉ giao hàng"
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        width={700}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allAddresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  router.push("/profile/addresses");
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          ) : (
            <>
              {allAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddressModal(false);
                  }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAddress?.id === address.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {address.isDefault && (
                        <span className="inline-block text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Mặc định
                        </span>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Tỉnh/Thành phố:
                        </span>
                        <span className="font-medium text-gray-800">
                          {address.city}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Phường/Xã:
                        </span>
                        <span className="font-medium text-gray-800">
                          {address.ward}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 min-w-[100px]">
                          Địa chỉ:
                        </span>
                        <span className="font-medium text-gray-800">
                          {address.fullAddress}
                        </span>
                      </div>
                    </div>
                    {selectedAddress?.id === address.id && (
                      <div className="text-blue-600">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setShowAddAddressModal(true);
                  }}
                  className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 text-sm"
                >
                  + Thêm địa chỉ mới
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal thêm địa chỉ mới */}
      <Modal
        title="Thêm địa chỉ mới"
        open={showAddAddressModal}
        onCancel={() => {
          setShowAddAddressModal(false);
          setShowAddressModal(true);
        }}
        footer={null}
        width={600}
      >
        <div className="space-y-4 mt-4">
          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setShowProvinceSuggestions(true);
                }}
                onFocus={() => setShowProvinceSuggestions(true)}
                placeholder="Nhập tên tỉnh/thành phố"
                className="w-full p-3 border rounded-md"
              />
              {showProvinceSuggestions && provinceSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {provinceSuggestions.slice(0, 10).map((province) => (
                    <div
                      key={province.code}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setCityInput(province.name);
                        setNewAddressForm({
                          ...newAddressForm,
                          city: province.name,
                        });
                        setSelectedProvinceCode(province.code);
                        setShowProvinceSuggestions(false);
                      }}
                    >
                      {province.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Phường/Xã */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={wardInput}
                onChange={(e) => {
                  setWardInput(e.target.value);
                }}
                onFocus={() => setShowWardSuggestions(true)}
                placeholder="Nhập tên phường/xã"
                disabled={!selectedProvinceCode}
                className="w-full p-3 border rounded-md disabled:bg-gray-100"
              />
              {showWardSuggestions && wardSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {wardSuggestions.slice(0, 10).map((ward) => (
                    <div
                      key={ward.code}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setWardInput(ward.name);
                        setNewAddressForm({
                          ...newAddressForm,
                          ward: ward.name,
                        });
                        setShowWardSuggestions(false);
                      }}
                    >
                      {ward.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Địa chỉ cụ thể */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={newAddressForm.fullAddress}
              onChange={(e) =>
                setNewAddressForm({
                  ...newAddressForm,
                  fullAddress: e.target.value,
                })
              }
              placeholder="Số nhà, tên đường..."
              className="w-full p-3 border rounded-md"
            />
          </div>

          {/* Đặt làm mặc định */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={newAddressForm.isDefault}
              onChange={(e) =>
                setNewAddressForm({
                  ...newAddressForm,
                  isDefault: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={() => {
                setShowAddAddressModal(false);
                setShowAddressModal(true);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAddNewAddress}
              disabled={submittingAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submittingAddress ? "Đang thêm..." : "Thêm địa chỉ"}
            </button>
          </div>
        </div>
      </Modal>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
};

export default PaymentPage;
