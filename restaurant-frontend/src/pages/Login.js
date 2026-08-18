import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error: authError } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
      setError(error.message || "Lỗi đăng nhập. Vui lòng thử lại!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image"></div>
      <div className="login-form">
        <h2>Đăng Nhập</h2>
        <p>
          Chưa có tài khoản?{" "}
          <span className="signup-link" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </span>
        </p>

        {(error || authError) && <div className="error-message">{error || authError}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className="forgot-password">Quên mật khẩu?</p>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
