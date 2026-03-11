import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import orderService from '../api/orderService';
import moment from 'moment';
import '../styles/order-details.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        setError(error.message || 'Lỗi khi lấy thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!order) {
    return <div className="error">Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="order-details-container">
      <h2>Chi tiết đơn hàng</h2>
      <div className="order-info">
        <div className="info-item">
          <span className="info-label">Mã đơn hàng:</span>
          <span className="info-value">{order._id}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Tên khách hàng:</span>
          <span className="info-value">{order.name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Số điện thoại:</span>
          <span className="info-value">{order.phone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Email:</span>
          <span className="info-value">{order.email}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Hình thức:</span>
          <span className="info-value">{order.orderType}</span>
        </div>
        {order.orderType === 'dine-in' && (
          <>
            <div className="info-item">
              <span className="info-label">Số bàn:</span>
              <span className="info-value">{order.tableNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Số lượng khách:</span>
              <span className="info-value">{order.guestCount}</span>
            </div>
          </>
        )}
        {order.orderType === 'delivery' && order.deliveryAddress && (
          <div className="info-item">
            <span className="info-label">Địa chỉ giao hàng:</span>
            <span className="info-value">
              {order.deliveryAddress.street}, {order.deliveryAddress.ward}, {order.deliveryAddress.district}, {order.deliveryAddress.city}
            </span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Ngày đặt:</span>
          <span className="info-value">{moment(order.orderDate).format('DD/MM/YYYY')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Giờ đặt:</span>
          <span className="info-value">{order.orderTime}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Ghi chú:</span>
          <span className="info-value">{order.specialNotes}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Tổng tiền:</span>
          <span className="info-value">{order.totalPrice?.toLocaleString()} VNĐ</span>
        </div>
        {order.discount && (
          <div className="info-item">
            <span className="info-label">Giảm giá:</span>
            <span className="info-value">{order.discount.discountAmount?.toLocaleString()} VNĐ</span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Thành tiền:</span>
          <span className="info-value">{order.discount ? order.discount.finalPrice?.toLocaleString() : order.totalPrice?.toLocaleString()} VNĐ</span>
        </div>
        <div className="info-item">
          <span className="info-label">Phương thức thanh toán:</span>
          <span className="info-value">{order.paymentMethod}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Trạng thái thanh toán:</span>
          <span className="info-value">{order.paymentStatus}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Trạng thái đơn hàng:</span>
          <span className="info-value">{order.status}</span>
        </div>
      </div>

      {/* Thêm phần hiển thị thông tin thanh toán VNPay */}
      {order.paymentMethod === 'vnpay' && order.vnpayInfo && (
        <div className="payment-info-section">
          <h3>Thông tin thanh toán VNPay</h3>
          <div className="payment-info-grid">
            <div className="info-item">
              <span className="info-label">Mã giao dịch:</span>
              <span className="info-value">{order.vnpayInfo.vnpTxnRef}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Số tiền:</span>
              <span className="info-value">{order.vnpayInfo.vnpAmount?.toLocaleString()} VNĐ</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngân hàng:</span>
              <span className="info-value">{order.vnpayInfo.vnpBankCode || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Loại thẻ:</span>
              <span className="info-value">{order.vnpayInfo.vnpCardType || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Thời gian thanh toán:</span>
              <span className="info-value">
                {order.vnpayInfo.vnpPayDate
                  ? moment(order.vnpayInfo.vnpPayDate, 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm:ss')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;