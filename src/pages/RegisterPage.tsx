import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../services/authService";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: string;
  otp?: string;
  general?: string;
}

type RegistrationStep = "form" | "otp" | "success";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeToTerms: false,
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản sử dụng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.sendOtp({ email: formData.email });
      setOtpSent(true);
      setCurrentStep("otp");
    } catch (error) {
      console.error("Send OTP error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Không thể gửi mã OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.verifyOtp({
        email: formData.email,
        otp: otp.trim(),
      });

      setVerificationToken(response.verificationToken);

      // Now register the user
      await handleFinalRegister(response.verificationToken);
    } catch (error) {
      console.error("Verify OTP error:", error);
      setErrors({
        otp:
          error instanceof Error
            ? error.message
            : "Mã OTP không hợp lệ. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegister = async (token: string) => {
    try {
      await authService.register({
        fullname: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        verificationToken: token,
      });

      setCurrentStep("success");

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Register error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Đăng ký không thành công. Vui lòng thử lại.",
      });
      setCurrentStep("form"); // Go back to form
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await authService.sendOtp({ email: formData.email });
      setErrors({ general: "Mã OTP mới đã được gửi!" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Không thể gửi lại mã OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "form":
        return renderRegistrationForm();
      case "otp":
        return renderOtpVerification();
      case "success":
        return renderSuccess();
      default:
        return renderRegistrationForm();
    }
  };

  const renderRegistrationForm = () => (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-8 space-y-6"
      onSubmit={handleSendOtp}
    >
      {errors.general && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            placeholder="Nhập họ và tên của bạn"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            placeholder="Nhập email của bạn"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.phone ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            placeholder="Nhập số điện thoại (tùy chọn)"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            placeholder="Nhập lại mật khẩu"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label
            htmlFor="agreeToTerms"
            className="ml-2 block text-sm text-gray-900"
          >
            Tôi đồng ý với{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              chính sách bảo mật
            </a>{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
        )}
      </div>

      <div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          } transition-colors duration-200`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang gửi mã xác thực...
            </div>
          ) : (
            "Gửi mã xác thực"
          )}
        </motion.button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </motion.form>
  );

  const renderOtpVerification = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Xác thực mã OTP</h3>
        <p className="mt-2 text-sm text-gray-600">
          Chúng tôi đã gửi mã 6 chữ số đến email{" "}
          <strong>{formData.email}</strong>
        </p>
      </div>

      {errors.general && (
        <div
          className={`px-4 py-3 rounded-lg ${
            errors.general.includes("gửi")
              ? "bg-green-50 border border-green-300 text-green-700"
              : "bg-red-50 border border-red-300 text-red-700"
          }`}
        >
          {errors.general}
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700"
          >
            Mã OTP <span className="text-red-500">*</span>
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
              errors.otp ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest`}
            placeholder="000000"
          />
          {errors.otp && (
            <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
          )}
        </div>

        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            } transition-colors duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xác thực...
              </div>
            ) : (
              "Xác thực và đăng ký"
            )}
          </motion.button>
        </div>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
          >
            Gửi lại mã OTP
          </button>
          <br />
          <button
            type="button"
            onClick={() => setCurrentStep("form")}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            ← Quay lại thay đổi thông tin
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-8"
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Đăng ký thành công!
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Tài khoản của bạn đã được tạo thành công. <br />
        Đang chuyển hướng đến trang đăng nhập...
      </p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {currentStep === "form" && "Tạo tài khoản mới"}
            {currentStep === "otp" && "Xác thực tài khoản"}
            {currentStep === "success" && "Hoàn thành"}
          </h2>
          {currentStep === "form" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Hoặc{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                đăng nhập với tài khoản có sẵn
              </Link>
            </p>
          )}
        </div>

        {renderStep()}
      </motion.div>
    </div>
  );
}
