/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  message,
  Popconfirm,
} from "antd";
import "../styles/QLBan.css";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;

const QlBan = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const API_URL = "http://localhost:5000"; // URL của backend

  // Lấy header xác thực với token từ context
  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Lấy danh sách bàn
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/tables`,
        getAuthHeader()
      );
      if (response.data) {
        setTables(Array.isArray(response.data) ? response.data : []);
      } else {
        setTables([]);
        message.warning("Không có dữ liệu bàn");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải danh sách bàn!"
      );
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal thêm/sửa bàn
  const openModal = (record = null) => {
    setSelectedTable(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        tableID: record.tableID,
        area: record.area,
        capacity: record.capacity,
        status: record.status,
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: "available",
        isActive: true,
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (selectedTable) {
        // Cập nhật bàn
        await axios.put(
          `${API_URL}/api/tables/${selectedTable._id}`,
          values,
          getAuthHeader()
        );
        message.success("Cập nhật bàn thành công!");
      } else {
        // Thêm bàn mới
        await axios.post(`${API_URL}/api/tables`, values, getAuthHeader());
        message.success("Thêm bàn thành công!");
      }
      fetchTables();
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

  // Xóa bàn
  const deleteTable = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tables/${id}`, getAuthHeader());
      message.success("Xóa bàn thành công!");
      fetchTables();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi xóa bàn!");
      }
      console.error(error);
    }
  };

  // Hiển thị trạng thái dưới dạng Tag có màu
  const renderStatusTag = (status) => {
    let color = "";
    let text = "";

    switch (status) {
      case "available":
        color = "green";
        text = "Trống";
        break;
      case "reserved":
        color = "gold";
        text = "Đã đặt trước";
        break;
      case "occupied":
        color = "red";
        text = "Đang sử dụng";
        break;
      case "maintenance":
        color = "blue";
        text = "Bảo trì";
        break;
      default:
        color = "default";
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "Mã bàn",
      dataIndex: "tableID",
      key: "tableID",
    },
    {
      title: "Khu vực",
      dataIndex: "area",
      key: "area",
    },
    {
      title: "Sức chứa",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => `${capacity} người`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status),
      filters: [
        { text: "Trống", value: "available" },
        { text: "Đã đặt trước", value: "reserved" },
        { text: "Đang sử dụng", value: "occupied" },
        { text: "Bảo trì", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Sử dụng",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
        </Tag>
      ),
      filters: [
        { text: "Đang sử dụng", value: true },
        { text: "Ngừng sử dụng", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Hành động",
      key: "actions",
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
            title="Xóa bàn"
            description="Bạn có chắc chắn muốn xóa bàn này không?"
            onConfirm={() => deleteTable(record._id)}
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
    <div className="qlban-container">
      <h2>Quản Lý Bàn</h2>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm Bàn
      </Button>

      <Table
        columns={columns}
        dataSource={tables}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm / Sửa Bàn */}
      <Modal
        title={selectedTable ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={selectedTable ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="tableID"
            label="Mã bàn"
            rules={[{ required: true, message: "Vui lòng nhập mã bàn" }]}
          >
            <Input placeholder="Ví dụ: T01, B02..." />
          </Form.Item>

          <Form.Item
            name="area"
            label="Khu vực"
            rules={[{ required: true, message: "Vui lòng nhập khu vực" }]}
          >
            <Input placeholder="Ví dụ: Tầng 1, Khu vực ngoài trời..." />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Số người"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="available">Trống</Option>
              <Option value="reserved">Đã đặt trước</Option>
              <Option value="occupied">Đang sử dụng</Option>
              <Option value="maintenance">Bảo trì</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Sử dụng" valuePropName="checked">
            <Switch
              checkedChildren="Đang sử dụng"
              unCheckedChildren="Ngừng sử dụng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlBan;
