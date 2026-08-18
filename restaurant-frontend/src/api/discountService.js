/* eslint-disable no-throw-literal */
import axiosClient from './axiosClient';

const discountService = {
  // Lấy tất cả mã giảm giá
  getAllDiscounts: async () => {
    try {
      const response = await axiosClient.get('/discounts');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
      throw error.response?.data || { message: "Không thể tải danh sách mã giảm giá" };
    }
  },

  // Lấy chi tiết mã giảm giá theo ID
  getDiscountById: async (id) => {
    try {
      const response = await axiosClient.get(`/discounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy mã giảm giá ID ${id}:`, error);
      throw error.response?.data || { message: "Không thể tải thông tin mã giảm giá" };
    }
  },

  // Kiểm tra mã giảm giá theo code
  checkDiscountCode: async (code) => {
    try {
      if (!code || typeof code !== 'string') {
        throw new Error("Mã giảm giá không hợp lệ");
      }
      const response = await axiosClient.get(`/discounts/code/${code.trim()}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra mã giảm giá ${code}:`, error);
      throw error.response?.data || { message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" };
    }
  },

  // Áp dụng mã giảm giá
  applyDiscount: async (code, orderTotal) => {
    try {
      if (!code || !orderTotal) {
        throw new Error("Thiếu mã giảm giá hoặc giá trị đơn hàng");
      }

      const response = await axiosClient.post('/discounts/apply', {
        code: code.trim(),
        orderTotal: Number(orderTotal)
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi áp dụng mã giảm giá ${code}:`, error);
      const errorMessage = error.response?.data?.message ||
        "Không thể áp dụng mã giảm giá. Vui lòng kiểm tra lại mã của bạn";
      throw { message: errorMessage };
    }
  },

  // Tăng số lần sử dụng - phương pháp an toàn hơn
  incrementUsage: async (code) => {
    try {
      if (!code) {
        console.warn("Không có mã giảm giá để cập nhật số lần sử dụng");
        return { success: false };
      }

      const response = await axiosClient.post(`/discounts/increment-usage/${code.trim()}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Lỗi khi cập nhật số lần sử dụng mã ${code}:`, error);
      // Không ném lỗi ở đây vì việc này không quan trọng đối với trải nghiệm người dùng
      return { success: false, message: "Đã xảy ra lỗi khi cập nhật số lần sử dụng mã giảm giá" };
    }
  }
};

export default discountService;
