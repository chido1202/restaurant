const jwt = require("jsonwebtoken");

// Middleware xác thực & kiểm tra quyền
const middlewareController = {
  authenticate: (req, res, next) => {
    try {
      // Kiểm tra header Authorization có tồn tại không
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // Cho phép tiếp tục với req.user = null
        req.user = null;
        return next();
      }

      // Lấy token từ chuỗi "Bearer <token>"
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          // Cho phép tiếp tục với req.user = null
          req.user = null;
          return next();
        }

        req.user = user; // Lưu thông tin user vào request
        next();
      });
    } catch (error) {
      req.user = null;
      next();
    }
  },

  requireAuth: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện thao tác này!" });
    }
    next();
  },

  authorizeRoles: (roles = []) => {
    return (req, res, next) => {
      if (!Array.isArray(roles)) {
        return res.status(500).json({ message: "Lỗi hệ thống: roles phải là mảng!" });
      }

      if (!req.user || (roles.length && !roles.includes(req.user.role))) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
      }
      next();
    };
  }
};

module.exports = middlewareController;
