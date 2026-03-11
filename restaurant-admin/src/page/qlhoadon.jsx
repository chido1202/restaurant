import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Select,
  Drawer,
  Descriptions,
  Typography,
  Tooltip,
  Card,
  Row,
  Col,
  Divider,
  Badge,
  Alert,
  Breadcrumb,
  Input as AntInput,
  Statistic,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import "../styles/QLHoaDon.css";

const { Option } = Select;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const QlHoaDon = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    paid: 0,
    pending: 0,
  });
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const API_URL = "http://localhost:5000";
  const printRef = useRef();

  // 🔹 Load danh sách hóa đơn
  useEffect(() => {
    fetchBills();
    fetchPendingOrders();
  }, []);

  // 🔹 Tính toán thống kê
  useEffect(() => {
    if (bills.length > 0) {
      const paid = bills.filter((bill) => bill.paymentStatus === "paid").length;
      const pending = bills.filter(
        (bill) => bill.paymentStatus === "pending"
      ).length;

      setStatistics({
        total: bills.length,
        paid,
        pending,
      });
    }
  }, [bills]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hóa đơn:", error);
      message.error("Lỗi khi tải danh sách hóa đơn!");
    }
    setLoading(false);
  };

  // 🔹 Lấy danh sách đơn hàng chưa có hóa đơn
  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lọc các đơn hàng có trạng thái confirmed hoặc completed và chưa có hóa đơn
      const pendingOrdersData = response.data.filter(
        (order) =>
          (order.status === "confirmed" || order.status === "completed") &&
          order.paymentStatus !== "failed"
      );

      setPendingOrders(pendingOrdersData);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng chưa có hóa đơn:", error);
    }
  };

  // 🔹 Mở modal chỉnh sửa
  const openEditModal = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
    form.setFieldsValue({
      paymentStatus: bill.paymentStatus,
      paymentDetails: bill.paymentDetails,
    });
  };

  // 🔹 Mở drawer xem chi tiết
  const openDetailDrawer = (bill) => {
    setSelectedBill(bill);
    setIsDrawerOpen(true);
  };

  // 🔹 Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/bills/${selectedBill._id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Cập nhật hóa đơn thành công!");
      setIsModalOpen(false);
      fetchBills();
    } catch (error) {
      console.error("Lỗi khi cập nhật hóa đơn:", error);
      message.error("Có lỗi xảy ra khi cập nhật hóa đơn!");
    }
  };

  // 🔹 Tạo hóa đơn mới
  const handleCreateBill = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/bills`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Tạo hóa đơn thành công!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchBills();
      fetchPendingOrders();
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      message.error(error.response?.data?.message || "Lỗi khi tạo hóa đơn!");
    }
  };

  // 🔹 Xóa hóa đơn
  const deleteBill = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa hóa đơn này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/api/bills/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Xóa hóa đơn thành công!");
          fetchBills();
        } catch (error) {
          console.error("Lỗi khi xóa hóa đơn:", error);
          message.error("Lỗi khi xóa hóa đơn!");
        }
      },
    });
  };

  // 🔹 In hóa đơn
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hóa Đơn #${selectedBill?.billNumber}`,
    onAfterPrint: () => message.success("In hóa đơn thành công!"),
  });

  // 🔹 Render trạng thái thanh toán
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

  // 🔹 Render phương thức thanh toán
  const renderPaymentMethod = (method) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "card":
        return "Thẻ";
      case "online":
        return "Thanh toán online";
      case "vnpay":
        return <Tag color="blue">VNPay</Tag>;
      default:
        return method;
    }
  };

  // 🔹 Tìm kiếm hóa đơn
  const getFilteredBills = () => {
    let filteredData = [...bills];

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(
        (bill) =>
          bill.billNumber.toString().includes(searchLower) ||
          (bill.orderID?.orderID &&
            bill.orderID.orderID.toLowerCase().includes(searchLower)) ||
          (bill.paymentReference &&
            bill.paymentReference.toLowerCase().includes(searchLower))
      );
    }

    // Lọc theo ngày
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day").valueOf();
      const endDate = dateRange[1].endOf("day").valueOf();

      filteredData = filteredData.filter((bill) => {
        const billDate = new Date(bill.issueDate).valueOf();
        return billDate >= startDate && billDate <= endDate;
      });
    }

    return filteredData;
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "billNumber",
      key: "billNumber",
      width: 100,
      render: (text) => <Badge status="processing" text={`#${text}`} />,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderID",
      key: "orderID",
      width: 120,
      render: (orderID) => orderID?.orderID || "---",
    },
    {
      title: "Ngày tạo",
      dataIndex: "issueDate",
      key: "issueDate",
      width: 150,
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (text) => (
        <Text strong style={{ color: "#f5222d" }}>
          {text?.toLocaleString("vi-VN")}đ
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (text) => renderPaymentMethod(text),
      filters: [
        { text: "Tiền mặt", value: "cash" },
        { text: "Thẻ", value: "card" },
        { text: "Online", value: "online" },
        { text: "VNPay", value: "vnpay" },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: "Trạng thái",
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
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => openDetailDrawer(record)}
              type="primary"
              style={{ backgroundColor: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              type="primary"
              style={{ backgroundColor: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => deleteBill(record._id)}
              type="primary"
              danger
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              icon={<PrinterOutlined />}
              onClick={() => {
                setSelectedBill(record);
                setTimeout(() => {
                  handlePrint();
                }, 500);
              }}
              type="default"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="qlhoadon-container">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[{ title: "Trang chủ" }, { title: "Quản lý hóa đơn" }]}
      />

      <div className="page-header">
      <Title level={2} style={{ color: "white" }}>Quản Lý Hóa Đơn</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo Hóa Đơn
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng hóa đơn"
              value={statistics.total}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={statistics.paid}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chưa thanh toán"
              value={statistics.pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <div className="table-header">
        <Space>
          <AntInput
            placeholder="Tìm kiếm theo mã hóa đơn, mã đơn hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined />}
          />

          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            format="DD/MM/YYYY"
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText("");
              setDateRange([]);
              fetchBills();
            }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={getFilteredBills()}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Tổng cộng ${total} hóa đơn`,
        }}
      />

      {/* 🔹 Modal Chỉnh sửa hóa đơn */}
      <Modal
        title="Cập nhật hóa đơn"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <Form.Item name="paymentDetails" label="Chi tiết thanh toán">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 🔹 Modal Tạo hóa đơn mới */}
      <Modal
        title="Tạo hóa đơn mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        okText="Tạo hóa đơn"
        cancelText="Hủy"
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateBill}>
          {pendingOrders.length === 0 ? (
            <Alert
              message="Không có đơn hàng"
              description="Không có đơn hàng nào cần tạo hóa đơn."
              type="info"
              showIcon
            />
          ) : (
            <>
              <Form.Item
                name="orderID"
                label="Chọn đơn hàng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn hàng",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn đơn hàng"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {pendingOrders.map((order) => (
                    <Option key={order._id} value={order._id}>
                      #{order.orderID} - {order.name} -{" "}
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="paymentStatus"
                label="Trạng thái thanh toán"
                initialValue="pending"
              >
                <Select>
                  <Option value="pending">Chưa thanh toán</Option>
                  <Option value="paid">Đã thanh toán</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="updateOrderStatus"
                valuePropName="checked"
                initialValue={true}
              >
                <Alert
                  message="Tự động cập nhật trạng thái đơn hàng"
                  description="Các đơn hàng đang ở trạng thái 'Chờ xác nhận' sẽ được cập nhật thành 'Đã xác nhận'"
                  type="info"
                  showIcon
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 🔹 Drawer xem chi tiết hóa đơn */}
      <Drawer
        title={`Chi tiết hóa đơn #${selectedBill?.billNumber}`}
        placement="right"
        width={700}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In hóa đơn
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setIsDrawerOpen(false);
                openEditModal(selectedBill);
              }}
            >
              Sửa
            </Button>
          </Space>
        }
      >
        {selectedBill && (
          <div ref={printRef} className="print-content">
            <div className="bill-header">
              <div className="restaurant-info">
                <h2>NHÀ HÀNG INFERNO GRILL.</h2>
                <p>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                <p>SĐT: 0123456789 - Email: info@infernogrill.com</p>
              </div>
              <div className="bill-title">
                <h1>HÓA ĐƠN</h1>
                <div className="bill-number">
                  Số: #{selectedBill.billNumber}
                </div>
                <div className="bill-date">
                  Ngày:{" "}
                  {moment(selectedBill.issueDate).format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions bordered column={1} className="bill-info">
              <Descriptions.Item label="Mã đơn hàng">
                {selectedBill.orderID?.orderID || "---"}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedBill.orderID?.name || "---"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedBill.orderID?.phone || "---"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ color: "#f5222d", fontSize: "16px" }}>
                  {selectedBill.totalAmount?.toLocaleString("vi-VN")}đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {renderPaymentMethod(selectedBill.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {renderPaymentStatus(selectedBill.paymentStatus)}
              </Descriptions.Item>
              {selectedBill.paymentDetails && (
                <Descriptions.Item label="Chi tiết thanh toán">
                  {selectedBill.paymentDetails}
                </Descriptions.Item>
              )}
              {selectedBill.paymentMethod === "vnpay" && (
                <>
                  <Descriptions.Item label="Mã giao dịch VNPay">
                    {selectedBill.paymentReference || "Không có"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            {selectedBill.orderID &&
              selectedBill.orderID.items &&
              selectedBill.orderID.items.length > 0 && (
                <>
                  <Divider orientation="left">Chi tiết món ăn</Divider>
                  <Table
                    dataSource={selectedBill.orderID.items}
                    pagination={false}
                    rowKey="productId"
                    className="items-table"
                    columns={[
                      {
                        title: "Tên món",
                        dataIndex: "name",
                        key: "name",
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "price",
                        key: "price",
                        render: (price) => `${price.toLocaleString("vi-VN")}đ`,
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                      },
                      {
                        title: "Thành tiền",
                        key: "total",
                        render: (_, record) =>
                          `${(record.price * record.quantity).toLocaleString(
                            "vi-VN"
                          )}đ`,
                      },
                    ]}
                  />
                </>
              )}

            <div className="bill-footer">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p>
                Mọi thắc mắc về hóa đơn, vui lòng liên hệ với nhà hàng trong
                vòng 7 ngày.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default QlHoaDon;
