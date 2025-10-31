import { useState } from "react";
import { Modal } from "antd";
import { motion } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react"; // 👁️ Thêm icon
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

export default function LoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 thêm state

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6)
      newErrors.password = "Ít nhất 6 ký tự";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      login(response.user, response.accessToken);
      onClose();
    } catch (error: any) {
      // 👇 Kiểm tra lỗi 500 hoặc lỗi đăng nhập sai
      if (error?.response?.status === 500 || error?.message?.includes("500")) {
        setErrors({ general: "Thông tin đăng nhập không chính xác" });
      } else {
        setErrors({ general: error.message || "Đăng nhập thất bại" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      maskStyle={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
      }}
      bodyStyle={{ padding: 0, background: "transparent" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="p-8 sm:p-10 text-center relative">
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-extrabold text-gray-800 mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent"
          >
            Đăng nhập
          </motion.h2>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {errors.general && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 w-full px-4 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm`}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Ô nhập mật khẩu có icon 👁️ */}
            <div className="text-left relative">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 w-full px-4 py-2 pr-10 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm`}
                placeholder="Nhập mật khẩu"
              />
              {/* 👁️ Nút toggle hiện/ẩn */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(147,51,234,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:opacity-90"
              }`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </motion.button>

            {/* Link Quên mật khẩu */}
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() =>
                  alert("Tính năng quên mật khẩu đang được phát triển")
                }
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
              >
                Quên mật khẩu?
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </Modal>
  );
}
