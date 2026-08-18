/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import tableService from "../api/tableService";
import discountService from "../api/discountService";
import paymentService from "../api/paymentService"; // Thêm service thanh toán
import { useAuth } from "../contexts/auth";
import { useCart } from "../contexts/cart";
import "../styles/booking.css";
import Footer from "../components/Footer";

const BookingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [availableTables, setAvailableTables] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Thêm state cho phương thức thanh toán
  const [showDeliveryAddress, setShowDeliveryAddress] = useState(false); // Hiển thị form địa chỉ giao hàng
  const [bookingInfo, setBookingInfo] = useState({
    name: "",
    phone: "",
    email: "",
    orderType: "dine-in",
    tableNumber: "",
    guestCount: "",
    specialNotes: "",
    orderDate: "",
    orderTime: "",
    // Thêm thông tin địa chỉ giao hàng
    deliveryAddress: {
      street: "",
      city: "",
      district: "",
      ward: "",
      details: ""
    }
  });

  // Tính tổng tiền giỏ hàng
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  // Tính giá sau khi áp dụng giảm giá
  const finalPrice = discountInfo ? discountInfo.finalPrice : totalPrice;

  // Điền thông tin từ người dùng đang đăng nhập
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setBookingInfo(prev => ({
        ...prev,
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
      }));
    }
  }, [isAuthenticated, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Xử lý các trường thông thường
    if (!name.includes('.')) {
      setBookingInfo({ ...bookingInfo, [name]: value });
    } else {
      // Xử lý trường nested (địa chỉ giao hàng)
      const [parent, child] = name.split('.');
      setBookingInfo({
        ...bookingInfo,
        [parent]: {
          ...bookingInfo[parent],
          [child]: value
        }
      });
    }

    // Xử lý đặc biệt cho orderType
    if (name === 'orderType') {
      // Hiển thị form địa chỉ nếu chọn giao hàng
      setShowDeliveryAddress(value === 'delivery');

      // Thiết lập lại phương thức thanh toán mặc định
      if (value === 'dine-in') {
        setPaymentMethod('cash');
      }
    }
  };

  // Cập nhật phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Kiểm tra bàn trống theo thời gian
  const checkAvailableTables = async () => {
    if (!bookingInfo.orderDate || !bookingInfo.orderTime) return;

    try {
      console.log("Đang kiểm tra bàn trống cho:", bookingInfo.orderDate, bookingInfo.orderTime);
      const tables = await tableService.getAvailableTables(
        bookingInfo.orderDate,
        bookingInfo.orderTime
      );
      console.log("Danh sách bàn trống:", tables);
      setAvailableTables(tables);
    } catch (error) {
      console.error("Lỗi khi kiểm tra bàn trống:", error);
      setMessage({
        type: "error",
        text: "Không thể kiểm tra bàn trống. Vui lòng thử lại sau!"
      });
    }
  };

  // Gọi API kiểm tra bàn khi thay đổi ngày giờ
  useEffect(() => {
    if (bookingInfo.orderDate && bookingInfo.orderTime && bookingInfo.orderType === "dine-in") {
      checkAvailableTables();
    }
  }, [bookingInfo.orderDate, bookingInfo.orderTime, bookingInfo.orderType]);

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = async (e) => {
    e.preventDefault();

    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      return;
    }

    if (totalPrice <= 0) {
      setDiscountError("Giỏ hàng trống. Vui lòng thêm món ăn trước khi áp dụng mã giảm giá");
      return;
    }

    setDiscountError("");
    setDiscountLoading(true);

    try {
      const result = await discountService.applyDiscount(discountCode, totalPrice);
      setDiscountInfo(result);
      setDiscountError("");
    } catch (error) {
      setDiscountInfo(null);
      setDiscountError(error.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
    } finally {
      setDiscountLoading(false);
    }
  };

  // Xóa mã giảm giá đã áp dụng
  const handleRemoveDiscount = () => {
    setDiscountInfo(null);
    setDiscountCode("");
    setDiscountError("");
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (orderId) => {
    try {
      // Tạo thông tin đơn hàng
      const orderInfo = `Thanh toan don hang #${orderId}`;

      // Gọi API tạo URL thanh toán
      const response = await paymentService.createVNPayUrl(
        orderId,
        finalPrice, // Sử dụng giá sau giảm giá
        orderInfo
      );

      if (response.data?.success && response.data?.vnpUrl) {
        // Lưu thông tin giao dịch vào localStorage để có thể kiểm tra khi quay lại
        localStorage.setItem('vnp_orderId', orderId);
        localStorage.setItem('vnp_txnRef', response.data.vnpTxnRef);

        // Chuyển hướng đến trang thanh toán VNPay
        console.log("Chuyển hướng đến VNPay:", response.data.vnpUrl);
        window.location.href = response.data.vnpUrl;
      } else {
        throw new Error("Không thể tạo URL thanh toán");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán VNPay:", error);
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại sau!"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Kiểm tra điều kiện cần thiết
      if (bookingInfo.orderType === 'delivery' &&
        (!bookingInfo.deliveryAddress.street || !bookingInfo.deliveryAddress.city)) {
        setMessage({
          type: "error",
          text: "Vui lòng nhập đầy đủ địa chỉ giao hàng!"
        });
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        customerId: currentUser?._id || null,
        name: bookingInfo.name,
        phone: bookingInfo.phone,
        email: bookingInfo.email,
        orderType: bookingInfo.orderType,
        tableNumber: bookingInfo.orderType === "dine-in" ? bookingInfo.tableNumber : null,
        guestCount: bookingInfo.guestCount ? parseInt(bookingInfo.guestCount) : null,
        specialNotes: bookingInfo.specialNotes,
        orderDate: bookingInfo.orderDate,
        orderTime: bookingInfo.orderTime,
        // Thêm items nếu có, nếu không thì gửi mảng rỗng
        items: cart.length > 0 ? cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })) : [],
        totalPrice: totalPrice,
        // Thêm thông tin giảm giá nếu có
        discount: discountInfo ? {
          code: discountCode,
          discountAmount: discountInfo.discountAmount,
          finalPrice: discountInfo.finalPrice
        } : null,
        // Thêm thông tin thanh toán
        paymentMethod: paymentMethod,
        paymentStatus: "pending"
      };

      // Thêm địa chỉ giao hàng nếu là đơn giao hàng
      if (bookingInfo.orderType === 'delivery') {
        orderData.deliveryAddress = bookingInfo.deliveryAddress;
      }

      // Gửi yêu cầu đặt bàn/đặt món
      const response = await axiosClient.post("/orders", orderData);

      if (response.data) {
        // Tăng số lần sử dụng mã giảm giá nếu có
        if (discountInfo && discountCode) {
          // Sử dụng phương thức incrementUsage đã cải tiến
          const result = await discountService.incrementUsage(discountCode);
          if (!result.success) {
            console.warn("Không thể cập nhật số lần sử dụng mã giảm giá");
          }
        }

        // Xóa giỏ hàng khi đặt bàn thành công
        clearCart();

        // Chuyển đến thanh toán VNPay nếu chọn phương thức này và không phải đặt bàn tại nhà hàng
        if (paymentMethod === 'vnpay' && bookingInfo.orderType !== 'dine-in') {
          await handleVNPayPayment(response.data.order._id);
          return; // Không cần thực hiện các bước tiếp theo vì sẽ chuyển hướng
        }

        setMessage({
          type: "success",
          text: "Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm."
        });

        // Reset form
        setBookingInfo({
          name: "",
          phone: "",
          email: "",
          orderType: "dine-in",
          tableNumber: "",
          guestCount: "",
          specialNotes: "",
          orderDate: "",
          orderTime: "",
          deliveryAddress: {
            street: "",
            city: "",
            district: "",
            ward: "",
            details: ""
          }
        });
        setDiscountCode("");
        setDiscountInfo(null);
        setPaymentMethod("cash");

        // Chuyển hướng về trang chủ sau 2 giây
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau!"
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/80x60/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn';
  };

  return (
    <>
      <div className="bk-container">
        <h2>Đặt Bàn & Món Ăn</h2>

        {message.text && (
          <div className={`bk-alert ${message.type}`}>
            {message.type === "success" ? (
              <svg className="bk-alert-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg className="bk-alert-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Hiển thị giỏ hàng */}
        <div className="bk-cart-section">
          <h3>Món Đã Chọn</h3>

          {cart.length > 0 ? (
            <>
              <table className="bk-cart-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên món</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <img
                          src={item.image || 'https://placehold.co/80x60/f0f0f0/555555?text=Hình+ảnh+không+có+sẵn'}
                          alt={item.name}
                          onError={handleImageError}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.price?.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="bk-quantity-controls">
                          <button className="bk-quantity-btn" onClick={() => updateQuantity(item._id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button className="bk-quantity-btn" onClick={() => updateQuantity(item._id, 1)}>+</button>
                        </div>
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                      <td>
                        <button
                          className="bk-delete-btn"
                          onClick={() => removeFromCart(item._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bk-total-row">
                    <td colSpan="4" className="bk-total-label">Tổng cộng:</td>
                    <td className="bk-total-price">{totalPrice.toLocaleString()} VNĐ</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              {/* Phần áp dụng mã giảm giá */}
              <div className="bk-discount-section">
                <h4>Mã giảm giá</h4>
                {!discountInfo ? (
                  <div className="bk-discount-input-container">
                    <div className="bk-discount-input">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={discountLoading}
                      >
                        {discountLoading ? "Đang áp dụng..." : "Áp dụng"}
                      </button>
                    </div>
                    {discountError && <div className="bk-discount-error">{discountError}</div>}
                  </div>
                ) : (
                  <div className="bk-discount-applied">
                    <div className="bk-discount-info">
                      <p><strong>Mã giảm giá:</strong> {discountCode}</p>
                      <p><strong>Giảm:</strong> {discountInfo.discountAmount.toLocaleString()} VNĐ</p>
                    </div>
                    <button className="bk-remove-discount" onClick={handleRemoveDiscount}>
                      Hủy áp dụng
                    </button>
                  </div>
                )}

                {/* Hiển thị giá sau khi áp dụng giảm giá */}
                {discountInfo && (
                  <div className="bk-price-summary">
                    <div className="bk-original-price">
                      <span>Tổng tiền:</span>
                      <span className="bk-strikethrough">{totalPrice.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="bk-final-price">
                      <span>Thành tiền sau giảm giá:</span>
                      <span className="bk-discounted-price">{finalPrice.toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="bk-empty-cart">Giỏ hàng trống. <a href="/menu">Xem thực đơn</a> để chọn món.</p>
          )}
        </div>

        {/* Form đặt bàn */}
        <form className="bk-booking-form" onSubmit={handleSubmit}>
          <h3>Thông tin đặt hàng</h3>

          <div className="bk-form-group">
            <div className="bk-form-control">
              <label htmlFor="name">Họ tên</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Họ tên"
                value={bookingInfo.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bk-form-control">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Số điện thoại"
                value={bookingInfo.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="bk-form-group single">
            <div className="bk-form-control">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email liên hệ"
                value={bookingInfo.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Hình thức đặt hàng */}
          <div className="bk-form-group single">
            <div className="bk-form-control">
              <label htmlFor="orderType">Hình thức</label>
              <select
                id="orderType"
                name="orderType"
                value={bookingInfo.orderType}
                onChange={handleChange}
                required
              >
                <option value="dine-in">Ăn tại nhà hàng</option>
                <option value="takeaway">Mang về</option>
                <option value="delivery">Giao hàng</option>
              </select>
            </div>
          </div>

          {/* Form thông tin thêm cho đặt bàn */}
          {bookingInfo.orderType === "dine-in" && (
            <>
              <div className="bk-form-group">
                <div className="bk-form-control">
                  <label htmlFor="orderDate">Ngày đặt</label>
                  <input
                    type="date"
                    id="orderDate"
                    name="orderDate"
                    value={bookingInfo.orderDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bk-form-control">
                  <label htmlFor="orderTime">Giờ đặt</label>
                  <input
                    type="time"
                    id="orderTime"
                    name="orderTime"
                    value={bookingInfo.orderTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="bk-form-group">
                <div className="bk-form-control">
                  <label htmlFor="tableNumber">Số bàn</label>
                  <select
                    id="tableNumber"
                    name="tableNumber"
                    value={bookingInfo.tableNumber}
                    onChange={handleChange}
                    required
                    disabled={!bookingInfo.orderDate || !bookingInfo.orderTime || availableTables.length === 0}
                  >
                    <option value="">-- Chọn bàn --</option>
                    {availableTables.map(table => (
                      <option key={table._id} value={table.tableID}>
                        Bàn {table.tableID} - {table.area || "Tầng 1"} (sức chứa: {table.capacity} người)
                      </option>
                    ))}
                  </select>
                  {availableTables.length === 0 && bookingInfo.orderDate && bookingInfo.orderTime && (
                    <span className="bk-table-warning">Không có bàn trống trong khung giờ này. Vui lòng chọn thời gian khác.</span>
                  )}
                  {(!bookingInfo.orderDate || !bookingInfo.orderTime) && (
                    <span className="bk-table-info">Vui lòng chọn ngày và giờ để xem bàn trống.</span>
                  )}
                </div>

                <div className="bk-form-control">
                  <label htmlFor="guestCount">Số lượng khách</label>
                  <input
                    type="number"
                    id="guestCount"
                    name="guestCount"
                    placeholder="Số lượng khách"
                    value={bookingInfo.guestCount}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
              </div>
            </>
          )}

          {/* Form địa chỉ giao hàng */}
          {showDeliveryAddress && (
            <div className="bk-delivery-address-section">
              <h4>Địa chỉ giao hàng</h4>

              <div className="bk-form-group">
                <div className="bk-form-control">
                  <label htmlFor="deliveryAddress.street">Số nhà, đường</label>
                  <input
                    type="text"
                    id="deliveryAddress.street"
                    name="deliveryAddress.street"
                    placeholder="Số nhà, tên đường"
                    value={bookingInfo.deliveryAddress.street}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bk-form-control">
                  <label htmlFor="deliveryAddress.ward">Phường/Xã</label>
                  <input
                    type="text"
                    id="deliveryAddress.ward"
                    name="deliveryAddress.ward"
                    placeholder="Phường/Xã"
                    value={bookingInfo.deliveryAddress.ward}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="bk-form-group">
                <div className="bk-form-control">
                  <label htmlFor="deliveryAddress.district">Quận/Huyện</label>
                  <input
                    type="text"
                    id="deliveryAddress.district"
                    name="deliveryAddress.district"
                    placeholder="Quận/Huyện"
                    value={bookingInfo.deliveryAddress.district}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="bk-form-control">
                  <label htmlFor="deliveryAddress.city">Thành phố/Tỉnh</label>
                  <input
                    type="text"
                    id="deliveryAddress.city"
                    name="deliveryAddress.city"
                    placeholder="Thành phố/Tỉnh"
                    value={bookingInfo.deliveryAddress.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="bk-form-group single">
                <div className="bk-form-control">
                  <label htmlFor="deliveryAddress.details">Chi tiết thêm</label>
                  <textarea
                    id="deliveryAddress.details"
                    name="deliveryAddress.details"
                    placeholder="Thông tin chi tiết thêm (tòa nhà, lối vào, v.v.)"
                    value={bookingInfo.deliveryAddress.details}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Phương thức thanh toán */}
          <div className="bk-form-group single">
            <div className="bk-form-control">
              <label htmlFor="paymentMethod">Phương thức thanh toán</label>
              <div className="bk-payment-methods">
                <div className={`bk-payment-method ${paymentMethod === "cash" ? "active" : ""}`}>
                  <input
                    type="radio"
                    id="payment-cash"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={handlePaymentMethodChange}
                  />
                  <label htmlFor="payment-cash">
                    <span>Tiền mặt khi nhận hàng/tại nhà hàng</span>
                  </label>
                </div>

                {/* Chỉ hiển thị phương thức VNPay cho đơn mang về/giao hàng */}
                {bookingInfo.orderType !== "dine-in" && cart.length > 0 && (
                  <div className={`bk-payment-method ${paymentMethod === "vnpay" ? "active" : ""}`}>
                    <input
                      type="radio"
                      id="payment-vnpay"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={handlePaymentMethodChange}
                    />
                    <label htmlFor="payment-vnpay">
                      <span>Thanh toán trực tuyến qua VNPay</span>
                      <img
                        src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png"
                        alt="VNPay"
                        className="bk-payment-logo"
                        width="60"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ghi chú đặt hàng */}
          <div className="bk-form-group single">
            <div className="bk-form-control">
              <label htmlFor="specialNotes">Ghi chú</label>
              <textarea
                id="specialNotes"
                name="specialNotes"
                placeholder="Yêu cầu đặc biệt"
                value={bookingInfo.specialNotes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="bk-submit-btn"
            disabled={loading || (bookingInfo.orderType === "dine-in" && availableTables.length === 0)}
          >
            {loading ? (
              <>
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle>
                </svg>
                Đang xử lý...
              </>
            ) : (
              paymentMethod === "vnpay" && bookingInfo.orderType !== "dine-in"
                ? "Xác nhận và thanh toán"
                : "Xác nhận đặt hàng"
            )}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default BookingPage;
