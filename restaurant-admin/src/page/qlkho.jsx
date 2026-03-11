import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import "../styles/QLKho.css"; // Kiểm tra xem file CSS đã có chưa

const QlKho = () => {
  const [khoList, setKhoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKho, setSelectedKho] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách kho từ API
  useEffect(() => {
    fetchKhoList();
  }, []);

  const fetchKhoList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5174/api/warehouse");
      setKhoList(response.data.khos || []);

    } catch (error) {
      message.error("Lỗi khi tải danh sách kho!");
    }
    setLoading(false);
  };

  // 🔹 Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedKho(record);
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
      if (selectedKho) {
        await axios.put(`http://localhost:5174/api/warehouse/${selectedKho.id}`, values);
        message.success("Cập nhật kho thành công!");
      } else {
        await axios.post("http://localhost:5174/api/warehouse", values);
        message.success("Thêm kho thành công!");
      }
      fetchKhoList();
      setIsModalOpen(false);
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  // 🔹 Xóa kho
  const deleteKho = async (id) => {
    try {
      await axios.delete(`http://localhost:5174/api/warehouse/${id}`);
      message.success("Xóa kho thành công!");
      fetchKhoList();
    } catch (error) {
      message.error("Lỗi khi xóa kho!");
    }
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên Kho", dataIndex: "tenKho", key: "tenKho" },
    { title: "Số Lượng", dataIndex: "soLuong", key: "soLuong" },
    { title: "Vị Trí", dataIndex: "viTri", key: "viTri" },
    {
      title: "Hành động",
      key: "actions",
      render: (record) => (
        <>
          <Button onClick={() => openModal(record)} type="primary" style={{ marginRight: 8 }}>
            Sửa
          </Button>
          <Button onClick={() => deleteKho(record.id)} danger>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="qlkho-container">
      <h2>Quản Lý Kho</h2>
      <Button type="primary" onClick={() => openModal()} style={{ marginBottom: 16 }}>
        + Thêm Kho
      </Button>
      <Table columns={columns} dataSource={khoList} loading={loading} rowKey="id" />

      {/* 🔹 Modal Thêm / Sửa Kho */}
      <Modal
        title={selectedKho ? "Chỉnh sửa kho" : "Thêm kho mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="tenKho" label="Tên Kho" rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="soLuong" label="Số Lượng" rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="viTri" label="Vị Trí" rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlKho;
