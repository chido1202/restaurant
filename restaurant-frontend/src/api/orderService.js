import axiosClient from './axiosClient';

const orderService = {
  // Lấy tất cả đơn hàng của người dùng
  getUserOrders: async () => {
    try {
      const response = await axiosClient.get('/orders/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId) => {
    try {
      const response = await axiosClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosClient.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default orderService;
