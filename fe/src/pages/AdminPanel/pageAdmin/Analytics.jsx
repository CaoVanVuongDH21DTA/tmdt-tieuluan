import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getCategoryDistributionAnalytics,
  getTopProductsAnalytics,
} from "../../../api/admin/analytics";
import { AnalyticsSkeleton } from "../skeleton/AnalyticsSkeleton";
import { showCustomToast } from "../../../components/Toaster/ShowCustomToast";
import { 
    AttachMoney as MoneyIcon, 
    TrendingUp as TrendingUpIcon, 
    People as PeopleIcon, 
} from "@mui/icons-material";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ totalRevenue: 0, totalProfit: 0, totalUsers: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [revenueRes, userGrowthRes, categoryRes, topProductsRes] = await Promise.all([
          getRevenueAnalytics(),
          getUserGrowthAnalytics(),
          getCategoryDistributionAnalytics(),
          getTopProductsAnalytics(),
        ]);

        // --- Tính toán tổng quan ---
        const totalRev = revenueRes.reduce((acc, cur) => acc + (cur.revenue || 0), 0);
        const totalProf = revenueRes.reduce((acc, cur) => acc + (cur.profit || 0), 0);
        const totalUsr = userGrowthRes.reduce((acc, cur) => acc + (cur.newUsers || 0), 0);

        setSummaryStats({
            totalRevenue: totalRev,
            totalProfit: totalProf,
            totalUsers: totalUsr
        });

        // --- Doanh thu Chart ---
        setRevenueData({
          labels: revenueRes.map((item) => `Tháng ${item.month}`),
          datasets: [
            {
              label: "Doanh thu",
              data: revenueRes.map((item) => item.revenue),
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderRadius: 4,
              barPercentage: 0.6,
            },
            {
              label: "Lợi nhuận",
              data: revenueRes.map((item) => item.profit),
              backgroundColor: "rgba(16, 185, 129, 0.8)",
              borderRadius: 4,
              barPercentage: 0.6,
            },
          ],
        });

        // --- User Chart ---
        setUserGrowthData({
          labels: userGrowthRes.map((item) => `T${item.month}`),
          datasets: [
            {
              label: "Người dùng mới",
              data: userGrowthRes.map((item) => item.newUsers),
              borderColor: "rgb(99, 102, 241)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 3,
              pointRadius: 4,
              tension: 0.4,
              fill: true,
            },
          ],
        });

        // --- Category Chart ---
        setCategoryData({
          labels: categoryRes.map((c) => c.category),
          datasets: [{
              data: categoryRes.map((c) => c.revenue),
              backgroundColor: [
                "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280",
              ],
              borderWidth: 0,
              hoverOffset: 10,
          }],
        });

        setTopProducts(topProductsRes);
      } catch (error) {
        console.error(error);
        showCustomToast(`Lỗi ${error || "tải dữ liệu phân tích"} `, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // --- Helper Format Tiền Tệ (Fix lỗi số 'e') ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num) => {
      return new Intl.NumberFormat("vi-VN").format(num);
  };

  // --- Chart Options ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: "top", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed.y !== null) {
                        label += formatCurrency(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { borderDash: [2, 2], color: "#f3f4f6" },
            ticks: {
                callback: function(value) {
                    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                    return value;
                },
                font: { size: 11 }
            }
        },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  };

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan kinh doanh</h1>
            <p className="text-sm text-gray-500 mt-1">Dữ liệu phân tích hiệu suất cửa hàng</p>
        </div>
        <div className="text-sm text-gray-400 italic">Cập nhật: Vừa xong</div>
      </div>

      {/* 1. Summary Cards (Thẻ tóm tắt) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Tổng Doanh Thu" 
            value={formatCurrency(summaryStats.totalRevenue)} 
            icon={<MoneyIcon className="text-blue-600"/>} 
            bg="bg-blue-50" 
          />
          <StatCard 
            title="Lợi Nhuận Ròng" 
            value={formatCurrency(summaryStats.totalProfit)} 
            icon={<TrendingUpIcon className="text-green-600"/>} 
            bg="bg-green-50" 
          />
          <StatCard 
            title="Khách Hàng Mới" 
            value={formatNumber(summaryStats.totalUsers)} 
            icon={<PeopleIcon className="text-purple-600"/>} 
            bg="bg-purple-50" 
          />
      </div>

      {/* 2. Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Doanh thu (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Doanh thu & Lợi nhuận</h3>
            <div className="h-[320px]">
                <Bar data={revenueData} options={commonOptions} />
            </div>
        </div>

        {/* Phân bổ danh mục (Chiếm 1 cột) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tỷ trọng doanh thu</h3>
            <div className="flex-1 flex items-center justify-center relative">
                <div className="w-[220px] h-[220px]">
                    <Doughnut 
                        data={categoryData} 
                        options={{
                            responsive: true, 
                            maintainAspectRatio: false, 
                            cutout: "75%",
                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
                        }} 
                    />
                </div>
                {/* Số tổng ở giữa biểu đồ tròn */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center mt-[-20px]">
                        <span className="block text-xs text-gray-400">Tổng</span>
                        <span className="block text-lg font-bold text-gray-800">100%</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Products Table */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Top Sản phẩm bán chạy</h3>
                <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="overflow-y-auto max-h-[350px] pr-2 custom-scroll">
                <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left rounded-l-lg">#</th>
                            <th className="px-3 py-2 text-left">Sản phẩm</th>
                            <th className="px-3 py-2 text-right">Đã bán</th>
                            <th className="px-3 py-2 text-right rounded-r-lg">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {topProducts.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-3 font-medium text-gray-400">
                                    {idx < 3 ? (
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                                            {idx + 1}
                                        </span>
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </td>
                                <td className="px-3 py-3 font-medium text-gray-800">{p.name}</td>
                                <td className="px-3 py-3 text-right text-gray-600">{formatNumber(p.sales)}</td>
                                <td className="px-3 py-3 text-right font-bold text-blue-600">{formatCurrency(p.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>

         {/* User Growth Chart */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tăng trưởng User mới</h3>
            <div className="h-[300px]">
                <Line 
                    data={userGrowthData} 
                    options={{
                        ...commonOptions,
                        scales: {
                            ...commonOptions.scales,
                            y: { ...commonOptions.scales.y, ticks: { callback: val => val } } // Số nguyên cho user
                        },
                        plugins: { ...commonOptions.plugins, tooltip: { ...commonOptions.plugins.tooltip, callbacks: { label: c => `${c.formattedValue} người` } } }
                    }} 
                />
            </div>
         </div>
      </div>
    </div>
  );
};

// Sub-component: Thẻ thống kê nhỏ
const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
            {icon}
        </div>
    </div>
);

export default Analytics;