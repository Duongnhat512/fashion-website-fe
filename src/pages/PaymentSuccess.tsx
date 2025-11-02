import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const orderId = params.get("orderId");
  const amount = Number(params.get("amount"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-green-200 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl text-center max-w-md border border-green-100"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-7xl mb-4 text-green-500"
        >
          ✅
        </motion.div>

        <h1 className="text-3xl font-extrabold text-green-700 mb-2">
          Thanh toán thành công!
        </h1>

        <p className="text-gray-700 mb-4">
          Cảm ơn bạn đã tin tưởng và mua hàng 💚 Đơn hàng{" "}
          <strong>{orderId}</strong> của bạn đã được thanh toán thành công.
        </p>

        <p className="text-xl font-semibold text-green-600 mb-8">
          Số tiền: {amount.toLocaleString("vi-VN")}₫
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
          >
            Quay lại trang chủ
          </button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-sm text-gray-500"
        >
          🌿 Chúc bạn có một ngày tuyệt vời và những trải nghiệm mua sắm vui vẻ!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
