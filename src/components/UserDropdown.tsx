import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  avt?: string;
}

interface UserDropdownProps {
  user: User;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render khi user object thay đổi (bao gồm avatar)
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [user]); // Theo dõi toàn bộ user object thay vì chỉ user.avt

  // Tạo avatar URL với cache busting
  const avatarUrl = user.avt
    ? `${user.avt.split("?")[0]}?t=${Date.now()}&force=${forceUpdate}`
    : null;
  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: 100000 }}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-3 px-3 py-2
             bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30
             transition-all duration-300 border border-white/20"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.fullname}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center ring-2 ring-white/50">
            <span className="text-purple-600 text-sm font-bold">
              {user.fullname.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-white leading-tight truncate max-w-[120px]">
            {user.fullname}
          </p>
          <p className="text-xs text-white/70">
            {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </p>
        </div>

        <svg
          className={`w-4 h-4 text-white/80 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
          style={{ zIndex: 100001 }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 px-6 py-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-90"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div>
                <p className="font-semibold text-lg">{user.fullname}</p>
                <p className="text-white/80 text-sm truncate">{user.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white mt-1">
                  {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="p-2 space-y-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-xl transition-all duration-300"
            >
              <svg
                className="w-4 h-4 text-purple-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Thông tin cá nhân
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 rounded-xl transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 text-orange-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-2.21 0-4 1.79-4 4 0 2.21 1.79 4 4 4s4-1.79 4-4c0-2.21-1.79-4-4-4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414"
                  />
                </svg>
                Quản lý hệ thống
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300"
            >
              <svg
                className="w-4 h-4 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
