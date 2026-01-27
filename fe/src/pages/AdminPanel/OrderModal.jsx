import { useState, useEffect } from "react";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { updateOrderAPI } from "../../api/order/order";
import { getAllShipping } from "../../api/ship/shipping";

const OrderModal = ({ order, onClose, onSave }) => {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({
    shippingProviderId: "",
    orderStatus: "PENDING",
  });

  useEffect(() => {
    if (order) {
      setForm({
        shippingProviderId: order.shippingProvider?.id || "",
        orderStatus: order.orderStatus || "PENDING",
      });
    }
  }, [order]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await getAllShipping();
        setProviders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn vị vận chuyển:", err);
        setProviders([]); 
      }
    };
    fetchProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedOrder = {
      id: order.id,
      shippingProviderId: form.shippingProviderId,
      orderStatus: form.orderStatus,
    };

    try {
      const updated = await updateOrderAPI(updatedOrder);

      const statusText = {
        PENDING: "Chờ xác nhận",
        IN_PROGRESS: "Đã xác nhận",
        SHIPPED: "Đang giao",
        DELIVERED: "Đã giao",
        CANCELLED: "Đã hủy",
      };

      const providerName =
        providers?.find((p) => p.id === form.shippingProviderId)?.name ||
        order.shippingProvider?.name ||
        "Chưa chọn";

      showCustomToast(
        `Đơn hàng #${order.id.slice(0, 8)} đã được cập nhật!\n` +
          `• Trạng thái: ${statusText[form.orderStatus]}\n` +
          `• Đơn vị vận chuyển: ${providerName}`,
        "success"
      );

      if (onSave) onSave(updated);
      onClose();
    } catch (err) {
      showCustomToast(
        `Cập nhật đơn hàng #${order.id.slice(0, 8)} thất bại.\nVui lòng kiểm tra kết nối hoặc thử lại sau!`,
        "error"
      );
    }
  };

  if (!order) return null;

  const selectedProvider =
    (providers || []).find((p) => p.id === form.shippingProviderId) ||
    order.shippingProvider ||
    null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">
            Chi tiết đơn hàng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CancelIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Mã đơn hàng:
            </label>
            <p className="text-gray-900 text-sm break-all">{order.id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-5">
              <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Thông tin khách hàng
                </h4>
                <p className="text-sm text-gray-700">
                  <b>Email:</b> {order.emailUser}
                </p>
                <p className="text-sm text-gray-700">
                  <b>Địa chỉ:</b>{" "}
                  {order.address
                    ? `${order.address.street}, ${order.address.city}, ${order.address.state}`
                    : "Chưa có"}
                </p>
                
                <p 
                  className="text-sm text-gray-700 truncate" 
                  title={order.note || "Không có"}
                >
                  <b>Ghi chú:</b> {order.note || "Không có"}
                </p>
              </div>

              <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Thông tin vận chuyển
                </h4>

                <label className="block text-sm font-medium text-gray-700">
                  Đơn vị vận chuyển
                </label>
                <select
                  name="shippingProviderId"
                  value={form.shippingProviderId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 mt-1 text-sm"
                >
                  <option value="">-- Chọn đơn vị vận chuyển --</option>
                  {providers?.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </select>

                {selectedProvider && (
                  <div className="flex items-center mt-3 space-x-3">
                    <img
                      src={selectedProvider.imgShip}
                      alt={selectedProvider.name}
                      className="w-10 h-10 rounded-md border"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedProvider.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Hotline: {selectedProvider.contactInfo}
                      </p>
                      <a
                        href={selectedProvider.trackingUrlTemplate?.replace(
                          "{trackingNumber}",
                          order.shipmentNumber || "..."
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Tra cứu vận đơn
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="border p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Sản phẩm trong đơn
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                  {order.orderItemList?.map((item, index) => (
                    <div className="flex justify-between text-sm border-b pb-1">
                      <div className="flex items-center gap-1 w-[70%]">
                        <span
                          className="truncate block"
                          title={item.product.name}
                        >
                          {item.product.name}
                        </span>
                        <span className="flex-shrink-0">× {item.quantity}</span>
                      </div>
                      <span className="text-right flex-shrink-0">
                        {(item.itemPrice || 0).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 border-t border-gray-200 pt-2">
                    <p className="text-gray-600">Tạm tính:</p>
                    <p className="text-right font-semibold text-gray-900">
                      {order.totalAmount?.toLocaleString("vi-VN")} ₫
                    </p>

                    {order.discount && (
                      <>
                        <p className="text-gray-600">Mã giảm giá:</p>
                        <p className="text-right text-green-600 font-medium">
                          {order.discount.code} ({order.discount.percentage}%)
                        </p>
                      </>
                    )}

                    <p className="text-gray-600">Tổng thanh toán:</p>
                    <p className="text-right font-semibold text-blue-600">
                      {order.totalAmount?.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái đơn hàng
                </label>

                <select
                  name="orderStatus"
                  value={form.orderStatus}
                  onChange={handleChange}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm ${
                    form.orderStatus === "CANCELLED"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={form.orderStatus === "CANCELLED"}
                >
                  <option
                    value="PENDING"
                    disabled={["IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
                      form.orderStatus
                    )}
                  >
                    Chờ xác nhận
                  </option>
                  <option
                    value="IN_PROGRESS"
                    disabled={["SHIPPED", "DELIVERED", "CANCELLED"].includes(
                      form.orderStatus
                    )}
                  >
                    Đã xác nhận
                  </option>
                  <option
                    value="SHIPPED"
                    disabled={["DELIVERED", "CANCELLED"].includes(
                      form.orderStatus
                    )}
                  >
                    Đang giao
                  </option>
                  <option
                    value="DELIVERED"
                    disabled={form.orderStatus === "CANCELLED"}
                  >
                    Đã giao
                  </option>
                  <option
                    value="CANCELLED"
                    disabled={["DELIVERED"].includes(form.orderStatus)}
                  >
                    Đã hủy
                  </option>
                </select>

                {order.expectedDeliveryDate && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày dự kiến giao:
                    </label>
                    <p className="text-sm text-gray-700">
                      {new Date(order.expectedDeliveryDate).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;