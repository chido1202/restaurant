/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../contexts/auth';
import axiosClient from '../api/axiosClient';
import '../styles/reviewForm.css';
import { useNavigate } from 'react-router-dom';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState(0);
  const navigate = useNavigate();

  const ratingLabels = {
    1: 'Rất không hài lòng',
    2: 'Không hài lòng',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất hài lòng'
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('Chỉ được tải lên tối đa 3 ảnh');
      return;
    }

    // Đây là xử lý demo sử dụng URL.createObjectURL
    // Trong thực tế, bạn sẽ cần tải ảnh lên server và nhận lại URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setImages(imageUrls);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (rating === 0) {
      setError('Vui lòng chọn đánh giá sao');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosClient.post('/reviews', {
        productId,
        rating,
        comment,
        images
      });

      setSuccess('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đang chờ phê duyệt.');
      setRating(0);
      setComment('');
      setImages([]);

      if (onReviewSubmit) {
        onReviewSubmit(response.data.review);
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rv-login-prompt">
        <p>Vui lòng <button className="rv-login-btn" onClick={() => navigate('/login', { state: { from: window.location.pathname } })}>đăng nhập</button> để viết đánh giá</p>
      </div>
    );
  }

  return (
    <div className="rv-form-container">
      <h3 className="rv-form-title">Viết đánh giá</h3>

      {error && (
        <div className="rv-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm2.5 8.2a.5.5 0 0 1-.7.7L8 8.7l-1.8 1.7a.5.5 0 1 1-.7-.7L7.3 8 5.6 6.3a.5.5 0 0 1 .7-.7L8 7.3l1.8-1.7a.5.5 0 0 1 .7.7L8.7 8l1.8 1.7z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="rv-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rv-form">
        <div className="rv-rating-container">
          <div className="rv-stars">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onClick={() => setRating(ratingValue)}
                  />
                  <span
                    className={`rv-star ${ratingValue <= (hover || rating) ? 'filled' : ''}`}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ★
                  </span>
                </label>
              );
            })}
          </div>
          <div className="rv-rating-label">
            {rating > 0 && <span>{ratingLabels[rating]}</span>}
          </div>
        </div>

        <div className="rv-form-group">
          <label htmlFor="comment">Nội dung đánh giá</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows="4"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="rv-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="animate-spin">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2z" />
              </svg>
              Đang gửi...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
              </svg>
              Gửi đánh giá
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
