/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import moment from 'moment';
import '../styles/reviewList.css';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  const [avgRating, setAvgRating] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/reviews/product/${productId}`, {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });

      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
      setAvgRating(response.data.avgRating);
    } catch (err) {
      console.error('Lỗi khi tải đánh giá:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, pagination.page]);

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="rv-loading">
        <div className="rv-loading-spinner"></div>
        <span>Đang tải đánh giá...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rv-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm2.5 8.2a.5.5 0 0 1-.7.7L8 8.7l-1.8 1.7a.5.5 0 1 1-.7-.7L7.3 8 5.6 6.3a.5.5 0 0 1 .7-.7L8 7.3l1.8-1.7a.5.5 0 0 1 .7.7L8.7 8l1.8 1.7z" />
        </svg>
        {error}
      </div>
    );
  }

  if (reviews.length === 0 && !loading) {
    return <div className="rv-no-reviews">Chưa có đánh giá nào cho sản phẩm này</div>;
  }

  return (
    <div className="rv-list-container">
      <div className="rv-summary">
        <div className="rv-avg-rating">
          <span className="rv-rating-number">{avgRating.toFixed(1)}</span>
          <div className="rv-stars">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`rv-star ${i < Math.floor(avgRating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rv-total-reviews">{pagination.total} đánh giá</span>
        </div>
      </div>

      <div className="rv-reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="rv-review-item">
            <div className="rv-review-header">
              <div className="rv-reviewer-info">
                {review.user?.avatar ? (
                  <img src={review.user.avatar} alt="User" className="rv-user-avatar" />
                ) : (
                  <div className="rv-default-avatar">{review.user?.name?.charAt(0) || 'A'}</div>
                )}
                <div className="rv-reviewer-details">
                  <div className="rv-reviewer-name">{review.user?.name || 'Ẩn danh'}</div>
                  <div className="rv-review-date">{moment(review.createdAt).format('DD/MM/YYYY')}</div>
                </div>
              </div>
              <div className="rv-review-rating">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`rv-star ${i < review.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="rv-review-content">
              <p>{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="rv-review-images">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Review ${index + 1}`}
                    onClick={() => handleImageClick(img)}
                    className="rv-review-image"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="rv-pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="rv-page-btn"
          >
            &lt; Trước
          </button>

          {pagination.pages <= 5 ? (
            // Hiển thị tất cả trang nếu có ít hơn hoặc bằng 5 trang
            [...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`rv-page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))
          ) : (
            // Hiển thị phân trang thông minh nếu có nhiều hơn 5 trang
            <>
              {pagination.page > 1 && <button onClick={() => handlePageChange(1)} className="rv-page-btn">1</button>}
              {pagination.page > 2 && (pagination.page > 3 && <span className="rv-page-ellipsis">...</span>)}

              {pagination.page > 2 && <button onClick={() => handlePageChange(pagination.page - 1)} className="rv-page-btn">{pagination.page - 1}</button>}
              <button className="rv-page-btn active">{pagination.page}</button>
              {pagination.page < pagination.pages - 1 && <button onClick={() => handlePageChange(pagination.page + 1)} className="rv-page-btn">{pagination.page + 1}</button>}

              {pagination.page < pagination.pages - 1 && (pagination.page < pagination.pages - 2 && <span className="rv-page-ellipsis">...</span>)}
              {pagination.page < pagination.pages && <button onClick={() => handlePageChange(pagination.pages)} className="rv-page-btn">{pagination.pages}</button>}
            </>
          )}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="rv-page-btn"
          >
            Sau &gt;
          </button>
        </div>
      )}

      {previewImage && (
        <div className="rv-image-preview-modal" onClick={closePreview}>
          <div className="rv-preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />
            <button className="rv-close-preview" onClick={closePreview}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
