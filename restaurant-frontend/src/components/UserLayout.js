import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaSignOutAlt, FaStar } from 'react-icons/fa';
import { useAuth } from '../contexts/auth';
import '../styles/UserLayout.css';

const UserLayout = ({ children }) => {
  const { currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="user-layout-loading">Đang tải thông tin người dùng...</div>;
  }

  if (!currentUser) {
    return (
      <div className="no-auth-container">
        <p>Vui lòng đăng nhập để xem thông tin tài khoản</p>
        <a href="/login" className="auth-btn">Đăng nhập</a>
      </div>
    );
  }

  // Xác định menu item nào đang active dựa vào đường dẫn
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="user-layout-container">
      <div className="user-sidebar">
        <div className="user-profile-info">
          <img
            src={currentUser?.avatar || "https://placehold.co/120x120.png?text=User"}
            alt="User"
            className="user-profile-img"
          />
          <h3>{currentUser?.name || currentUser?.username}</h3>
          <p>{currentUser?.role === "admin" ? "Quản trị viên" :
            currentUser?.role === "staff" ? "Nhân viên" : "Khách hàng"}</p>
        </div>
        <ul className="user-menu">
          <li
            className={isActive('/user/me') ? 'active' : ''}
            onClick={() => navigate('/user/me')}
          >
            <FaUser /> Thông tin cá nhân
          </li>
          <li
            className={isActive('/user/my-orders') ? 'active' : ''}
            onClick={() => navigate('/user/my-orders')}
          >
            <FaShoppingBag /> Đơn hàng của tôi
          </li>
          <li
            className={isActive('/user/my-reviews') ? 'active' : ''}
            onClick={() => navigate('/user/my-reviews')}
          >
            <FaStar /> Đánh giá của tôi
          </li>
          <li onClick={handleLogout}>
            <FaSignOutAlt /> Đăng xuất
          </li>
        </ul>
      </div>

      <div className="user-content">
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
