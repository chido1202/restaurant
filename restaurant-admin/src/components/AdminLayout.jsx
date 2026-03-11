import React from "react";
import { Layout, Menu } from "antd";
import { Link, Outlet } from "react-router-dom";
import {
  AiOutlineTable,
  AiOutlineUser,
  AiOutlineShop,
  AiOutlineTeam,
  AiOutlineShoppingCart,
  AiOutlineFileText,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineAppstore,
  AiOutlineSchedule,
  AiOutlineGift,
} from "react-icons/ai";
import "../styles/AdminLayout.css";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const categories = [
    {
      name: "Tổng quan",
      icon: <AiOutlineAppstore />,
      path: "/admin",
    },
    {
      name: "Quản lý sản phẩm",
      icon: <AiOutlineShoppingCart />,
      path: "/admin/qlsanpham",
    },
    {
      name: "Quản lý danh mục",
      icon: <AiOutlineAppstore />,
      path: "/admin/qldanhmuc",
    },
    {
      name: "Quản lý bàn",
      icon: <AiOutlineTable />,
      path: "/admin/qlban",
    },
    {
      name: "Quản lý khách hàng",
      icon: <AiOutlineUser />,
      path: "/admin/qlkhachhang",
    },
    {
      name: "Quản lý nhân viên",
      icon: <AiOutlineTeam />,
      path: "/admin/qlnhanvien",
    },
    {
      name: "Quản lý kho",
      icon: <AiOutlineShop />,
      path: "/admin/qlkho",
    },
    {
      name: "Quản lý nhà cung cấp",
      icon: <AiOutlineShop />,
      path: "/admin/qlnhacungcap",
    },
    {
      name: "Quản lý đơn hàng",
      icon: <AiOutlineShoppingCart />,
      path: "/admin/qldonhang",
    },
    {
      name: "Quản lý hóa đơn",
      icon: <AiOutlineFileText />,
      path: "/admin/qlhoadon",
    },
    {
      name: "Quản lý tài khoản",
      icon: <AiOutlineSetting />,
      path: "/admin/qltaikhoan",
    },
    {
      name: "Quản lý sự kiện",
      icon: <AiOutlineSchedule />,
      path: "/admin/qlsukien",
    },
    {
      name: "Quản lý giảm giá",
      icon: <AiOutlineGift />,
      path: "/admin/qlgiamgia",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className="logo" />
        <Menu theme="dark" mode="inline">
          {categories.map((category, index) => (
            <Menu.Item key={index} icon={category.icon}>
              <Link to={category.path}>{category.name}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: "0 16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
