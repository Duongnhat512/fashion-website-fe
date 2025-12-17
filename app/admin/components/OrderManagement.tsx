"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Pagination,
  Checkbox,
  Input,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CarOutlined,
  FileTextOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { orderService } from "../../../services/order/order.service";
import type { OrderResponse } from "../../../services/order/order.types";
import { useNotification } from "../../../components/common/NotificationProvider";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [allOrders, setAllOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const notify = useNotification();
  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    let filtered =
      statusFilter === "all"
        ? allOrders
        : allOrders.filter((order) => order.status === statusFilter);

    // Lọc theo tìm kiếm mã đơn hàng
    if (searchText.trim()) {
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setOrders(filtered);
    setTotalOrders(filtered.length);
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [statusFilter, allOrders, searchText]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders(1000, 1);
      setAllOrders(data.orders);
    } catch (error) {
      notify.error("Không thể tải danh sách đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      unpaid: { color: "red", text: "Chưa thanh toán" },
      pending: { color: "orange", text: "Chờ xử lý" },
      ready_to_ship: { color: "blue", text: "Sẵn sàng giao" },
      shipping: { color: "cyan", text: "Đang giao" },
      delivered: { color: "green", text: "Đã giao" },
      completed: { color: "success", text: "Hoàn thành" },
      cancelled: { color: "default", text: "Đã hủy" },
    };
    const { color, text } = statusMap[status] || {
      color: "default",
      text: status,
    };
    return <Tag color={color}>{text}</Tag>;
  };

  const showOrderDetail = (order: OrderResponse) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleMarkAsReadyToShip = async (orderId: string) => {
    try {
      await orderService.markOrderAsReadyToShip(orderId);
      notify.success("Đã đánh dấu đơn hàng sẵn sàng giao!");
      fetchAllOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await orderService.markOrderAsDelivered(orderId);
      notify.success("Đã xác nhận đơn hàng đã giao!");
      fetchAllOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const handleMarkAsShipping = async (orderId: string) => {
    try {
      await orderService.markOrderAsShipping(orderId);
      notify.success("Đã xác nhận đơn hàng đang giao!");
      fetchAllOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const paginatedOrders = getPaginatedOrders();
      const completedOrderIds = paginatedOrders
        .filter((order) => order.status === "completed")
        .map((order) => order.id);
      setSelectedOrders(completedOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleViewInvoices = async () => {
    try {
      setInvoiceLoading(true);

      const blob = await orderService.getInvoicesData(selectedOrders);
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      notify.error("Không thể xem hóa đơn");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handlePrintInvoices = async () => {
    if (selectedOrders.length === 0) {
      notify.warning("Vui lòng chọn ít nhất một đơn hàng đã hoàn thành");
      return;
    }

    try {
      setInvoiceLoading(true);
      const blob = await orderService.downloadInvoicesBatch(selectedOrders);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify.success("Đã tải xuống hóa đơn thành công");
    } catch (error) {
      notify.error("Không thể tải xuống hóa đơn");
      console.error(error);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const getPaginatedOrders = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: allOrders.length,
      unpaid: 0,
      pending: 0,
      ready_to_ship: 0,
      shipping: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };

    allOrders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  };

  const orderColumns = [
    {
      title: () => {
        const paginatedOrders = getPaginatedOrders();
        const completedOrders = paginatedOrders.filter(
          (order) => order.status === "completed"
        );
        const allSelected =
          completedOrders.length > 0 &&
          completedOrders.every((order) => selectedOrders.includes(order.id));
        const indeterminate =
          completedOrders.some((order) => selectedOrders.includes(order.id)) &&
          !allSelected;

        return (
          <Checkbox
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={(e) => handleSelectAll(e.target.checked)}
            disabled={completedOrders.length === 0}
          />
        );
      },
      dataIndex: "select",
      key: "select",
      width: 50,
      render: (_: any, record: OrderResponse) =>
        record.status === "completed" ? (
          <Checkbox
            checked={selectedOrders.includes(record.id)}
            onChange={(e) => handleSelectOrder(record.id, e.target.checked)}
          />
        ) : null,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 200,
      render: (id: string) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      render: (user: any) => (
        <div>
          <div className="font-semibold">{user?.fullname || "N/A"}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-bold text-purple-600">
          {amount?.toLocaleString("vi-VN")}đ
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "isCOD",
      key: "isCOD",
      render: (isCOD: boolean) => (
        <Tag color={isCOD ? "orange" : "green"}>{isCOD ? "COD" : "Online"}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a: OrderResponse, b: OrderResponse) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_: any, record: OrderResponse) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
            size="small"
            block
          >
            Xem
          </Button>

          {record.status === "pending" && (
            <Button
              type="default"
              icon={<CarOutlined />}
              onClick={() => handleMarkAsReadyToShip(record.id)}
              size="small"
              block
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Xác nhận đơn hàng
            </Button>
          )}

          {record.status === "ready_to_ship" && (
            <Button
              type="default"
              icon={<CarOutlined />}
              onClick={() => handleMarkAsShipping(record.id)}
              size="small"
              block
              className="bg-cyan-500 text-white hover:bg-cyan-600"
            >
              Xác nhận giao hàng
            </Button>
          )}

          {record.status === "shipping" && (
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkAsDelivered(record.id)}
              size="small"
              block
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Xác nhận đã giao
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm theo mã đơn hàng..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={() => fetchAllOrders()}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {(() => {
          const counts = getStatusCounts();
          return (
            <>
              <Button
                type={statusFilter === "all" ? "primary" : "default"}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả ({counts.all})
              </Button>
              <Button
                type={statusFilter === "unpaid" ? "primary" : "default"}
                onClick={() => setStatusFilter("unpaid")}
              >
                Chưa thanh toán ({counts.unpaid})
              </Button>
              <Button
                type={statusFilter === "pending" ? "primary" : "default"}
                onClick={() => setStatusFilter("pending")}
              >
                Chờ xử lý ({counts.pending})
              </Button>
              <Button
                type={statusFilter === "ready_to_ship" ? "primary" : "default"}
                onClick={() => setStatusFilter("ready_to_ship")}
              >
                Sẵn sàng giao ({counts.ready_to_ship})
              </Button>
              <Button
                type={statusFilter === "shipping" ? "primary" : "default"}
                onClick={() => setStatusFilter("shipping")}
              >
                Đang giao ({counts.shipping})
              </Button>
              <Button
                type={statusFilter === "delivered" ? "primary" : "default"}
                onClick={() => setStatusFilter("delivered")}
              >
                Đã giao ({counts.delivered})
              </Button>
              <Button
                type={statusFilter === "completed" ? "primary" : "default"}
                onClick={() => setStatusFilter("completed")}
              >
                Hoàn thành ({counts.completed})
              </Button>
              <Button
                type={statusFilter === "cancelled" ? "primary" : "default"}
                onClick={() => setStatusFilter("cancelled")}
              >
                Đã hủy ({counts.cancelled})
              </Button>
            </>
          );
        })()}
      </div>

      {/* Nút hóa đơn cho đơn hàng đã hoàn thành */}
      {selectedOrders.length > 0 && (
        <div className="mb-6 flex gap-3">
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleViewInvoices}
            loading={invoiceLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Xem hóa đơn ({selectedOrders.length})
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintInvoices}
            loading={invoiceLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            In hóa đơn ({selectedOrders.length})
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table
          columns={orderColumns}
          dataSource={getPaginatedOrders()}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      {totalOrders > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={totalOrders}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper
            locale={{ jump_to: "Đi đến trang", page: "" }}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`
            }
          />
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={
          <div className="text-lg font-bold">
            Chi tiết đơn hàng #{selectedOrder?.id}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Thông tin khách hàng */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Thông tin khách hàng</h3>
              <p>
                <strong>Họ tên:</strong> {selectedOrder.user?.fullname}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.user?.email}
              </p>
              <p>
                <strong>SĐT:</strong> {selectedOrder.user?.phone}
              </p>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Địa chỉ giao hàng</h3>
              <p>
                <strong>Người nhận:</strong>{" "}
                {selectedOrder.shippingAddress?.fullName || "N/A"}
              </p>
              <p>
                <strong>SĐT:</strong>{" "}
                {selectedOrder.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                {selectedOrder.shippingAddress?.fullAddress || "N/A"}
              </p>
              <p>
                <strong>Phường/Xã:</strong>{" "}
                {selectedOrder.shippingAddress?.ward || "N/A"}
              </p>
              <p>
                <strong>Tỉnh/TP:</strong>{" "}
                {selectedOrder.shippingAddress?.city || "N/A"}
              </p>
            </div>

            {/* Sản phẩm */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Sản phẩm</h3>
              {selectedOrder.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 mb-3 pb-3 border-b last:border-b-0"
                >
                  <img
                    src={item.variant?.imageUrl}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">
                      Màu: {item.variant?.color?.name} | Size:{" "}
                      {item.variant?.size}
                    </p>
                    <p className="text-sm">
                      {item.rate?.toLocaleString("vi-VN")}đ x {item.quantity}
                    </p>
                  </div>
                  <div className="font-bold text-purple-600">
                    {item.amount?.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>{selectedOrder.subTotal?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Giảm giá:</span>
                <span className="text-red-500">
                  -{selectedOrder.discount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí ship:</span>
                <span>
                  {selectedOrder.shippingFee?.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-purple-600">
                  {selectedOrder.totalAmount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex items-center justify-between">
              <div>
                <strong>Trạng thái:</strong>{" "}
                {getStatusTag(selectedOrder.status)}
              </div>
              <div>
                <strong>Thanh toán:</strong>{" "}
                <Tag color={selectedOrder.isCOD ? "orange" : "green"}>
                  {selectedOrder.isCOD ? "COD" : "Online"}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
