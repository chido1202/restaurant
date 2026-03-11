import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message } from "antd";
import "../styles/QLKhachHang.css"; // Kiểm tra xem file CSS đã có chưa
const getApiUrl = async () => {
  try {
    const response = await axios.get("http://localhost:5174/api/config");
    return response.data.apiBaseUrl;
  } catch (error) {
    console.error("Lỗi khi lấy API URL:", error);
    return "http://localhost:5174/api"; // Giá trị mặc định
  }
};

const QlKhachHang = () => {
  const [khachHangList, setKhachHangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách khách hàng từ API
  useEffect(() => {
    const fetchKhachHangList = async () => {
      setLoading(true);
      try {
        const apiUrl = await getApiUrl(); // 🔹 Gọi hàm mới
        console.log("API URL:", apiUrl);
        const response = await axios.get(`${apiUrl}/customers`);
        console.log("API Response:", response.data);
    
        setKhachHangList(response.data.customers || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        message.error("Lỗi khi tải danh sách khách hàng!");
      }
      setLoading(false);
    };
  
    fetchKhachHangList(); // Gọi hàm ngay sau khi khai báo
  }, []);
  

  // 🔹 Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedKhachHang(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // 🔹 Xử lý submit form (Thêm mới / Cập nhật)
  const handleSubmit = async (values) => {
    try {
      if (selectedKhachHang) {
        await axios.put(`http://localhost:5174/api/customers/${selectedKhachHang.id}`, values);
        message.success("Cập nhật khách hàng thành công!");
      } else {
        await axios.post("http://localhost:5174/api/customers", values);
        message.success("Thêm khách hàng thành công!");
      }
      fetchKhachHangList();
      setIsModalOpen(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  // 🔹 Xóa khách hàng
  const deleteKhachHang = async (id) => {
    try {
      await axios.delete(`http://localhost:5174/api/customers/${id}`);
      message.success("Xóa khách hàng thành công!");
      fetchKhachHangList();
    } catch (error) {
      message.error("Lỗi khi xóa khách hàng!");
    }
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    { title: "Mã Khách Hàng", dataIndex: "customerID", key: "customerID" },
    { title: "Họ Tên", dataIndex: "name", key: "name" },
    { title: "Số Điện Thoại", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Địa Chỉ", dataIndex: "address", key: "address" },
    { title: "Loại Khách Hàng", dataIndex: "customerType", key: "customerType" },
    { title: "Điểm Tích Lũy", dataIndex: "loyaltyPoints", key: "loyaltyPoints" },
    { title: "Hạng Thành Viên", dataIndex: "membershipTiers", key: "membershipTiers" },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <>
          <Button onClick={() => openModal(record)} type="primary" style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button onClick={() => deleteKhachHang(record.customerID)} danger>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="qlkhachhang-container">
      <h2>Quản Lý Khách Hàng</h2>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        + Thêm Khách Hàng
      </Button>
      <Table columns={columns} dataSource={khachHangList} loading={loading} rowKey="id" />

      {/* 🔹 Modal Thêm / Sửa Khách Hàng */}
      <Modal
        title={selectedKhachHang ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Họ Tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa Chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlKhachHang;
