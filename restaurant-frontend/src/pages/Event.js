import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/event.css";
import eventService from "../api/eventService";

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách sự kiện");
        setLoading(false);
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const offers = [
    {
      title: "Video & Photo",
      description:
        "There are many variations passages of Lorem Ipsum available, but majority have suffered alteration.",
      icon: "📷",
    },
    {
      title: "Catering & Decoration",
      description:
        "Every event needs catering and decoration. We provide the best as per client requirements.",
      icon: "⭐",
    },
    {
      title: "Flower Bouquets",
      description:
        "We offer flower bouquets because they express beauty and are a sign of respect and welcome.",
      icon: "🏡",
    },
    {
      title: "Entertainment",
      description:
        "Every event needs entertainment like dance, fire shows, and magic shows to engage guests.",
      icon: "🎭",
    },
    {
      title: "Event Cards",
      description:
        "There are many variations passages of Lorem Ipsum available, but majority have suffered alteration.",
      icon: "📖",
    },
    {
      title: "Videos",
      description:
        "There are many variations passages of Lorem Ipsum available, but majority have suffered alteration.",
      icon: "🔲",
    },
  ];

  // Hàm xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/300x220/f0f0f0/555555?text=Hình+ảnh+sự+kiện+không+có+sẵn';
  };

  if (loading) {
    return (
      <div className="ev-loading">
        <div className="ev-spinner"></div>
        <p>Đang tải sự kiện...</p>
      </div>
    );
  }

  return (
    <div className="ev-container">
      {/* Event Section */}
      <section className="ev-section">
        <h2 className="ev-title">SỰ KIỆN CỦA CHÚNG TÔI</h2>
        {error && <p className="ev-error">{error}</p>}
        <div className="ev-list">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="ev-card">
                <img
                  src={event.image || "/images/default-event.jpg"}
                  alt={event.name}
                  className="ev-card-img"
                  onError={handleImageError}
                />
                <div className="ev-card-info">
                  <h3 className="ev-card-title">{event.name}</h3>
                  <p className="ev-card-desc">{event.description}</p>
                  <p className="ev-card-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" />
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString('vi-VN')}
                  </p>
                  {event.discountCode && (
                    <div className="ev-discount">
                      <span className="ev-discount-badge">Mã: {event.discountCode.code}</span>
                      <p>
                        {event.discountCode.discountType === 'percentage'
                          ? `Giảm ${event.discountCode.discountValue}%`
                          : `Giảm ${event.discountCode.discountValue.toLocaleString('vi-VN')}đ`
                        }
                      </p>
                    </div>
                  )}
                  <Link to={`/events/${event._id}`} className="ev-btn">➜</Link>
                </div>
              </div>
            ))
          ) : (
            <p className="ev-no-events">Không có sự kiện nào.</p>
          )}
        </div>
      </section>

      {/* Offer Section */}
      <section className="ev-offers">
        <h2 className="ev-title">DỊCH VỤ CỦA CHÚNG TÔI</h2>
        <div className="ev-offer-list">
          {offers.map((offer, index) => (
            <div key={index} className="ev-offer-card">
              <div className="ev-offer-icon">{offer.icon}</div>
              <h3 className="ev-offer-title">{offer.title}</h3>
              <p className="ev-offer-desc">{offer.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EventPage;
