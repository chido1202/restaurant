import axiosClient from './axiosClient';

const tableService = {
  // Lấy tất cả bàn
  getAllTables: async () => {
    try {
      const response = await axiosClient.get('/tables');
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bàn:", error);
      throw error.response?.data || { message: "Không thể tải danh sách bàn" };
    }
  },

  // Lấy danh sách bàn trống theo thời gian
  getAvailableTables: async (date, time) => {
    try {
      const response = await axiosClient.get('/tables/available', {
        params: { date, time }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra bàn trống:`, error);
      throw error.response?.data || { message: "Không thể kiểm tra bàn trống" };
    }
  },

  // Lấy thông tin một bàn cụ thể
  getTableById: async (id) => {
    try {
      const response = await axiosClient.get(`/tables/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin bàn:`, error);
      throw error.response?.data || { message: "Không thể lấy thông tin bàn" };
    }
  }
};

export default tableService;
