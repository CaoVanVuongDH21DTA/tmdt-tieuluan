import { useState, useEffect } from "react";
import { getAllRoles } from "../../api/user/userInfo";
import Modal from "./common/Modal";
import { 
    Person as PersonIcon, 
    Email as EmailIcon, 
    Phone as PhoneIcon, 
    Badge as RoleIcon 
} from "@mui/icons-material";

const UserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    addressList: [],
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  // Lấy danh sách roles từ backend
  useEffect(() => {
    const fetchRoles = async () => {
        try {
            const data = await getAllRoles();
            setRoles(data || []);
        } catch (error) {
            console.error(error);
        }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      const currentRoleId = user.authorityList?.length > 0 ? user.authorityList[0].id : "";
      
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        authorityId: currentRoleId,
        addressList: user.addressList || [],
      });
    } else {
      setFormData({
        firstName: "", lastName: "", email: "", phoneNumber: "", authorityId: "", addressList: [],
      });
    }
    setErrors({});
  }, [user, isOpen]);

  // Xử lý thay đổi input
  const handleChange = (field, value) => {
      if (field === "phoneNumber") {
          const num = value.replace(/\D/g, "");
          if (num.length > 10) return;
          setFormData(prev => ({ ...prev, [field]: num }));
      } else {
          setFormData(prev => ({ ...prev, [field]: value }));
      }
      if(errors[field]) setErrors(prev => ({...prev, [field]: ""}));
  };

  // Validate & Submit
  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Vui lòng nhập Họ";
    if (!formData.lastName.trim()) newErrors.lastName = "Vui lòng nhập Tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập Email";
    
    if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Vui lòng nhập SĐT";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "SĐT không hợp lệ (10 số, bắt đầu bằng 0)";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật người dùng"
      onSave={handleSubmit}
      saveText="Lưu thay đổi"
      width="max-w-2xl w-full"
    >
      <div className="space-y-6">
        
        {/* Block 1: Thông tin cá nhân */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <PersonIcon fontSize="small"/> Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Họ" 
                    value={formData.firstName} 
                    onChange={(val) => handleChange("firstName", val)} 
                    placeholder="Nguyễn" 
                    error={errors.firstName}
                />
                <InputField 
                    label="Tên" 
                    value={formData.lastName} 
                    onChange={(val) => handleChange("lastName", val)} 
                    placeholder="Văn A" 
                    error={errors.lastName}
                />
            </div>
        </div>

        {/* Block 2: Liên hệ & Vai trò */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <InputField 
                    label="Email" 
                    icon={<EmailIcon fontSize="small" className="text-gray-400"/>}
                    value={formData.email} 
                    onChange={(val) => handleChange("email", val)} 
                    placeholder="example@gmail.com" 
                    type="email"
                    disabled={!!user} 
                    error={errors.email}
                />
                
                <InputField 
                    label="Số điện thoại" 
                    icon={<PhoneIcon fontSize="small" className="text-gray-400"/>}
                    value={formData.phoneNumber} 
                    onChange={(val) => handleChange("phoneNumber", val)} 
                    placeholder="0912345678" 
                    error={errors.phoneNumber}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò hệ thống</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><RoleIcon fontSize="small"/></div>
                    <select
                        value={formData.authorityId}
                        onChange={(e) => handleChange("authorityId", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                    >
                        <option value="">-- Chọn vai trò --</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.roleCode} - {role.roleDescription}
                            </option>
                        ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                    * Phân quyền truy cập cho người dùng này.
                </p>
            </div>
        </div>

        {/* Block 3: Địa chỉ (Read-only) */}
        {formData.addressList?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sổ địa chỉ đã lưu ({formData.addressList.length})</label>
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-[150px] overflow-y-auto custom-scroll">
                    {formData.addressList.map((addr, idx) => (
                        <div key={addr.id || idx} className="p-3 border-b border-gray-100 last:border-0 text-sm hover:bg-white transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{addr.name}</span>
                                <span className="text-gray-400 text-xs">|</span>
                                <span className="text-gray-600">{addr.phoneNumber}</span>
                                {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded font-medium">Mặc định</span>}
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-1" title={`${addr.street}, ${addr.city}`}>
                                {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </Modal>
  );
};

// Reusable Input Component
const InputField = ({ label, value, onChange, placeholder, type = "text", disabled, error, icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all
                    ${error 
                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }
                    ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
                `}
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
    </div>
);

export default UserModal;