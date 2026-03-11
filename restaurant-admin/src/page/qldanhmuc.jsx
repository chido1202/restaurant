import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import { useAuth } from "../context/AuthContext";
import "../styles/QlDanhMuc.css";

const QlDanhMuc = () => {
  const [danhMucList, setDanhMucList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState(null);
  const [form] = Form.useForm();
  const API_URL = "http://localhost:5000"; // URL của backend
  const { token } = useAuth();

  // Lấy header xác thực với token từ context
  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    fetchDanhMucList();
  }, []);

  const fetchDanhMucList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setDanhMucList(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedDanhMuc(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        name: record.name,
      });
    } else {
      form.resetFields();
    }
  };

  // Xử lý submit form (Thêm mới / Cập nhật)
  const handleSubmit = async (values) => {
    try {
      if (selectedDanhMuc) {
        // Cập nhật danh mục
        await axios.put(
          `${API_URL}/api/categories/${selectedDanhMuc._id}`,
          values,
          getAuthHeader()
        );
        message.success("Cập nhật danh mục thành công!");
      } else {
        // Thêm danh mục mới
        await axios.post(
          `${API_URL}/api/categories`,
          values,
          getAuthHeader()
        );
        message.success("Thêm danh mục thành công!");
      }
      fetchDanhMucList();
      setIsModalOpen(false);
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Có lỗi xảy ra!");
      }
      console.error(error);
    }
  };

  // Xóa danh mục
  const deleteDanhMuc = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/categories/${id}`,
        getAuthHeader()
      );
      message.success("Xóa danh mục thành công!");
      fetchDanhMucList();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi xóa danh mục!");
      }
      console.error(error);
    }
  };

  // Cấu hình cột của bảng
  const columns = [
    { 
      title: "ID", 
      dataIndex: "_id", 
      key: "_id",
      width: '20%',
      ellipsis: true 
    },
    { 
      title: "Tên Danh Mục", 
      dataIndex: "name", 
      key: "name" 
    },
    {
      title: "Hành động",
      key: "actions",
      width: '20%',
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
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => deleteDanhMuc(record._id)}
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
    <div className="qldanhmuc-container">
      <h2>Quản Lý Danh Mục</h2>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm Danh Mục
      </Button>

      <Table
        columns={columns}
        dataSource={danhMucList}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm / Sửa Danh Mục */}
      <Modal
        title={selectedDanhMuc ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={selectedDanhMuc ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Danh Mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlDanhMuc;
