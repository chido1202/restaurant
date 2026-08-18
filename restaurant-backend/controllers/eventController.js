const Event = require("../models/Event");
const Discount = require("../models/Discount");

const eventController = {
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.find().populate('discountCode', 'code discountValue discountType');
      res.status(200).json(events);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
      res.status(500).json({ message: "Lỗi server khi lấy danh sách sự kiện", error: error.message });
    }
  },

  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('discountCode', 'code discountValue discountType');
      if (!event) return res.status(404).json({ message: "Không tìm thấy sự kiện" });
      res.status(200).json(event);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sự kiện:", error);
      res.status(500).json({ message: "Lỗi server khi lấy thông tin sự kiện", error: error.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      const newEvent = new Event(req.body);
      await newEvent.save();

      // Nếu có discountCode, tạo mã giảm giá cho sự kiện
      if (req.body.discount) {
        const discountData = req.body.discount;
        discountData.event = newEvent._id;

        const newDiscount = new Discount(discountData);
        await newDiscount.save();

        // Cập nhật event với mã giảm giá mới
        newEvent.discountCode = newDiscount._id;
        await newEvent.save();
      }

      res.status(201).json(newEvent);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo sự kiện", error });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEvent) return res.status(404).json({ message: "Không tìm thấy sự kiện" });

      // Cập nhật thông tin mã giảm giá nếu có
      if (req.body.discount && updatedEvent.discountCode) {
        await Discount.findByIdAndUpdate(updatedEvent.discountCode, req.body.discount);
      } else if (req.body.discount) {
        // Tạo mã giảm giá mới
        const discountData = req.body.discount;
        discountData.event = updatedEvent._id;

        const newDiscount = new Discount(discountData);
        await newDiscount.save();

        // Cập nhật event với mã giảm giá mới
        updatedEvent.discountCode = newDiscount._id;
        await updatedEvent.save();
      }

      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật sự kiện", error });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('discountCode');
      if (!event) return res.status(404).json({ message: "Không tìm thấy sự kiện" });

      // Xóa mã giảm giá liên quan
      if (event.discountCode) {
        await Discount.findByIdAndDelete(event.discountCode._id);
      }

      await Event.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Đã xóa sự kiện và mã giảm giá liên quan" });
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error);
      res.status(500).json({ message: "Lỗi khi xóa sự kiện", error: error.message });
    }
  },

  // Lấy sự kiện đang hoạt động
  getActiveEvents: async (req, res) => {
    try {
      const now = new Date();
      const events = await Event.find({
        isActive: true,
        date: { $lte: now },
        $or: [
          { endDate: { $gte: now } },
          { endDate: { $exists: false } }
        ]
      }).populate('discountCode', 'code discountValue discountType');
      res.status(200).json(events);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện đang hoạt động:", error);
      res.status(500).json({ message: "Lỗi server khi lấy danh sách sự kiện đang hoạt động", error: error.message });
    }
  }
};

module.exports = eventController;
