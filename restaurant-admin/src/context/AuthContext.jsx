import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Kiểm tra token còn hạn hay không
          const decodedToken = jwtDecode.jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            // Token còn hạn, thiết lập xác thực
            setToken(storedToken);
            setIsAuthenticated(true);
            
            // Cấu hình axios với token mặc định
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            
            // Lấy thông tin người dùng nếu cần
            try {
              const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${storedToken}` }
              });
              setUser(response.data);
            } catch (error) {
              console.error("Lỗi khi lấy thông tin người dùng:", error);
              // Nếu không thể lấy thông tin, vẫn giữ trạng thái đã xác thực
            }
          } else {
            // Token hết hạn, xóa và làm mới trạng thái
            logout();
          }
        } catch (error) {
          // Token không hợp lệ
          console.error("Token không hợp lệ:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      token,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
