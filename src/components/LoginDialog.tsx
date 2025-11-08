import { useState } from "react";
import { Modal, message } from "antd";
import { motion } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Key,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { useNotification } from "./NotificationProvider";

type ForgotPasswordStep = "email" | "otp" | "password" | "success";

export default function LoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const notify = useNotification();
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (error?.response?.status === 500 || error?.message?.includes("500")) {
        setErrors({ general: "Thông tin đăng nhập không chính xác" });
      } else {
        setErrors({ general: error.message || "Đăng nhập thất bại" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password handlers
  const handleOpenForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotStep("email");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep("email");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      notify.error("Vui lòng nhập email");
      return;
    }
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email: forgotEmail });
      message.success("Mã OTP đã được gửi đến email của bạn");
      setForgotStep("otp");
    } catch (error: any) {
      message.error(error.message || "Không thể gửi email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      message.error("Vui lòng nhập mã OTP");
      return;
    }
    try {
      setIsLoading(true);
      const response = await authService.verifyResetOtp({
        email: forgotEmail,
        otp: parseInt(otp), // Chuyển string sang number
      });
      console.log("Verify OTP Response:", response);
      console.log("Reset Token received:", response.resetToken);

      if (!response.resetToken) {
        message.error("Không nhận được resetToken từ server");
        return;
      }

      setResetToken(response.resetToken); // Lưu resetToken từ API response
      message.success("Xác thực thành công");
      setForgotStep("password");
    } catch (error: any) {
      message.error(error.message || "Mã OTP không chính xác");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      message.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 6) {
      message.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    console.log("Reset Password Data:", {
      token: resetToken,
      password: newPassword,
      confirmPassword: confirmPassword,
    });

    if (!resetToken) {
      message.error("Token không hợp lệ. Vui lòng thử lại từ đầu.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({
        token: resetToken,
        password: newPassword,
        confirmPassword: confirmPassword,
      });
      message.success("Đặt lại mật khẩu thành công");
      setForgotStep("success");
    } catch (error: any) {
      message.error(error.message || "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep("email");
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
                onClick={handleOpenForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
              >
                Quên mật khẩu?
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-white rounded-lg p-8"
        >
          <button
            onClick={handleCloseForgotPassword}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-2 text-center">
            Quên mật khẩu
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            {forgotStep === "email" && "Nhập email để nhận mã xác thực"}
            {forgotStep === "otp" && "Nhập mã OTP đã gửi đến email"}
            {forgotStep === "password" && "Đặt mật khẩu mới cho tài khoản"}
            {forgotStep === "success" && "Hoàn tất đặt lại mật khẩu"}
          </p>

          {/* Step 1: Email */}
          {forgotStep === "email" && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {forgotStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <div className="text-sm text-gray-600 text-center">
                Gửi đến:{" "}
                <span className="font-semibold text-purple-600">
                  {forgotEmail}
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
              <button
                type="button"
                onClick={() => setForgotStep("email")}
                className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Thay đổi email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {forgotStep === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {forgotStep === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Đặt lại mật khẩu thành công!
                </h3>
                <p className="text-gray-600 text-sm">
                  Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ
                </p>
              </div>
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </motion.div>
      )}
    </Modal>
  );
}
