import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadUserProfile = async () => {
      if (authUser?.id) {
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
          if (authUser) {
            setUser(authUser as UserProfile);
            setFormData({
              fullname: authUser.fullname || "",
              phone: (authUser as any).phone || "",
              dob: (authUser as any).dob
                ? (authUser as any).dob.split("T")[0]
                : "",
              gender: (authUser as any).gender || "",
              avt: null,
            });
            setPreviewImage((authUser as any).avt || null);
          }
        }
      }
    };

    loadUserProfile();
  }, [navigate, isAuthenticated, authUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avt: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", user!.id);
      formDataToSend.append("fullname", formData.fullname);
      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (formData.dob) formDataToSend.append("dob", formData.dob);
      if (formData.gender) formDataToSend.append("gender", formData.gender);
      if (formData.avt) formDataToSend.append("avt", formData.avt);

      await updateUser(formDataToSend);

      const updatedUser: UserProfile = {
        ...user!,
        fullname: formData.fullname,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        avt: previewImage || user!.avt,
      };

      setUser(updatedUser);
      setIsEditing(false);
      setErrors({ general: "Cập nhật thông tin thành công!" });
      setTimeout(() => setErrors({}), 3000);
    } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Thông tin cá nhân
              </h1>
            </div>
          </div>

          {/* Notification */}
          {errors.general && (
            <div
              className={`mx-8 mt-4 px-4 py-3 rounded-xl text-center font-medium ${
                errors.general.includes("thành công")
                  ? "bg-green-50 border border-green-300 text-green-700"
                  : "bg-red-50 border border-red-300 text-red-700"
              }`}
            >
              {errors.general}
            </div>
          )}

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="md:col-span-2 flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-gray-500 font-semibold">
                          {user.fullname.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-700 cursor-pointer shadow-lg">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </label>
                    )}
                  </div>
                </div>

                {/* Fullname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.fullname}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-500">{user.email}</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-gray-500">
                      {user.phone || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* DOB */}
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
                      className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  ) : (
                    <p className="text-gray-500">
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
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
                      className="w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  ) : (
                    <p className="text-gray-500">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <p className="text-gray-500">
                    {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              ← Về trang chủ
            </button>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {isLoading ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
