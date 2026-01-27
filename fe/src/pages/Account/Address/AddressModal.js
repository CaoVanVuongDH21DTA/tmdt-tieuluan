import React, { useCallback, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/features/common";
import { addAddressAPI, updateAddressAPI } from "../../../api/user/userInfo";
import { saveAddress, updateAddress } from "../../../store/features/user";
import { motion, AnimatePresence } from "framer-motion";
import { showCustomToast } from "../../../components/Toaster/ShowCustomToast";
import { 
  Person as PersonIcon, Phone as PhoneIcon, Home as HomeIcon, 
  LocationCity as CityIcon, Map as MapIcon, Close as CloseIcon, 
  Edit as EditIcon, Add as AddIcon 
} from "@mui/icons-material";

const backdrop = { visible: { opacity: 1 }, hidden: { opacity: 0 } };
const modal = { hidden: { y: 50, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } } };

// Helper format phone (cắt số 0 đầu)
const getInitialPhone = (phone) => {
    if(!phone) return "";
    return phone.startsWith("0") ? phone.substring(1) : phone;
};

const AddressModal = ({ addressToEdit, onCancel }) => {
  const dispatch = useDispatch();
  const isEditMode = !!addressToEdit;

  const [values, setValues] = useState({
    name: "", phoneNumber: "", street: "", city: "", state: "", zipCode: "",
  });

  useEffect(() => {
      if (isEditMode && addressToEdit) {
        setValues({
          name: addressToEdit.name || "",
          phoneNumber: getInitialPhone(addressToEdit.phoneNumber),
          street: addressToEdit.street || "",
          city: addressToEdit.city || "",
          state: addressToEdit.state || "",
          zipCode: addressToEdit.zipCode || "",
        });
      }
  }, [isEditMode, addressToEdit]);

  const [errors, setErrors] = useState({});

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
        let num = value.replace(/\D/g, "");
        if (num.startsWith("0")) num = num.substring(1);
        if (num.length > 9) return;
        setValues(prev => ({ ...prev, [name]: num }));
    } 
    else if (name === "zipCode") {
        if (!/^\d*$/.test(value)) return;
        setValues(prev => ({ ...prev, [name]: value }));
    }
    else {
        setValues(prev => ({ ...prev, [name]: value }));
    }
    if(errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    const formErrors = {};
    
    // Validate
    if (!values.name.trim()) formErrors.name = "Vui lòng nhập tên người nhận";
    if (values.phoneNumber.length !== 9) formErrors.phoneNumber = "SĐT phải đủ 9 số (sau +84)";
    if (!values.street.trim()) formErrors.street = "Vui lòng nhập địa chỉ chi tiết";
    if (!values.city.trim()) formErrors.city = "Chọn Tỉnh/Thành phố";
    if (!values.state.trim()) formErrors.state = "Chọn Quận/Huyện";

    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }

    dispatch(setLoading(true));
    
    // Payload chuẩn bị gửi (Thêm số 0 vào đầu SĐT)
    const payload = { ...values, phoneNumber: "0" + values.phoneNumber };

    // --- LOGIC GỘP: Phân chia API gọi theo chế độ ---
    const apiCall = isEditMode 
        ? updateAddressAPI(addressToEdit.id, payload) 
        : addAddressAPI(payload);

    apiCall
      .then((res) => {
        if (isEditMode) {
          dispatch(updateAddress(res));
          showCustomToast("Cập nhật địa chỉ thành công!", "success");
        } else {
          dispatch(saveAddress(res));
          showCustomToast("Thêm địa chỉ thành công!", "success");
        }
        onCancel?.(true);
      })
      .catch((err) => {
        console.error(err);
        showCustomToast(isEditMode ? "Cập nhật thất bại!" : "Thêm thất bại!", "error");
      })
      .finally(() => dispatch(setLoading(false)));

  }, [dispatch, values, onCancel, isEditMode, addressToEdit]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        variants={backdrop} initial="hidden" animate="visible" exit="hidden" onClick={() => onCancel(false)}
      >
        <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          variants={modal} onClick={(e) => e.stopPropagation()}
        >
          {/* Header Dynamic Title */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {isEditMode ? <EditIcon className="text-blue-600"/> : <AddIcon className="text-blue-600"/>} 
                {isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h2>
            <button onClick={() => onCancel(false)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><CloseIcon /></button>
          </div>

          <div className="p-6 overflow-y-auto custom-scroll">
            <form onSubmit={onSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<PersonIcon/>} label="Họ tên" name="name" placeholder="Nguyễn Văn A" value={values.name} onChange={handleOnChange} error={errors.name} />
                
                {/* Phone Input */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className={`flex w-full rounded-lg border overflow-hidden transition-all ${errors.phoneNumber ? "border-red-500 ring-2 ring-red-100" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"}`}>
                        <div className="bg-gray-100 px-3 py-2.5 flex items-center border-r border-gray-300">
                            <span className="text-sm font-semibold text-gray-600 tracking-wide">+84</span>
                        </div>
                        <input type="tel" name="phoneNumber" value={values.phoneNumber} onChange={handleOnChange} maxLength={9} className="w-full px-4 py-2.5 text-sm outline-none bg-white text-gray-900 placeholder-gray-400" placeholder="912 345 678" />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <CityIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <select name="city" value={values.city} onChange={handleOnChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border appearance-none bg-white ${errors.city ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"} outline-none transition-all text-sm`}>
                            <option value="">Chọn Tỉnh/Thành</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                        </select>
                    </div>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                 </div>

                 <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Quận/Huyện <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                        <select name="state" value={values.state} onChange={handleOnChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border appearance-none bg-white ${errors.state ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"} outline-none transition-all text-sm`}>
                            <option value="">Chọn Quận/Huyện</option>
                            <option value="Quận 1">Quận 1</option>
                            <option value="Quận 3">Quận 3</option>
                            <option value="Thành phố Thủ Đức">Thành phố Thủ Đức</option>
                            <option value="Quận Cầu Giấy">Quận Cầu Giấy</option>
                        </select>
                    </div>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                 </div>
              </div>

              <InputField icon={<HomeIcon/>} label="Địa chỉ cụ thể" name="street" placeholder="Số 123, đường ABC..." value={values.street} onChange={handleOnChange} error={errors.street} />
              
              <InputField label="Mã bưu điện (ZipCode)" name="zipCode" placeholder="700000" value={values.zipCode} onChange={handleOnChange} error={errors.zipCode} optional />

            </form>
          </div>

          <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={() => onCancel(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all text-sm">Hủy bỏ</button>
            <button onClick={onSubmit} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-sm">
                {isEditMode ? "Lưu thay đổi" : "Thêm địa chỉ"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InputField = ({ icon, label, name, placeholder, value, onChange, error, optional }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700 mb-1 block">{label} {!optional && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">{icon}</div>}
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all ${error ? "border-red-500 bg-red-50 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default AddressModal;