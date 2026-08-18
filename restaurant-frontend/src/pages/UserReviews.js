import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { FaTrashAlt, FaEye, FaStar } from 'react-icons/fa';
import '../styles/userReviews.css';
import UserLayout from '../components/UserLayout';

const UserReviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchUserReviews();
  }, [currentUser]);

  const fetchUserReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/reviews/user/me');
      setReviews(response.data);
    } catch (err) {
      console.error('Lỗi khi tải đánh giá:', err);
      setError('Không thể tải đánh giá của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      return;
    }

    try {
      await axiosClient.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      console.error('Lỗi khi xóa đánh giá:', err);
      alert('Không thể xóa đánh giá. Vui lòng thử lại sau.');
    }
  };

  // Hiển thị trạng thái dạng badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge approved">Đã duyệt</span>;
      case 'pending':
        return <span className="badge pending">Đang xét duyệt</span>;
      case 'rejected':
        return <span className="badge rejected">Bị từ chối</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="reviews-loading">Đang tải đánh giá...</div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="reviews-error">{error}</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h2>Đánh giá của tôi</h2>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Bạn chưa có đánh giá nào.</p>
          <Link to="/menu" className="view-products-btn">Khám phá menu</Link>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="product-info">
                  {review.product?.imageProduct ? (
                    <img
                      src={review.product.imageProduct}
                      alt={review.product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/70x70.png?text=Food";
                      }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/70x70.png?text=Food"
                      alt="Product placeholder"
                      className="product-image"
                    />
                  )}
                  <div>
                    <h4>{review.product?.name || 'Sản phẩm không còn tồn tại'}</h4>
                    <span className="review-date">
                      {moment(review.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </div>
                {renderStatusBadge(review.status)}
              </div>

              <div className="review-content">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < review.rating ? 'filled' : ''}`}
                    >
                      <FaStar />
                    </span>
                  ))}
                </div>
                <p>{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Review ${index + 1}`}
                        onClick={() => handleImageClick(img)}
                        className="review-image"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/90x90.png?text=Image";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="review-actions">
                <Link
                  to={`/products/${review.product?._id}`}
                  className="view-product-btn"
                >
                  <FaEye /> Xem sản phẩm
                </Link>
                <button
                  className="delete-review-btn"
                  onClick={() => handleDeleteReview(review._id)}
                >
                  <FaTrashAlt /> Xóa đánh giá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />
            <button className="close-preview" onClick={closePreview}>×</button>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserReviews;
