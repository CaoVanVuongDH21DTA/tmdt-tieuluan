import { useEffect, useState, useCallback } from "react";
import {
  getAllOrdersAPI,
  cancelOrderAPI,
} from "../../../api/order/order";
import { showCustomToast } from "../../../components/Toaster/ShowCustomToast";
import { OrderSkeleton } from "../skeleton/OrderSkeleton";
import OrderManagement from "./OrderManagement";
import OrderModal from "../OrderModal";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersAPI();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showCustomToast("error", "Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cập nhật đơn hàng
  const handleUpdateOrder = (updated) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setShowModal(false);
  };


  // Hủy đơn hàng
  const handleCancelOrder = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await cancelOrderAPI(id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, orderStatus: "CANCELLED" } : o
        )
      );
      showCustomToast("Đơn hàng đã được hủy!", "success");
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      showCustomToast("Không thể hủy đơn hàng!", "error");
    }
  };

  // Dữ liệu hiển thị theo trang
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <OrderSkeleton />;

  return (
    <div>
      <OrderManagement
        orders={paginatedOrders}
        totalOrders={orders.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onEdit={(order) => {
          setSelectedOrder(order);
          setShowModal(true);
        }}
        onDelete={handleCancelOrder}
      />

      {/* Pagination Control */}
      {orders.length > pageSize && (
        <div className="flex justify-center items-center mt-6 space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Trước
          </button>

          <span className="text-gray-700">
            Trang <b>{currentPage}</b> / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal sửa đơn hàng */}
      {showModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onSave={handleUpdateOrder}
        />
      )}
    </div>
  );
};

export default Order;
