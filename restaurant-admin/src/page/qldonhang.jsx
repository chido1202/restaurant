import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Drawer,
  Descriptions,
  List,
  Typography,
  Divider,
  Card,
} from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import "../styles/QLDonHang.css";

const { Option } = Select;
const { Text } = Typography;

const QlDonHang = () => {
  const [donHangList, setDonHangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDonHang, setSelectedDonHang] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const API_URL = "http://localhost:5000"; // Cập nhật URL API backend

  // 🔹 Lấy danh sách đơn hàng từ API
  useEffect(() => {
    fetchDonHangList();
  }, []);

  const fetchDonHangList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonHangList(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng!");
    }
    setLoading(false);
  };

  // 🔹 Mở modal cập nhật trạng thái đơn hàng
  const openEditModal = (record) => {
    setSelectedDonHang(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      status: record.status,
      paymentStatus: record.paymentStatus,
    });
  };

  // 🔹 Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/orders/${selectedDonHang._id}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        message.success("Cập nhật trạng thái đơn hàng thành công!");

        // Hiển thị thông báo nếu đơn hàng là đặt bàn
        if (
          selectedDonHang.orderType === "dine-in" &&
          selectedDonHang.tableNumber
        ) {
          if (values.status === "confirmed") {
            message.info(
              `Đã cập nhật trạng thái Bàn ${selectedDonHang.tableNumber} thành "Đã đặt trước"`
            );
          } else if (
            values.status === "completed" ||
            values.status === "cancelled"
          ) {
            message.info(
              `Đã cập nhật trạng thái Bàn ${selectedDonHang.tableNumber} thành "Trống"`
            );
          }
        }

        fetchDonHangList();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      message.error("Có lỗi xảy ra khi cập nhật đơn hàng!");
    }
  };

  // 🔹 Xóa đơn hàng
  const deleteDonHang = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đơn hàng này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/api/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Xóa đơn hàng thành công!");
          fetchDonHangList();
        } catch (error) {
          console.error("Lỗi khi xóa đơn hàng:", error);
          message.error("Lỗi khi xóa đơn hàng!");
        }
      },
    });
  };

  // 🔹 Xem chi tiết đơn hàng
  const viewOrderDetail = (record) => {
    setSelectedDonHang(record);
    setIsDetailDrawerOpen(true);
  };

  // 🔹 Hiển thị trạng thái dưới dạng Tag có màu
  const renderStatusTag = (status) => {
    let color = "";
    let text = "";

    switch (status) {
      case "pending":
        color = "gold";
        text = "Chờ xác nhận";
        break;
      case "confirmed":
        color = "blue";
        text = "Đã xác nhận";
        break;
      case "completed":
        color = "green";
        text = "Hoàn thành";
        break;
      case "cancelled":
        color = "red";
        text = "Đã hủy";
        break;
      default:
        color = "default";
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // 🔹 Hiển thị trạng thái thanh toán
  const renderPaymentStatus = (status) => {
    let color = "";
    let text = "";

    switch (status) {
      case "pending":
        color = "warning";
        text = "Chưa thanh toán";
        break;
      case "paid":
        color = "success";
        text = "Đã thanh toán";
        break;
      case "failed":
        color = "error";
        text = "Thanh toán thất bại";
        break;
      default:
        color = "default";
        text = status || "Chưa thanh toán";
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // 🔹 Hiển thị loại đơn hàng
  const renderOrderType = (type) => {
    switch (type) {
      case "dine-in":
        return "Đặt bàn tại nhà hàng";
      case "takeaway":
        return "Mang đi";
      case "delivery":
        return "Giao hàng";
      default:
        return type;
    }
  };

  // 🔹 Hiển thị phương thức thanh toán
  const renderPaymentMethod = (method) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "card":
        return "Thẻ";
      case "online":
        return "Thanh toán online";
      case "vnpay":
        return (
          <span style={{ color: "#005BAA" }}>
            <strong>VNPay</strong>
          </span>
        );
      default:
        return method;
    }
  };

  // 🔹 Hiển thị tổng tiền (tính cả giảm giá nếu có)
  const renderTotalPrice = (totalPrice, record) => {
    // Hiển thị giá sau giảm giá nếu có thông tin giảm giá
    if (record.discount && record.discount.finalPrice) {
      return (
        <div>
          <div style={{ textDecoration: "line-through", color: "#aaa" }}>
            {totalPrice?.toLocaleString("vi-VN")}đ
          </div>
          <div style={{ color: "green", fontWeight: "bold" }}>
            {record.discount.finalPrice.toLocaleString("vi-VN")}đ
          </div>
        </div>
      );
    }
    return <span>{totalPrice?.toLocaleString("vi-VN")}đ</span>;
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderID",
      key: "orderID",
      width: 100,
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small>{record.phone}</small>
          {record.email && (
            <small style={{ display: "block" }}>{record.email}</small>
          )}
        </div>
      ),
    },
    {
      title: "Loại đơn",
      dataIndex: "orderType",
      key: "orderType",
      width: 120,
      render: (text) => renderOrderType(text),
      filters: [
        { text: "Đặt bàn", value: "dine-in" },
        { text: "Mang đi", value: "takeaway" },
        { text: "Giao hàng", value: "delivery" },
      ],
      onFilter: (value, record) => record.orderType === value,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      render: renderTotalPrice,
      sorter: (a, b) => {
        const aPrice = a.discount?.finalPrice || a.totalPrice;
        const bPrice = b.discount?.finalPrice || b.totalPrice;
        return aPrice - bPrice;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => renderStatusTag(status),
      filters: [
        { text: "Chờ xác nhận", value: "pending" },
        { text: "Đã xác nhận", value: "confirmed" },
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 140,
      render: (status) => renderPaymentStatus(status),
      filters: [
        { text: "Chưa thanh toán", value: "pending" },
        { text: "Đã thanh toán", value: "paid" },
        { text: "Thanh toán thất bại", value: "failed" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => viewOrderDetail(record)}
            type="primary"
            style={{ backgroundColor: "#1890ff" }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            type="primary"
            style={{ backgroundColor: "#52c41a" }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteDonHang(record._id)}
            type="primary"
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="qldonhang-container">
      <h2>Quản Lý Đơn Hàng</h2>
      <Table
        columns={columns}
        dataSource={donHangList}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
        }}
      />
      {/* 🔹 Modal Cập nhật trạng thái đơn hàng */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item
            name="status"
            label="Trạng thái đơn hàng"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="paymentStatus"
            label="Trạng thái thanh toán"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái thanh toán",
              },
            ]}
          >
            <Select>
              <Option value="pending">Chưa thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="failed">Thanh toán thất bại</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* 🔹 Drawer Xem chi tiết đơn hàng */}
      <Drawer
        title={`Chi tiết đơn hàng #${selectedDonHang?.orderID}`}
        placement="right"
        onClose={() => setIsDetailDrawerOpen(false)}
        open={isDetailDrawerOpen}
        width={600}
      >
        {selectedDonHang && (
          <>
            <Descriptions title="Thông tin đơn hàng" bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">
                {selectedDonHang.orderID}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedDonHang.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedDonHang.phone}
              </Descriptions.Item>
              {selectedDonHang.email && (
                <Descriptions.Item label="Email">
                  {selectedDonHang.email}
                </Descriptions.Item>
              )}
              {/* Hiển thị loại đơn hàng với màu sắc tương ứng */}
              <Descriptions.Item label="Loại đơn hàng">
                {selectedDonHang.orderType === "dine-in" ? (
                  <Tag color="purple">Đặt bàn tại nhà hàng</Tag>
                ) : selectedDonHang.orderType === "takeaway" ? (
                  <Tag color="volcano">Mang đi</Tag>
                ) : (
                  <Tag color="geekblue">Giao hàng</Tag>
                )}
              </Descriptions.Item>

              {/* Thêm hiển thị thông tin đặt bàn nếu là dine-in */}
              {selectedDonHang.orderType === "dine-in" && (
                <>
                  <Descriptions.Item label="Số bàn">
                    {selectedDonHang.tableNumber || "Chưa xác định"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số khách">
                    {selectedDonHang.guestCount || "Chưa xác định"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian đặt">
                    {selectedDonHang.reservationDate
                      ? moment(selectedDonHang.reservationDate).format(
                          "DD/MM/YYYY"
                        )
                      : "Chưa xác định"}{" "}
                    {selectedDonHang.reservationTime || ""}
                  </Descriptions.Item>
                </>
              )}

              {/* Thêm hiển thị thông tin địa chỉ giao hàng nếu là delivery */}
              {selectedDonHang.orderType === "delivery" &&
                selectedDonHang.deliveryAddress && (
                  <Descriptions.Item label="Địa chỉ giao hàng">
                    <div className="delivery-address">
                      <p>
                        <strong>Chi tiết:</strong>{" "}
                        {selectedDonHang.deliveryAddress.details || "N/A"}
                      </p>
                      <p>
                        <strong>Phường/Xã:</strong>{" "}
                        {selectedDonHang.deliveryAddress.ward || "N/A"}
                      </p>
                      <p>
                        <strong>Quận/Huyện:</strong>{" "}
                        {selectedDonHang.deliveryAddress.district || "N/A"}
                      </p>
                      <p>
                        <strong>Tỉnh/Thành phố:</strong>{" "}
                        {selectedDonHang.deliveryAddress.city || "N/A"}
                      </p>
                      {selectedDonHang.deliveryAddress.street && (
                        <p>
                          <strong>Đường:</strong>{" "}
                          {selectedDonHang.deliveryAddress.street}
                        </p>
                      )}
                    </div>
                  </Descriptions.Item>
                )}

              <Descriptions.Item label="Ghi chú">
                {selectedDonHang.specialNotes || "Không có ghi chú"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn hàng">
                {renderStatusTag(selectedDonHang.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {renderPaymentMethod(selectedDonHang.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {renderPaymentStatus(selectedDonHang.paymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ fontSize: "16px", color: "#f5222d" }}>
                  {selectedDonHang.totalPrice?.toLocaleString("vi-VN")}đ
                </Text>
              </Descriptions.Item>
            </Descriptions>
            {/* Thêm hiển thị thông tin giảm giá nếu có */}
            {selectedDonHang.discount && selectedDonHang.discount.code && (
              <div style={{ marginBottom: 24 }}>
                <Divider orientation="left">Thông tin mã giảm giá</Divider>
                <Card>
                  <p>
                    <strong>Mã giảm giá:</strong>{" "}
                    {selectedDonHang.discount.code}
                  </p>
                  <p>
                    <strong>Giá trị giảm:</strong>{" "}
                    {selectedDonHang.discount.discountAmount?.toLocaleString(
                      "vi-VN"
                    )}
                    đ
                  </p>
                  <p>
                    <strong>Tổng tiền trước giảm:</strong>{" "}
                    {selectedDonHang.totalPrice?.toLocaleString("vi-VN")}đ
                  </p>
                  <p>
                    <strong>Thành tiền sau giảm:</strong>{" "}
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      {selectedDonHang.discount.finalPrice?.toLocaleString(
                        "vi-VN"
                      )}
                      đ
                    </span>
                  </p>
                </Card>
              </div>
            )}

            {/* Thêm hiển thị thông tin VNPay nếu có */}
            {selectedDonHang.paymentMethod === "vnpay" &&
              selectedDonHang.vnpayInfo && (
                <div style={{ marginBottom: 24 }}>
                  <Divider orientation="left">
                    Thông tin thanh toán VNPay
                  </Divider>
                  <Card>
                    <p>
                      <strong>Mã giao dịch:</strong>{" "}
                      {selectedDonHang.vnpayInfo.vnpTxnRef}
                    </p>
                    {selectedDonHang.vnpayInfo.vnpBankCode && (
                      <p>
                        <strong>Ngân hàng:</strong>{" "}
                        {selectedDonHang.vnpayInfo.vnpBankCode}
                      </p>
                    )}
                    {selectedDonHang.vnpayInfo.vnpCardType && (
                      <p>
                        <strong>Loại thẻ:</strong>{" "}
                        {selectedDonHang.vnpayInfo.vnpCardType}
                      </p>
                    )}
                    {selectedDonHang.vnpayInfo.vnpPayDate && (
                      <p>
                        <strong>Thời gian thanh toán:</strong>{" "}
                        {selectedDonHang.vnpayInfo.vnpPayDate}
                      </p>
                    )}
                  </Card>
                </div>
              )}

            <Divider orientation="left">Chi tiết món ăn</Divider>

            {selectedDonHang.items && selectedDonHang.items.length > 0 ? (
              <List
                bordered
                dataSource={selectedDonHang.items}
                renderItem={(item) => (
                  <List.Item>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            marginRight: 10,
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div>{item.name}</div>
                        <div>
                          <Text type="secondary">
                            {item.price?.toLocaleString("vi-VN")}đ x{" "}
                            {item.quantity}
                          </Text>
                        </div>
                      </div>
                      <div>
                        <Text strong>
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          đ
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">
                Không có món ăn nào trong đơn hàng này.
              </Text>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default QlDonHang;
