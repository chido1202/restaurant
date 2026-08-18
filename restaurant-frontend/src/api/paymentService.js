import axiosClient from './axiosClient';

const paymentService = {
  // Tạo URL thanh toán VNPay
  createVNPayUrl: async (orderId, amount, orderInfo, bankCode = '') => {
    try {
      const response = await axiosClient.post('/payment/vnpay/create', {
        orderId,
        amount,
        orderInfo,
        bankCode, // Thêm tùy chọn chọn ngân hàng
        language: 'vn' // Ngôn ngữ mặc định
      });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi tạo URL thanh toán' };
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await axiosClient.get(`/payment/status/${orderId}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Có lỗi xảy ra khi kiểm tra trạng thái thanh toán' };
    }
  },

  // Cập nhật trạng thái thanh toán từ frontend
  updatePaymentStatus: async (paymentData) => {
    try {
      const response = await axiosClient.post('/payment/update-status', paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách ngân hàng hỗ trợ (có thể thêm nếu cần)
  getBankList: () => {
    return [
      { code: 'NCB', name: 'Ngân hàng Quốc Dân (NCB)' },
      { code: 'VISA', name: 'Thẻ quốc tế VISA/MASTER/JCB' },
      { code: 'VIETCOMBANK', name: 'Ngân hàng Ngoại Thương (Vietcombank)' },
      { code: 'VIETINBANK', name: 'Ngân hàng Công Thương (VietinBank)' },
      { code: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)' },
      { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp (Agribank)' },
      { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (SacomBank)' },
      { code: 'TECHCOMBANK', name: 'Ngân hàng Kỹ thương Việt Nam (Techcombank)' },
      { code: 'MBBANK', name: 'Ngân hàng Quân đội (MB)' },
      { code: 'VPBANK', name: 'Ngân hàng Việt Nam Thịnh Vượng (VPBank)' },
      { code: 'TPB', name: 'Ngân hàng Tiên Phong (TPBank)' },
      { code: 'VNPAYQR', name: 'Thanh toán qua ứng dụng hỗ trợ VNPAYQR' }
    ];
  }
};

export default paymentService;
