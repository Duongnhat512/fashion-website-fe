import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSearch } from "../contexts/SearchContext";
import UserDropdown from "./UserDropdown";
import { Badge } from "antd";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import LoginDialog from "./LoginDialog";
import AccountDropdown from "./AccountDropdown";
import logo from "../assets/BooBoo.png";
export default function Header() {
  const { cartCount } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { handleSearch, clearSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const trimmed = searchQuery.trim();
    const delay = setTimeout(() => {
      if (!trimmed) {
        clearSearch();
      } else {
        handleSearch(trimmed);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-2xl backdrop-blur-lg z-50">
      <div className="relative z-10 flex items-center justify-between px-8 py-4 gap-6">
        {/* 🟣 Logo */}
        <Link
          to="/"
          className="group flex items-center space-x-3 flex-shrink-0"
          onClick={clearSearch}
        >
          <img
            src={logo}
            alt="BooBoo Logo"
            className="w-16 h-16 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300">
            BOOBOO
          </span>
        </Link>

        {/* 🔍 Thanh tìm kiếm */}
        <div className="flex-1 max-w-2xl mx-6 relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-6 py-3 pl-12 pr-12 rounded-2xl text-white
              placeholder-white/70 bg-white/10 border border-white/30
              backdrop-blur-md transition-all duration-300
              focus:outline-none focus:bg-white/20 focus:border-white/60
              group-hover:bg-white/15"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 🧭 Navigation */}
        <nav className="flex items-center gap-3 flex-shrink-0">
          {/* Trang chủ */}
          <Link
            to="/"
            onClick={clearSearch}
            className="relative group px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
          >
            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center space-x-2">
              <svg
                className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Trang chủ</span>
            </div>
          </Link>

          {/* 🔔 Thông báo */}
          <Link
            to="/notifications"
            className="relative group flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
          >
            <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>Thông báo</span>
            </div>
          </Link>

          {/* 🛒 Giỏ hàng - chỉ hiện khi đã đăng nhập */}
          {isAuthenticated && (
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/cart";
              }}
              className="relative group flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
            >
              <Badge
                count={cartCount > 99 ? "99+" : cartCount}
                color="#ef4444"
                offset={[10, -5]}
                style={{
                  fontWeight: 600,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
                  borderRadius: "12px",
                }}
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="text-base">Giỏ hàng</span>
                </div>
              </Badge>
            </Link>
          )}

          {/* 🧾 Đơn hàng - chỉ hiện nếu user thường */}
          {isAuthenticated && user?.role !== "admin" && (
            <Link
              to="/orders"
              className="relative group flex items-center space-x-2 px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-medium"
            >
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-center space-x-2">
                <svg
                  className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-base">Đơn hàng</span>
              </div>
            </Link>
          )}

          {/* 👤 Auth */}
          {isAuthenticated && user ? (
            <div className="relative flex items-center gap-3">
              <span className="text-white text-sm sm:text-base">Xin chào,</span>
              <UserDropdown user={user} />
            </div>
          ) : (
            <AccountDropdown onLoginClick={() => setShowLogin(true)} />
          )}
        </nav>
      </div>
      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}
