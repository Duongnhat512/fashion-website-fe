import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { SearchProvider } from "./contexts/SearchContext"; // 🆕 thêm dòng này
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import RevenueStatistics from "./pages/Admin/RevenueStatistics";
import SuccessPage from "./pages/SuccessPage";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* ✅ Bọc SearchProvider ở đây để Header & HomePage dùng chung */}
        <SearchProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/admin/revenue" element={<RevenueStatistics />} />
              </Routes>
            </Layout>
          </Router>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
