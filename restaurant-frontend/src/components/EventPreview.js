import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/eventPreview.css";
import eventService from "../api/eventService";

const EventPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const data = await eventService.getActiveEvents();
        setEvents(data);
      } catch (err) {
        setError("Không thể tải sự kiện");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, []);

  if (loading) return <div className="event-preview-section event-preview-loading">Đang tải...</div>;
  if (error) return <div className="event-preview-section event-preview-error">{error}</div>;

  // Lấy sự kiện đầu tiên có mã giảm giá (nếu có)
  const activeEvent = events.length > 0 && events[0].discountCode ? events[0] : null;

  return (
    <div className="event-preview-section">
      <div className="event-preview-container">
        <h2 className="event-preview-heading">Sự Kiện Đặc Biệt</h2>
        <p className="event-preview-description">
          Tham gia sự kiện của chúng tôi để nhận trải nghiệm ẩm thực tuyệt vời và ưu đãi hấp dẫn.
        </p>

        {activeEvent && (
          <div className="event-preview-discount">
            <span className="event-preview-discount-code">
              {activeEvent.discountCode.code}
            </span>
            <p className="event-preview-discount-value">
              {activeEvent.discountCode.discountType === 'percentage'
                ? `Giảm ${activeEvent.discountCode.discountValue}%`
                : `Giảm ${activeEvent.discountCode.discountValue.toLocaleString('vi-VN')}đ`
              }
            </p>
          </div>
        )}

        <Link to="/events" className="event-preview-button">
          Xem Thêm
        </Link>
      </div>
    </div>
  );
};

export default EventPreview;
