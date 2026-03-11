import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Select, message, InputNumber, Tag, Space } from "antd";
import { useAuth } from "../context/AuthContext";
import "../styles/QLSanPham.css";

const { Option } = Select;
const { TextArea } = Input;

const QlSanPham = () => {
  const [sanPhamList, setSanPhamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSanPham, setSelectedSanPham] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [danhMucList, setDanhMucList] = useState([]);
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

  // 🔹 Lấy danh sách sản phẩm và danh mục từ API
  useEffect(() => {
    fetchSanPhamList();
    fetchDanhMucList();
  }, []);

  const fetchSanPhamList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setSanPhamList(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm!");
      console.error(error);
    }
    setLoading(false);
  };

  const fetchDanhMucList = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setDanhMucList(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục!");
      console.error(error);
    }
  };

  // 🔹 Mở modal (thêm mới / chỉnh sửa)
  const openModal = (record = null) => {
    setSelectedSanPham(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        productID: record.productID,
        name: record.name,
        price: record.price,
        description: record.description,
        type: record.type,
        imageProduct: record.imageProduct,
        mainIngredients: record.mainIngredients,
        category: record.category || null,
      });
    } else {
      form.resetFields();
    }
  };

  // 🔹 Xử lý submit form (Thêm mới / Cập nhật)
  const handleSubmit = async (values) => {
    try {
      if (selectedSanPham) {
        // Cập nhật sản phẩm
        await axios.put(
          `${API_URL}/api/products/${selectedSanPham._id}`, 
          values, 
          getAuthHeader()
        );
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm sản phẩm mới
        await axios.post(
          `${API_URL}/api/products`, 
          values, 
          getAuthHeader()
        );
        message.success("Thêm sản phẩm thành công!");
      }
      fetchSanPhamList();
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

  // 🔹 Xóa sản phẩm
  const deleteSanPham = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/products/${id}`,
        getAuthHeader()
      );
      message.success("Xóa sản phẩm thành công!");
      fetchSanPhamList();
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm!");
      console.error(error);
    }
  };

  // 🔹 Cấu hình cột của bảng
  const columns = [
    { title: "Mã SP", dataIndex: "productID", key: "productID" },
    { title: "Tên Sản Phẩm", dataIndex: "name", key: "name" },
    { 
      title: "Giá (VNĐ)", 
      dataIndex: "price", 
      key: "price",
      render: (price) => price?.toLocaleString('vi-VN') 
    },
    { 
      title: "Danh mục", 
      dataIndex: "category", 
      key: "category",
      render: (category) => {
        if (!category) return <span style={{ color: '#999' }}>Chưa phân loại</span>;
        const catObj = danhMucList.find(cat => cat._id === category || cat.name === category);
        return catObj ? (
          <Tag color="blue">{catObj.name}</Tag>
        ) : (
          <Tag color="blue">{category}</Tag>
        );
      }
    },
    { title: "Loại", dataIndex: "type", key: "type" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal(record)} type="primary">
            Sửa
          </Button>
          <Button onClick={() => deleteSanPham(record._id)} danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="qlsanpham-container">
      <h2>Quản Lý Sản Phẩm</h2>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" onClick={() => openModal()}>
          + Thêm Sản Phẩm
        </Button>
        <Button type="link" onClick={fetchSanPhamList}>
          🔄 Làm mới danh sách
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={sanPhamList} 
        loading={loading} 
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* 🔹 Modal Thêm / Sửa Sản Phẩm */}
      <Modal
        title={selectedSanPham ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText={selectedSanPham ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="productID" 
            label="Mã Sản Phẩm" 
            rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="name" 
            label="Tên Sản Phẩm" 
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="price" 
            label="Giá" 
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item name="category" label="Danh mục">
            <Select 
              placeholder="Chọn danh mục"
              allowClear
            >
              {danhMucList.map(category => (
                <Option key={category?._id} value={category?._id}>{category?.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="type" label="Loại Sản Phẩm">
            <Select>
              <Option value="Đồ ăn">Đồ ăn</Option>
              <Option value="Đồ uống">Đồ uống</Option>
              <Option value="Món chính">Món chính</Option>
              <Option value="Món phụ">Món phụ</Option>
              <Option value="Tráng miệng">Tráng miệng</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          
          <Form.Item name="description" label="Mô tả sản phẩm">
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item name="mainIngredients" label="Nguyên liệu chính">
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item name="imageProduct" label="Đường dẫn hình ảnh">
            <Input placeholder="Nhập URL hình ảnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlSanPham;
