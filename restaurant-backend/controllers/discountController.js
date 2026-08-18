const Discount = require("../models/Discount");
const Event = require("../models/Event");

const discountController = {
  getAllDiscounts: async (req, res) => {
    try {
      const discounts = await Discount.find().populate('event', 'name');
      res.status(200).json(discounts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi server khi lấy danh sách mã giảm giá", error: error.message });
    }
  },

  getDiscountById: async (req, res) => {
    try {
      const discount = await Discount.findById(req.params.id).populate('event', 'name');
      if (!discount) return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
      res.status(200).json(discount);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi server khi lấy thông tin mã giảm giá", error: error.message });
    }
  },

  getDiscountByCode: async (req, res) => {
    try {
      const { code } = req.params;
      const discount = await Discount.findOne({
        code,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        $or: [
          { maxUsage: 0 }, // không giới hạn số lần sử dụng
          { usageCount: { $lt: "$maxUsage" } } // còn có thể sử dụng
        ]
      }).populate('event', 'name');

      if (!discount) return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã hết hạn" });
      res.status(200).json(discount);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  },

  createDiscount: async (req, res) => {
    try {
      // Kiểm tra xem mã đã tồn tại chưa
      const existingDiscount = await Discount.findOne({ code: req.body.code });
      if (existingDiscount) {
        return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
      }

      const newDiscount = new Discount(req.body);
      await newDiscount.save();

      // Nếu có liên kết với sự kiện, cập nhật sự kiện
      if (req.body.event) {
        await Event.findByIdAndUpdate(req.body.event, { discountCode: newDiscount._id });
      }

      res.status(201).json(newDiscount);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi tạo mã giảm giá", error });
    }
  },

  updateDiscount: async (req, res) => {
    try {
      const updatedDiscount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedDiscount) return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });

      // Cập nhật liên kết với sự kiện nếu cần
      if (req.body.event) {
        await Event.findByIdAndUpdate(req.body.event, { discountCode: updatedDiscount._id });
      }

      res.status(200).json(updatedDiscount);
    } catch (error) {
      res.status(400).json({ message: "Lỗi khi cập nhật mã giảm giá", error });
    }
  },

  deleteDiscount: async (req, res) => {
    try {
      const discount = await Discount.findById(req.params.id);
      if (!discount) return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });

      // Xóa liên kết với sự kiện
      if (discount.event) {
        await Event.findByIdAndUpdate(discount.event, { $unset: { discountCode: 1 } });
      }

      await Discount.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Xóa mã giảm giá thành công" });
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi khi xóa mã giảm giá", error: error.message });
    }
  },

  applyDiscount: async (req, res) => {
    try {
      const { code, orderTotal } = req.body;

      if (!code || !orderTotal) {
        return res.status(400).json({ message: "Thiếu mã giảm giá hoặc giá trị đơn hàng" });
      }

      // Tìm mã giảm giá có hiệu lực (đã được sửa)
      const discount = await Discount.findOne({
        code,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (!discount) {
        return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã hết hạn" });
      }

      // Kiểm tra số lần sử dụng riêng thay vì dùng $or trong truy vấn
      if (discount.maxUsage > 0 && discount.usageCount >= discount.maxUsage) {
        return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (discount.minOrderValue > 0 && orderTotal < discount.minOrderValue) {
        return res.status(400).json({
          message: `Đơn hàng tối thiểu để sử dụng mã này là ${discount.minOrderValue.toLocaleString('vi-VN')} VNĐ`
        });
      }

      // Tính giá trị giảm giá
      let discountAmount = 0;
      if (discount.discountType === 'percentage') {
        discountAmount = Math.round(orderTotal * (discount.discountValue / 100));
      } else { // fixed
        discountAmount = discount.discountValue;
      }

      // Không để giảm giá vượt quá giá trị đơn hàng
      discountAmount = Math.min(discountAmount, orderTotal);

      // Tính giá sau khi áp dụng giảm giá
      const finalPrice = orderTotal - discountAmount;

      res.status(200).json({
        originalPrice: orderTotal,
        discountAmount,
        finalPrice,
        discountInfo: discount
      });
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },

  // Thêm 1 lần sử dụng mã giảm giá
  incrementUsage: async (req, res) => {
    try {
      const { code } = req.params;

      // Tìm mã giảm giá trước
      const discount = await Discount.findOne({ code });

      if (!discount) {
        return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
      }

      // Cập nhật usageCount
      discount.usageCount = (discount.usageCount || 0) + 1;
      await discount.save();

      res.status(200).json({
        message: "Đã cập nhật số lần sử dụng",
        usageCount: discount.usageCount
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật số lần sử dụng mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi server khi cập nhật số lần sử dụng", error: error.message });
    }
  }
};

module.exports = discountController;
