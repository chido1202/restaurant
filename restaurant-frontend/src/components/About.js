import React from "react";
import "../styles/about.css";
import { FaUtensils, FaBuilding, FaConciergeBell } from "react-icons/fa";
import choose from "../assets/choose.jpg";


export default function About() {
  return (
    <section className="about">
      <div className="about-container">
        
        <div className="about-gallery">
          <img src={choose} alt="Hình ảnh" className="gallery-item" />
          
        </div>

        {/* Nội dung bên phải */}
        <div className="about-content">
          <h2>LỰA CHỌN CHÚNG TÔI</h2>
          <div className="about-item">
            <FaUtensils className="about-icon" />
            <div>
              <h3>Thực đơn phong phú</h3>
              <p>Đa dạng thực đơn cùng nhiều combo hấp dẫn</p>
            </div>
          </div>
          <div className="about-item">
            <FaBuilding className="about-icon" />
            <div>
              <h3>Không gian rộng rãi</h3>
              <p>Ấm cúng - Độc lạ - Tha hồ Check-in. Phòng riêng cho hội họp, sinh nhật</p>
            </div>
          </div>
          <div className="about-item">
            <FaConciergeBell className="about-icon" />
            <div>
              <h3>Phục vụ miễn chê</h3>
              <p>Chu đáo - Tận tình - Hết mình vì thực khách</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
