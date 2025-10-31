import React, { useState } from "react";
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

const RevenueStatistics = () => {
  const [year, setYear] = useState<number>(2025);

  // 🔹 Dữ liệu mẫu doanh thu từng tháng
  const revenueData = [
    { month: "Th1", revenue: 420, profit: 120 },
    { month: "Th2", revenue: 680, profit: 220 },
    { month: "Th3", revenue: 580, profit: 160 },
    { month: "Th4", revenue: 900, profit: 260 },
    { month: "Th5", revenue: 750, profit: 200 },
    { month: "Th6", revenue: 1100, profit: 350 },
    { month: "Th7", revenue: 980, profit: 300 },
    { month: "Th8", revenue: 1250, profit: 420 },
    { month: "Th9", revenue: 1320, profit: 460 },
    { month: "Th10", revenue: 1475, profit: 510 },
    { month: "Th11", revenue: 1600, profit: 550 },
    { month: "Th12", revenue: 1850, profit: 630 },
  ];

  // 🔹 Tính tổng doanh thu & lợi nhuận
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
  const totalProfit = revenueData.reduce((sum, r) => sum + r.profit, 0);

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
              Tăng trưởng trung bình
            </h3>
            <p className="text-3xl font-bold mt-2">+12.5%</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-sm uppercase tracking-wide opacity-80">
              Đơn hàng trung bình
            </h3>
            <p className="text-3xl font-bold mt-2">≈ 435</p>
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
      </div>
    </div>
  );
};

export default RevenueStatistics;
