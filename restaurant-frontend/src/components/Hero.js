import React from "react";
import { Link } from "react-router-dom";
import "../styles/hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Inferno Grill.</h1>
        <p>Chúng tôi rất hân hạnh được phục vụ quý thực khách</p>
        <Link to="/menu" className="btn">Thực Đơn</Link>
        <Link to="/booking" className="btn">Đặt Bàn</Link>
      </div>
    </section>
  );
}
