import React, { useCallback, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/menuPreview.css"; // Import file CSS
import axiosClient from "../api/axiosClient";
import { useCart } from "../contexts/cart"; // Import useCart hook

export default function MenuPreview() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Sử dụng useCart hook

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get("/categories");
      console.log("Fetched categories:", response.data);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data);
        setActiveCategory(response.data[0]); // Chọn danh mục đầu tiên làm mặc định
      } else {
        console.error("Invalid categories format:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

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

  const handleAddToCart = (dish) => {
    addToCart(dish);
    setNotification({
      show: true,
      message: `Đã thêm ${dish.name} vào giỏ hàng!`
    });

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3000);
  };

  // Xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/250x180/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn';
  };

  // Lọc dishes dựa trên danh mục đang chọn
  const filteredDishes = dishes.filter(dish => dish.category === activeCategory?.name);

  // Hiển thị chỉ 8 món đầu tiên
  const limitedDishes = filteredDishes.slice(0, 8);

  return (
    <section className="menu-preview">
      <h2>BẠN MUỐN ĂN GÌ?</h2>

      {/* Hiển thị thông báo */}
      {notification.show && (
        <div className="preview-notification">
          {notification.message}
        </div>
      )}

      {/* Danh mục món ăn */}
      {categories.length > 0 && (
        <div className="menu-categories">
          {categories.map((category) => (
            <button
              key={category._id}
              className={`category-btn ${activeCategory?._id === category._id ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Danh sách món ăn */}
      {loading ? (
        <div className="preview-loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="menu-items">
          {limitedDishes.length > 0 ? (
            limitedDishes.map((dish) => (
              <div className="menu-preview-item" key={dish._id}>
                <img
                  src={dish.imageProduct || 'https://placehold.co/250x180/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn'}
                  alt={dish.name}
                  onError={handleImageError}
                />
                <div className="menu-preview-info">
                  <h3>{dish.name}</h3>
                  <p>{dish.price?.toLocaleString()} VNĐ</p>
                  <div className="menu-preview-buttons">
                    <button
                      className="preview-order-btn"
                      onClick={() => handleAddToCart(dish)}
                    >
                      Đặt món
                    </button>
                    <Link to={`/products/${dish._id}`} className="preview-detail-btn">Chi tiết</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="preview-empty">Không có món ăn nào trong danh mục này.</div>
          )}
        </div>
      )}

      {/* Nút xem tất cả */}
      <div className="menu-preview-footer">
        <Link to="/menu" className="see-all-btn">Xem tất cả thực đơn</Link>
      </div>
    </section>
  );
}
