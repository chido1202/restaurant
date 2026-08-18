import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaRegCalendarAlt, FaSave, FaTimesCircle, FaUserEdit } from "react-icons/fa";
import "../styles/UserProfile.css";
import { useAuth } from "../contexts/auth";
import axiosClient from "../api/axiosClient";
import UserLayout from "../components/UserLayout";

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // Khởi tạo formData khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    // Reset về giá trị ban đầu
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
    setIsEditing(false);
    setStatusMessage({ type: "", message: "" });
  };

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Bạn cần đăng nhập lại");

      await axiosClient.put("/api/users/me", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatusMessage({ type: "success", message: "Cập nhật thông tin thành công!" });
      setIsEditing(false);

      // Cập nhật lại thông tin người dùng
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setStatusMessage({
        type: "error",
        message: err.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin"
      });
    }
  };

  return (
    <UserLayout>
      <h2>Thông tin cá nhân</h2>

      {statusMessage.message && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          {statusMessage.message}
        </div>
      )}

      <div className="gender-selection">
        <label>
          <input type="radio" name="gender" checked={currentUser?.gender === "male"} readOnly /> Nam
        </label>
        <label>
          <input type="radio" name="gender" checked={currentUser?.gender === "female"} readOnly /> Nữ
        </label>
      </div>

      <div className="form-group">
        <div className="input-box">
          <label>Tên đăng nhập</label>
          <input type="text" value={currentUser?.username} readOnly />
        </div>
        <div className="input-box">
          <label>Họ tên</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            readOnly={!isEditing}
            className={isEditing ? "editable" : ""}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="input-box email-box">
          <label>Email</label>
          <input type="text" value={currentUser?.email} readOnly />
          <FaCheckCircle className="verified-icon" />
        </div>
      </div>

      <div className="form-group">
        <div className="input-box">
          <label>Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            readOnly={!isEditing}
            className={isEditing ? "editable" : ""}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="input-box">
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            readOnly={!isEditing}
            className={isEditing ? "editable" : ""}
          />
        </div>
        <div className="input-box date-box">
          <label>Ngày sinh</label>
          <input type="text" value={currentUser?.dob || 'Chưa cập nhật'} readOnly />
          <FaRegCalendarAlt className="calendar-icon" />
        </div>
      </div>

      <div className="button-group">
        {!isEditing ? (
          <button className="edit-btn" onClick={startEditing}>
            <FaUserEdit /> Chỉnh sửa thông tin
          </button>
        ) : (
          <>
            <button className="cancel-btn" onClick={cancelEditing}>
              <FaTimesCircle /> Hủy thay đổi
            </button>
            <button className="save-btn" onClick={saveChanges}>
              <FaSave /> Lưu thay đổi
            </button>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default UserProfile;
