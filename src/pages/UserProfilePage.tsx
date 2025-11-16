import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { useNotification } from "../components/NotificationProvider";

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
  avt?: File | null;
}

interface FormErrors {
  fullname?: string;
  phone?: string;
  dob?: string;
  general?: string;
}

export default function UserProfilePage() {
  const notify = useNotification();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, updateUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    phone: "",
    dob: "",
    gender: "",
    avt: null,
  });

  // Load user profile
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadUserProfile = async () => {
      if (!authUser?.id) return;

      try {
        const userProfile = await authService.getUserProfile(authUser.id);
        setUser(userProfile);

        setFormData({
          fullname: userProfile.fullname || "",
          phone: userProfile.phone || "",
          dob: userProfile.dob ? userProfile.dob.split("T")[0] : "",
          gender: userProfile.gender || "",
          avt: null,
        });

        setPreviewImage(userProfile.avt || null);
      } catch {
        const fallbackUser = authUser as UserProfile;
        setUser(fallbackUser);
        setFormData({
          fullname: fallbackUser.fullname || "",
          phone: fallbackUser.phone || "",
          dob: fallbackUser.dob ? fallbackUser.dob.split("T")[0] : "",
          gender: fallbackUser.gender || "",
          avt: null,
        });
        setPreviewImage(fallbackUser.avt || null);
      }
    };

    loadUserProfile();
  }, [navigate, isAuthenticated, authUser]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle avatar change
  // Trong handleImageChange, sau khi avatar được update thành công từ API, cần gọi updateUser
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avt: file }));
      const blobUrl = URL.createObjectURL(file);
      setPreviewImage(blobUrl);
      // Nếu đang chỉnh sửa, upload ảnh ngay lập tức
      if (isEditing) {
        (async () => {
          try {
            setIsLoading(true);
            const updated = await authService.updateAvatar(file);

            let avatarUrl = updated.avt;

            // Nếu API không trả về avatar URL, gọi getUserProfile để lấy
            if (!avatarUrl && user?.id) {
              try {
                const freshUserProfile = await authService.getUserProfile(
                  user.id
                );
                avatarUrl = freshUserProfile.avt;
              } catch (profileError) {
                console.error(
                  "❌ Không thể lấy avatar từ getUserProfile:",
                  profileError
                );
              }
            }

            // Cập nhật thông tin người dùng tại local state và AuthContext
            const newUser = { ...(user || {}), ...updated } as UserProfile;
            setUser(newUser); // Cập nhật local state

            // CẬP NHẬT AuthContext NGAY LẬP TỨC - KHÔNG CHỜ ASYNC
            if (avatarUrl) {
              updateUser({ avt: avatarUrl }).catch((err) => {
                console.error("AuthContext update failed:", err);
              });
            } else {
              console.warn("⚠️ Không có avatar URL để cập nhật AuthContext");
            }

            // Đặt preview thành URL thật từ server
            setPreviewImage(avatarUrl || blobUrl);
            // Giải phóng URL blob để không chiếm dụng bộ nhớ
            URL.revokeObjectURL(blobUrl);
            notify.success("Cập nhật ảnh đại diện thành công");
          } catch (err: any) {
            console.error("Upload avatar error", err);
            notify.error(
              err?.message || "Không thể tải ảnh lên. Vui lòng thử lại."
            );
            // Fallback: revert preview to previous
            setPreviewImage(user?.avt || null);
            URL.revokeObjectURL(blobUrl);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = "Họ tên là bắt buộc";
    else if (formData.fullname.trim().length < 2)
      newErrors.fullname = "Họ tên phải có ít nhất 2 ký tự";

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";

    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 100) newErrors.dob = "Tuổi phải từ 13 đến 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user || !user.id) {
      setErrors({ general: "Không tìm thấy thông tin người dùng!" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Tạo payload - KHÔNG gửi avatar vì đã upload riêng
      const payload: Partial<UserProfile> = {
        id: user.id,
        fullname: formData.fullname,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        // Không gửi avt - avatar được update riêng qua updateAvatar
      };

      await updateUser(payload);

      // Update local state
      const updatedUser: UserProfile = {
        ...user,
        ...payload,
      };
      setUser(updatedUser);

      // Đồng bộ formData với dữ liệu mới
      setFormData({
        fullname: updatedUser.fullname || "",
        phone: updatedUser.phone || "",
        dob: updatedUser.dob ? updatedUser.dob.split("T")[0] : "",
        gender: updatedUser.gender || "",
        avt: null,
      });

      setIsEditing(false);
      setErrors({ general: "Cập nhật thông tin thành công!" });
      setTimeout(() => setErrors({}), 3000);
    } catch (error) {
      console.error("❌ Lỗi cập nhật:", error);
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

  // Cancel editing
  const handleCancel = () => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        gender: user.gender || "",
        avt: null,
      });
      setPreviewImage(user.avt || null);
    }
    setIsEditing(false);
    setErrors({});
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gray-300 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-300 opacity-20 mx-auto"></div>
            </div>
            <p className="text-purple-600 font-semibold text-lg">
              Đang tải thông tin...
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/50">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-8 py-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="relative p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-1 rounded-xl">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent">
                    Thông tin cá nhân
                  </h1>
                </div>
                <p className="text-center text-white/80 text-lg">
                  Quản lý và cập nhật thông tin tài khoản của bạn
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
            </div>

            {/* Notification */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mx-8 mt-6 px-6 py-4 rounded-xl text-center font-medium backdrop-blur-sm ${
                  errors.general.includes("thành công")
                    ? "bg-green-100/80 border border-green-300/50 text-green-700"
                    : "bg-red-100/80 border border-red-300/50 text-red-700"
                }`}
              >
                {errors.general}
              </motion.div>
            )}

            {/* Form Content */}
            <div className="px-8 py-8">
              <form onSubmit={handleSave} className="space-y-8">
                {/* Avatar Section */}
                <div className="text-center">
                  <div className="relative inline-block group">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-1">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-gray-500 font-bold">
                              {user.fullname.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    {isEditing && (
                      <motion.label
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </motion.label>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    {isEditing
                      ? "Nhấp vào biểu tượng để thay đổi ảnh đại diện"
                      : "Ảnh đại diện"}
                  </p>
                </div>

                {/* Personal Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fullname */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-300"
                          placeholder="Nhập họ và tên"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        {errors.fullname && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.fullname}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
                        {user.fullname}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
                      {user.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-300"
                          placeholder="Nhập số điện thoại"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
                        {user.phone || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        {errors.dob && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.dob}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
                        {user.dob
                          ? new Date(user.dob).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giới tính
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-300"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ) : (
                      <p className="text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
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

                  {/* Role */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <p className="text-gray-600 bg-gray-50/80 backdrop-blur-sm px-4 py-3 rounded-xl border">
                      {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer with Action Buttons */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50/80 via-white/50 to-gray-50/80 backdrop-blur-sm border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-300 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Về trang chủ</span>
                </motion.button>

                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10">Chỉnh sửa</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.button>
                  ) : (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
                      >
                        Hủy
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none transition-all duration-300 relative overflow-hidden group"
                      >
                        <span className="relative z-10">
                          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </span>
                        {!isLoading && (
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
