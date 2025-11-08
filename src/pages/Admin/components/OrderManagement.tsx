import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, Truck } from "lucide-react";
import { Table, Tag, Button, Space, Modal, message, Pagination } from "antd";
import { orderService } from "../../../services/orderService";
import type { OrderResponse } from "../../../services/orderService";
import { useNotification } from "../../../components/NotificationProvider";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const notify = useNotification();
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
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
      fetchOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await orderService.markOrderAsDelivered(orderId);
      notify.success("Đã xác nhận đơn hàng đã giao!");
      fetchOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const handleMarkAsShipping = async (orderId: string) => {
    try {
      await orderService.markOrderAsShipping(orderId);
      notify.success("Đã xác nhận đơn hàng đang giao!");
      fetchOrders();
    } catch (error) {
      notify.error("Không thể cập nhật trạng thái đơn hàng");
      console.error(error);
    }
  };

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="font-mono text-xs">{id.slice(0, 8)}...</span>
      ),
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
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: OrderResponse) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<Eye size={16} />}
            onClick={() => showOrderDetail(record)}
            size="small"
            block
          >
            Xem
          </Button>

          {record.status === "pending" && (
            <Button
              type="default"
              icon={<Truck size={16} />}
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
              icon={<Truck size={16} />}
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
              icon={<CheckCircle size={16} />}
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

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
        <Button type="primary" onClick={fetchOrders} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <Button
          type={statusFilter === "all" ? "primary" : "default"}
          onClick={() => setStatusFilter("all")}
        >
          Tất cả ({orders.length})
        </Button>
        <Button
          type={statusFilter === "unpaid" ? "primary" : "default"}
          onClick={() => setStatusFilter("unpaid")}
        >
          Chưa thanh toán ({orders.filter((o) => o.status === "unpaid").length})
        </Button>
        <Button
          type={statusFilter === "pending" ? "primary" : "default"}
          onClick={() => setStatusFilter("pending")}
        >
          Chờ xử lý ({orders.filter((o) => o.status === "pending").length})
        </Button>
        <Button
          type={statusFilter === "ready_to_ship" ? "primary" : "default"}
          onClick={() => setStatusFilter("ready_to_ship")}
        >
          Sẵn sàng giao (
          {orders.filter((o) => o.status === "ready_to_ship").length})
        </Button>
        <Button
          type={statusFilter === "shipping" ? "primary" : "default"}
          onClick={() => setStatusFilter("shipping")}
        >
          Đang giao ({orders.filter((o) => o.status === "shipping").length})
        </Button>
        <Button
          type={statusFilter === "delivered" ? "primary" : "default"}
          onClick={() => setStatusFilter("delivered")}
        >
          Đã giao ({orders.filter((o) => o.status === "delivered").length})
        </Button>
        <Button
          type={statusFilter === "completed" ? "primary" : "default"}
          onClick={() => setStatusFilter("completed")}
        >
          Hoàn thành ({orders.filter((o) => o.status === "completed").length})
        </Button>
        <Button
          type={statusFilter === "cancelled" ? "primary" : "default"}
          onClick={() => setStatusFilter("cancelled")}
        >
          Đã hủy ({orders.filter((o) => o.status === "cancelled").length})
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table
          columns={orderColumns}
          dataSource={paginatedOrders}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      {filteredOrders.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={filteredOrders.length}
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
            Chi tiết đơn hàng #{selectedOrder?.id.slice(0, 8)}
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
                <strong>Quận/Huyện:</strong>{" "}
                {selectedOrder.shippingAddress?.district || "N/A"}
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
                    src={item.product?.imageUrl}
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
