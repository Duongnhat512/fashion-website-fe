"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authService } from "@/services/auth/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/common/NotificationProvider";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import Link from "next/link";
import LoginDialog from "@/components/common/LoginDialog";
interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dob: string;
  gender: "male" | "female" | "other" | "";
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  agreeToTerms?: string;
  otp?: string;
  general?: string;
}

type RegistrationStep = "form" | "otp" | "success";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    gender: "",
    agreeToTerms: false,
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    const processedValue =
      name === "email" ? value.trim().toLowerCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

    if (!formData.dob) {
      newErrors.dob = "Ngày sinh là bắt buộc";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 16) {
        newErrors.dob = "Bạn phải từ 16 tuổi trở lên để đăng ký";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Giới tính là bắt buộc";
    }

    if (!formData.phone) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải bắt đầu từ 0 và gồm 10 chữ số";
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
    setIsLoading(true);
    try {
      await authService.register({
        fullname: formData.fullName,
        email: formData.email,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender || undefined,
        phone: formData.phone || undefined,
        verificationToken: token,
      });
      notify.success(
        "Đăng ký tài khoản thành công! Hệ thống sẽ tự động đăng nhập..."
      );
      setCurrentStep("success");
      setTimeout(async () => {
        try {
          const loginResponse = await authService.login({
            email: formData.email,
            password: formData.password,
          });

          login(loginResponse.user, loginResponse.accessToken);
          router.replace("/");
        } catch (loginError) {
          console.error("Login error:", loginError);
        }
      }, 1000);
      const loginResponse = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      login(loginResponse.user, loginResponse.accessToken);
      router.replace("/");
    } catch (error) {
      console.error("Register error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Đăng ký không thành công. Vui lòng thử lại.",
      });
      setCurrentStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRegistrationForm = () => (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-8 space-y-6"
      onSubmit={handleSendOtp}
    >
      {errors.general && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Họ và tên */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-3 border ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } rounded-lg`}
          placeholder="Nhập họ và tên"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-3 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } rounded-lg`}
          placeholder="Nhập email của bạn"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Ngày sinh */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ngày sinh <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          className={`mt-1 block w-full max-w-full px-3 py-3 border ${
            errors.dob ? "border-red-500" : "border-gray-300"
          } rounded-lg`}
        />
        {errors.dob && (
          <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
        )}
      </div>

      {/* Giới tính */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giới tính <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {[
            { value: "male", label: "Nam" },
            { value: "female", label: "Nữ" },
            { value: "other", label: "Khác" },
          ].map((g) => (
            <label key={g.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g.value}
                checked={formData.gender === g.value}
                onChange={handleInputChange}
              />
              {g.label}
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-3 border ${
            errors.phone ? "border-red-500" : "border-gray-300"
          } rounded-lg`}
          placeholder="Nhập số điện thoại"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Mật khẩu */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-3 pr-10 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
            placeholder="Tạo mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Xác nhận mật khẩu */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-3 pr-10 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
            placeholder="Nhập lại mật khẩu"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Điều khoản */}
      <div className="flex items-center">
        <input
          name="agreeToTerms"
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">
          Tôi đồng ý với <span className="text-red-500">*</span>{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            điều khoản
          </a>{" "}
          và{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            chính sách bảo mật
          </a>
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 text-sm font-medium rounded-lg text-white ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {isLoading ? "Đang gửi mã xác thực..." : "Gửi mã xác thực"}
      </motion.button>
    </motion.form>
  );

  const renderOtpVerification = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-8 space-y-6"
    >
      <h3 className="text-center text-lg font-medium text-gray-900">
        Xác thực mã OTP
      </h3>
      <p className="text-center text-sm text-gray-600">
        Mã OTP đã được gửi đến <strong>{formData.email}</strong>
      </p>

      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Nhập mã OTP"
          className={`w-full px-3 py-3 border ${
            errors.otp ? "border-red-500" : "border-gray-300"
          } rounded-lg text-center text-lg tracking-widest`}
        />
        {errors.otp && (
          <p className="text-sm text-red-600 text-center">{errors.otp}</p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 text-sm font-medium rounded-lg text-white ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {isLoading ? "Đang xác thực..." : "Xác thực và đăng ký"}
        </motion.button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => setCurrentStep("form")}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            ← Quay lại chỉnh thông tin
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
        Tài khoản của bạn đã được tạo. <br />
        Đang chuyển hướng đến trang đăng nhập...
      </p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {currentStep === "form"
              ? "Tạo tài khoản mới"
              : currentStep === "otp"
              ? "Xác thực tài khoản"
              : "Hoàn thành"}
          </h2>
          {currentStep === "form" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Hoặc{" "}
              <button
                onClick={() => setShowLoginDialog(true)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                đăng nhập
              </button>
            </p>
          )}
        </div>

        {currentStep === "form"
          ? renderRegistrationForm()
          : currentStep === "otp"
          ? renderOtpVerification()
          : renderSuccess()}
      </motion.div>

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
