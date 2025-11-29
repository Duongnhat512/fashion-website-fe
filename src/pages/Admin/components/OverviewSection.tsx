import { useState, useEffect } from "react";
import {
  Card,
  DatePicker,
  Table,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Select,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  LineChartOutlined,
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
  RevenueByStatus,
  RevenueTimeSeries,
  SalesDetail,
  TopProductByRevenue,
  TopProductByViews,
  HourlyRevenue,
  RevenueComparison,
  ProfitTimeSeries,
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
  const [revenueByStatus, setRevenueByStatus] = useState<RevenueByStatus[]>([]);
  const [revenueTimeSeries, setRevenueTimeSeries] = useState<
    RevenueTimeSeries[]
  >([]);
  const [salesDetail, setSalesDetail] = useState<SalesDetail | null>(null);
  const [topByRevenue, setTopByRevenue] = useState<TopProductByRevenue[]>([]);
  const [topByViews, setTopByViews] = useState<TopProductByViews[]>([]);
  const [hourlyRevenue, setHourlyRevenue] = useState<HourlyRevenue[]>([]);
  const [revenueComparison, setRevenueComparison] =
    useState<RevenueComparison | null>(null);
  const [profitTimeSeries, setProfitTimeSeries] = useState<ProfitTimeSeries[]>(
    []
  );
  const [forecastData, setForecastData] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);
  const [forecastPeriod, setForecastPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  useEffect(() => {
    fetchForecastData();
  }, [forecastPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [startDate, endDate] = dateRange;

      // Fetch all statistics in parallel
      const [
        dashboard,
        revByStatus,
        revTimeSeries,
        topSelling,
        products,
        salesDet,
        topRevenue,
        topViews,
        hourly,
        comparison,
        profit,
      ] = await Promise.all([
        statisticsService.getDashboard(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        ),
        statisticsService.getRevenueByStatus(),
        statisticsService.getRevenueTimeSeries(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        ),
        statisticsService.getTopSellingProducts(),
        statisticsService.getProductsStatistics(),
        statisticsService.getSalesDetail(),
        statisticsService.getTopProductsByRevenue(10),
        statisticsService.getTopProductsByViews(10),
        statisticsService.getRevenueHourly(),
        statisticsService.getRevenueComparison(),
        statisticsService.getProfitTimeSeries(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        ),
      ]);

      setDashboardStats(dashboard);
      setRevenueByStatus(revByStatus);
      setRevenueTimeSeries(revTimeSeries);
      setTopProducts(topSelling);
      setProductStats(products);
      setSalesDetail(salesDet);
      setTopByRevenue(topRevenue);
      setTopByViews(topViews);
      setHourlyRevenue(hourly);
      setRevenueComparison(comparison);
      setProfitTimeSeries(profit);

      // Calculate order stats
      const ordersByStatus = revByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      }));

      const totalOrders = revByStatus.reduce(
        (sum, item) => sum + parseInt(item.count),
        0
      );

      const cancelledOrders = revByStatus.find((r) => r.status === "cancelled");
      const cancelledRate =
        cancelledOrders && totalOrders > 0
          ? (parseInt(cancelledOrders.count) / totalOrders) * 100
          : 0;

      setOrderStats({
        totalOrders,
        ordersByStatus,
        cancelledRate: parseFloat(cancelledRate.toFixed(1)),
        averageOrderValue: products.averageOrderValue,
      });
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

  const fetchForecastData = async () => {
    try {
      setForecastLoading(true);
      const forecast = await statisticsService.getRevenueForecast(
        forecastPeriod
      );
      setForecastData(forecast);
    } catch (error) {
      console.error("Không thể tải dữ liệu dự báo:", error);
    } finally {
      setForecastLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatForecastCurrency = (value: number) => {
    const millionValue = value / 1000000;
    if (millionValue >= 1000) {
      return {
        value: (millionValue / 1000).toFixed(1),
        suffix: "B",
      };
    } else {
      return {
        value: millionValue.toFixed(1),
        suffix: "M",
      };
    }
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
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={8}>
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

            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-green-600">
                      📈 Chi tiết bán hàng
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">SP hoạt động:</span>
                      <span className="font-bold text-xl text-green-600">
                        {salesDetail?.activeProducts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">SP còn hàng:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {salesDetail?.inStockProducts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-700">SP đã bán:</span>
                      <span className="font-bold text-xl text-purple-600">
                        {salesDetail?.productsSold || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Tỷ lệ tồn kho:</span>
                      <span className="font-bold text-lg text-orange-600">
                        {salesDetail?.stockRate || 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="h-full"
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-purple-600">
                      💰 So sánh doanh thu
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Hiện tại:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {formatCurrency(
                          revenueComparison?.current.revenue || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Trung bình:</span>
                      <span className="font-bold text-lg text-gray-600">
                        {formatCurrency(
                          revenueComparison?.average.revenue || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700">So với hôm qua:</span>
                      <span
                        className={`font-bold text-lg ${
                          revenueComparison?.comparison.vsYesterday.trend ===
                          "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {revenueComparison?.comparison.vsYesterday.trend ===
                        "up"
                          ? "↑"
                          : "↓"}{" "}
                        {revenueComparison?.comparison.vsYesterday.percentage ||
                          0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-700">Lợi nhuận:</span>
                      <span className="font-bold text-lg text-orange-600">
                        {formatCurrency(revenueComparison?.current.profit || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Charts Section */}
          <Row gutter={[16, 16]}>
            {/* Revenue Time Series Chart */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-green-600">
                      📊 Doanh thu theo thời gian
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>

            {/* Profit Time Series Chart */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-purple-600">
                      💎 Lợi nhuận theo thời gian
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={profitTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(Number(value)),
                          "Lợi nhuận",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#a855f7"
                        strokeWidth={3}
                        name="Lợi nhuận"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Revenue by Status & Hourly Revenue */}
          <Row gutter={[16, 16]}>
            {/* Bar Chart - Revenue by Status */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-blue-600">
                      📈 Doanh thu theo trạng thái
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
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
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        name="Doanh thu"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>

            {/* Line Chart - Hourly Revenue */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-orange-600">
                      ⏰ Doanh thu theo giờ
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hourlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        label={{
                          value: "Giờ",
                          position: "insideBottom",
                          offset: -5,
                        }}
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
                        dataKey="revenue"
                        stroke="#f97316"
                        strokeWidth={2}
                        name="Doanh thu"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Lợi nhuận"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Top Products by Revenue & Views */}
          <Row gutter={[16, 16]}>
            {/* Bar Chart - Top Products by Revenue */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-green-600">
                      💰 Top sản phẩm theo doanh thu
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topByRevenue.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="productName"
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        height={80}
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
                      <Bar
                        dataKey="revenue"
                        fill="#10b981"
                        name="Doanh thu"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </Col>

            {/* Bar Chart - Top Products by Views */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Card
                  title={
                    <span className="text-lg font-semibold text-cyan-600">
                      👁️ Top sản phẩm theo lượt xem
                    </span>
                  }
                  className="shadow-lg h-full"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topByViews.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="productName"
                        tick={{ fontSize: 11 }}
                        angle={-20}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="views"
                        fill="#06b6d4"
                        name="Lượt xem"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
                        label={(entry: any) => {
                          const statusInfo = statusMap[entry.status] || {
                            text: entry.status,
                          };
                          return `${statusInfo.text}: ${entry.count}`;
                        }}
                      >
                        {(orderStats?.ordersByStatus || []).map(
                          (_entry, index) => (
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

          {/* Dự báo doanh thu */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={24}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Card
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-purple-600">
                        📈 Dự báo doanh thu
                      </span>
                      <Select
                        value={forecastPeriod}
                        onChange={(value) => setForecastPeriod(value)}
                        style={{ width: 120 }}
                        size="small"
                      >
                        <Select.Option value="week">Tuần</Select.Option>
                        <Select.Option value="month">Tháng</Select.Option>
                        <Select.Option value="quarter">Quý</Select.Option>
                        <Select.Option value="year">Năm</Select.Option>
                      </Select>
                    </div>
                  }
                  className="shadow-lg"
                >
                  {forecastLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Spin size="large" />
                      <span className="ml-3 text-gray-600">
                        Đang tải dữ liệu dự báo...
                      </span>
                    </div>
                  ) : forecastData?.forecast ? (
                    <div className="space-y-4">
                      {/* Thông tin dự báo chính */}
                      <Row gutter={16}>
                        <Col span={8}>
                          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500 h-full">
                            <Statistic
                              title={
                                <span className="text-lg font-semibold">
                                  Doanh thu dự báo
                                </span>
                              }
                              value={
                                formatForecastCurrency(
                                  forecastData.forecast.predictedRevenue
                                ).value
                              }
                              precision={1}
                              suffix={
                                formatForecastCurrency(
                                  forecastData.forecast.predictedRevenue
                                ).suffix
                              }
                              prefix={
                                <DollarOutlined className="text-purple-500 text-2xl" />
                              }
                              valueStyle={{
                                color: "#a855f7",
                                fontSize: "28px",
                                fontWeight: "bold",
                              }}
                            />
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                              Độ tin cậy:{" "}
                              {forecastData.forecast.confidence === "low"
                                ? "Thấp"
                                : forecastData.forecast.confidence === "medium"
                                ? "Trung bình"
                                : "Cao"}
                            </p>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500 h-full">
                            <Statistic
                              title={
                                <span className="text-lg font-semibold">
                                  Khoảng dự báo
                                </span>
                              }
                              value={`${
                                formatForecastCurrency(
                                  forecastData.forecast.range.min
                                ).value
                              } - ${
                                formatForecastCurrency(
                                  forecastData.forecast.range.max
                                ).value
                              }`}
                              suffix={
                                formatForecastCurrency(
                                  forecastData.forecast.range.max
                                ).suffix
                              }
                              prefix={
                                <BarChartOutlined className="text-green-500 text-2xl" />
                              }
                              valueStyle={{
                                color: "#10b981",
                                fontSize: "22px",
                                fontWeight: "bold",
                              }}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-500 h-full">
                            <Statistic
                              title={
                                <span className="text-lg font-semibold">
                                  Xu hướng
                                </span>
                              }
                              value={
                                forecastData.historicalData.trend ===
                                "increasing"
                                  ? "Tăng"
                                  : forecastData.historicalData.trend ===
                                    "decreasing"
                                  ? "Giảm"
                                  : "Ổn định"
                              }
                              prefix={
                                <LineChartOutlined className="text-orange-500 text-2xl" />
                              }
                              valueStyle={{
                                color: "#f97316",
                                fontSize: "28px",
                                fontWeight: "bold",
                              }}
                            />
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                              Tốc độ:{" "}
                              {forecastData.historicalData.growthRate.toFixed(
                                2
                              )}
                              %
                            </p>
                          </Card>
                        </Col>
                      </Row>

                      {/* Insights */}
                      <Card size="small" className="bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Phân tích & Khuyến nghị
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {forecastData.insights.summary}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm">
                              Yếu tố ảnh hưởng:
                            </h5>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {forecastData.insights.factors
                                .slice(0, 2)
                                .map((factor: string, index: number) => (
                                  <li key={index}>{factor}</li>
                                ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm">
                              Khuyến nghị:
                            </h5>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {forecastData.insights.recommendations
                                .slice(0, 2)
                                .map((rec: string, index: number) => (
                                  <li key={index}>{rec}</li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Spin size="small" />
                      <p className="mt-2 text-gray-600">
                        Đang tải dữ liệu dự báo...
                      </p>
                    </div>
                  )}
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
