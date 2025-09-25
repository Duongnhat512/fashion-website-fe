import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  avt?: string;
  role: string;
}

interface FormData {
  fullname: string;
  phone: string;
  dob: string;
  gender: "male" | "female" | "other" | "";
}

interface FormErrors {
  fullname?: string;
  phone?: string;
  dob?: string;
  general?: string;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, updateUser, logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    phone: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load user data from AuthContext
    if (authUser) {
      setUser(authUser as UserProfile);
      setFormData({
        fullname: authUser.fullname || "",
        phone: (authUser as any).phone || "",
        dob: (authUser as any).dob ? (authUser as any).dob.split("T")[0] : "", // Format date for input
        gender: (authUser as any).gender || "",
      });
    }
  }, [navigate, isAuthenticated, authUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Họ tên là bắt buộc";
    } else if (formData.fullname.trim().length < 2) {
      newErrors.fullname = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 100) {
        newErrors.dob = "Tuổi phải từ 13 đến 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data for API call
      const updateData = {
        id: user!.id, // Add user ID for the update API
        fullname: formData.fullname,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
      };

      // Call AuthContext updateUser which will handle the API call
      await updateUser(updateData);

      // Update local user state with the form data
      const updatedUser: UserProfile = {
        ...user!,
        ...updateData,
      };
      setUser(updatedUser);
      setIsEditing(false);

      // Show success message
      setErrors({ general: "Cập nhật thông tin thành công!" });
      setTimeout(() => setErrors({}), 3000);
    } catch (error) {
      console.error("Update profile error:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Cập nhật thông tin không thành công. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Thông tin cá nhân
              </h1>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {errors.general && (
            <div
              className={`mx-6 mt-4 px-4 py-3 rounded-lg ${
                errors.general.includes("thành công")
                  ? "bg-green-50 border border-green-300 text-green-700"
                  : "bg-red-50 border border-red-300 text-red-700"
              }`}
            >
              {errors.general}
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6">
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar Section */}
                <div className="md:col-span-2 flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.avt ? (
                        <img
                          src={user.avt}
                          alt={user.fullname}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-gray-600">
                          {user.fullname.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.fullname ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.fullname}</p>
                  )}
                  {errors.fullname && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullname}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-500 py-2">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Email không thể thay đổi
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {user.phone || "Chưa cập nhật"}
                    </p>
                  )}
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.dob ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
                  )}
                  {errors.dob && (
                    <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">
                      {user.gender === "male"
                        ? "Nam"
                        : user.gender === "female"
                        ? "Nữ"
                        : user.gender === "other"
                        ? "Khác"
                        : "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <p className="text-gray-500 py-2">
                    {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Về trang chủ
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
