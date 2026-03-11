/* eslint-disable react-hooks/exhaustive-deps */
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
  Popconfirm,
} from "antd";
import { useAuth } from "../context/AuthContext";
import "../styles/QLTaiKhoan.css";

const { Option } = Select;

const QlTaiKhoan = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const API_URL = "http://localhost:5000";
  const { token } = useAuth();

  // Lấy header xác thực với token từ context
  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users`, getAuthHeader());
      setUserList(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      message.error("Lỗi khi tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedUser(record);
    setIsModalOpen(true);

    if (record) {
      // Đối với chỉnh sửa - không hiển thị trường mật khẩu
      form.setFieldsValue({
        username: record.username,
        name: record.name,
        email: record.email,
        phone: record.phone,
        address: record.address,
        role: record.role,
      });
    } else {
      // Đối với thêm mới
      form.resetFields();
    }
  };

  // Xử lý submit form (Thêm mới / Cập nhật)
  const handleSubmit = async (values) => {
    try {
      if (selectedUser) {
        // Cập nhật người dùng
        await axios.put(
          `${API_URL}/api/users/${selectedUser._id}`,
          values,
          getAuthHeader()
        );
        message.success("Cập nhật người dùng thành công!");
      } else {
        // Thêm người dùng mới - yêu cầu mật khẩu
        if (!values.password) {
          return message.error("Mật khẩu là bắt buộc khi tạo người dùng mới!");
        }

        await axios.post(`${API_URL}/api/users`, values, getAuthHeader());
        message.success("Thêm người dùng thành công!");
      }

      fetchUserList();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi:", error);
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Có lỗi xảy ra!");
      }
    }
  };

  // Xóa người dùng
  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/users/${id}`, getAuthHeader());
      message.success("Xóa người dùng thành công!");
      fetchUserList();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      message.error("Lỗi khi xóa người dùng!");
    }
  };

  // Hiển thị loại người dùng
  const renderUserRole = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "staff":
        return "Nhân viên";
      case "customer":
        return "Khách hàng";
      default:
        return role;
    }
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => renderUserRole(role),
    },
    {
      title: "Hành động",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <>
          <Button
            onClick={() => openModal(record)}
            type="primary"
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => deleteUser(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="qltaikhoan-container">
      <h2>Quản Lý Người Dùng</h2>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm Người Dùng
      </Button>
      <Table
        columns={columns}
        dataSource={userList}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      {/* Modal Thêm / Sửa Người Dùng */}
      <Modal
        title={selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        okText={selectedUser ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
            ]}
          >
            <Input disabled={selectedUser} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          {selectedUser && (
            <Form.Item
              name="password"
              label="Mật khẩu mới (để trống nếu không thay đổi)"
              rules={[{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới nếu muốn thay đổi" />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                pattern: /^[0-9]{10,15}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Quyền"
            rules={[{ required: true, message: "Vui lòng chọn quyền" }]}
          >
            <Select placeholder="Chọn quyền người dùng">
              <Option value="admin">Quản trị viên</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="customer">Khách hàng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlTaiKhoan;
