import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <CheckCircle className="w-20 h-20 text-green-500 drop-shadow-lg" />
            <div className="absolute inset-0 bg-green-400/30 blur-2xl rounded-full"></div>
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã tin tưởng và đặt hàng tại{" "}
          <span className="text-purple-600 font-semibold">BOOBOO</span>.
          <br />
          Đơn hàng của bạn đang được xử lý, chúng tôi sẽ liên hệ sớm nhất!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Tiếp tục mua sắm
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/orders/all")}
            className="px-6 py-3 border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition"
          >
            Xem đơn hàng của tôi
          </motion.button>
        </div>

        <div className="mt-10 text-sm text-gray-500">
          <p>
            Nếu cần hỗ trợ, vui lòng liên hệ{" "}
            <a
              href="mailto:support@booboo.vn"
              className="text-blue-600 font-medium hover:underline"
            >
              support@booboo.vn
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
