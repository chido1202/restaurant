import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const billService = {
  // Lấy hóa đơn theo ID đơn hàng
  getBillByOrderId: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xem hóa đơn');
      }

      // Lấy danh sách tất cả hóa đơn và tìm hóa đơn theo orderID
      const response = await axios.get(`${API_URL}/bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        // Tìm hóa đơn có orderID khớp với orderId được truyền vào
        const bill = response.data.find(bill =>
          bill.orderID && bill.orderID._id === orderId
        );

        if (bill) {
          return bill;
        } else {
          throw new Error('Không tìm thấy hóa đơn cho đơn hàng này');
        }
      } else {
        throw new Error('Không có hóa đơn nào được tìm thấy');
      }
    } catch (error) {
      console.error('Lỗi khi lấy hóa đơn:', error);
      throw error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi lấy thông tin hóa đơn';
    }
  },

  // Lấy tất cả hóa đơn của người dùng hiện tại
  getUserBills: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xem hóa đơn');
      }

      const response = await axios.get(`${API_URL}/bills/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error);
      throw error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi lấy danh sách hóa đơn';
    }
  }
};

export default billService;
