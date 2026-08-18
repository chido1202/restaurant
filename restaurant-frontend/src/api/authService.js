import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const authService = {
    // Đăng nhập
    login: async (data) => {
        try {
            const response = await axios.post(`${API_URL}login`, data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // Đăng ký
    register: async (data) => {
        try {
            const response = await axios.post(`${API_URL}register`, data);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // Lấy thông tin người dùng
    getUserProfile: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('User not authenticated');

            const response = await axios.get(`${API_URL}profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // Kiểm tra xác thực
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },

    // Đăng xuất
    logout: () => {
        localStorage.removeItem('token');
    }
};

export default authService;
