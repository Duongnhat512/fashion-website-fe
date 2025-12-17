"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Tag,
  Space,
  message,
  Pagination,
  Switch,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import voucherService, {
  type Voucher,
  type CreateVoucherRequest,
} from "../../../services/voucher/voucher.service";
import dayjs from "dayjs";
import { useNotification } from "../../../components/common/NotificationProvider";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function VoucherManagement() {
  const notify = useNotification();
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");

  useEffect(() => {
    loadVouchers();
  }, [search, isActiveFilter]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const vouchers = await voucherService.getAllVouchers();
      setAllVouchers(vouchers);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = useMemo(() => {
    let filtered = allVouchers;
    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.code.toLowerCase().includes(search.toLowerCase()) ||
          v.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (isActiveFilter === "active") {
      filtered = filtered.filter((v) => v.isActive);
    } else if (isActiveFilter === "inactive") {
      filtered = filtered.filter((v) => !v.isActive);
    }
    return filtered;
  }, [allVouchers, search, isActiveFilter]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedVouchers = filteredVouchers.slice(startIndex, endIndex);

  const handleCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      ...voucher,
      dateRange: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await voucherService.delete(id);
      notify.success("Xóa voucher thành công");
      loadVouchers();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi xóa voucher");
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await voucherService.toggle(id, isActive);
      notify.success("Cập nhật trạng thái voucher thành công");
      loadVouchers();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi cập nhật trạng thái voucher");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const voucherData: CreateVoucherRequest = {
        code: values.code,
        title: values.title,
        description: values.description,
        discountPercentage: values.discountPercentage,
        maxDiscountValue: values.maxDiscountValue,
        minOrderValue: values.minOrderValue,
        usageLimit: values.usageLimit,
        usageLimitPerUser: values.usageLimitPerUser,
        isActive: values.isActive,
        isStackable: false,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      };

      if (editingVoucher) {
        await voucherService.update(editingVoucher.id, voucherData);
        notify.success("Cập nhật voucher thành công");
      } else {
        await voucherService.create(voucherData);
        notify.success("Tạo voucher thành công");
      }

      setIsModalVisible(false);
      loadVouchers();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi lưu voucher");
    }
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (value) => `${value}%`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleToggle(record.id, checked)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Voucher
          </Button>
          <Input
            placeholder="Tìm kiếm voucher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 200, marginRight: 16, marginLeft: 16 }}
          />
          <Select
            value={isActiveFilter}
            onChange={(value) => {
              setIsActiveFilter(value);
              setPage(1);
            }}
            style={{ width: 120 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="active">Hoạt động</Select.Option>
            <Select.Option value="inactive">Không hoạt động</Select.Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={paginatedVouchers}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {filteredVouchers.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={page}
            total={filteredVouchers.length}
            pageSize={pageSize}
            onChange={setPage}
            showSizeChanger={false}
            showQuickJumper
            locale={{ jump_to: "Đi đến trang", page: "" }}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} voucher`
            }
          />
        </div>
      )}

      <Modal
        title={editingVoucher ? "Cập nhật Voucher" : "Tạo Voucher mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã Voucher"
            rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
          >
            <Input placeholder="Ví dụ: SUMMER2025" />
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề">
            <Input placeholder="Tiêu đề voucher" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea placeholder="Mô tả voucher" rows={3} />
          </Form.Item>

          <Form.Item
            name="discountPercentage"
            label="Phần trăm giảm giá"
            rules={[
              { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="maxDiscountValue"
              label="Giá trị giảm tối đa (VNĐ)"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="minOrderValue"
              label="Giá trị đơn hàng tối thiểu (VNĐ)"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="usageLimit"
              label="Số lần sử dụng tối đa"
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="usageLimitPerUser"
              label="Số lần sử dụng tối đa mỗi người"
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingVoucher ? "Cập nhật" : "Tạo"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
