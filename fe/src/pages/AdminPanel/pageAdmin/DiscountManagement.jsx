import { useState, useEffect } from "react";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as OfferIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import DiscountModal from "../DiscountModal"; 
import { 
  fetchDiscounts, 
  saveDiscount,  
  updateDiscount,   
  deleteDiscount, 
  updateDiscountStatus 
} from "../../../api/discount/discount"; 
import { showCustomToast } from "../../../components/Toaster/ShowCustomToast";
import { distributeDiscountToAllUsers } from "../../../api/discount/discount"

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        const data = await fetchDiscounts();
        // Sắp xếp: Mới nhất lên đầu
        const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDiscounts(sortedData);
      } catch (error) {
        console.error("Lỗi khi tải discounts:", error);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadDiscounts();
  }, []);

  // --- 2. FILTERS & PAGINATION ---
  const filteredDiscounts = discounts.filter(discount =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const currentDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 3. HANDLERS ---
  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setShowModal(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setShowModal(true);
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.")) {
      try {
        await deleteDiscount(id);
        setDiscounts(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa discount:", error);
        alert("Không thể xóa mã giảm giá này (có thể do đã có người sử dụng).");
      }
    }
  };

  const handleSaveDiscount = async (discountData) => {
    try {
      if (editingDiscount) {
        // Update
        const updated = await updateDiscount(editingDiscount.id, discountData);
        setDiscounts(prev => prev.map(d => d.id === updated.id ? updated : d));
        showCustomToast("Cập nhật thành công!", "success");
      } else {
        // Create
        const saved = await saveDiscount(discountData);
        setDiscounts(prev => [saved, ...prev]);
        showCustomToast("Tạo mã giảm giá thành công!", "success");
      }
      setShowModal(false);
      setEditingDiscount(null);
    } catch (error) {
      console.error("Lỗi khi lưu discount:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu.";
      showCustomToast(`${msg}`, "error");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showCustomToast(`Đã Copy thành công ${code}`, "success");
  };

  const handleToggleStatus = async (id) => { 
    try {
      const discount = discounts.find(d => d.id === id);
      if (!discount) return;
      const newStatus = !discount.active; 
      await updateDiscountStatus(id, newStatus);

      setDiscounts(prev => prev.map(d =>
        d.id === id ? { ...d, active: newStatus } : d
      ));
      showCustomToast(`Đã ${newStatus ? 'kích hoạt' : 'tắt'} mã thành công`, "success");
      
    } catch (error) {
      showCustomToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
    }
  };

  const handleDistributeToAll = async (discount) => {
    const confirmMsg = `🎁 BẠN MUỐN TẶNG MÃ NÀY CHO TẤT CẢ NGƯỜI DÙNG?\n\n- Mã: ${discount.code}\n- Mức giảm: ${discount.percentage}%\n\nHành động này sẽ gán mã giảm giá vào ví của toàn bộ khách hàng.`;
    
    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true); 
        await distributeDiscountToAllUsers(discount.id); 
        
        showCustomToast(`Đã gửi tặng mã ${discount.code} cho tất cả mọi người thành công!`, "success");

      } catch (error) {
        showCustomToast("Có lỗi xảy ra khi gửi mã.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- 4. HELPER FUNCTIONS ---
  const getStatusInfo = (discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    end.setHours(23, 59, 59); // Tính hết ngày kết thúc

    if (!discount.active) return { text: "Đã tắt", color: "gray", icon: <CancelIcon fontSize="small"/> };
    if (now < start) return { text: "Sắp diễn ra", color: "blue", icon: <CalendarIcon fontSize="small"/> };
    if (now > end) return { text: "Đã hết hạn", color: "red", icon: <CancelIcon fontSize="small"/> };
    return { text: "Đang hoạt động", color: "green", icon: <CheckCircleIcon fontSize="small"/> };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getUsedCount = (discount) => {
    return discount.userDiscounts?.length || 0;
  };

  const getUsagePercentage = (discount) => {
    const usageLimit = 100; // Ví dụ hardcode giới hạn hiển thị là 100 để thanh bar đẹp
    const usedCount = getUsedCount(discount);
    // Nếu logic thật có maxUsage, hãy thay 100 bằng maxUsage
    return Math.min((usedCount / usageLimit) * 100, 100); 
  };

  // --- 5. RENDER ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><OfferIcon /></span>
              Quản lý Mã Giảm Giá
            </h1>
            <p className="text-gray-500 mt-1 ml-12">
              Tạo và quản lý các chương trình khuyến mãi cho cửa hàng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-initial group">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm mã, mô tả..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-full sm:w-72 transition-all outline-none"
              />
            </div>
            
            <button
              onClick={handleAddDiscount}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:transform active:scale-95"
            >
              <AddIcon />
              <span>Tạo Mã Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tổng số mã</p>
            <h3 className="text-3xl font-bold text-gray-900">{discounts.length}</h3>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2 inline-block font-medium">
              Toàn bộ hệ thống
            </span>
          </div>
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <OfferIcon fontSize="large" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Đang hoạt động</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {discounts.filter(d => getStatusInfo(d).color === 'green').length}
            </h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block font-medium">
              Sẵn sàng sử dụng
            </span>
          </div>
          <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
            <CheckCircleIcon fontSize="large" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Ngừng hoạt động</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {discounts.filter(d => getStatusInfo(d).color !== 'green').length}
            </h3>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full mt-2 inline-block font-medium">
              Hết hạn hoặc Tắt
            </span>
          </div>
          <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
            <CancelIcon fontSize="large" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Giảm Giá</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thông Tin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giá Trị</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời Hạn</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentDiscounts.map((discount) => {
                const status = getStatusInfo(discount);
                return (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    {/* Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded border border-blue-100 select-all">
                          {discount.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(discount.code)}
                          className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy mã"
                        >
                          <CopyIcon fontSize="small" />
                        </button>
                      </div>
                    </td>

                    {/* Info */}
                    <td className="px-6 py-4">
                      <div className="max-w-[220px]">
                        <div className="text-sm text-gray-900 line-clamp-2" title={discount.description}>
                          {discount.description || "Không có mô tả"}
                        </div>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">{discount.percentage}%</span>
                        <span className="text-xs text-gray-500">
                          Tối đa: {formatCurrency(discount.maxDiscountAmount)}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-900 font-medium">
                          {new Date(discount.startDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-gray-400 text-xs">đến</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          status.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                          status.color === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                          status.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDistributeToAll(discount)}
                          disabled={!discount.active} 
                          className={`p-2 rounded-lg transition-colors group relative ${
                            discount.active 
                              ? 'text-purple-600 hover:bg-purple-50' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Tặng cho tất cả người dùng"
                        >
                          <SendIcon fontSize="small" /> 
                        </button>
                         <button
                          onClick={() => handleToggleStatus(discount.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            discount.active 
                            ? 'text-orange-500 hover:bg-orange-50' 
                            : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={discount.active ? "Tắt mã này" : "Kích hoạt mã"}
                        >
                          {discount.active ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small"/>}
                        </button>

                        <button
                          onClick={() => handleEditDiscount(discount)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <EditIcon fontSize="small" />
                        </button>

                        <button
                          onClick={() => handleDeleteDiscount(discount.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentDiscounts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <OfferIcon className="text-gray-400 text-3xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {searchTerm ? "Không tìm thấy kết quả" : "Chưa có mã giảm giá nào"}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {searchTerm ? `Không tìm thấy mã nào phù hợp với "${searchTerm}"` : "Bắt đầu tạo mã khuyến mãi để thu hút khách hàng"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleAddDiscount}
                          className="text-blue-600 font-medium hover:text-blue-700 text-sm hover:underline"
                        >
                          + Tạo mã giảm giá ngay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredDiscounts.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredDiscounts.length)}</span> - <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredDiscounts.length)}</span> của <span className="font-medium text-gray-900">{filteredDiscounts.length}</span> mã
            </span>
            
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white border border-blue-600"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Component */}
      <DiscountModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDiscount(null);
        }}
        discount={editingDiscount}
        onSave={handleSaveDiscount}
      />
    </div>
  );
};

export default DiscountManagement;