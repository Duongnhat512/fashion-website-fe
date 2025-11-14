import { useState, useEffect } from "react";
import { Card, DatePicker, Table, Tag, Spin, Row, Col, Statistic } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import statisticsService from "../../../services/statisticsService";
import type {
  DashboardStats,
  TopSellingProduct,
  ProductStats,
  OrderStats,
} from "../../../services/statisticsService";
import { useNotification } from "../../../components/NotificationProvider";

const { RangePicker } = DatePicker;

const COLORS = [
  "#10b981",
  "#fbbf24",
  "#3b82f6",
  "#06b6d4",
  "#ef4444",
  "#22c55e",
];

const OverviewSection = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  // States for statistics
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch all statistics in parallel
      const [dashboard, topSelling, products, orders] = await Promise.all([
        statisticsService.getDashboard(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        ),
        statisticsService.getTopSellingProducts(),
        statisticsService.getProductsStatistics(),
        statisticsService.getOrdersStatistics(),
      ]);

      setDashboardStats(dashboard);
      setTopProducts(topSelling);
      setProductStats(products);
      setOrderStats(orders);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      notify.error(error.message || "Không thể tải dữ liệu thống kê!");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const statusMap: Record<string, { text: string; color: string }> = {
    completed: { text: "Hoàn thành", color: "success" },
    pending: { text: "Chờ xác nhận", color: "gold" },
    ready_to_ship: { text: "Chuẩn bị hàng", color: "blue" },
    shipping: { text: "Đang giao", color: "cyan" },
    cancelled: { text: "Đã hủy", color: "red" },
    delivered: { text: "Đã giao", color: "green" },
  };

  const topProductsColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      align: "center" as const,
      render: (value: string) => <Tag color="blue">{value} SP</Tag>,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center" as const,
      render: (value: string) => <Tag color="purple">{value}</Tag>,
    },
  ];

  const orderStatusColumns = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusInfo = statusMap[status] || {
          text: status,
          color: "default",
        };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
      align: "center" as const,
      render: (value: number) => (
        <span className="font-semibold text-lg">{value}</span>
      ),
    },
    {
      title: "Tỷ lệ",
      key: "percentage",
      align: "right" as const,
      render: (_: any, record: any) => {
        const percentage = orderStats
          ? ((record.count / orderStats.totalOrders) * 100).toFixed(1)
          : 0;
        return <span className="text-gray-600">{percentage}%</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Tổng quan thống kê
        </h2>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          size="large"
          className="rounded-lg"
        />
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
        </div>
      ) : (
        <>
          {/* Dashboard Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
                  <Statistic
                    title="Tổng doanh thu"
                    value={dashboardStats?.totalRevenue || 0}
                    prefix={<DollarOutlined className="text-green-500" />}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: "#10b981", fontSize: "24px" }}
                  />
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
                  <Statistic
                    title="Tổng đơn hàng"
                    value={dashboardStats?.totalOrders || 0}
                    prefix={<ShoppingOutlined className="text-blue-500" />}
                    valueStyle={{ color: "#3b82f6", fontSize: "24px" }}
                  />
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
                  <Statistic
                    title="Khách hàng"
                    value={dashboardStats?.totalCustomers || 0}
                    prefix={<UserOutlined className="text-purple-500" />}
                    valueStyle={{ color: "#a855f7", fontSize: "24px" }}
                  />
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-500">
                  <Statistic
                    title="Tổng sản phẩm"
                    value={dashboardStats?.totalProducts || 0}
                    prefix={<AppstoreOutlined className="text-orange-500" />}
                    valueStyle={{ color: "#f97316", fontSize: "24px" }}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Product & Order Stats Summary */}
          {/* Product & Order Stats Summary */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-blue-600">
                      📊 Thống kê sản phẩm
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Tổng sản phẩm:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {productStats?.totalProducts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Đã bán:</span>
                      <span className="font-bold text-xl text-green-600">
                        {productStats?.totalSold || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700">Doanh thu:</span>
                      <span className="font-bold text-lg text-purple-600">
                        {formatCurrency(productStats?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Giá trị TB/Đơn:</span>
                      <span className="font-bold text-lg text-orange-600">
                        {formatCurrency(productStats?.averageOrderValue || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-purple-600">
                      📦 Thống kê đơn hàng
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Tổng đơn hàng:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {orderStats?.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-gray-700">Tỷ lệ hủy:</span>
                      <span className="font-bold text-xl text-red-600">
                        {orderStats?.cancelledRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Giá trị TB:</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatCurrency(orderStats?.averageOrderValue || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row gutter={[16, 16]}>
            {/* Bar Chart - Top Selling Products */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-blue-600">
                      📈 Top sản phẩm bán chạy
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="productName"
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name === "totalRevenue") {
                            return [formatCurrency(Number(value)), "Doanh thu"];
                          }
                          return [value, "Số lượng"];
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="totalQuantity"
                        fill="#3b82f6"
                        name="Số lượng bán"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>

            {/* Pie Chart - Order Status Distribution */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-purple-600">
                      🎯 Phân bố trạng thái đơn hàng
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStats?.ordersByStatus || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => {
                          const statusInfo = statusMap[entry.status] || {
                            text: entry.status,
                          };
                          return `${statusInfo.text}: ${entry.count}`;
                        }}
                      >
                        {(orderStats?.ordersByStatus || []).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          const statusInfo = statusMap[name] || { text: name };
                          return [value, statusInfo.text];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Line Chart - Revenue by Products */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-green-600">
                      💰 Biểu đồ doanh thu theo sản phẩm
                    </span>
                  }
                  className="shadow-lg"
                >
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={topProducts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="productName"
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(Number(value)),
                          "Doanh thu",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Doanh thu"
                        dot={{ fill: "#10b981", r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Data Tables */}
          {/* Data Tables */}
          <Row gutter={[16, 16]} align="stretch">
            {/* Top sản phẩm bán chạy */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-orange-600">
                      🏆 Top sản phẩm bán chạy (Chi tiết)
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <Table
                    columns={topProductsColumns}
                    dataSource={topProducts.slice(0, 3)} // 👉 Lấy đúng 3 sản phẩm
                    rowKey="productId"
                    size="small"
                    pagination={false} // 👉 Tắt phân trang
                  />
                </Card>
              </motion.div>
            </Col>

            {/* Chi tiết trạng thái đơn hàng */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-pink-600">
                      📋 Chi tiết trạng thái đơn hàng
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <Table
                    columns={orderStatusColumns}
                    dataSource={orderStats?.ordersByStatus || []}
                    rowKey="status"
                    size="small"
                    pagination={false} // Không cần phân trang
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default OverviewSection;
