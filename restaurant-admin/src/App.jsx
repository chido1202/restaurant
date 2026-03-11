import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";
import Home from "./page/home"; // Cập nhật import
import QlSanPham from "./page/qlsanpham";
import QlDonHang from "./page/qldonhang";
import QlSuKien from "./page/qlsukien";
import QLGiamGia from "./page/qlgiamgia";
import QlHoaDon from "./page/qlhoadon";
import QlBan from "./page/qlban";
import QlTaiKhoan from "./page/qltaikhoan";
import QlDanhMuc from "./page/qldanhmuc";
import Login from "./page/login";
import QlDanhGia from "./page/qldanhgia";

const categories = [
  { id: 4, name: "Quản lý Sản Phẩm", icon: "💻", path: "/qlsanpham" },
  { id: 5, name: "Quản lý Danh Mục", icon: "📁", path: "/qldanhmuc" }, // Thêm mục mới
  { id: 10, name: "Quản lý Bàn", icon: "🕐", path: "/qlban" },
  { id: 7, name: "Quản lý Đơn Hàng", icon: "📄", path: "/qldonhang" },
  { id: 7, name: "Quản lý Hoá đơn", icon: "💸", path: "/qlhoadon" },
  { id: 11, name: "Quản lý Tài Khoản", icon: "💵", path: "/qltaikhoan" },
  { id: 17, name: "Quản lý Sự Kiện", icon: "🎉", path: "/qlsukien" },
  { id: 18, name: "Quản lý Giảm Giá", icon: "💸", path: "/qlgiamgia" },
  { id: 19, name: "Quản lý Đánh Giá", icon: "⭐", path: "/qldanhgia" },
];

// Protected Route component - chỉ cho phép truy cập khi đã xác thực
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-container">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function NotFound() {
  return <h1>404 - Không tìm thấy trang!</h1>;
}

// Layout component với sidebar
function DashboardLayout({ children }) {
  const { logout } = useAuth();

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <Link
          to="/home"
          className={location.pathname === "/home" ? "active" : ""}
        >
          <h2 className="title">inferno grill.</h2>
        </Link>
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="category-item">
              <Link to={category.path} className="nav-link">
                {category.icon} {category.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="logout-container">
          <button onClick={logout} className="logout-button">
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="content">{children}</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Trang đăng nhập - không cần xác thực */}
      <Route path="/login" element={<Login />} />

      {/* Các trang cần xác thực */}
      <Route path="/" element={<Navigate to="/home" />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlsanpham"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlSanPham />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Thêm route cho quản lý danh mục */}
      <Route
        path="/qldanhmuc"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlDanhMuc />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qldonhang"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlDonHang />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlhoadon"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlHoaDon />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlhoadon"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlHoaDon />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlban"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlBan />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qltaikhoan"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlTaiKhoan />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlgiamgia"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QLGiamGia />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qlsukien"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlSuKien />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qldanhgia"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QlDanhGia />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Route bắt lỗi 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
