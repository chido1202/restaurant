import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import "../styles/QLNhanVien.css"; // Kiểm tra xem file CSS đã có chưa

const { Option } = Select;

const QlNhanVien = () => {
  const [nhanVienList, setNhanVienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách nhân viên từ API
  useEffect(() => {
    fetchNhanVienList();
  }, []);

  const fetchNhanVienList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5174/api/employees");
      setNhanVienList(response.data.nhanviens || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhân viên!");
    }
    setLoading(false);
  };

  // 🔹 Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedNhanVien(record);
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
      if (selectedNhanVien) {
        await axios.put(`http://localhost:5174/api/employees/${selectedNhanVien.id}`, values);
        message.success("Cập nhật nhân viên thành công!");
      } else {
        await axios.post("http://localhost:5174/api/employees", values);
        message.success("Thêm nhân viên thành công!");
      }
      fetchNhanVienList();
      setIsModalOpen(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  // 🔹 Xóa nhân viên
  const deleteNhanVien = async (id) => {
    try {
      await axios.delete(`http://localhost:5174/api/employees/${id}`);
      message.success("Xóa nhân viên thành công!");
      fetchNhanVienList();
    } catch (error) {
      message.error("Lỗi khi xóa nhân viên!");
    }
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Họ Tên", dataIndex: "hoTen", key: "hoTen" },
    { title: "Chức Vụ", dataIndex: "chucVu", key: "chucVu" },
    { title: "Số Điện Thoại", dataIndex: "soDienThoai", key: "soDienThoai" },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <>
          <Button onClick={() => openModal(record)} type="primary" style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button onClick={() => deleteNhanVien(record.id)} danger>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="qlnhanvien-container">
      <h2>Quản Lý Nhân Viên</h2>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        + Thêm Nhân Viên
      </Button>
      <Table columns={columns} dataSource={nhanVienList} loading={loading} rowKey="id" />

      {/* 🔹 Modal Thêm / Sửa Nhân Viên */}
      <Modal
        title={selectedNhanVien ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="hoTen" label="Họ Tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="chucVu" label="Chức Vụ" rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}>
            <Select>
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Phục vụ">Phục vụ</Option>
              <Option value="Bếp trưởng">Bếp trưởng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số Điện Thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlNhanVien;
