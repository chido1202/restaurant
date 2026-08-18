const nodemailer = require('nodemailer');
const moment = require('moment');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailService = {
  // Gửi email đăng ký thành công
  sendRegistrationSuccess: async (user) => {
    try {
      const mailOptions = {
        from: `Inferno Grill <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Đăng ký tài khoản thành công - Nhà hàng ABC',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #4CAF50; text-align: center;">Đăng Ký Thành Công!</h2>
            <p>Xin chào <strong>${user.name || user.username}</strong>,</p>
            <p>Chúc mừng bạn đã đăng ký tài khoản thành công tại nhà hàng của chúng tôi!</p>
            <p>Thông tin tài khoản:</p>
            <ul>
              <li>Tên đăng nhập: ${user.username}</li>
              <li>Email: ${user.email}</li>
            </ul>
            <p>Bây giờ bạn có thể đặt bàn, đặt món ăn và tích lũy điểm thưởng.</p>
            <p>Cảm ơn bạn đã lựa chọn nhà hàng của chúng tôi!</p>
            <div style="margin-top: 20px; text-align: center; color: #777;">
              <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
              <p>&copy; ${new Date().getFullYear()} Nhà hàng ABC. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email đăng ký đã được gửi thành công đến:', user.email);
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi gửi email đăng ký:', error);
      return { success: false, error };
    }
  },

  // Gửi email xác nhận đặt bàn
  sendOrderConfirmation: async (order) => {
    try {
      // Tạo danh sách món ăn nếu có
      let itemsList = '';
      let totalAmount = 0;

      if (order.items && order.items.length > 0) {
        itemsList = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Sản phẩm</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Số lượng</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Đơn giá</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Thành tiền</th>
            </tr>
        `;

        order.items.forEach(item => {
          const itemTotal = item.price * item.quantity;
          totalAmount += itemTotal;

          itemsList += `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${item.price.toLocaleString('vi-VN')}đ</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${itemTotal.toLocaleString('vi-VN')}đ</td>
            </tr>
          `;
        });

        // Hiển thị tổng tiền và thông tin giảm giá nếu có
        let discountInfo = '';
        if (order.discount && order.discount.code) {
          discountInfo = `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Mã giảm giá (${order.discount.code}):</strong></td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">-${order.discount.amount.toLocaleString('vi-VN')}đ</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Thành tiền:</strong></td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(totalAmount - order.discount.amount).toLocaleString('vi-VN')}đ</td>
            </tr>
          `;
        } else {
          discountInfo = `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Thành tiền:</strong></td>
              <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${totalAmount.toLocaleString('vi-VN')}đ</td>
            </tr>
          `;
        }

        itemsList += discountInfo + '</table>';
      }

      // Loại đơn hàng
      let orderTypeText = '';
      switch (order.orderType) {
        case 'dine-in':
          orderTypeText = 'Đặt bàn tại nhà hàng';
          break;
        case 'takeaway':
          orderTypeText = 'Đặt mang về';
          break;
        case 'delivery':
          orderTypeText = 'Giao hàng tận nơi';
          break;
        default:
          orderTypeText = 'Đặt hàng';
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.email,
        subject: `Xác nhận ${orderTypeText} - Nhà hàng ABC`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #4CAF50; text-align: center;">Xác Nhận ${orderTypeText}</h2>
            <p>Xin chào <strong>${order.name}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại nhà hàng của chúng tôi. Dưới đây là chi tiết đơn hàng của bạn:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Mã đơn hàng:</strong> ${order.orderID}</p>
              <p><strong>Loại đơn hàng:</strong> ${orderTypeText}</p>
              ${order.orderType === 'dine-in' ? `<p><strong>Số bàn:</strong> ${order.tableNumber}</p>` : ''}
              ${order.orderType === 'dine-in' ? `<p><strong>Số người:</strong> ${order.guestCount}</p>` : ''}
              <p><strong>Ngày đặt:</strong> ${new Date(order.orderDate).toLocaleString('vi-VN')}</p>
              ${order.reservationDate ? `<p><strong>Ngày sử dụng:</strong> ${new Date(order.reservationDate).toLocaleDateString('vi-VN')}</p>` : ''}
              ${order.reservationTime ? `<p><strong>Giờ sử dụng:</strong> ${order.reservationTime}</p>` : ''}
              ${order.specialNotes ? `<p><strong>Ghi chú:</strong> ${order.specialNotes}</p>` : ''}
            </div>
            
            ${itemsList}
            
            <p style="margin-top: 20px;">Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn sớm nếu cần thêm thông tin.</p>
            <p>Cảm ơn bạn đã lựa chọn nhà hàng của chúng tôi!</p>
            
            <div style="margin-top: 20px; text-align: center; color: #777;">
              <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
              <p>&copy; ${new Date().getFullYear()} Nhà hàng ABC. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email xác nhận đặt bàn đã được gửi thành công đến:', order.email);
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi gửi email xác nhận đặt bàn:', error);
      return { success: false, error };
    }
  },

  // Gửi email xác nhận thanh toán
  sendPaymentConfirmation: async (order) => {
    if (!order.email) return;

    const subject = 'Xác nhận thanh toán đơn hàng';

    // Định dạng lại các thông tin
    const orderDate = new Date(order.createdAt).toLocaleString('vi-VN');
    const items = order.items.map(item =>
      `- ${item.name} x ${item.quantity}: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ`
    ).join('\n');

    const totalAmount = order.totalPrice.toLocaleString('vi-VN');
    const finalAmount = order.discount?.finalPrice
      ? order.discount.finalPrice.toLocaleString('vi-VN')
      : totalAmount;

    // Chi tiết thanh toán VNPay
    let paymentInfo = '';
    if (order.paymentMethod === 'vnpay' && order.vnpayInfo) {
      paymentInfo = `
      <p>Chi tiết thanh toán:</p>
      <ul>
        <li>Mã giao dịch: ${order.vnpayInfo.vnpTxnRef}</li>
        ${order.vnpayInfo.vnpBankCode ? `<li>Ngân hàng: ${order.vnpayInfo.vnpBankCode}</li>` : ''}
        ${order.vnpayInfo.vnpPayDate ? `<li>Thời gian thanh toán: ${order.vnpayInfo.vnpPayDate}</li>` : ''}
      </ul>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>Xác nhận thanh toán đơn hàng</h2>
        </div>
        
        <p>Kính gửi ${order.name},</p>
        
        <p>Cảm ơn bạn đã thanh toán đơn hàng. Dưới đây là thông tin chi tiết về đơn hàng của bạn:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Mã đơn hàng:</strong> ${order.orderID}</p>
          <p><strong>Ngày đặt:</strong> ${orderDate}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod === 'cash' ? 'Tiền mặt' :
        order.paymentMethod === 'card' ? 'Thẻ' :
          order.paymentMethod === 'vnpay' ? 'VNPay' : 'Thanh toán online'
      }</p>
          <p><strong>Trạng thái thanh toán:</strong> Đã thanh toán</p>
          
          ${paymentInfo}
          
          <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
            <h3>Chi tiết đơn hàng:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              ${order.items.map(item => `
                <li style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                  <div>
                    <strong>${item.name}</strong> x ${item.quantity}
                  </div>
                  <div>
                    ${(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                </li>
              `).join('')}
            </ul>
            
            <div style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
              <p style="display: flex; justify-content: space-between;">
                <strong>Tổng cộng:</strong>
                <span>${totalAmount}đ</span>
              </p>
              
              ${order.discount ? `
                <p style="display: flex; justify-content: space-between;">
                  <strong>Giảm giá:</strong>
                  <span>-${order.discount.discountAmount.toLocaleString('vi-VN')}đ</span>
                </p>
                <p style="display: flex; justify-content: space-between; font-size: 18px; color: #d4380d;">
                  <strong>Thành tiền:</strong>
                  <strong>${finalAmount}đ</strong>
                </p>
              ` : ''}
            </div>
          </div>
        </div>
        
        <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Inferno Grill. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail(order.email, subject, html);
      console.log(`Email xác nhận thanh toán đã được gửi đến ${order.email}`);
    } catch (error) {
      console.error('Lỗi khi gửi email xác nhận thanh toán:', error);
      throw error;
    }
  },

  // Gửi email xác nhận thanh toán thành công
  sendPaymentConfirmation: async (order) => {
    try {
      const paymentMethod = order.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt';
      const transactionDate = order.vnpayInfo?.vnpPayDate
        ? moment(order.vnpayInfo.vnpPayDate, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm:ss')
        : moment().format('DD/MM/YYYY HH:mm:ss');

      // Tính tổng tiền
      const totalAmount = order.discount?.finalPrice || order.totalPrice;

      const paymentInfo = order.vnpayInfo
        ? `<p>Mã giao dịch: <strong>${order.vnpayInfo.vnpTxnRef}</strong></p>
           <p>Ngân hàng: <strong>${order.vnpayInfo.vnpBankCode || 'N/A'}</strong></p>
           <p>Loại thẻ: <strong>${order.vnpayInfo.vnpCardType || 'N/A'}</strong></p>`
        : '';

      const mailOptions = {
        from: `Inferno Grill <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: `Xác nhận thanh toán thành công - Đơn hàng #${order.orderID}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4CAF50; text-align: center;">Thanh toán thành công!</h2>
            <p>Kính gửi <strong>${order.name}</strong>,</p>
            <p>Chúng tôi xin thông báo rằng thanh toán cho đơn hàng của bạn đã được xử lý thành công.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Thông tin thanh toán:</h3>
              <p>Mã đơn hàng: <strong>#${order.orderID}</strong></p>
              <p>Số tiền: <strong>${totalAmount.toLocaleString()} VNĐ</strong></p>
              <p>Phương thức thanh toán: <strong>${paymentMethod}</strong></p>
              <p>Thời gian thanh toán: <strong>${transactionDate}</strong></p>
              ${paymentInfo}
            </div>
            
            <p>Đơn hàng của bạn đã được xác nhận và đang được xử lý. Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao hoặc sẵn sàng để nhận.</p>
            
            <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
            
            <div style="margin-top: 30px; text-align: center; color: #888;">
              <p>Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại.</p>
              <p>© ${new Date().getFullYear()} Nhà Hàng Việt. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email xác nhận thanh toán đã được gửi đến ${order.email}`);
      return true;
    } catch (error) {
      console.error('Lỗi khi gửi email xác nhận thanh toán:', error);
      throw error;
    }
  }
};

module.exports = emailService;
