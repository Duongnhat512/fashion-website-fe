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
  Select,
  Checkbox,
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
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();
  const notify = useNotification();
  const { user } = useAuth();

  const [provinceSuggestions, setProvinceSuggestions] = useState<Province[]>(
    []
  );
  const [wardSuggestions, setWardSuggestions] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    setProvinceSuggestions(getProvinces());
  }, []);

  useEffect(() => {
    const city = form.getFieldValue("city");
    if (city) {
      const provinces = getProvinces();
      const province = provinces.find((p) => p.name === city);
      if (province) {
        setSelectedProvinceCode(province.code);
        const filtered = searchWards(province.code, "");
        setWardSuggestions(filtered);
      }
    }
  }, [form.getFieldValue("city")]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();
      if (response.success && Array.isArray(response.data)) {
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
      const provinces = getProvinces();
      const province = provinces.find((p) => p.name === address.city);
      if (province) {
        setSelectedProvinceCode(province.code);
        const filtered = searchWards(province.code, "");
        setWardSuggestions(filtered);
      }
    } else {
      setEditingAddress(null);
      form.resetFields();
      setSelectedProvinceCode("");
      setWardSuggestions([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    form.resetFields();
    setSelectedProvinceCode("");
    setWardSuggestions([]);
  };

  const handleSubmit = async (values: any) => {
    console.log("[Address Form] Submit started", values);
    console.log("[Address Form] User info:", {
      fullname: user?.fullname,
      phone: user?.phone,
    });

    // Validate required fields
    if (!values.city || !values.ward || !values.fullAddress) {
      notify.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const fullName = user?.fullname || "";
    const phone = user?.phone || "";

    if (!fullName || !phone) {
      notify.error("Thiếu thông tin người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName,
        phone: phone,
        city: values.city,
        ward: values.ward,
        district: values.district || "",
        fullAddress: values.fullAddress,
        isDefault: values.isDefault || false,
      };

      console.log("[Address Form] Payload:", payload);

      if (editingAddress) {
        console.log("[Address Form] Updating address:", editingAddress.id);
        const response = await addressService.updateAddress(
          editingAddress.id,
          payload
        );
        console.log("[Address Form] Update response:", response);
        if (response.success) {
          notify.success("Cập nhật địa chỉ thành công");
          fetchAddresses();
          handleCloseModal();
        } else {
          console.error("[Address Form] Update failed:", response);
          notify.error(response.message || "Không thể cập nhật địa chỉ");
        }
      } else {
        console.log("[Address Form] Creating new address");
        const response = await addressService.createAddress(payload);
        console.log("[Address Form] Create response:", response);
        if (response.success) {
          notify.success("Thêm địa chỉ thành công");
          fetchAddresses();
          handleCloseModal();
        } else {
          console.error("[Address Form] Create failed:", response);
          notify.error(response.message || "Không thể thêm địa chỉ");
        }
      }
    } catch (error) {
      console.error("[Address Form] Exception:", error);
      notify.error(
        editingAddress ? "Không thể cập nhật địa chỉ" : "Không thể thêm địa chỉ"
      );
    } finally {
      setSubmitting(false);
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
        centered
        style={{ maxWidth: "95vw" }}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        destroyOnClose
        maskClosable={false}
        keyboard={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          validateTrigger={["onBlur", "onChange"]}
          scrollToFirstError
        >
          {/* Tỉnh/Thành phố với Select */}
          <Form.Item
            label="Tỉnh/Thành phố"
            name="city"
            rules={[
              { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
            ]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const label = option?.label || option?.children;
                if (typeof label === "string") {
                  return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
              onChange={(value) => {
                form.setFieldsValue({ city: value, ward: undefined });
                const provinces = getProvinces();
                const province = provinces.find((p) => p.name === value);
                if (province) {
                  setSelectedProvinceCode(province.code);
                  const filtered = searchWards(province.code, "");
                  setWardSuggestions(filtered);
                }
              }}
            >
              {provinceSuggestions.map((province) => (
                <Select.Option key={province.code} value={province.name}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Phường/Xã */}
          <Form.Item
            label="Phường/Xã"
            name="ward"
            rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
          >
            <Select
              placeholder="Chọn phường/xã"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => {
                const label = option?.label || option?.children;
                if (typeof label === "string") {
                  return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
              getPopupContainer={(trigger) =>
                trigger.parentElement || document.body
              }
              disabled={!selectedProvinceCode}
            >
              {wardSuggestions.map((ward) => (
                <Select.Option key={ward.code} value={ward.name}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
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
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>

          <div className="flex gap-2 justify-end pt-4 border-t mt-4">
            <Button
              onClick={handleCloseModal}
              size="large"
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
            >
              {editingAddress ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
