/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useCart } from "../contexts/cart";
import { FaShoppingCart, FaChevronRight, FaUser, FaSignOutAlt, FaSignInAlt, FaBars, FaShoppingBag, FaCommentAlt, FaHome, FaUtensils, FaCalendarAlt } from "react-icons/fa";
import "../styles/navbar.css";
import { NavDropdown } from "react-bootstrap";

function Navbar() {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sử dụng useRef để theo dõi các phần tử DOM
  const miniCartRef = useRef(null);
  const cartIconRef = useRef(null);

  // Xử lý sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Đóng mobile menu khi thay đổi route
  useEffect(() => {
    setMobileMenuActive(false);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  // Tính tổng số lượng món trong giỏ hàng
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền trong giỏ hàng
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Xử lý khi click vào biểu tượng giỏ hàng
  const handleCartClick = (e) => {
    e.preventDefault();
    setShowMiniCart(!showMiniCart);
  };

  // Xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/60x60/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn';
  };

  // Xử lý khi click bên ngoài mini cart - Sử dụng refs thay vì querySelector
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra cả hai trường hợp để đảm bảo an toàn
      if (
        showMiniCart &&
        miniCartRef.current &&
        cartIconRef.current &&
        !miniCartRef.current.contains(event.target) &&
        !cartIconRef.current.contains(event.target)
      ) {
        setShowMiniCart(false);
      }
    };

    // Chỉ thêm event listener khi mini-cart đang được hiển thị
    if (showMiniCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMiniCart]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  return (
    <nav className={`nb-navbar ${scrolled ? "scrolled" : ""} ${mobileMenuActive ? "nb-mobile-menu-active" : ""}`}>
      <Link to="/" className="nb-logo">Inferno <span>Grill.</span></Link>

      <button className="nb-mobile-menu-btn" onClick={toggleMobileMenu}>
        <FaBars />
      </button>

      <ul className="nb-nav-links">
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            <FaHome className="nb-nav-icon" />
            <span>Trang Chủ</span>
          </Link>
        </li>
        <li>
          <Link to="/menu" className={location.pathname === "/menu" ? "active" : ""}>
            <FaUtensils className="nb-nav-icon" />
            <span>Thực Đơn</span>
          </Link>
        </li>
        <li>
          <Link to="/booking" className={location.pathname === "/booking" ? "active" : ""}>
            <FaShoppingBag className="nb-nav-icon" />
            <span>Đặt Bàn</span>
          </Link>
        </li>
        <li>
          <Link to="/events" className={location.pathname === "/event" ? "active" : ""}>
            <FaCalendarAlt className="nb-nav-icon" />
            <span>Sự Kiện</span>
          </Link>
        </li>
      </ul>

      <div className="nb-nav-actions">
        <div className="nb-cart-wrapper">
          {/* Sử dụng ref thay vì selector */}
          <a href="#" className="nb-cart-icon" onClick={handleCartClick} ref={cartIconRef}>
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="nb-cart-badge">{cartItemCount}</span>}
          </a>

          {/* Mini Cart Dropdown - Sử dụng ref */}
          {showMiniCart && (
            <div className="nb-mini-cart" ref={miniCartRef}>
              <h3>Giỏ hàng của bạn</h3>

              {cart.length > 0 ? (
                <>
                  <div className="nb-mini-cart-items">
                    {cart.map(item => (
                      <div key={item._id} className="nb-mini-cart-item">
                        <img
                          src={item.image || 'https://placehold.co/60x60/f0f0f0/555555?text=NA'}
                          alt={item.name}
                          onError={handleImageError}
                        />
                        <div className="nb-mini-cart-info">
                          <h4>{item.name}</h4>
                          <div className="nb-mini-cart-price-qty">
                            <p>{item.price?.toLocaleString()} VNĐ</p>
                            <div className="nb-mini-cart-qty">
                              <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                            </div>
                          </div>
                        </div>
                        <button
                          className="nb-mini-cart-remove"
                          onClick={() => removeFromCart(item._id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="nb-mini-cart-total">
                    <span>Tổng tiền:</span>
                    <span>{totalPrice.toLocaleString()} VNĐ</span>
                  </div>

                  <div className="nb-mini-cart-buttons">
                    <button
                      className="nb-view-cart-btn"
                      onClick={() => {
                        navigate("/booking");
                        setShowMiniCart(false);
                      }}
                    >
                      Đặt bàn với món ăn này <FaChevronRight />
                    </button>
                  </div>
                </>
              ) : (
                <div className="nb-mini-cart-empty">
                  <p>Giỏ hàng của bạn đang trống</p>
                  <button
                    onClick={() => {
                      navigate("/menu");
                      setShowMiniCart(false);
                    }}
                  >
                    Xem thực đơn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="nb-user-dropdown">
            <NavDropdown
              title={
                <span className="nb-user-info">
                  <span className="nb-username">{currentUser?.name || 'Tài khoản'}</span>
                </span>
              }
              id="user-dropdown"
            >
              <NavDropdown.Item as={Link} to="/user/me" className="dropdown-item">
                <FaUser /> Tài khoản của tôi
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/user/my-reviews" className="dropdown-item">
                <FaCommentAlt /> Đánh giá của tôi
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/user/my-orders" className="dropdown-item">
                <FaShoppingBag /> Đơn hàng của tôi
              </NavDropdown.Item>
              <NavDropdown.Divider className="dropdown-divider" />
              <NavDropdown.Item onClick={handleLogout} className="dropdown-item logout">
                <FaSignOutAlt /> Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        ) : (
          <Link to="/login" className="nb-login-btn">
            <FaSignInAlt /> Đăng Nhập
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
