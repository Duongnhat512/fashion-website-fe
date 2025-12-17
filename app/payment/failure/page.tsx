"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const PaymentFailure: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();

  const message = params.get("message") || "Thanh toán thất bại";
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md"
      >
        <div className="text-6xl mb-4 text-red-500">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Thanh toán thất bại!
        </h1>
        <p className="text-gray-600 mb-4">
          {message} cho đơn hàng{" "}
          <strong className="text-red-600">{orderId}</strong>.
        </p>
        <button
          onClick={() => router.replace("/")}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
        >
          Quay lại trang chủ
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;
