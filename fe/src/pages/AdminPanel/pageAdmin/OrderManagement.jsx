import { useState, useEffect, useRef } from "react";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

const OrderManagement = ({ orders, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map trạng thái sang tiếng Việt
  const statusText = {
    PENDING_PAYMENT: "Chờ thanh toán (CARD)",
    PENDING: "Chờ xác nhận",
    IN_PROGRESS: "Đã xác nhận",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.emailUser &&
        order.emailUser.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quản lý đơn hàng</h2>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="IN_PROGRESS">Đã xác nhận</option>
            <option value="SHIPPED">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-y-auto relative">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã đơn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tổng tiền
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 relative">
                <td className="px-4 py-3 text-gray-700 max-w-[260px]">
                  <div className="line-clamp-1 break-words">{order.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[260px]">
                  <div className="line-clamp-1 break-words">
                    {order.emailUser}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {order.totalAmount
                    ? order.totalAmount.toLocaleString("vi-VN") + " ₫"
                    : "0 ₫"}
                </td>

                {/* Hiển thị trạng thái tiếng Việt */}
                <td className="px-4 py-3 capitalize text-gray-700">
                  {statusText[order.orderStatus] || order.orderStatus}
                </td>

                <td className="px-4 py-3 relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === order.id ? null : order.id
                      )
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <MoreVertIcon />
                  </button>

                  {activeDropdown === order.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-6 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    >
                      <button
                        onClick={() => {
                          onEdit(order);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>

                      <button
                        onClick={() => {
                          onDelete(order.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <DeleteIcon className="w-4 h-4" />
                        <span>Hủy đơn</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Không có đơn hàng nào
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
