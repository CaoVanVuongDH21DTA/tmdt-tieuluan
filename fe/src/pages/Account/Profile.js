import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeAddress, selectUserInfo } from "../../store/features/user";
import { setLoading } from "../../store/features/common";
import { deleteAddressAPI } from "../../api/user/userInfo";
import { motion, AnimatePresence } from "framer-motion";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import EditProfile from "./Profile/EditProfile";
import AddressModal from "./Address/AddressModal";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Add as AddIcon,
  Map as MapIcon
} from "@mui/icons-material";

const Profile = () => {
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  
  // State quản lý Modal
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // --- LOGIC: LẤY CHỮ CÁI ĐẦU CỦA TÊN ---
  const getAvatarInitial = () => {
      const firstName = userInfo?.firstName?.trim();
      const lastName = userInfo?.lastName?.trim();
      
      // Ưu tiên hiển thị chữ cái đầu của Tên (First Name)
      if (firstName) return firstName.charAt(0).toUpperCase();
      // Nếu không có Tên thì lấy Họ
      if (lastName) return lastName.charAt(0).toUpperCase();
      return "U"; 
  };

  // --- LOGIC ADDRESS ACTIONS ---
  const onDeleteAddress = useCallback((id) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) return;
      dispatch(setLoading(true));
      deleteAddressAPI(id)
        .then(() => {
          dispatch(removeAddress(id));
          showCustomToast("Xóa địa chỉ thành công", "success");
        })
        .catch(() => showCustomToast("Xóa thất bại", "error"))
        .finally(() => dispatch(setLoading(false)));
    }, [dispatch]);

  // Handler mở modal
  const openAddModal = () => {
      setSelectedAddress(null);
      setIsAddressModalOpen(true);
  };

  const openEditModal = (addr) => {
      setSelectedAddress(addr);
      setIsAddressModalOpen(true);
  };

  return (
    <div className="p-4 md:px-8 bg-gray-50">
      <motion.div className="max-w-5xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
                <p className="text-gray-500 mt-1">Quản lý thông tin bảo mật và địa chỉ nhận hàng</p>
            </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
           {/* Họa tiết trang trí nền */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

           {/* --- AVATAR SECTION (ĐÃ SỬA) --- */}
           <div className="relative group flex-shrink-0">
              <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center transition-colors ${!userInfo?.avatarUrl ? 'bg-primary' : 'bg-gray-100'}`}>
                  {userInfo?.avatarUrl ? (
                      <img 
                           src={userInfo.avatarUrl} 
                           alt="User Avatar" 
                           className="w-full h-full object-cover" 
                           onError={(e) => { e.target.style.display='none'; }} 
                      />
                  ) : (
                      <span className="text-5xl font-bold text-white select-none shadow-sm">
                           {getAvatarInitial()}
                      </span>
                  )}
               </div>
              
              {/* Nút chỉnh sửa avatar */}
              <button onClick={() => setEditProfileVisible(true)} className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-10" title="Đổi ảnh đại diện">
                 <EditIcon fontSize="small"/>
              </button>
           </div>

           <div className="flex-1 text-center md:text-left space-y-3 w-full z-10 min-w-0">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  <div className="min-w-0 w-full md:w-auto">
                      <h2 className="text-2xl font-bold text-gray-900 truncate" title={`${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`}>
                        {userInfo?.lastName || userInfo?.firstName ? `${userInfo?.firstName || ""} ${userInfo?.lastName || ""}` : "Người dùng mới"}
                      </h2>
                  </div>
                  <button onClick={() => setEditProfileVisible(true)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all text-sm shadow-sm active:scale-95">
                      <EditIcon fontSize="small" /> Chỉnh sửa hồ sơ
                  </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full max-w-2xl mx-auto md:mx-0">
                 <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors min-w-0">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0"><EmailIcon fontSize="small"/></div>
                    <div className="text-left min-w-0 flex-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate w-full" title={userInfo?.email}>
                            {userInfo?.email}
                        </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:border-green-200 transition-colors min-w-0">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg flex-shrink-0"><PhoneIcon fontSize="small"/></div>
                    <div className="text-left min-w-0 flex-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Số điện thoại</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.phoneNumber || "Chưa cập nhật"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Address List Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
           <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><LocationOnIcon className="text-red-500"/> Sổ địa chỉ</h3>
                  <p className="text-sm text-gray-500 mt-1">Bạn có {userInfo?.addressList?.length || 0} địa chỉ đã lưu</p>
              </div>
              <button onClick={openAddModal} className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-sm font-medium active:scale-[0.98]">
                 <AddIcon fontSize="small"/> Thêm địa chỉ mới
              </button>
           </div>

           <div className="space-y-4">
              <AnimatePresence>
                 {userInfo?.addressList?.length > 0 ? (
                    userInfo.addressList.map((addr) => (
                        <motion.div key={addr.id} layout initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, scale: 0.95}}
                           className="relative border rounded-xl p-5 transition-all group border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        >
                           <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex-1 space-y-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                      <span className="font-bold text-gray-900 text-base border-r pr-3 border-gray-300 truncate" title={addr.name}>
                                          {addr.name}
                                      </span>
                                      <span className="text-gray-500 text-sm flex-shrink-0">{addr.phoneNumber}</span>
                                  </div>
                                  
                                  <div className="text-sm text-gray-600">
                                      <p className="truncate" title={addr.street}>{addr.street}</p>
                                      <p className="truncate" title={`${addr.city} - ${addr.state}`}>
                                          {addr.city} - {addr.state} {addr.zipCode && `(${addr.zipCode})`}
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-3 justify-center min-w-[140px] flex-shrink-0">
                                  <div className="flex gap-3 text-sm font-medium">
                                      <button onClick={() => openEditModal(addr)} className="text-blue-600 hover:underline">Cập nhật</button>
                                      <button onClick={() => onDeleteAddress(addr.id)} className="text-gray-500 hover:text-red-600 hover:underline">Xóa</button>
                                  </div>
                              </div>
                           </div>
                        </motion.div>
                    ))
                 ) : (
                    <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                       <MapIcon style={{fontSize: 48, opacity: 0.5, marginBottom: 8}}/>
                       <p className="text-sm font-medium text-gray-500">Chưa có địa chỉ nào.</p>
                       <p className="text-xs text-gray-400">Thêm địa chỉ để nhận hàng thuận tiện hơn.</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {editProfileVisible && <EditProfile onClose={() => setEditProfileVisible(false)} />}
        
        {isAddressModalOpen && (
            <AddressModal 
                addressToEdit={selectedAddress} 
                onCancel={() => setIsAddressModalOpen(false)} 
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;