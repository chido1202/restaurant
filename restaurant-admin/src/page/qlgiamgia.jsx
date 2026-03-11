/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Tag,
  message,
  Popconfirm,
} from "antd";
import { useAuth } from "../context/AuthContext";
import "../styles/QLGiamGia.css";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

const QlGiamGia = () => {
  const [discountList, setDiscountList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
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

  // Lấy danh sách mã giảm giá và sự kiện
  useEffect(() => {
    fetchDiscountList();
    fetchEventList();
  }, []);

  const fetchDiscountList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/discounts`,
        getAuthHeader()
      );
      if (response.data) {
        setDiscountList(Array.isArray(response.data) ? response.data : []);
      } else {
        setDiscountList([]);
        message.warning("Không có dữ liệu mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã giảm giá:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải danh sách mã giảm giá!"
      );
      setDiscountList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventList = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/events`,
        getAuthHeader()
      );
      if (response.data) {
        setEventList(Array.isArray(response.data) ? response.data : []);
      } else {
        setEventList([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi tải danh sách sự kiện!"
      );
      setEventList([]);
    }
  };

  // Mở modal thêm/sửa mã giảm giá
  const openModal = (record = null) => {
    setSelectedDiscount(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({
        code: record.code,
        description: record.description,
        discountType: record.discountType,
        discountValue: record.discountValue,
        dateRange: [moment(record.startDate), moment(record.endDate)],
        minOrderValue: record.minOrderValue,
        maxUsage: record.maxUsage,
        isActive: record.isActive,
        event: record.event?._id || record.event,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        discountType: "percentage",
        minOrderValue: 0,
        maxUsage: 0,
        isActive: true,
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      // Chuyển đổi dateRange thành startDate và endDate
      const [startDate, endDate] = values.dateRange;
      const discountData = {
        ...values,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      delete discountData.dateRange;

      // Đảm bảo minOrderValue và maxUsage là số
      discountData.minOrderValue = Number(discountData.minOrderValue) || 0;
      discountData.maxUsage = Number(discountData.maxUsage) || 0;

      if (selectedDiscount) {
        // Cập nhật mã giảm giá
        await axios.put(
          `${API_URL}/api/discounts/${selectedDiscount._id}`,
          discountData,
          getAuthHeader()
        );
        message.success("Cập nhật mã giảm giá thành công!");
      } else {
        // Thêm mã giảm giá mới
        await axios.post(
          `${API_URL}/api/discounts`,
          discountData,
          getAuthHeader()
        );
        message.success("Thêm mã giảm giá thành công!");
      }
      fetchDiscountList();
      // Nếu có liên kết với sự kiện, tải lại danh sách sự kiện
      if (values.event) {
        fetchEventList();
      }
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

  // Xóa mã giảm giá
  const deleteDiscount = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/discounts/${id}`, getAuthHeader());
      message.success("Xóa mã giảm giá thành công!");
      fetchDiscountList();
      // Tải lại danh sách sự kiện vì có thể có sự kiện liên quan đến mã giảm giá
      fetchEventList();
    } catch (error) {
      if (error.response && error.response.data) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi xóa mã giảm giá!");
      }
      console.error(error);
    }
  };

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Loại giảm giá",
      dataIndex: "discountType",
      key: "discountType",
      render: (type) =>
        type === "percentage" ? "Phần trăm (%)" : "Số tiền cố định",
    },
    {
      title: "Giá trị",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) =>
        record.discountType === "percentage"
          ? `${value}%`
          : `${value.toLocaleString("vi-VN")}đ`,
    },
    {
      title: "Thời gian hiệu lực",
      key: "validPeriod",
      render: (_, record) => (
        <>
          <div>{moment(record.startDate).format("DD/MM/YYYY")}</div>
          <div>đến</div>
          <div>{moment(record.endDate).format("DD/MM/YYYY")}</div>
        </>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      render: (value) =>
        value > 0 ? `${value.toLocaleString("vi-VN")}đ` : "Không giới hạn",
    },
    {
      title: "Lượt sử dụng",
      key: "usage",
      render: (_, record) => {
        const used = record.usageCount || 0;
        const max = record.maxUsage || 0;
        const statusColor = max > 0 && used >= max ? "red" : "green";
        return (
          <div>
            <span style={{ color: statusColor }}>
              {used} {max > 0 ? `/ ${max}` : ""}
            </span>
            {max > 0 && used >= max && (
              <Tag color="red" style={{ marginLeft: 5 }}>
                Đã hết
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Sự kiện",
      dataIndex: "event",
      key: "event",
      render: (event) =>
        event ? (
          typeof event === "object" ? (
            event.name
          ) : (
            "Có liên kết sự kiện"
          )
        ) : (
          <span style={{ color: "#999" }}>Không có</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
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
            title="Xóa mã giảm giá"
            description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
            onConfirm={() => deleteDiscount(record._id)}
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
    <div className="qlgiamgia-container">
      <h2>Quản Lý Mã Giảm Giá</h2>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm Mã Giảm Giá
      </Button>

      <Table
        columns={columns}
        dataSource={discountList}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm / Sửa Mã Giảm Giá */}
      <Modal
        title={
          selectedDiscount ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText={selectedDiscount ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã giảm giá"
            rules={[
              { required: true, message: "Vui lòng nhập mã giảm giá" },
              {
                pattern: /^[A-Z0-9]+$/,
                message: "Mã giảm giá chỉ chấp nhận chữ in hoa và số",
              },
            ]}
          >
            <Input placeholder="Ví dụ: SUMMER2023" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
          >
            <Select>
              <Option value="percentage">Phần trăm (%)</Option>
              <Option value="fixed">Số tiền cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label="Giá trị giảm giá"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị giảm giá" },
            ]}
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
            name="dateRange"
            label="Thời gian hiệu lực"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian hiệu lực" },
            ]}
          >
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="minOrderValue"
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
            name="maxUsage"
            label="Số lần sử dụng tối đa"
            tooltip="Đặt 0 nếu không giới hạn"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {selectedDiscount && (
            <Form.Item label="Đã sử dụng">
              <span style={{ fontWeight: "bold" }}>
                {selectedDiscount.usageCount || 0} lần
              </span>
              {selectedDiscount.maxUsage > 0 &&
                selectedDiscount.usageCount >= selectedDiscount.maxUsage && (
                  <Tag color="red" style={{ marginLeft: 10 }}>
                    Đã hết lượt
                  </Tag>
                )}
            </Form.Item>
          )}

          <Form.Item name="event" label="Sự kiện liên kết">
            <Select placeholder="Chọn sự kiện liên kết (nếu có)" allowClear>
              {eventList.map((event) => (
                <Option key={event._id} value={event._id}>
                  {event.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ngưng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QlGiamGia;
