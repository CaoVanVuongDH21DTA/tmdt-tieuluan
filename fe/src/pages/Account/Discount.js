import { useState, useEffect } from "react";
import {
  LocalOffer,
  Info,
  CopyAll,
  AccessTime,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { getDiscountByUser } from "../../api/discount/discount";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../store/features/user";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";

// =============================================================================
// COMPONENT: DISCOUNT CARD (Giao diện Vé - Đã tối ưu không gian)
// =============================================================================
const DiscountCard = ({ discount, type = "available", onCopy }) => {
  // 1. Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Vô thời hạn";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // 2. Tính ngày còn lại
  const remainingDays = discount.endDate
    ? Math.ceil((new Date(discount.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // 3. Style config
  const getCardStyle = () => {
    // Mặc định
    let styles = {
      borderLeft: "border-blue-500",
      themeColor: "text-blue-600",
      bgRight: "bg-blue-50",
      btnClass: "text-blue-600 border-blue-200 hover:bg-blue-100",
    };

    if (type === "used") {
      styles = {
        borderLeft: "border-gray-400 grayscale opacity-60",
        themeColor: "text-gray-500",
        bgRight: "bg-gray-100",
        btnClass: "hidden", // Ẩn nút nếu đã dùng
      };
    } else if (type === "expired") {
      styles = {
        borderLeft: "border-red-400 grayscale opacity-60",
        themeColor: "text-red-500",
        bgRight: "bg-red-50",
        btnClass: "hidden",
      };
    } else if (discount.type === "freeship") {
      styles = {
        borderLeft: "border-green-500",
        themeColor: "text-green-600",
        bgRight: "bg-green-50",
        btnClass: "text-green-600 border-green-200 hover:bg-green-100",
      };
    } else if (discount.discount >= 50) {
      styles = {
        borderLeft: "border-orange-500",
        themeColor: "text-orange-600",
        bgRight: "bg-orange-50",
        btnClass: "text-orange-600 border-orange-200 hover:bg-orange-100",
      };
    }

    return styles;
  };

  const style = getCardStyle();

  return (
    <div className={`relative w-full flex bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden min-h-[140px] border-l-4 ${style.borderLeft}`}>
      
      {/* --- PHẦN TRÁI: NỘI DUNG (Chiếm phần lớn, min-w-0 để tránh vỡ layout text) --- */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between border-r border-dashed border-gray-300 relative min-w-0">
        
        {/* Lỗ tròn trang trí (Notches) - Màu trùng background trang (gray-50) */}
        <div className="absolute -right-[10px] -top-[10px] w-5 h-5 rounded-full bg-gray-50 z-10 border-b border-gray-200"></div>
        <div className="absolute -right-[10px] -bottom-[10px] w-5 h-5 rounded-full bg-gray-50 z-10 border-t border-gray-200"></div>

        <div>
          {/* Header Code */}
          <div className="flex items-center gap-1.5 mb-1">
            <LocalOffer className={`w-4 h-4 ${style.themeColor}`} />
            <span className={`font-bold text-sm ${style.themeColor}`}>
              {discount.code}
            </span>
          </div>

          {/* Mô tả chính (Cho phép xuống dòng, không cắt quá ngắn) */}
          <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-2" title={discount.description}>
            {discount.description}
          </h3>
          
          {/* Hạn sử dụng */}
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <AccessTime style={{ fontSize: 14 }} /> 
            HSD: {formatDate(discount.endDate)}
          </p>
        </div>

        {/* Footer điều kiện */}
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap gap-x-3">
          {discount.minOrder > 0 && (
             <span>Đơn từ: <b>{discount.minOrder.toLocaleString("vi-VN")}đ</b></span>
          )}
          {discount.maxDiscountAmount > 0 && discount.type !== "freeship" && (
             <span>Giảm tối đa: <b>{discount.maxDiscountAmount.toLocaleString("vi-VN")}đ</b></span>
          )}
        </div>
      </div>

      {/* --- PHẦN PHẢI: ACTIONS (Cố định chiều rộng) --- */}
      <div className={`w-[110px] sm:w-[130px] flex flex-col items-center justify-center px-2 py-3 flex-shrink-0 ${style.bgRight} relative`}>
        
        {/* Text trạng thái */}
        <div className="text-center mb-2 z-10">
          {type === "available" && remainingDays <= 3 && remainingDays > 0 && (
            <span className="block text-[10px] font-bold text-red-500 uppercase mb-0.5">Sắp hết hạn</span>
          )}
          <span className={`text-xs font-bold ${style.themeColor}`}>
            {type === "available" ? (remainingDays > 0 ? `Còn ${remainingDays} ngày` : "Hết hôm nay") : ""}
            {type === "used" && "Đã dùng"}
            {type === "expired" && "Hết hạn"}
          </span>
        </div>

        {/* Nút Copy */}
        {type === "available" && (
          <button
            onClick={() => onCopy(discount.code)}
            className={`flex flex-col items-center justify-center w-full py-1.5 px-2 bg-white rounded border shadow-sm active:scale-95 transition-all z-10 ${style.btnClass}`}
          >
            <CopyAll style={{ fontSize: 18 }} />
            <span className="text-[10px] font-bold uppercase mt-0.5">Sao chép</span>
          </button>
        )}

        {/* Icon nền trang trí (Mờ) */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none overflow-hidden">
             {type === 'available' ? <LocalOffer style={{ fontSize: 60 }} /> : 
              type === 'used' ? <CheckCircle style={{ fontSize: 60 }} /> : 
              <Cancel style={{ fontSize: 60 }} />}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN PAGE
// =============================================================================
const Discount = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [copiedCode, setCopiedCode] = useState("");
  const userInfo = useSelector(selectUserInfo);
  const [discountData, setDiscountData] = useState({
    available: [],
    used: [],
    expired: [],
  });

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const userId = userInfo?.id;
        if (!userId) return;

        const data = await getDiscountByUser(userId);

        console.log("data: ", data)
        const now = new Date();

        const available = data.filter(
          (d) => d.active && (!d.endDate || new Date(d.endDate) >= now) && !d.usedDate
        );
        const used = data.filter((d) => d.usedDate);
        const expired = data.filter(
          (d) => d.endDate && new Date(d.endDate) < now && !d.usedDate
        );

        setDiscountData({ available, used, expired });
      } catch (err) {
        showCustomToast("Lỗi tải danh sách voucher", "error");
      }
    };
    fetchDiscounts();
  }, [userInfo]);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showCustomToast(`Đã sao chép: ${code}`, "success");
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed copy", err);
    }
  };

  const tabs = [
    { key: "available", label: "Có hiệu lực", count: discountData.available.length },
    { key: "used", label: "Đã sử dụng", count: discountData.used.length },
    { key: "expired", label: "Hết hạn", count: discountData.expired.length },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4"> {/* Giảm max-w để nội dung tập trung hơn */}
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kho Voucher</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý mã giảm giá của bạn</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto bg-white rounded-t-lg shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 px-4 text-sm sm:text-base font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {discountData[activeTab].map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              type={activeTab}
              onCopy={handleCopyCode}
            />
          ))}
        </div>

        {/* Empty State */}
        {discountData[activeTab].length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <LocalOffer className="text-gray-200 mb-3" style={{ fontSize: 60 }} />
            <p className="text-gray-500">Chưa có voucher nào ở mục này</p>
          </div>
        )}

        {/* Footer Hướng dẫn */}
        <div className="mt-10 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Info fontSize="small" className="text-blue-500"/> Hướng dẫn nhanh
          </h4>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex gap-3">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
               <div><p className="font-medium">Tìm voucher</p><p className="text-gray-500 text-xs mt-0.5">Chọn mã phù hợp đơn hàng.</p></div>
            </div>
            <div className="flex gap-3">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
               <div><p className="font-medium">Lưu mã</p><p className="text-gray-500 text-xs mt-0.5">Bấm "Sao chép" để copy.</p></div>
            </div>
            <div className="flex gap-3">
               <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
               <div><p className="font-medium">Áp dụng</p><p className="text-gray-500 text-xs mt-0.5">Dán vào ô mã giảm giá khi thanh toán.</p></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Discount;