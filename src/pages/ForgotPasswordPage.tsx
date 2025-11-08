import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { message } from "antd";
import { Mail, Key, CheckCircle, ArrowLeft } from "lucide-react";

type Step = "email" | "otp" | "password" | "success";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Step 1: Gửi email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      message.error("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword({ email });
      message.success("Mã OTP đã được gửi đến email của bạn");
      setStep("otp");
    } catch (error: any) {
      message.error(error.message || "Không thể gửi email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      message.error("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifyResetOtp({ email, otp });
      setResetToken(response.resetToken);
      message.success("Xác thực thành công");
      setStep("password");
    } catch (error: any) {
      message.error(error.message || "Mã OTP không chính xác");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Đặt lại mật khẩu
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

    try {
      setLoading(true);
      await authService.resetPassword({ resetToken, newPassword });
      message.success("Đặt lại mật khẩu thành công");
      setStep("success");
    } catch (error: any) {
      message.error(error.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "email" && "Nhập email để nhận mã xác thực"}
            {step === "otp" && "Nhập mã OTP đã gửi đến email"}
            {step === "password" && "Đặt mật khẩu mới cho tài khoản"}
            {step === "success" && "Hoàn tất đặt lại mật khẩu"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendEmail} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div className="text-sm text-gray-600 text-center">
                Gửi đến:{" "}
                <span className="font-semibold text-purple-600">{email}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Thay đổi email
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
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
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
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
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Đặt lại mật khẩu thành công!
                </h3>
                <p className="text-gray-600">
                  Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* Back to Login */}
          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
