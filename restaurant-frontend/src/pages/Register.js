import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: ""
  });

  const { register, loading, error: authError } = useAuth();
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await register(formData);
      setMessage({ type: "success", text: "Đăng ký thành công! Đang chuyển hướng..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Lỗi đăng ký, vui lòng thử lại."
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-image"></div>
      <div className="register-form">
        <h2>Tạo Tài Khoản</h2>
        <p>
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}
        {authError && <div className="message danger">{authError}</div>}

        <form onSubmit={handleRegister}>
          <label>Họ tên</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Tên đăng nhập</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Mật khẩu</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
