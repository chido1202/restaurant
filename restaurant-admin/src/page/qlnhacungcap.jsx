import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message } from "antd";
import "../styles/QLNhaCungCap.css"; // Kiểm tra xem file CSS đã có chưa

const QlNhaCungCap = () => {
  const [nccList, setNccList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNCC, setSelectedNCC] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách nhà cung cấp từ API
  useEffect(() => {
    fetchNhaCungCapList();
  }, []);

  const fetchNhaCungCapList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5174/api/suppliers");
      setNccList(response.data.nhacungcaps || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhà cung cấp!");
    }
    setLoading(false);
  };

  // 🔹 Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedNCC(record);
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
      if (selectedNCC) {
        await axios.put(`http://localhost:5174/api/suppliers/${selectedNCC.id}`, values);
        message.success("Cập nhật nhà cung cấp thành công!");
      } else {
        await axios.post("http://localhost:5174/api/suppliers", values);
        message.success("Thêm nhà cung cấp thành công!");
      }
      fetchNhaCungCapList();
      setIsModalOpen(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  // 🔹 Xóa nhà cung cấp
  const deleteNCC = async (id) => {
    try {
      await axios.delete(`http://localhost:5174/api/suppliers/${id}`);
      message.success("Xóa nhà cung cấp thành công!");
      fetchNhaCungCapList();
    } catch (error) {
      message.error("Lỗi khi xóa nhà cung cấp!");
    }
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên Nhà Cung Cấp", dataIndex: "tenNCC", key: "tenNCC" },
    { title: "Số Điện Thoại", dataIndex: "sdt", key: "sdt" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Địa Chỉ", dataIndex: "diaChi", key: "diaChi" },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <>
          <Button onClick={() => openModal(record)} type="primary" style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button onClick={() => deleteNCC(record.id)} danger>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="qlnhacungcap-container">
      <h2>Quản Lý Nhà Cung Cấp</h2>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        + Thêm Nhà Cung Cấp
      </Button>
      <Table columns={columns} dataSource={nccList} loading={loading} rowKey="id" />

      {/* 🔹 Modal Thêm / Sửa Nhà Cung Cấp */}
      <Modal
        title={selectedNCC ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="tenNCC" label="Tên Nhà Cung Cấp" rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa Chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlNhaCungCap;
