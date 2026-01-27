import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Backspace as BackspaceIcon,
} from "@mui/icons-material";
import StatsCard from "../UI/StatsCard";
import { DashboardSkeleton } from "../skeleton/DashboardSkeleton";
import { useState, useEffect } from "react";
import { getDashboard } from "../../../api/admin/dashboard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboard();
        setStats({
          totalUsers: data.totalUsers,
          totalOrders: data.totalOrders,
          revenue: data.totalRevenue,
          cancelledOrders: data.cancelledOrders,
        });

        // Sắp xếp theo ngày mới nhất
        const sortedOrders = (data.recentOrders || []).sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );

        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error("Lỗi khi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  // Tính toán trang
  const totalPages = Math.ceil(recentOrders.length / ordersPerPage);
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = recentOrders.slice(indexOfFirst, indexOfLast);

  // Hàm xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const statsData = [
    {
      title: "Tổng người dùng",
      value: stats?.totalUsers ?? 0,
      icon: <PeopleIcon fontSize="medium" />,
      color: "bg-blue-500",
    },
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders ?? 0,
      icon: <ShoppingCartIcon fontSize="medium" />,
      color: "bg-green-500",
    },
    {
      title: "Doanh thu",
      value: stats?.revenue
        ? new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(stats.revenue)
        : "0 ₫",
      icon: <AttachMoneyIcon fontSize="medium" />,
      color: "bg-pink-500",
    },
    {
      title: "Đơn hủy",
      value: stats?.cancelledOrders ?? 0,
      icon: <BackspaceIcon fontSize="medium" />,
      color: "bg-red-500",
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
      </div>

      {/* 🧮 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* 📦 Đơn hàng gần đây */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Đơn hàng gần đây
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[250px]">
                      <div className="line-clamp-2 break-words">{order.emailUser || "Không có email"}</div>
                      
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.totalAmount
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.totalAmount)
                        : "0 ₫"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          order.orderStatus === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500 text-sm"
                  >
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Trang trước
            </button>
            <span className="text-gray-700">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
