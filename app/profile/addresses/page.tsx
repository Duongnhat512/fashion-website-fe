"use client";

import React, { useState, useEffect } from "react";
import { addressService } from "@/services/address/address.service";
import { useNotification } from "@/components/common/NotificationProvider";
import { useAuth } from "@/hooks/useAuth";
import type {
  Address,
  CreateAddressRequest,
} from "@/services/address/address.types";
import {
  Modal,
  Form,
  Input,
  Button,
  Card,
  Tag,
  Popconfirm,
  Spin,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  getProvinces,
  searchProvinces,
  searchWards,
  getProvinceByCode,
  type Province,
  type Ward,
} from "@/lib/addressUtils";

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();
  const notify = useNotification();
  const { user } = useAuth();

  // State cho tỉnh/thành và phường/xã
  const [provinceSuggestions, setProvinceSuggestions] = useState<Province[]>(
    []
  );
  const [wardSuggestions, setWardSuggestions] = useState<Ward[]>([]);
  const [showProvinceSuggestions, setShowProvinceSuggestions] = useState(false);
  const [showWardSuggestions, setShowWardSuggestions] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [cityInput, setCityInput] = useState("");
  const [wardInput, setWardInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Load danh sách tỉnh/thành ban đầu
  useEffect(() => {
    setProvinceSuggestions(getProvinces());
  }, []);

  // Tìm kiếm tỉnh/thành khi user nhập
  useEffect(() => {
    const filtered = searchProvinces(cityInput);
    setProvinceSuggestions(filtered);
  }, [cityInput]);

  // Tìm kiếm phường/xã khi user nhập và đã chọn tỉnh
  useEffect(() => {
    if (selectedProvinceCode) {
      const filtered = searchWards(selectedProvinceCode, wardInput);
      setWardSuggestions(filtered);
    }
  }, [selectedProvinceCode, wardInput]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();
      if (response.success && Array.isArray(response.data)) {
        // Sắp xếp: địa chỉ mặc định lên đầu
        const sortedAddresses = (response.data as Address[]).sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );
        setAddresses(sortedAddresses);
      }
    } catch (error) {
      notify.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      form.setFieldsValue(address);
      setCityInput(address.city);
      setWardInput(address.ward);
      // Tìm province code từ tên
      const provinces = getProvinces();
      const province = provinces.find((p) => p.name === address.city);
      if (province) setSelectedProvinceCode(province.code);
    } else {
      setEditingAddress(null);
      form.resetFields();
      // Tự động điền fullName và phone từ user
      form.setFieldsValue({
        fullName: user?.fullname || "",
        phone: user?.phone || "",
      });
      setCityInput("");
      setWardInput("");
      setSelectedProvinceCode("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    form.resetFields();
    setCityInput("");
    setWardInput("");
    setSelectedProvinceCode("");
    setShowProvinceSuggestions(false);
    setShowWardSuggestions(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Tự động thêm fullName và phone từ user nếu không có
      const payload = {
        ...values,
        fullName: values.fullName || user?.fullname || "",
        phone: values.phone || user?.phone || "",
        district: values.district || "", // Không bắt buộc
      };

      if (editingAddress) {
        // Cập nhật địa chỉ
        const response = await addressService.updateAddress(
          editingAddress.id,
          payload
        );
        if (response.success) {
          notify.success("Cập nhật địa chỉ thành công");
          fetchAddresses();
          handleCloseModal();
        }
      } else {
        // Tạo mới địa chỉ
        const response = await addressService.createAddress(payload);
        if (response.success) {
          notify.success("Thêm địa chỉ thành công");
          fetchAddresses();
          handleCloseModal();
        }
      }
    } catch (error) {
      notify.error(
        editingAddress ? "Không thể cập nhật địa chỉ" : "Không thể thêm địa chỉ"
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await addressService.deleteAddress(id);
      if (response.success) {
        notify.success("Xóa địa chỉ thành công");
        fetchAddresses();
      }
    } catch (error) {
      notify.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await addressService.setDefaultAddress(id);
      if (response.success) {
        notify.success("Đã đặt địa chỉ mặc định");
        fetchAddresses();
      }
    } catch (error) {
      notify.error("Không thể đặt địa chỉ mặc định");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-6 py-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Địa chỉ của tôi</h1>
            <p className="text-white/90 text-sm mt-1">
              Quản lý địa chỉ giao hàng
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className="bg-white text-purple-600 border-none hover:bg-gray-100"
          >
            Thêm địa chỉ
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {addresses.length === 0 ? (
          <Empty
            description="Bạn chưa có địa chỉ nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`${
                  address.isDefault
                    ? "border-2 border-blue-500 shadow-lg bg-blue-50/30"
                    : "border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400 transition-all"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  {address.isDefault ? (
                    <Tag color="blue" icon={<CheckCircleOutlined />}>
                      Địa chỉ mặc định
                    </Tag>
                  ) : (
                    <Button
                      type="dashed"
                      size="small"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <EnvironmentOutlined className="mt-1 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-gray-500 text-sm">
                        Tỉnh/Thành phố:
                      </div>
                      <div className="font-medium text-gray-800">
                        {address.city}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <EnvironmentOutlined className="mt-1 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-gray-500 text-sm">Phường/Xã:</div>
                      <div className="font-medium text-gray-800">
                        {address.ward}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <EnvironmentOutlined className="mt-1 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-gray-500 text-sm">Địa chỉ:</div>
                      <div className="font-medium text-gray-800">
                        {address.fullAddress}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleOpenModal(address)}
                  >
                    Sửa
                  </Button>

                  <Popconfirm
                    title="Xóa địa chỉ"
                    description="Bạn có chắc chắn muốn xóa địa chỉ này?"
                    onConfirm={() => handleDelete(address.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          {/* Hidden fields - tự động lấy từ user */}
          <Form.Item name="fullName" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="phone" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="district" hidden>
            <Input />
          </Form.Item>

          {/* Tỉnh/Thành phố với autocomplete */}
          <Form.Item
            label="Tỉnh/Thành phố"
            name="city"
            rules={[
              { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
            ]}
          >
            <div className="relative">
              <Input
                placeholder="Nhập tên tỉnh/thành phố"
                size="large"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  form.setFieldValue("city", e.target.value);
                  setShowProvinceSuggestions(true);
                }}
                onFocus={() => setShowProvinceSuggestions(true)}
              />
              {showProvinceSuggestions && provinceSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {provinceSuggestions.slice(0, 10).map((province) => (
                    <div
                      key={province.code}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setCityInput(province.name);
                        form.setFieldValue("city", province.name);
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
          </Form.Item>

          {/* Phường/Xã */}
          <Form.Item
            label="Phường/Xã"
            name="ward"
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          >
            <div className="relative">
              <Input
                placeholder="Nhập tên phường/xã"
                size="large"
                value={wardInput}
                onChange={(e) => {
                  setWardInput(e.target.value);
                  form.setFieldValue("ward", e.target.value);
                }}
                onFocus={() => setShowWardSuggestions(true)}
                disabled={!selectedProvinceCode}
              />
              {showWardSuggestions && wardSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {wardSuggestions
                    .filter((w) =>
                      w.name.toLowerCase().includes(wardInput.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((ward) => (
                      <div
                        key={ward.code}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setWardInput(ward.name);
                          form.setFieldValue("ward", ward.name);
                          setShowWardSuggestions(false);
                        }}
                      >
                        {ward.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Địa chỉ cụ thể"
            name="fullAddress"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Số nhà, tên đường, ..."
              size="large"
            />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="mr-2" />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>
          </Form.Item>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {editingAddress ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
