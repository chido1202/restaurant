import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEye, FaBan, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaFileInvoice, FaDownload, FaTruck, FaUtensils, FaHotel, FaMoneyBillWave
} from 'react-icons/fa';
import { useAuth } from '../contexts/auth';
import orderService from '../api/orderService';
import billService from '../api/billService';
import '../styles/UserOrders.css';
import UserLayout from '../components/UserLayout';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [activeFilter, setActiveFilter] = useState('all');
  const [billData, setBillData] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const navigate = useNavigate();
  const billRef = useRef();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const data = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', err);
        setError(err.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleViewOrderDetail = async (orderId) => {
    try {
      const orderDetail = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetail);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancelLoading(true);
      await orderService.cancelOrder(orderId);

      // Cập nhật trạng thái đơn hàng trong danh sách
      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      );
      setOrders(updatedOrders);

      // Nếu đang xem chi tiết đơn hàng này, cập nhật thông tin
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }

      setStatusMessage({
        type: 'success',
        message: 'Đơn hàng đã được hủy thành công!'
      });

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setStatusMessage({ type: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      setStatusMessage({
        type: 'error',
        message: err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  // Xem và tải hóa đơn
  const handleViewBill = async (orderId) => {
    try {
      setLoadingBill(true);
      // Gọi API để lấy thông tin hóa đơn từ backend
      const billResponse = await billService.getBillByOrderId(orderId);
      if (billResponse) {
        setBillData(billResponse);
        setShowBillModal(true);
      } else {
        setStatusMessage({
          type: 'error',
          message: 'Không tìm thấy hóa đơn cho đơn hàng này'
        });
        setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
      }
    } catch (err) {
      console.error('Lỗi khi tải hóa đơn:', err);
      setStatusMessage({
        type: 'error',
        message: 'Không thể tải hóa đơn. Vui lòng thử lại sau.'
      });
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    } finally {
      setLoadingBill(false);
    }
  };

  // In hóa đơn
  const handlePrintBill = useReactToPrint({
    contentRef: billRef,
    documentTitle: `Hóa Đơn #${billData?.billNumber}`,
    onAfterPrint: () => {
      setStatusMessage({
        type: 'success',
        message: 'Hóa đơn đã được in thành công!'
      });
      setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
    },
  });

  // Hàm hiển thị trạng thái đơn hàng
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xác nhận', color: '#ff9800', icon: <FaExclamationTriangle /> };
      case 'confirmed':
        return { text: 'Đã xác nhận', color: '#2196f3', icon: <FaCheckCircle /> };
      case 'completed':
        return { text: 'Hoàn thành', color: '#4caf50', icon: <FaCheckCircle /> };
      case 'cancelled':
        return { text: 'Đã hủy', color: '#f44336', icon: <FaTimesCircle /> };
      default:
        return { text: 'Không xác định', color: '#9e9e9e', icon: <FaExclamationTriangle /> };
    }
  };

  // Hàm hiển thị phương thức thanh toán
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cash':
        return { text: 'Tiền mặt', icon: <FaMoneyBillWave /> };
      case 'card':
        return { text: 'Thẻ', icon: <FaMoneyBillWave /> };
      case 'online':
        return { text: 'Thanh toán online', icon: <FaMoneyBillWave /> };
      case 'vnpay':
        return { text: 'VNPay', icon: <FaMoneyBillWave /> };
      default:
        return { text: method || 'Chưa xác định', icon: <FaMoneyBillWave /> };
    }
  };

  // Hàm hiển thị loại đơn hàng
  const getOrderTypeDisplay = (type) => {
    switch (type) {
      case 'dine-in':
        return { text: 'Đặt bàn tại nhà hàng', icon: <FaHotel /> };
      case 'takeaway':
        return { text: 'Mang đi', icon: <FaUtensils /> };
      case 'delivery':
        return { text: 'Giao hàng', icon: <FaTruck /> };
      default:
        return { text: type || 'Chưa xác định', icon: <FaUtensils /> };
    }
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm định dạng ngày (không có giờ)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Kiểm tra nếu đơn hàng có thể hủy: đang ở trạng thái pending hoặc confirmed
  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status);
  };

  // Lọc đơn hàng theo trạng thái
  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.status === activeFilter);
  };

  // Tạo danh sách tab trạng thái
  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  // Kiểm tra đơn hàng đã có hóa đơn chưa
  const hasInvoice = (order) => {
    // Chỉ đơn hàng đã xác nhận hoặc hoàn thành mới có khả năng có hóa đơn
    return ['confirmed', 'completed'].includes(order.status) && order.paymentStatus !== 'failed';
  };

  return (
    <UserLayout>
      <div className="user-orders-container">
        <div className="orders-header">
          <h2>Đơn hàng của tôi</h2>
          <button className="orders-add-btn" onClick={() => navigate('/menu')}>Đặt món mới</button>
        </div>

        {statusMessage.message && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            {statusMessage.message}
          </div>
        )}

        <div className="order-filter-tabs">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="tab-count">
                  {orders.filter(order => order.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="orders-loading">
            <div className="spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : error ? (
          <div className="orders-error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>Bạn chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/menu')} className="view-menu-btn">Xem thực đơn</button>
          </div>
        ) : (
          <div className="orders-list">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Loại đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredOrders().map((order) => {
                  const status = getStatusDisplay(order.status);
                  const orderType = getOrderTypeDisplay(order.orderType);
                  return (
                    <tr key={order._id} className={`order-row ${order.status}`}>
                      <td className="order-id">{order.orderID}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td className="order-type">
                        <span className="type-icon">{orderType.icon}</span>
                        {orderType.text}
                      </td>
                      <td className="price-column">
                        {order.discount && order.discount.finalPrice ? (
                          <div>
                            <span className="original-price">{order.totalPrice?.toLocaleString()} VNĐ</span>
                            <span className="final-price">{order.discount.finalPrice?.toLocaleString()} VNĐ</span>
                          </div>
                        ) : (
                          <span>{order.totalPrice?.toLocaleString()} VNĐ</span>
                        )}
                      </td>
                      <td>
                        <span className="order-status" style={{ backgroundColor: status.color }}>
                          {status.icon} {status.text}
                        </span>
                      </td>
                      <td className="action-column">
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewOrderDetail(order._id)}
                            title="Xem chi tiết"
                          >
                            <FaEye /> <span>Xem</span>
                          </button>

                          {hasInvoice(order) && (
                            <button
                              className="action-btn bill-btn"
                              onClick={() => handleViewBill(order._id)}
                              disabled={loadingBill}
                              title="Xem hóa đơn"
                            >
                              <FaFileInvoice /> <span>{loadingBill ? 'Đang tải...' : 'Hóa đơn'}</span>
                            </button>
                          )}

                          {canCancelOrder(order.status) && (
                            <button
                              className="action-btn cancel-btn"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancelLoading}
                              title="Hủy đơn hàng"
                            >
                              <FaBan /> <span>Hủy</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="order-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Chi tiết đơn hàng #{selectedOrder.orderID}</h3>
                <button className="close-btn" onClick={closeOrderDetail}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="status-banner" style={{ backgroundColor: getStatusDisplay(selectedOrder.status).color }}>
                  {getStatusDisplay(selectedOrder.status).icon}
                  <span>{getStatusDisplay(selectedOrder.status).text}</span>
                </div>

                <div className="order-meta">
                  <div className="meta-item">
                    <span className="meta-icon">{getOrderTypeDisplay(selectedOrder.orderType).icon}</span>
                    <div>
                      <span className="meta-label">Loại đơn hàng</span>
                      <span className="meta-value">{getOrderTypeDisplay(selectedOrder.orderType).text}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">{getPaymentMethodDisplay(selectedOrder.paymentMethod).icon}</span>
                    <div>
                      <span className="meta-label">Thanh toán</span>
                      <span className="meta-value">{getPaymentMethodDisplay(selectedOrder.paymentMethod).text}</span>
                    </div>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">
                      <FaCheckCircle />
                    </span>
                    <div>
                      <span className="meta-label">Ngày đặt</span>
                      <span className="meta-value">{formatDateTime(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-info">
                  <div className="info-section">
                    <h4>Thông tin khách hàng</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Họ tên:</span>
                        <span className="value">{selectedOrder.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số điện thoại:</span>
                        <span className="value">{selectedOrder.phone}</span>
                      </div>
                      {selectedOrder.email && (
                        <div className="info-item full-width">
                          <span className="label">Email:</span>
                          <span className="value">{selectedOrder.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOrder.orderType === 'dine-in' && (
                    <div className="info-section">
                      <h4>Thông tin đặt bàn</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Số bàn:</span>
                          <span className="value highlight">{selectedOrder.tableNumber || 'Chưa xác định'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Số khách:</span>
                          <span className="value">{selectedOrder.guestCount || 'Chưa xác định'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Ngày sử dụng:</span>
                          <span className="value">{selectedOrder.reservationDate ? formatDate(selectedOrder.reservationDate) : 'Chưa xác định'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Giờ sử dụng:</span>
                          <span className="value">{selectedOrder.reservationTime || 'Chưa xác định'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                    <div className="info-section">
                      <h4>Địa chỉ giao hàng</h4>
                      <div className="delivery-address-box">
                        {selectedOrder.deliveryAddress.details && (
                          <div className="address-detail">
                            <span className="address-label">Chi tiết:</span>
                            <span className="address-value">{selectedOrder.deliveryAddress.details}</span>
                          </div>
                        )}
                        {selectedOrder.deliveryAddress.ward && (
                          <div className="address-detail">
                            <span className="address-label">Phường/Xã:</span>
                            <span className="address-value">{selectedOrder.deliveryAddress.ward}</span>
                          </div>
                        )}
                        {selectedOrder.deliveryAddress.district && (
                          <div className="address-detail">
                            <span className="address-label">Quận/Huyện:</span>
                            <span className="address-value">{selectedOrder.deliveryAddress.district}</span>
                          </div>
                        )}
                        {selectedOrder.deliveryAddress.city && (
                          <div className="address-detail">
                            <span className="address-label">Tỉnh/Thành phố:</span>
                            <span className="address-value">{selectedOrder.deliveryAddress.city}</span>
                          </div>
                        )}
                        {selectedOrder.deliveryAddress.street && (
                          <div className="address-detail">
                            <span className="address-label">Đường:</span>
                            <span className="address-value">{selectedOrder.deliveryAddress.street}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.specialNotes && (
                    <div className="info-section">
                      <h4>Ghi chú</h4>
                      <div className="notes-box">
                        {selectedOrder.specialNotes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-items">
                  <h4>Món đã đặt</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th className="item-image">Hình ảnh</th>
                          <th className="item-name">Tên món</th>
                          <th className="item-price">Đơn giá</th>
                          <th className="item-quantity">Số lượng</th>
                          <th className="item-total">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <img
                                src={item.image || 'https://placehold.co/50x50.png?text=Food'}
                                alt={item.name}
                                className="item-img"
                              />
                            </td>
                            <td>{item.name}</td>
                            <td>{item.price?.toLocaleString()} VNĐ</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Không có món ăn nào</p>
                  )}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Tổng tiền:</span>
                    <span>{selectedOrder.totalPrice?.toLocaleString()} VNĐ</span>
                  </div>

                  {selectedOrder.discount && (
                    <>
                      <div className="summary-row discount">
                        <span>Giảm giá {selectedOrder.discount.code && `(${selectedOrder.discount.code})`}:</span>
                        <span>-{selectedOrder.discount.discountAmount?.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="summary-row final">
                        <span>Thành tiền:</span>
                        <span>{selectedOrder.discount.finalPrice?.toLocaleString()} VNĐ</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-actions">
                  {hasInvoice(selectedOrder) && (
                    <button
                      className="view-bill-btn"
                      onClick={() => handleViewBill(selectedOrder._id)}
                      disabled={loadingBill}
                    >
                      <FaFileInvoice /> {loadingBill ? 'Đang tải...' : 'Xem hóa đơn'}
                    </button>
                  )}

                  {canCancelOrder(selectedOrder.status) && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      disabled={cancelLoading}
                    >
                      <FaBan /> Hủy đơn hàng
                    </button>
                  )}
                  <button className="close-modal-btn" onClick={closeOrderDetail}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal xem hóa đơn */}
        {billData && showBillModal && (
          <div className="bill-modal">
            <div className="bill-content">
              <div className="bill-header-controls">
                <h3>Hóa đơn #{billData.billNumber}</h3>
                <div className="bill-controls">
                  <button className="print-bill-btn" onClick={handlePrintBill}>
                    <FaDownload /> In / Tải
                  </button>
                  <button className="close-bill-btn" onClick={() => setShowBillModal(false)}>×</button>
                </div>
              </div>

              <div className="bill-document" ref={billRef}>
                <div className="bill-heading">
                  <div className="restaurant-info">
                    <h2>NHÀ HÀNG INFERNO GRILL.</h2>
                    <p>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                    <p>SĐT: 0123456789 - Email: info@infernogrill.com</p>
                  </div>
                  <div className="bill-title">
                    <h1>HÓA ĐƠN</h1>
                    <div className="bill-number">Số: #{billData.billNumber}</div>
                    <div className="bill-date">
                      Ngày: {moment(billData.issueDate).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="bill-divider"></div>

                <div className="bill-details">
                  <div className="bill-section">
                    <div className="bill-row">
                      <span className="bill-label">Mã đơn hàng:</span>
                      <span className="bill-value">{billData.orderID?.orderID || "---"}</span>
                    </div>
                    <div className="bill-row">
                      <span className="bill-label">Khách hàng:</span>
                      <span className="bill-value">{billData.orderID?.name || "---"}</span>
                    </div>
                    <div className="bill-row">
                      <span className="bill-label">Số điện thoại:</span>
                      <span className="bill-value">{billData.orderID?.phone || "---"}</span>
                    </div>
                    <div className="bill-row">
                      <span className="bill-label">Tổng tiền:</span>
                      <span className="bill-value total-amount">{billData.totalAmount?.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="bill-row">
                      <span className="bill-label">Phương thức thanh toán:</span>
                      <span className="bill-value">{getPaymentMethodDisplay(billData.paymentMethod).text}</span>
                    </div>
                    <div className="bill-row">
                      <span className="bill-label">Trạng thái thanh toán:</span>
                      <span className="bill-value payment-status">
                        {billData.paymentStatus === "paid" ? "Đã thanh toán" :
                          billData.paymentStatus === "pending" ? "Chờ thanh toán" : "Thanh toán thất bại"}
                      </span>
                    </div>
                  </div>

                  {billData.orderID && billData.orderID.items && billData.orderID.items.length > 0 && (
                    <div className="bill-section">
                      <h4 className="bill-section-title">Chi tiết món ăn</h4>
                      <table className="bill-items-table">
                        <thead>
                          <tr>
                            <th>Tên món</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billData.orderID.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.price?.toLocaleString('vi-VN')}đ</td>
                              <td>{item.quantity}</td>
                              <td>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bill-footer">
                    <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                    <p>Mọi thắc mắc về hóa đơn, vui lòng liên hệ với nhà hàng trong vòng 7 ngày.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default UserOrders;
