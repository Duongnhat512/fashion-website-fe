import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Space,
  message,
  Pagination,
  Drawer,
  List,
  Card,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  promotionService,
  type Promotion,
  type CreatePromotionRequest,
} from "../../../services/promotionService";
import { productService } from "../../../services/productService";
import dayjs from "dayjs";
import { useNotification } from "../../../components/NotificationProvider";
import VoucherManagement from "./VoucherManagement";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function PromotionManagement() {
  const notify = useNotification();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [form] = Form.useForm();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [products, setProducts] = useState<any[]>([]);

  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(
    null
  );
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [dateRange, setDateRange] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    loadPromotions();
  }, [page]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [dateRange, statusFilter, activeFilter]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAll(page, limit);
      setPromotions(response.data);
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts(1, 1000);
      setProducts(response.products);
    } catch {
      message.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  // Filter logic
  const getFilteredPromotions = () => {
    let filtered = [...promotions];

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((promo) => {
        const promoStart = dayjs(promo.startDate);
        const promoEnd = dayjs(promo.endDate);
        return promoStart.isBefore(end) && promoEnd.isAfter(start);
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((promo) => promo.status === statusFilter);
    }

    if (activeFilter !== "all") {
      if (activeFilter === "active") {
        filtered = filtered.filter((promo) => promo.active);
      } else if (activeFilter === "inactive") {
        filtered = filtered.filter((promo) => !promo.active);
      }
    }

    return filtered;
  };

  const handleResetFilters = () => {
    setDateRange(null);
    setStatusFilter("all");
    setActiveFilter("all");
    setPage(1);
  };

  const handleSubmitPromotion = async (id: string) => {
    try {
      await promotionService.submit(id);
      notify.success("Gửi duyệt thành công");
      loadPromotions();
    } catch (err: any) {
      notify.error(err.message || "Lỗi khi gửi duyệt");
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreatePromotionRequest = {
        name: values.name,
        type: values.type,
        value: values.value,
        note: values.note,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        productIds: values.productIds?.length ? values.productIds : undefined,
      };

      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, payload);
        notify.success("Cập nhật khuyến mãi thành công");
      } else {
        await promotionService.create(payload);
        notify.success("Tạo khuyến mãi thành công");
      }

      setIsModalVisible(false);
      form.resetFields();
      loadPromotions();
    } catch (err: any) {
      notify.error(err.message || "Có lỗi xảy ra");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await promotionService.activate(id);
      notify.success("Bật khuyến mãi thành công");
      loadPromotions();
    } catch {
      notify.error("Lỗi khi kích hoạt");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await promotionService.deactivate(id);
      notify.success("Tắt khuyến mãi thành công");
      loadPromotions();
    } catch {
      notify.error("Lỗi khi tắt khuyến mãi");
    }
  };

  // --------------------------
  // TABLE COLUMNS
  // --------------------------
  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên khuyến mãi",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "PERCENTAGE" ? "blue" : "green"}>
          {type === "PERCENTAGE" ? "Phần trăm" : "Giảm tiền"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      render: (_, record) =>
        record.type === "PERCENTAGE"
          ? `${record.value}%`
          : `${record.value.toLocaleString()} ₫`,
    },
    {
      title: "Thời gian",
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format("DD/MM/YYYY HH:mm")} →{" "}
          {dayjs(record.endDate).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "status",
      render: (status) => {
        if (status === "draft") return <Tag>Bản nháp</Tag>;
        if (status === "submitted") return <Tag color="blue">Đã duyệt</Tag>;
      },
    },
    {
      title: "Hoạt động",
      dataIndex: "active",
      render: (active, record) => {
        if (record.status === "draft") return <Tag>Chưa duyệt</Tag>;
        return active ? (
          <Tag color="green">Đang bật</Tag>
        ) : (
          <Tag color="red">Đang tắt</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 230,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewingPromotion(record);
              setIsDrawerVisible(true);
            }}
          >
            Xem
          </Button>
          {/* 
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button> */}

          {/* SUBMIT */}
          {record.status === "draft" && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              className="text-blue-600"
              onClick={() => handleSubmitPromotion(record.id)}
            >
              Xác nhận
            </Button>
          )}

          {/* ACTIVE / DEACTIVATE */}
          {record.status !== "draft" &&
            (record.active ? (
              // 🔥 TẮT (ĐỎ)
              <Button
                type="link"
                icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                style={{ color: "#ff4d4f", fontWeight: 600 }}
                onClick={() => handleDeactivate(record.id)}
                className="hover:bg-red-50"
              >
                Tắt
              </Button>
            ) : (
              // 🔥 BẬT (XANH)
              <Button
                type="link"
                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                style={{ color: "#52c41a", fontWeight: 600 }}
                onClick={() => handleActivate(record.id)}
                className="hover:bg-green-50"
              >
                Bật
              </Button>
            ))}
        </Space>
      ),
    },
  ];

  const filteredPromotions = getFilteredPromotions();

  // Pagination for filtered data
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  return (
    <Tabs defaultActiveKey="promotion" type="card">
      <Tabs.TabPane tab="Khuyến mãi" key="promotion">
        <div>
          {/* HEADER */}

          {/* FILTERS */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                className="bg-blue-600"
              >
                Tạo khuyến mãi
              </Button>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Thời gian:</span>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  className="w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  Trạng thái duyệt:
                </span>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-40"
                >
                  <Select.Option value="all">Tất cả</Select.Option>
                  <Select.Option value="draft">Bản nháp</Select.Option>
                  <Select.Option value="submitted">Đã duyệt</Select.Option>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Hoạt động:</span>
                <Select
                  value={activeFilter}
                  onChange={setActiveFilter}
                  className="w-32"
                >
                  <Select.Option value="all">Tất cả</Select.Option>
                  <Select.Option value="active">Đang bật</Select.Option>
                  <Select.Option value="inactive">Đang tắt</Select.Option>
                </Select>
              </div>

              <Button onClick={handleResetFilters} type="primary">
                Xem tất cả
              </Button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Table
              columns={columns}
              dataSource={paginatedPromotions}
              loading={loading}
              rowKey="id"
              pagination={false}
            />
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-8">
            <Pagination
              current={page}
              total={filteredPromotions.length}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              showTotal={(t, range) =>
                `${range[0]}-${range[1]} của ${t} khuyến mãi`
              }
            />
          </div>

          {/* MODAL CREATE / UPDATE */}
          <Modal
            title={
              editingPromotion ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"
            }
            open={isModalVisible}
            onOk={handleSubmit}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            width={700}
            okText={editingPromotion ? "Cập nhật" : "Tạo"}
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical" className="mt-4">
              <Form.Item
                name="name"
                label="Tên khuyến mãi"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="type"
                  label="Loại"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="PERCENTAGE">
                      Phần trăm (%)
                    </Select.Option>
                    <Select.Option value="FIXED_AMOUNT">
                      Giảm tiền (₫)
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="value"
                  label="Giá trị"
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-full" min={0} max={100} />
                </Form.Item>
              </div>

              <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[{ required: true }]}
              >
                <RangePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item name="productIds" label="Sản phẩm áp dụng">
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Không chọn = áp dụng tất cả"
                  options={products.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú">
                <TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>

          {/* DRAWER XEM CHI TIẾT */}
          <Drawer
            title="Chi tiết khuyến mãi"
            open={isDrawerVisible}
            onClose={() => setIsDrawerVisible(false)}
            width={600}
          >
            {viewingPromotion && (
              <div className="space-y-4">
                <Card title="Thông tin chung" size="small">
                  <p>
                    <strong>Tên:</strong> {viewingPromotion.name}
                  </p>
                  <p>
                    <strong>Loại:</strong>{" "}
                    {viewingPromotion.type === "PERCENTAGE"
                      ? "Phần trăm"
                      : "Giảm tiền"}
                  </p>
                  <p>
                    <strong>Giá trị:</strong>{" "}
                    {viewingPromotion.type === "PERCENTAGE"
                      ? `${viewingPromotion.value}%`
                      : `${viewingPromotion.value.toLocaleString()} ₫`}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{" "}
                    {dayjs(viewingPromotion.startDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}{" "}
                    →{" "}
                    {dayjs(viewingPromotion.endDate).format("DD/MM/YYYY HH:mm")}
                  </p>
                  <p>
                    <strong>Ghi chú:</strong> {viewingPromotion.note}
                  </p>
                </Card>

                <Card
                  title={`Sản phẩm áp dụng (${
                    viewingPromotion.products?.length || 0
                  })`}
                  size="small"
                >
                  {viewingPromotion.products?.length ? (
                    <List
                      dataSource={viewingPromotion.products}
                      renderItem={(product) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <img
                                src={product.imageUrl}
                                className="w-12 h-12 object-cover rounded"
                              />
                            }
                            title={
                              <span
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() =>
                                  navigate(`/products/${product.slug}`, {
                                    state: { product },
                                  })
                                }
                              >
                                {product.name}
                              </span>
                            }
                            description={product.shortDescription}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <p className="text-gray-500">Áp dụng cho tất cả sản phẩm</p>
                  )}
                </Card>
              </div>
            )}
          </Drawer>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Voucher" key="voucher">
        <VoucherManagement />
      </Tabs.TabPane>
    </Tabs>
  );
}
