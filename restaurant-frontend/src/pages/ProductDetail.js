import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useCart } from '../contexts/cart';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import '../styles/productDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState({
    product: null,
    warehouseProducts: [],
    categories: []
  });
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProductData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
        console.error('Error fetching product:', err);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleAddToCart = () => {
    const product = productData.product;
    if (!product) return;

    // Chuẩn bị đối tượng sản phẩm để thêm vào giỏ hàng
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageProduct,
      productID: product.productID,
    };

    addToCart(cartItem);

    // Hiển thị thông báo
    setNotification({
      show: true,
      message: `Đã thêm ${product.name} vào giỏ hàng!`
    });

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const handleOrderNow = () => {
    handleAddToCart();
    navigate('/booking');
  };

  // Xử lý lỗi hình ảnh với kích thước cố định
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/350x350/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn';
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) return <div className="pd-error">{error}</div>;
  if (!productData.product) return <div className="pd-error">Không tìm thấy sản phẩm</div>;

  const { product, warehouseProducts, categories } = productData;

  return (
    <div className="pd-container">
      {notification.show && (
        <div className="pd-notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {notification.message}
        </div>
      )}

      <Link to="/menu" className="pd-back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
        </svg>
        Quay lại thực đơn
      </Link>

      <div className="pd-main">
        <div className="pd-image-wrapper">
          <img
            src={product.imageProduct || 'https://placehold.co/350x350/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn'}
            alt={product.name}
            className="pd-image"
            onError={handleImageError}
          />
        </div>

        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-price">{product.price.toLocaleString('vi-VN')} VNĐ</div>

          <div className="pd-meta">
            <div className="pd-meta-item">
              <span className="pd-meta-label">Mã sản phẩm:</span>
              <span>{product.productID}</span>
            </div>

            {product?.type && (
              <div className="pd-meta-item">
                <span className="pd-meta-label">Loại:</span>
                <span>{product.type}</span>
              </div>
            )}

            <div className="pd-meta-item">
              <span className="pd-meta-label">Tồn kho:</span>
              <span>{product.stockQuantity} đơn vị</span>
            </div>
          </div>

          {categories?.length > 0 && (
            <div className="pd-badges">
              {categories.map(cat => (
                <span key={cat._id} className="pd-badge">{cat.name}</span>
              ))}
            </div>
          )}

          {(product.description || product.mainIngredients) && (
            <div className="pd-summary">
              <h3>Mô tả tóm tắt:</h3>
              <p>
                {product.description?.substring(0, 120)}
                {product.description?.length > 120 ? '...' : ''}
              </p>
            </div>
          )}

          <div className="pd-actions">
            <button className="pd-btn pd-btn-primary" onClick={handleAddToCart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              Thêm vào giỏ
            </button>
            <button className="pd-btn pd-btn-secondary" onClick={handleOrderNow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9H2zM1 7v1h14V7H1zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5zm2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z" />
              </svg>
              Đặt hàng
            </button>
          </div>
        </div>
      </div>

      <div className="pd-tabs">
        <div className="pd-tabs-header">
          <button
            className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Chi tiết sản phẩm
          </button>
          {product.mainIngredients && (
            <button
              className={`pd-tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Nguyên liệu
            </button>
          )}
          {warehouseProducts?.length > 0 && (
            <button
              className={`pd-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Thông tin tồn kho
            </button>
          )}
        </div>

        <div className={`pd-tab-content ${activeTab === 'description' ? 'active' : ''}`}>
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p>Không có thông tin mô tả chi tiết cho sản phẩm này.</p>
          )}
        </div>

        {product.mainIngredients && (
          <div className={`pd-tab-content ${activeTab === 'ingredients' ? 'active' : ''}`}>
            <p>{product.mainIngredients}</p>
          </div>
        )}

        {warehouseProducts?.length > 0 && (
          <div className={`pd-tab-content ${activeTab === 'inventory' ? 'active' : ''}`}>
            <table className="pd-inventory-table">
              <thead>
                <tr>
                  <th>Kho hàng</th>
                  <th>Số lượng tồn</th>
                  <th>Cập nhật gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {warehouseProducts.map(wp => (
                  <tr key={wp._id}>
                    <td>{wp.warehouse?.name || 'Không xác định'}</td>
                    <td>{wp.quantity}</td>
                    <td>{new Date(wp.lastUpdated).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pd-reviews">
        <h2 className="pd-reviews-title">Đánh giá sản phẩm</h2>
        <ReviewList productId={id} />
        <ReviewForm productId={id} onReviewSubmit={() => {
          // Hiển thị thông báo
          setNotification({
            show: true,
            message: 'Cảm ơn bạn đã gửi đánh giá!'
          });

          // Reload đánh giá sau khi người dùng gửi đánh giá mới
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }} />
      </div>
    </div>
  );
};

export default ProductDetail;
