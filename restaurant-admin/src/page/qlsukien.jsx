/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Upload,
  Switch,
  Tabs,
  InputNumber,
  Select,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import "../styles/QLSuKien.css";
import moment from "moment";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const QlSuKien = () => {
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { token } = useAuth();
  const API_URL = "http://localhost:5000"; // URL của backend

  // Lấy header xác thực với token từ context
  const getAuthHeader = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Lấy danh sách sự kiện
  useEffect(() => {
    fetchEventList();
  }, []);

  const fetchEventList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/events`,
        getAuthHeader()
      );
      if (response.data) {
        setEventList(Array.isArray(response.data) ? response.data : []);
      } else {
        setEventList([]);
        message.warning("Không có dữ liệu sự kiện");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải danh sách sự kiện!"
      );
      setEventList([]);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal thêm/sửa sự kiện
  const openModal = (record = null) => {
    setSelectedEvent(record);
    setIsModalOpen(true);
    if (record) {
      // Chuẩn bị dữ liệu discount để hiển thị trong form
      const discountData = record.discountCode
        ? {
            code: record.discountCode.code,
            discountType: record.discountCode.discountType,
            discountValue: record.discountCode.discountValue,
            dateRange: [
              moment(record.discountCode.startDate),
              moment(record.discountCode.endDate),
            ],
            minOrderValue: record.discountCode.minOrderValue || 0,
            maxUsage: record.discountCode.maxUsage || 0,
            isActive: record.discountCode.isActive,
          }
        : null;

      form.setFieldsValue({
        name: record.name,
        description: record.description,
        date: moment(record.date),
        endDate: record.endDate ? moment(record.endDate) : null,
        location: record.location,
        image: record.image,
        isActive: record.isActive !== false, // Mặc định là true nếu không có
        discount: discountData,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        discount: {
          discountType: "percentage",
          minOrderValue: 0,
          maxUsage: 0,
          isActive: true,
        },
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      // Chuẩn bị dữ liệu sự kiện
      const eventData = {
        name: values.name,
        description: values.description,
        date: values.date.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        location: values.location,
        image: values.image,
        isActive: values.isActive !== false, // Mặc định là true nếu không có
      };

      // Chuẩn bị dữ liệu discount nếu có
      if (values.discount && values.discount.code) {
        const discountData = { ...values.discount };

        // Chuyển đổi dateRange thành startDate và endDate
        if (discountData.dateRange) {
          const [startDate, endDate] = discountData.dateRange;
          discountData.startDate = startDate.toISOString();
          discountData.endDate = endDate.toISOString();
          delete discountData.dateRange;
        }

        // Đảm bảo minOrderValue và maxUsage là số
        discountData.minOrderValue = Number(discountData.minOrderValue) || 0;
        discountData.maxUsage = Number(discountData.maxUsage) || 0;
        discountData.isActive = discountData.isActive !== false; // Mặc định là true

        // Gắn thông tin discount vào event
        eventData.discount = discountData;
      }

      if (selectedEvent) {
        // Cập nhật sự kiện
        await axios.put(
          `${API_URL}/api/events/${selectedEvent._id}`,
          eventData,
          getAuthHeader()
        );
        message.success("Cập nhật sự kiện thành công!");
      } else {
        // Thêm sự kiện mới
        await axios.post(`${API_URL}/api/events`, eventData, getAuthHeader());
        message.success("Thêm sự kiện thành công!");
      }
      fetchEventList();
      // Tải lại danh sách mã giảm giá vì có thể có mã giảm giá liên quan đến sự kiện
      fetchDiscountList();
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

  // Xóa sự kiện
  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/events/${id}`, getAuthHeader());
      message.success("Xóa sự kiện và mã giảm giá liên quan thành công!");
      fetchEventList();
      // Tải lại danh sách mã giảm giá vì có thể có mã giảm giá liên quan đến sự kiện
      fetchDiscountList();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi xóa sự kiện!");
      }
      console.error(error);
    }
  };

  // Thêm hàm này nếu chưa có
  const fetchDiscountList = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/discounts`,
        getAuthHeader()
      );
      // Không cần lưu dữ liệu, chỉ gọi API để cập nhật backend
      if (!response.data) {
        console.warn("Không nhận được dữ liệu mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã giảm giá:", error);
      // Không hiển thị thông báo lỗi vì đây chỉ là API phụ
    }
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "Tên sự kiện",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Ngày diễn ra",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "Không có"),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Mã giảm giá",
      key: "discount",
      render: (_, record) =>
        record.discountCode ? (
          <span>{record.discountCode.code}</span>
        ) : (
          <span style={{ color: "#999" }}>Không có</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <span style={{ color: isActive ? "green" : "red" }}>
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </span>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Tạm ngưng", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
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
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sự kiện"
            description="Bạn có chắc chắn muốn xóa sự kiện này? Mã giảm giá liên quan cũng sẽ bị xóa."
            onConfirm={() => deleteEvent(record._id)}
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
    <div className="qlsukien-container">
      <h2>Quản Lý Sự Kiện</h2>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm Sự Kiện
      </Button>

      <Table
        columns={columns}
        dataSource={eventList}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm / Sửa Sự Kiện */}
      <Modal
        title={selectedEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
        okText={selectedEvent ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Form.Item
                name="name"
                label="Tên sự kiện"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sự kiện" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày diễn ra"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày diễn ra" },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="image" label="URL hình ảnh">
                <Input placeholder="Nhập URL hình ảnh cho sự kiện" />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm ngưng"
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="Mã giảm giá" key="2">
              <Form.Item
                name={["discount", "code"]}
                label="Mã giảm giá"
                rules={[
                  {
                    pattern: /^[A-Z0-9]+$/,
                    message: "Mã giảm giá chỉ chấp nhận chữ in hoa và số",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: EVENT2023" />
              </Form.Item>

              <Form.Item
                name={["discount", "discountType"]}
                label="Loại giảm giá"
              >
                <Select>
                  <Option value="percentage">Phần trăm (%)</Option>
                  <Option value="fixed">Số tiền cố định</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name={["discount", "discountValue"]}
                label="Giá trị giảm giá"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item
                name={["discount", "dateRange"]}
                label="Thời gian hiệu lực"
              >
                <DatePicker.RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                name={["discount", "minOrderValue"]}
                label="Giá trị đơn hàng tối thiểu"
                tooltip="Đặt 0 nếu không giới hạn"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>

              <Form.Item
                name={["discount", "maxUsage"]}
                label="Số lần sử dụng tối đa"
                tooltip="Đặt 0 nếu không giới hạn"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name={["discount", "isActive"]}
                label="Trạng thái mã giảm giá"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm ngưng"
                />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default QlSuKien;
