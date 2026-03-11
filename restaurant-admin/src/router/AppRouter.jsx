import React from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/LoginPage";
import Home from "../pages/Home";
import QlSanPham from "../pages/QlSanPham";
import QlDanhMuc from "../pages/QlDanhMuc";
import QlBan from "../pages/QlBan";
import QlKhachHang from "../pages/QlKhachHang";
import QlNhanVien from "../pages/QlNhanVien";
import QlKho from "../pages/QlKho";
import QlNhaCungCap from "../pages/QlNhaCungCap";
import QlDonHang from "../pages/QlDonHang";
import QlHoaDon from "../pages/QlHoaDon";
import QlTaiKhoan from "../pages/QlTaiKhoan";
import QlSuKien from "../pages/QlSuKien";
import QlGiamGia from "../pages/QlGiamGia";

const AppRouter = () => {
  return (
    <AnimatePresence>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="qlsanpham" element={<QlSanPham />} />
          <Route path="qldanhmuc" element={<QlDanhMuc />} />
          <Route path="qlban" element={<QlBan />} />
          <Route path="qlkhachhang" element={<QlKhachHang />} />
          <Route path="qlnhanvien" element={<QlNhanVien />} />
          <Route path="qlkho" element={<QlKho />} />
          <Route path="qlnhacungcap" element={<QlNhaCungCap />} />
          <Route path="qldonhang" element={<QlDonHang />} />
          <Route path="qlhoadon" element={<QlHoaDon />} />
          <Route path="qltaikhoan" element={<QlTaiKhoan />} />
          <Route path="qlsukien" element={<QlSuKien />} />
          <Route path="qlgiamgia" element={<QlGiamGia />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
