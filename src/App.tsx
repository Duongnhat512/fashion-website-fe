import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import RevenueStatistics from "./pages/Admin/components/RevenueStatistics";
import SuccessPage from "./pages/SuccessPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import Products from "./pages/Products";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* ✅ Bọc SearchProvider ở đây để Header & Products dùng chung */}
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/admin/revenue" element={<RevenueStatistics />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
