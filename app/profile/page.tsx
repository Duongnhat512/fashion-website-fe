"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth/auth.service";
import { useNotification } from "@/components/common/NotificationProvider";

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
  const router = useRouter();
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
      router.replace("/login");
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
  }, [router, isAuthenticated, authUser]);

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.fullname.trim()) newErrors.fullname = "Họ tên là bắt buộc";
    else if (formData.fullname.length < 2)
      newErrors.fullname = "Họ tên phải có ít nhất 2 ký tự";

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10–11 chữ số";

    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 100) newErrors.dob = "Tuổi phải từ 13 đến 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setIsLoading(true);
    setErrors({});

    try {
      let avatarUrl = user.avt;

      if (formData.avt) {
        const uploaded = await authService.updateAvatar(formData.avt);
        avatarUrl = uploaded.avt;
      }

      const payload: Partial<UserProfile> = {
        id: user.id,
        fullname: formData.fullname,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        avt: avatarUrl,
      };

      await updateUser(payload);
      setUser({ ...user, ...payload });
      setIsEditing(false);
      notify.success("Cập nhật thông tin thành công!");
    } catch (err) {
      setErrors({ general: "Cập nhật thất bại. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setFormData({
      fullname: user.fullname || "",
      phone: user.phone || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      gender: user.gender || "",
      avt: null,
    });
    setPreviewImage(user.avt || null);
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-8 py-8 text-white text-center">
            <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
            <p className="mt-2 text-white/90">
              Quản lý và cập nhật thông tin tài khoản
            </p>
          </div>

          {/* ERROR */}
          {errors.general && (
            <div className="mx-8 mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
              {errors.general}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSave} className="px-8 py-8 space-y-6">
            {/* AVATAR */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 mx-auto">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-3xl font-bold">
                      {user.fullname[0]}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    ✎
                  </label>
                )}
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FULLNAME */}
              <div>
                <label className="font-semibold">Họ và tên *</label>
                {isEditing ? (
                  <input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                  />
                ) : (
                  <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
                    {user.fullname}
                  </p>
                )}
                {errors.fullname && (
                  <p className="text-sm text-red-600">{errors.fullname}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="font-semibold">Email</label>
                <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
                  {user.email}
                </p>
              </div>

              {/* PHONE */}
              <div>
                <label className="font-semibold">Số điện thoại</label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                  />
                ) : (
                  <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
                    {user.phone || "Chưa cập nhật"}
                  </p>
                )}
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="font-semibold">Ngày sinh</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                  />
                ) : (
                  <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
                    {user.dob
                      ? new Date(user.dob).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                )}
                {errors.dob && (
                  <p className="text-sm text-red-600">{errors.dob}</p>
                )}
              </div>

              {/* GENDER */}
              <div>
                <label className="font-semibold">Giới tính</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
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

              {/* ROLE */}
              <div>
                <label className="font-semibold">Vai trò</label>
                <p className="mt-1 px-4 py-3 border rounded-xl bg-gray-50">
                  {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                </p>
              </div>
            </div>
          </form>

          {/* FOOTER */}
          <div className="px-8 py-6 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-purple-600"
            >
              ← Về trang chủ
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
