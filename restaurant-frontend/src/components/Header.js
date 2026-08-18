import React from "react";
import "../styles/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">Restaurant</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
