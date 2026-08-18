const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getUserByIdAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  createUser: async (req, res) => {
    try {
      const { username, password, email, name, phone, role, address } = req.body;

      // Kiểm tra xem username hoặc email đã tồn tại chưa
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại" });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        name,
        phone,
        role,
        address,
      });

      const savedUser = await newUser.save();

      // Trả về thông tin user đã tạo (không bao gồm password)
      const userResponse = { ...savedUser.toObject() };
      delete userResponse.password;

      res.status(201).json({
        message: "Tạo người dùng thành công",
        user: userResponse
      });
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi tạo người dùng", error });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Nếu có cập nhật mật khẩu, mã hóa mật khẩu mới
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật", error });
    }
  },

  updateUserSelf: async (req, res) => {
    try {
      const { userId } = req.user;
      const { name, phone, address } = req.body;

      // Chỉ cho phép cập nhật một số trường nhất định
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({
        message: "Cập nhật thông tin thành công",
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật thông tin", error });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json({ message: "Xóa người dùng thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
};

module.exports = userController;
