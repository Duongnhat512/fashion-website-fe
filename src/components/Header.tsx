import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserDropdown from "./UserDropdown";

export default function Header() {
  const { isAuthenticated, user } = useAuth();

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
          <Link to="/shop" className="hover:text-gray-600 transition-colors">
            Sản phẩm
          </Link>
          <Link to="/contact" className="hover:text-gray-600 transition-colors">
            Liên hệ
          </Link>
          <Link to="/cart" className="hover:text-gray-600 transition-colors">
            Giỏ hàng
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
