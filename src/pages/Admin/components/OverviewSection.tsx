import React, { useEffect, useState } from "react";
import {
  Users,
  Package,
  ClipboardList,
  Warehouse,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { orderService } from "../../../services/orderService";
import { userService } from "../../../services/userService";
import { productService } from "../../../services/productService";
import { inventoryService } from "../../../services/inventoryService";
import { useNotification } from "../../../components/NotificationProvider";

// Custom hook để animate số chạy
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function (easeOutExpo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(Math.floor(startValue + (end - startValue) * easeOutExpo));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

// Component card nhỏ hiển thị dữ liệu tóm tắt với hiệu ứng số chạy
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  isNumber = true,
}: any) => {
  // Parse số từ string nếu cần
  const numericValue =
    isNumber && typeof value === "string"
      ? parseInt(value.replace(/[,.]/g, ""))
      : typeof value === "number"
      ? value
      : 0;

  const animatedCount = useCountUp(numericValue, 1500);

  const displayValue = isNumber ? animatedCount.toLocaleString("vi-VN") : value;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg flex items-center gap-4 cursor-pointer hover:shadow-2xl transition ${
        onClick ? "hover:ring-2 hover:ring-yellow-400" : ""
      }`}
    >
      <div
        className={`p-3 rounded-xl ${color} text-white flex items-center justify-center`}
      >
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
      </div>
    </motion.div>
  );
};

const OverviewSection: React.FC<{ onTabChange?: (tab: string) => void }> = ({
  onTabChange,
}) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const notify = useNotification();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [ordersData, usersData, productsData, inventoryData] =
        await Promise.all([
          orderService.getAllOrders(),
          userService.getAllUsers(),
          productService.getAllProducts(1, 1),
          inventoryService.getAllInventories(),
        ]);

      setTotalOrders(ordersData.length);
      setTotalUsers(usersData.length);
      setTotalProducts(productsData.pagination.total);

      // Tính tổng tồn kho từ tất cả inventory
      const totalOnHand = inventoryData.reduce((sum: number, item: any) => {
        return sum + (item.onHand || 0);
      }, 0);
      setTotalInventory(totalOnHand);

      // Tính doanh thu từ các đơn hàng completed trong tháng hiện tại
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const revenue = ordersData
        .filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return (
            order.status === "completed" &&
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        })
        .reduce((sum: number, order: any) => {
          return sum + (order.totalAmount || 0);
        }, 0);

      setMonthlyRevenue(revenue);
    } catch (error) {
      console.error("Không thể tải thống kê:", error);
      notify.error("Không thể tải thống kê");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Tổng quan hệ thống
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Người dùng"
          value={totalUsers}
          icon={Users}
          color="bg-gradient-to-r from-purple-500 to-indigo-500"
          isNumber={true}
          onClick={() => onTabChange?.("users")}
        />
        <StatCard
          title="Đơn hàng"
          value={totalOrders}
          icon={Package}
          color="bg-gradient-to-r from-sky-500 to-cyan-500"
          isNumber={true}
          onClick={() => onTabChange?.("orders")}
        />
        <StatCard
          title="Sản phẩm"
          value={totalProducts}
          icon={ClipboardList}
          color="bg-gradient-to-r from-pink-500 to-rose-500"
          isNumber={true}
          onClick={() => onTabChange?.("products")}
        />
        <StatCard
          title="Tồn kho"
          value={totalInventory}
          icon={Warehouse}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          isNumber={true}
          onClick={() => onTabChange?.("inventory")}
        />
        <StatCard
          title="Doanh thu tháng"
          value={`₫ ${(monthlyRevenue / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          onClick={() => onTabChange?.("revenue")}
          isNumber={false}
        />
      </div>
    </>
  );
};

export default OverviewSection;
