/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Spin, Alert, Tag } from "antd";
import {
  ShoppingOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import "../styles/Home.css";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
    userCount: 0,
    totalRevenue: 0,
    recentOrders: [],
    productsByCategory: [],
    usersByRole: [],
  });

  const API_URL = "http://localhost:5000";
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Lấy số lượng sản phẩm
      const productsResponse = await axios.get(`${API_URL}/api/products`);

      // Lấy danh sách danh mục
      const categoriesResponse = await axios.get(`${API_URL}/api/categories`);

      // Lấy danh sách đơn hàng
      const ordersResponse = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lấy danh sách người dùng
      const usersResponse = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Tính toán sản phẩm theo danh mục
      const products = productsResponse.data;
      const categories = categoriesResponse.data;
      const orders = ordersResponse.data || [];
      const users = usersResponse.data || [];

      // Tính tổng doanh thu
      const totalRevenue = orders
        .filter((order) => order.status === "completed")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      // Lấy 5 đơn hàng mới nhất
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const productsByCategory = categories.map((category) => {
        // Đảm bảo category._id và category.name đều là string
        const categoryId = category._id ? category._id.toString() : "";
        const categoryName = category.name
          ? category.name.toString()
          : "Không xác định";

        const count = products.filter((product) => {
          // Xử lý trường hợp product.category có thể là object hoặc string
          if (!product.category) return false;

          const productCategoryId =
            typeof product.category === "object"
              ? product.category._id
              : product.category;

          return productCategoryId === categoryId;
        }).length;

        return {
          category: categoryName,
          count,
          key: categoryId, // Thêm key để React quản lý hiệu quả hơn
        };
      });

      // Thêm sản phẩm không có danh mục
      const uncategorizedCount = products.filter(
        (product) => !product.category
      ).length;
      if (uncategorizedCount > 0) {
        productsByCategory.push({
          category: "Chưa phân loại",
          count: uncategorizedCount,
          key: "uncategorized",
        });
      }

      // Thống kê người dùng theo vai trò
      const usersByRole = [
        {
          role: "Quản trị viên",
          count: users.filter((user) => user.role === "admin").length,
          key: "admin",
        },
        {
          role: "Nhân viên",
          count: users.filter((user) => user.role === "staff").length,
          key: "staff",
        },
        {
          role: "Khách hàng",
          count: users.filter((user) => user.role === "customer").length,
          key: "customer",
        },
      ];

      setStats({
        productCount: products.length,
        categoryCount: categories.length,
        orderCount: orders.length,
        userCount: users.length,
        totalRevenue,
        recentOrders,
        productsByCategory,
        usersByRole,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  // Hàm hiển thị trạng thái đơn hàng
  const renderOrderStatus = (status) => {
    let color = "";
    let text = "";

    switch (status) {
      case "pending":
        color = "gold";
        text = "Chờ xác nhận";
        break;
      case "confirmed":
        color = "blue";
        text = "Đã xác nhận";
        break;
      case "completed":
        color = "green";
        text = "Hoàn thành";
        break;
      case "cancelled":
        color = "red";
        text = "Đã hủy";
        break;
      default:
        color = "default";
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Cấu hình bảng phân loại sản phẩm theo danh mục
  const categoryColumns = [
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Số lượng sản phẩm",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
    },
  ];

  // Cấu hình bảng đơn hàng gần đây
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "orderID",
      key: "orderID",
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price?.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => renderOrderStatus(status),
    },
  ];

  // Cấu hình bảng thống kê người dùng theo vai trò
  const userRoleColumns = [
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
    },
  ];

  return (
    <div className="home-container">
      <h1>Bảng thống kê</h1>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Tổng số sản phẩm"
              value={stats.productCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Tổng số danh mục"
              value={stats.categoryCount}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đơn hàng"
              value={stats.orderCount}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#cf1322" }}
              suffix="đ"
              precision={0}
              formatter={(value) => value.toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={24} md={24} lg={24}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={stats.userCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#2196F3" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="table-row">
        <Col xs={24} lg={12}>
          <Card title="Phân loại sản phẩm theo danh mục">
            <Table
              columns={categoryColumns}
              dataSource={stats.productsByCategory}
              rowKey="key"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây">
            <Table
              columns={orderColumns}
              dataSource={stats.recentOrders}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="table-row">
        <Col xs={24} lg={12}>
          <Card title="Người dùng theo vai trò">
            <Table
              columns={userRoleColumns}
              dataSource={stats.usersByRole}
              rowKey="key"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
