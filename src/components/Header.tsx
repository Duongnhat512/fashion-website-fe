import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import UserDropdown from "./UserDropdown";
import { Badge } from "antd";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-xl font-bold hover:text-gray-600 transition-colors"
        >
          BOOBOO
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-gray-600 transition-colors">
            Trang chủ
          </Link>

          {/* Cart with badge */}
          <Link
            to="/cart"
            className="relative hover:text-gray-600 transition-colors flex items-center"
          >
            <Badge
              count={cartCount > 99 ? "99+" : cartCount}
              color="red"
              offset={[10, -5]} // chỉnh vị trí badge
              style={{
                fontWeight: 600,
                boxShadow: "0 0 0 1px #fff", // bo viền trắng cho rõ hơn
              }}
            >
              <span className="text-base">Giỏ hàng</span>
            </Badge>
          </Link>

          {/* Authentication Section */}
          {isAuthenticated && user ? (
            <UserDropdown user={user} />
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
