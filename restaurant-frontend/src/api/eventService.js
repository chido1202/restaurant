import axiosClient from './axiosClient';

const eventService = {
  // Lấy tất cả sự kiện
  getAllEvents: async () => {
    try {
      const response = await axiosClient.get('/events');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
      throw error.response?.data || { message: "Không thể tải danh sách sự kiện" };
    }
  },

  // Lấy sự kiện theo ID
  getEventById: async (id) => {
    try {
      const response = await axiosClient.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy sự kiện ID ${id}:`, error);
      throw error.response?.data || { message: "Không thể tải thông tin sự kiện" };
    }
  },

  // Lấy sự kiện đang hoạt động
  getActiveEvents: async () => {
    try {
      const response = await axiosClient.get('/events/active');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện đang hoạt động:", error);
      throw error.response?.data || { message: "Không thể tải sự kiện đang hoạt động" };
    }
  }
};

export default eventService;
