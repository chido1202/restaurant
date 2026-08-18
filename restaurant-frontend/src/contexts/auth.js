import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Kiểm tra token có hiệu lực không bằng cách lấy thông tin người dùng
            const userData = await authService.getUserProfile();
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            // Token không hợp lệ hoặc hết hạn
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ username, password });
      setCurrentUser(response.user || await authService.getUserProfile());
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const authContextValue = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
