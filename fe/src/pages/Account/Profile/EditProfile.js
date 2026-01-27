import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { selectUserInfo } from "../../../store/features/user";
import { showCustomToast } from "../../../components/Toaster/ShowCustomToast";
import { updateUserDetails } from "../../../api/user/userInfo";
import { setLoading } from "../../../store/features/common";
import { 
  CameraAlt as CameraIcon, 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Close as CloseIcon 
} from "@mui/icons-material";

const EditProfile = ({ onClose }) => {
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const getInitialPhone = (phone) => {
    if (!phone) return "";
    return phone.startsWith("0") ? phone.substring(1) : phone;
  };

  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    email: userInfo?.email || "",
    phoneNumber: getInitialPhone(userInfo?.phoneNumber), 
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userInfo?.avatarUrl || "");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      let numericValue = value.replace(/[^0-9]/g, "");
      
      if (numericValue.startsWith("0")) {
        numericValue = numericValue.substring(1);
      }

      if (numericValue.length > 9) return;
      
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showCustomToast("Vui lòng chọn file hình ảnh!", "warning");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showCustomToast("Kích thước ảnh không được quá 2MB!", "warning");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneBodyRegex = /^(3|5|7|8|9)([0-9]{8})$/; 

    if (!formData.firstName.trim()) newErrors.firstName = "Họ không được để trống";
    if (!formData.lastName.trim()) newErrors.lastName = "Tên không được để trống";
    
    if (!formData.phoneNumber) {
        newErrors.phoneNumber = "SĐT không được để trống";
    } else if (formData.phoneNumber.length !== 9) {
        newErrors.phoneNumber = "Phải nhập đủ 9 số (sau +84)";
    } else if (!phoneBodyRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Đầu số không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(setLoading(true));
    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("phoneNumber", "0" + formData.phoneNumber);

    if (avatarFile) {
      data.append("avatar", avatarFile);
    } 

    try {
      await updateUserDetails(data);
      showCustomToast("Cập nhật hồ sơ thành công!", "success");
      window.location.reload(); 
      onClose(true);
    } catch (error) {
      showCustomToast(error?.response?.data?.message || "Cập nhật thất bại!", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa hồ sơ</h2>
          <button 
            onClick={() => onClose(false)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scroll">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div 
                className="relative group cursor-pointer w-32 h-32"
                onClick={handleAvatarClick}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <PersonIcon style={{ fontSize: 60 }} />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CameraIcon className="text-white text-3xl" />
                </div>
                <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                    <CameraIcon style={{ fontSize: 16 }} />
                </div>
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              <p className="text-xs text-gray-500 mt-3">Nhấn vào ảnh để thay đổi</p>
            </div>

            {/* Grid Họ Tên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
                    ${errors.firstName ? "border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="Nguyễn"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all
                    ${errors.lastName ? "border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="Văn A"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Email không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <div className={`flex w-full rounded-lg border overflow-hidden transition-all
                  ${errors.phoneNumber 
                      ? "border-red-500 ring-2 ring-red-100" 
                      : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"}`}>
                
                <div className="bg-gray-100 px-3 py-2.5 flex items-center border-r border-gray-300">
                    <span className="text-sm font-semibold text-gray-600 tracking-wide">+84</span>
                </div>

                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={9}
                  className="w-full px-4 py-2.5 text-sm outline-none bg-white text-gray-900 placeholder-gray-400"
                  placeholder="912 345 678"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-sm"
          >
            Lưu thay đổi
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default EditProfile;