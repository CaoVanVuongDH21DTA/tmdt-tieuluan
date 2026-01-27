import React, { useState, useEffect } from "react";
import Modal from "./common/Modal"; // Import Modal chung của bạn
import { 
  ConfirmationNumber as TicketIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  CalendarToday as CalendarIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from "@mui/icons-material";

// --- HELPERS XỬ LÝ NGÀY THÁNG CHO INPUT ---
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const formatForInput = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

// --- INITIAL STATE ---
const initialState = {
  code: "",
  description: "",
  percentage: "",
  maxDiscountAmount: "",
  startDate: "",
  endDate: "",
  active: true,
};

const DiscountModal = ({ isOpen, onClose, discount, onSave }) => {
  const [formData, setFormData] = useState(initialState);

  // --- INIT DATA ---
  useEffect(() => {
    if (isOpen) {
      if (discount) {
        setFormData({
          code: discount.code || "",
          description: discount.description || "",
          percentage: discount.percentage || "",
          maxDiscountAmount: discount.maxDiscountAmount || "",
          startDate: formatForInput(discount.startDate),
          endDate: formatForInput(discount.endDate),
          active: discount.active ?? true,
        });
      } else {
        // Default cho tạo mới
        setFormData({
          ...initialState,
          startDate: getCurrentDateTimeLocal(),
          endDate: getCurrentDateTimeLocal(), // Có thể cộng thêm ngày nếu muốn
        });
      }
    }
  }, [discount, isOpen]);

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // 1. Validate cơ bản
    if (!formData.code || !formData.percentage || !formData.startDate || !formData.endDate) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    if (formData.percentage < 1 || formData.percentage > 100) {
      alert("Phần trăm giảm giá phải từ 1% đến 100%");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    // 2. Prepare Payload (Convert date về ISO chuẩn UTC để lưu DB)
    const payload = {
      ...formData,
      percentage: Number(formData.percentage),
      maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    onSave(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={discount ? "Cập nhật mã giảm giá" : "Tạo mã khuyến mãi mới"}
      onSave={handleSubmit}
      saveText={discount ? "Lưu thay đổi" : "Tạo mã"}
      width="max-w-4xl" // Modal rộng vừa phải
    >
      <div className="p-6 bg-gray-50/50 h-full overflow-y-auto custom-scroll">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* === CỘT TRÁI (THÔNG TIN CHÍNH - 7/12) === */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Block 1: Mã & Mô tả */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <TicketIcon fontSize="small" className="text-blue-500"/> Thông tin mã
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mã Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value.toUpperCase())} // Auto Uppercase
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-bold text-blue-700 tracking-wider focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder-gray-300"
                  placeholder="VD: SALE2024"
                  disabled={!!discount} // Không cho sửa mã khi edit (tuỳ logic)
                />
                <p className="text-[10px] text-gray-400 mt-1">Mã code là duy nhất và viết in hoa.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mô tả chương trình
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập mô tả chi tiết về mã giảm giá này..."
                />
              </div>
            </div>

            {/* Block 2: Giá trị giảm */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <MoneyIcon fontSize="small" className="text-green-500"/> Giá trị ưu đãi
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Phần trăm giảm (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => handleChange("percentage", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      placeholder="0"
                    />
                    <PercentIcon className="absolute right-2 top-2.5 text-gray-400" fontSize="small"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleChange("maxDiscountAmount", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* === CỘT PHẢI (CÀI ĐẶT THỜI GIAN - 5/12) === */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Block 3: Thời gian áp dụng */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                <CalendarIcon fontSize="small" className="text-orange-500"/> Thời gian
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Block 4: Trạng thái */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
                Trạng thái
              </h3>
              
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.active 
                    ? "bg-green-50 border-green-200" 
                    : "bg-gray-50 border-gray-200"
                }`}
                onClick={() => handleChange("active", !formData.active)}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${formData.active ? "text-green-700" : "text-gray-600"}`}>
                    {formData.active ? "Đang kích hoạt" : "Đã vô hiệu hóa"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.active ? "Mã này có thể được sử dụng." : "Mã này tạm thời bị ẩn."}
                  </span>
                </div>
                
                <div className={`text-3xl transition-colors ${formData.active ? "text-green-600" : "text-gray-400"}`}>
                  {formData.active ? <ToggleOnIcon fontSize="inherit"/> : <ToggleOffIcon fontSize="inherit"/>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DiscountModal;