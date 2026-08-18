import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import UserProfile from "./pages/UserProfile";
import ProductDetail from './pages/ProductDetail';
import EventPage from "./pages/Event";
import EventDetail from "./pages/EventDetail";
import { CartProvider } from './context/CartContext';
import { AuthProvider } from "./contexts/auth";
import UserReviews from './pages/UserReviews';
import UserOrders from "./pages/UserOrders";
import PrivateRoute from './components/PrivateRoute';
import PaymentResult from "./pages/PaymentResult";

function Layout() {
  const location = useLocation();
  const hideNavbarOn = ["/login", "/register"]; // Ẩn Navbar trên trang Login & Register

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/events" element={<EventPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/payment-result" element={<PaymentResult />} /> {/* Thêm route mới */}

        {/* Trang yêu cầu đăng nhập */}
        <Route path="/user/me" element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } />
        <Route path="/user/my-reviews" element={
          <PrivateRoute>
            <UserReviews />
          </PrivateRoute>
        } />
        <Route path="/user/my-orders" element={
          <PrivateRoute>
            <UserOrders />
          </PrivateRoute>
        } />

        {/* Xử lý đường dẫn không hợp lệ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
