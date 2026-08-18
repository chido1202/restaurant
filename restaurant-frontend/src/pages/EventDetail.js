/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/cart';
import eventService from '../api/eventService';
import discountService from '../api/discountService';
import '../styles/eventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const { cart } = useCart();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin sự kiện");
        setLoading(false);
        console.error("Error fetching event details:", err);
      }
    };

    fetchEventDetails();
  }, [id]);

  const applyDiscount = async () => {
    if (!event?.discountCode || discountApplied || cart.length === 0) return;

    try {
      // Tính tổng giá trị giỏ hàng
      const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

      if (totalPrice <= 0) {
        setNotification({
          show: true,
          message: "Giỏ hàng của bạn đang trống. Hãy thêm món để áp dụng mã giảm giá"
        });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      const discountResult = await discountService.applyDiscount(event.discountCode.code, totalPrice);
      if (discountResult) {
        // Lưu thông tin giảm giá vào context hoặc localStorage
        // Chú ý: 'dispatch' cần được định nghĩa hoặc nhận từ context
        if (typeof dispatch !== 'undefined') {
          dispatch({
            type: 'SET_DISCOUNT',
            payload: {
              code: event.discountCode.code,
              discountAmount: discountResult.discountAmount,
              finalPrice: discountResult.finalPrice
            }
          });
        }

        setDiscountApplied(true);

        // Cập nhật số lần sử dụng mã giảm giá
        await discountService.incrementUsage(event.discountCode.code);

        // Thông báo cho người dùng
        setNotification({
          show: true,
          message: `Đã áp dụng mã giảm giá! Giảm ${discountResult.discountAmount.toLocaleString('vi-VN')}đ`
        });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      }
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || "Không thể áp dụng mã giảm giá"
      });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      console.error("Lỗi khi áp dụng mã giảm giá:", err);
    }
  };

  // Xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x400/f0f0f0/555555?text=Hình+ảnh+sự+kiện+không+có+sẵn';
  };

  if (loading) {
    return (
      <div className="evd-loading">
        <div className="evd-spinner"></div>
        <p>Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (error) return <div className="evd-error">{error}</div>;
  if (!event) return <div className="evd-not-found">Không tìm thấy sự kiện</div>;

  return (
    <div className="evd-container">
      {notification.show && (
        <div className="evd-notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {notification.message}
        </div>
      )}

      <div className="evd-header">
        <Link to="/events" className="evd-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
          </svg>
          Quay lại
        </Link>
        <h1 className="evd-title">{event.name}</h1>
      </div>

      <div className="evd-content">
        <div className="evd-image-container">
          <img
            src={event.image || "/images/default-event.jpg"}
            alt={event.name}
            className="evd-image"
            onError={handleImageError}
          />
        </div>

        <div className="evd-info">
          <div className="evd-date-section">
            <div className="evd-date-item">
              <span className="evd-date-label">Ngày diễn ra:</span>
              <span className="evd-date-value">{new Date(event.date).toLocaleDateString('vi-VN')}</span>
            </div>

            {event.endDate && (
              <div className="evd-date-item">
                <span className="evd-date-label">Kết thúc:</span>
                <span className="evd-date-value">{new Date(event.endDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}

            <div className="evd-date-item">
              <span className="evd-date-label">Địa điểm:</span>
              <span className="evd-date-value">{event.location}</span>
            </div>
          </div>

          <div className="evd-desc-section">
            <h3 className="evd-section-title">Mô tả sự kiện</h3>
            <p className="evd-desc-text">{event.description}</p>
          </div>

          {event.discountCode && (
            <div className="evd-discount-section">
              <h3 className="evd-discount-title">Ưu đãi đặc biệt</h3>
              <div className="evd-discount-code">
                <span>Mã giảm giá: </span>
                <strong>{event.discountCode.code}</strong>
              </div>
              <p className="evd-discount-value">
                {event.discountCode.discountType === 'percentage'
                  ? `Giảm ${event.discountCode.discountValue}% giá trị đơn hàng`
                  : `Giảm ${event.discountCode.discountValue.toLocaleString('vi-VN')}đ`
                }
              </p>
              <button
                className={`evd-apply-btn ${discountApplied ? 'applied' : ''}`}
                onClick={applyDiscount}
                disabled={discountApplied || cart.length === 0}
              >
                {discountApplied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                    Đã áp dụng mã giảm giá
                  </>
                ) : cart.length === 0 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 1.5a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V2a.5.5 0 0 1 .5-.5z" />
                    </svg>
                    Thêm món vào giỏ hàng để áp dụng
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    Áp dụng mã giảm giá
                  </>
                )}
              </button>
            </div>
          )}

          <div className="evd-actions">
            <Link to="/booking" className="evd-book-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
              </svg>
              Đặt bàn ngay
            </Link>
            <Link to="/menu" className="evd-menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v2A1.5 1.5 0 0 0 1.5 5h13A1.5 1.5 0 0 0 16 3.5v-2A1.5 1.5 0 0 0 14.5 0h-13zm1 2h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1zm9.927.427A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0l-.396-.396zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2H1zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2h14zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
              </svg>
              Xem thực đơn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
