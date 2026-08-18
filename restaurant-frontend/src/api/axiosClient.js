import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để thêm token vào header
axiosClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
axiosClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Nếu lỗi 401 Unauthorized, có thể đăng xuất người dùng
    if (error.response && error.response.status === 401) {
      // Xóa token và thông tin người dùng
      localStorage.removeItem('token');
      // Có thể thêm logic chuyển hướng đến trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
