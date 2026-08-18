import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentService from '../api/paymentService';
import '../styles/payment-result.css';
import Footer from '../components/Footer';

const PaymentResult = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        const txnRef = queryParams.get('vnp_TxnRef');
        const vnpAmount = queryParams.get('vnp_Amount');
        const vnpBankCode = queryParams.get('vnp_BankCode');
        const vnpCardType = queryParams.get('vnp_CardType');
        const vnpPayDate = queryParams.get('vnp_PayDate');

        // Đọc từ localStorage
        const storedOrderId = localStorage.getItem('vnp_orderId');

        // Sử dụng txnRef từ URL query
        if (!txnRef) {
          setError("Không tìm thấy thông tin giao dịch");
          setLoading(false);
          return;
        }

        if (storedOrderId && responseCode) {
          try {
            // Nếu giao dịch thành công (responseCode = '00'), cập nhật đơn hàng
            if (responseCode === '00') {
              // Gọi API cập nhật trạng thái thanh toán
              const updateResponse = await paymentService.updatePaymentStatus({
                orderId: storedOrderId,
                vnpTxnRef: txnRef,
                vnpResponseCode: responseCode,
                vnpAmount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, // VNPay trả về số tiền * 100
                vnpBankCode,
                vnpCardType,
                vnpPayDate
              });

              if (updateResponse.data && updateResponse.data.success) {
                setPaymentStatus({
                  success: true,
                  message: "Thanh toán thành công!",
                  txnRef: txnRef,
                  orderId: storedOrderId,
                  details: updateResponse.data.order
                });
              } else {
                setPaymentStatus({
                  success: true,
                  message: "Thanh toán thành công, nhưng chưa cập nhật được trạng thái đơn hàng. Vui lòng liên hệ nhà hàng!",
                  txnRef: txnRef,
                  orderId: storedOrderId
                });
              }
            } else {
              // Giao dịch thất bại
              setPaymentStatus({
                success: false,
                message: getErrorMessage(responseCode),
                txnRef: txnRef,
                orderId: storedOrderId
              });

              // Vẫn cập nhật trạng thái giao dịch thất bại vào hệ thống
              await paymentService.updatePaymentStatus({
                orderId: storedOrderId,
                vnpTxnRef: txnRef,
                vnpResponseCode: responseCode,
                status: 'failed'
              });
            }
          } catch (statusError) {
            console.error("Lỗi khi cập nhật trạng thái thanh toán:", statusError);
            setError("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
          }
        } else if (responseCode) {
          // Nếu không có thông tin trong localStorage nhưng có responseCode từ VNPay
          if (responseCode === '00') {
            setPaymentStatus({
              success: true,
              message: "Thanh toán thành công! Tuy nhiên, không thể xác định đơn hàng. Vui lòng liên hệ nhà hàng!",
              txnRef: txnRef
            });
          } else {
            setPaymentStatus({
              success: false,
              message: getErrorMessage(responseCode),
              txnRef: txnRef
            });
          }
        } else {
          setError("Không thể xác định kết quả thanh toán");
        }

        // Xóa thông tin từ localStorage sau khi đã sử dụng
        localStorage.removeItem('vnp_txnRef');
        localStorage.removeItem('vnp_orderId');
      } catch (error) {
        console.error("Lỗi khi kiểm tra thanh toán:", error);
        setError("Có lỗi xảy ra khi kiểm tra giao dịch");
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [location]);

  // Hàm lấy thông báo lỗi dựa vào mã lỗi từ VNPay
  const getErrorMessage = (code) => {
    const errorMessages = {
      '01': 'Giao dịch đã tồn tại',
      '02': 'Merchant không hợp lệ',
      '03': 'Dữ liệu gửi sang không đúng định dạng',
      '04': 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
      '05': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định',
      '06': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Có lỗi xảy ra trong quá trình thanh toán'
    };

    return errorMessages[code] || 'Giao dịch không thành công';
  };

  const goToHomePage = () => {
    navigate('/');
  };

  const goToOrderHistory = () => {
    navigate('/user/my-orders');
  };

  if (loading) {
    return (
      <div className="payment-result-container loading">
        <div className="payment-spinner"></div>
        <p>Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container error">
        <div className="payment-result-icon error">❌</div>
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <div className="payment-actions">
          <button onClick={goToHomePage} className="payment-action-btn home">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="payment-result-container">
        {paymentStatus && (
          <>
            <div className={`payment-result-icon ${paymentStatus.success ? 'success' : 'error'}`}>
              {paymentStatus.success ? '✅' : '❌'}
            </div>
            <h2>{paymentStatus.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h2>
            <p>{paymentStatus.message}</p>
            {paymentStatus.txnRef && (
              <p className="payment-transaction-id">Mã giao dịch: <strong>{paymentStatus.txnRef}</strong></p>
            )}
            {paymentStatus.orderId && (
              <p className="payment-order-id">Mã đơn hàng: <strong>{paymentStatus.orderId}</strong></p>
            )}
            <div className="payment-actions">
              <button onClick={goToHomePage} className="payment-action-btn home">Về trang chủ</button>
              <button onClick={goToOrderHistory} className="payment-action-btn orders">Xem đơn hàng</button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentResult;
