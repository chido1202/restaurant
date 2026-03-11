/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Rate,
  Popconfirm,
  Card,
  Image,
  Typography,
  Tooltip,
  Badge,
} from "antd";
import axios from "axios";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import "../styles/qlDanhGia.css";
import { useAuth } from "../context/AuthContext";

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const QlDanhGia = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm();
  const { token } = useAuth();
  const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000";

  // Lấy header xác thực với token từ context
  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Lấy danh sách đánh giá
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/reviews`,
        getAuthHeader()
      );
      if (response.data) {
        setReviews(Array.isArray(response.data) ? response.data : []);
      } else {
        setReviews([]);
        message.warning("Không có dữ liệu đánh giá");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải danh sách đánh giá!"
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xem/cập nhật đánh giá
  const openModal = (record = null) => {
    setSelectedReview(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        rating: record.rating,
        comment: record.comment,
        status: record.status,
      });
    } else {
      form.resetFields();
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      await axios.put(
        `${API_URL}/api/reviews/moderate/${selectedReview._id}`,
        { status: values.status },
        getAuthHeader()
      );
      message.success("Cập nhật trạng thái đánh giá thành công!");
      fetchReviews();
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

  // Xóa đánh giá
  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, getAuthHeader());
      message.success("Xóa đánh giá thành công!");
      fetchReviews();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi xóa đánh giá!");
      }
      console.error(error);
    }
  };

  // Hiển thị trạng thái đánh giá
  const renderStatusTag = (status) => {
    let color = "";
    let text = "";

    switch (status) {
      case "pending":
        color = "gold";
        text = "Chờ duyệt";
        break;
      case "approved":
        color = "green";
        text = "Đã duyệt";
        break;
      case "rejected":
        color = "red";
        text = "Từ chối";
        break;
      default:
        color = "default";
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Hiển thị ảnh xem trước
  const handlePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
    setIsPreviewVisible(true);
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "Người dùng",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user?.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
          <div>
            <div>{user?.name || "Ẩn danh"}</div>
            <small>{user?.username}</small>
          </div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (product) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {product?.imageProduct && (
            <img
              src={product.imageProduct}
              alt={product.name}
              style={{
                width: "32px",
                height: "32px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          )}
          <span>{product?.name || "Sản phẩm không xác định"}</span>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (comment) => (
        <Tooltip title={comment}>
          <span>
            {comment.length > 50 ? `${comment.substring(0, 50)}...` : comment}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: (images) => (
        <Space size="small">
          {images && images.length > 0 ? (
            images.slice(0, 3).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`review-img-${index}`}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onClick={() => handlePreview(img)}
              />
            ))
          ) : (
            <span>Không có ảnh</span>
          )}
          {images && images.length > 3 && (
            <Badge count={`+${images.length - 3}`} />
          )}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a, b) =>
        moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => renderStatusTag(status),
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đã duyệt", value: "approved" },
        { text: "Từ chối", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
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
            Xem & Duyệt
          </Button>
          <Popconfirm
            title="Xóa đánh giá"
            description="Bạn có chắc chắn muốn xóa đánh giá này?"
            onConfirm={() => deleteReview(record._id)}
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
    <div className="qldanhgia-container">
      <h2>Quản Lý Đánh Giá</h2>

      <Table
        columns={columns}
        dataSource={reviews}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Xem & Duyệt Đánh Giá */}
      <Modal
        title="Xem & Duyệt Đánh Giá"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Cập nhật"
        cancelText="Đóng"
      >
        {selectedReview && (
          <Card className="review-card">
            <div className="review-header">
              <div className="user-info">
                {selectedReview.user?.avatar && (
                  <img
                    src={selectedReview.user.avatar}
                    alt={selectedReview.user.name}
                    className="user-avatar"
                  />
                )}
                <div>
                  <Title level={5}>
                    {selectedReview.user?.name || "Ẩn danh"}
                  </Title>
                  <Text type="secondary">
                    {moment(selectedReview.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Text>
                </div>
              </div>
              <Rate disabled value={selectedReview.rating} />
            </div>

            <div className="review-product">
              <Title level={5}>Sản phẩm: </Title>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {selectedReview.product?.imageProduct && (
                  <img
                    src={selectedReview.product.imageProduct}
                    alt={selectedReview.product.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <span>
                  {selectedReview.product?.name || "Sản phẩm không xác định"}
                </span>
              </div>
            </div>

            <div className="review-content">
              <Title level={5}>Nội dung đánh giá:</Title>
              <p>{selectedReview.comment}</p>
            </div>

            {selectedReview.images && selectedReview.images.length > 0 && (
              <div className="review-images">
                <Title level={5}>Hình ảnh:</Title>
                <div className="image-gallery">
                  {selectedReview.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`review-img-${index}`}
                      className="review-image"
                      onClick={() => handlePreview(img)}
                    />
                  ))}
                </div>
              </div>
            )}

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="approved">Phê duyệt</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        )}
      </Modal>

      {/* Modal xem ảnh */}
      <Modal
        open={isPreviewVisible}
        title="Xem ảnh"
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
      >
        <img alt="Ảnh xem trước" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default QlDanhGia;
