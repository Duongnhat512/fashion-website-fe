import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import { orderService } from "../../../services/orderService";
import { message } from "antd";

const RevenueStatistics = () => {
  const [year, setYear] = useState<number>(2025);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    fetchRevenueData();
  }, [year]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAllOrders();

      // Lọc các đơn hàng completed trong năm được chọn
      const completedOrders = ordersData.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return (
          order.status === "completed" && orderDate.getFullYear() === year
        );
      });

      // Tính doanh thu theo từng tháng
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthOrders = completedOrders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === i;
        });

        const revenue = monthOrders.reduce(
          (sum: number, order: any) => sum + (order.totalAmount || 0),
          0
        );

        // Giả sử lợi nhuận là 30% doanh thu (có thể điều chỉnh theo logic thực tế)
        const profit = revenue * 0.3;

        return {
          month: `Th${i + 1}`,
          revenue: Math.round(revenue / 1000000), // Chuyển sang triệu
          profit: Math.round(profit / 1000000),
        };
      });

      setRevenueData(monthlyData);

      // Tính tổng
      const total = monthlyData.reduce((sum, r) => sum + r.revenue, 0);
      const totalP = monthlyData.reduce((sum, r) => sum + r.profit, 0);
      setTotalRevenue(total);
      setTotalProfit(totalP);
    } catch (error) {
      console.error("Không thể tải dữ liệu doanh thu:", error);
      message.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Báo cáo doanh thu
            </h1>
            <p className="text-gray-500 mt-1">
              Phân tích kết quả kinh doanh theo tháng năm {year}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <label className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <Calendar className="text-purple-500" />
              <span className="text-gray-600 font-medium">Năm:</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border-none outline-none bg-transparent font-semibold text-purple-600"
              >
                {[2023, 2024, 2025].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Tổng quan nhanh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm uppercase tracking-wide opacity-80">
              Tổng doanh thu
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₫ {totalRevenue.toLocaleString("vi-VN")} triệu
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm uppercase tracking-wide opacity-80">
              Lợi nhuận
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₫ {totalProfit.toLocaleString("vi-VN")} triệu
            </p>
          </div>
          <div className="bg-gradient-to-r from-sky-400 to-cyan-500 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm uppercase tracking-wide opacity-80">
              Tháng cao nhất
            </h3>
            <p className="text-3xl font-bold mt-2">
              {revenueData.length > 0
                ? revenueData.reduce((max, r) =>
                    r.revenue > max.revenue ? r : max
                  ).month
                : "N/A"}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm uppercase tracking-wide opacity-80">
              Doanh thu TB/tháng
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₫{" "}
              {revenueData.length > 0
                ? Math.round(totalRevenue / 12).toLocaleString("vi-VN")
                : 0}{" "}
              triệu
            </p>
          </div>
        </div>

        {/* Biểu đồ doanh thu */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="text-yellow-500" /> Biểu đồ doanh thu & lợi
            nhuận theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                formatter={(v: number) => `${v} triệu`}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: "#f59e0b" }}
                name="Doanh thu"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e" }}
                name="Lợi nhuận"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột so sánh */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-sky-500" /> So sánh doanh thu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip formatter={(v: number) => `${v} triệu`} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
              <Bar dataKey="profit" fill="#10b981" name="Lợi nhuận" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueStatistics;
