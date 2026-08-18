/* eslint-disable no-undef */
import React, { useState, useCallback, useLayoutEffect } from "react";
import "../styles/menu.css";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useCart } from "../contexts/cart";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // Lấy danh mục từ API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get("/categories");
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Thêm danh mục "Tất cả" để hiển thị tất cả sản phẩm
        const allCategory = { _id: 'all', name: 'Tất cả' };
        const updatedCategories = [allCategory, ...response.data];
        setCategories(updatedCategories);
        setActiveCategory(allCategory); // Chọn danh mục "Tất cả" làm mặc định
      } else {
        console.error("Invalid categories format:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // Lấy danh sách món ăn từ API
  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/products");
      setDishes(response.data);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    fetchCategories();
    fetchDishes();
  }, [fetchCategories, fetchDishes]);

  const handleCheckout = () => {
    navigate("/booking");
  };

  // Tính tổng giá trị giỏ hàng
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Tính giá sau khi áp dụng giảm giá
  const getFinalPrice = () => {
    return calculateTotal();
  };

  // Lọc món ăn theo danh mục đang chọn
  const filteredDishes = activeCategory?.name === 'Tất cả'
    ? dishes
    : dishes.filter(dish => dish.category === activeCategory?.name);

  // Xử lý lỗi hình ảnh và hiển thị ảnh mặc định
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/280x200/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn';
  };

  return (
    <div className="menu-container">
      <h2 className="menu-title">THỰC ĐƠN</h2>

      {/* Danh mục */}
      {categories.length > 0 && (
        <nav className="menu-nav">
          <ul>
            {categories.map((category) => (
              <li
                key={category._id}
                className={activeCategory?.name === category.name ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Danh sách món ăn */}
      {loading ? (
        <div className="loading-container">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredDishes.length > 0 ? (
            filteredDishes.map((item) => (
              <div key={item._id} className="menu-item">
                <img
                  src={item.imageProduct || 'https://placehold.co/280x200/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn'}
                  alt={item.name}
                  onError={handleImageError}
                />
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p className="price">
                    {typeof item.price === "number" ? `${item?.price?.toLocaleString()} VNĐ` : item.price}
                  </p>
                  <div className="menu-buttons">
                    <button className="order-btn" onClick={() => {
                      addToCart(item);
                      setShowCart(true); // Hiện popup giỏ hàng khi thêm món
                    }}>Đặt Món</button>
                    <button className="details-btn" onClick={() => navigate(`/products/${item._id}`)}>Chi Tiết</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-dishes-message">
              <p>Không có món ăn nào trong danh mục này.</p>
            </div>
          )}
        </div>
      )}

      {/* Popup giỏ hàng */}
      {showCart && (
        <div className="cart-popup">
          <div className="cart-header">
            <h3>Giỏ Hàng</h3>
            <button className="close-btn" onClick={() => setShowCart(false)}>✕</button>
          </div>

          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img
                      src={item.image || item.imageProduct || 'https://placehold.co/70x70/f0f0f0/555555?text=NA'}
                      alt={item.name}
                      onError={handleImageError}
                    />
                    <div className="cart-info">
                      <h4>{item.name}</h4>
                      <p>{item?.price?.toLocaleString()} VNĐ</p>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                      </div>
                    </div>
                    <button className="delete-btn" onClick={() => removeFromCart(item._id)}>🗑</button>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <div className="final-price">
                  <span>Thanh toán:</span>
                  <span>{getFinalPrice().toLocaleString()} VNĐ</span>
                </div>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>Đặt bàn ngay</button>
            </>
          ) : (
            <p className="empty-cart">Giỏ hàng trống.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
