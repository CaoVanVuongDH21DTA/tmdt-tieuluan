import { useState, useEffect } from 'react';
import UserManagement from '../pageAdmin/UserManagement';
import UserModal from '../UserModal';
import { useDispatch, useSelector } from 'react-redux';
import { UserSkeleton } from "../skeleton/UserSkeleton";
import { showCustomToast } from '../../../components/Toaster/ShowCustomToast';
import { deleteUserById, updateUserById, getAllUser } from '../../../api/user/userInfo';
import { 
  updateUserStatusInList, 
  selectUsersList, 
  loadUsersList, 
  removeUserFromList, 
  updateUserInList 
} from '../../../store/features/user';
import { 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, 
  Button 
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const User = () => {
  const users = useSelector(selectUsersList);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal Confirm Lock/Unlock
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Nếu Redux đã có dữ liệu thì không fetch lại
      if (users && users.length > 0) return;
      
      setLoading(true);
      try {
        const res = await getAllUser();
        const data = res.data || res;
        dispatch(loadUsersList(data));
      } catch (err) {
        console.error("Lỗi khi tải danh sách user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []); 

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // --- LOGIC XÓA USER ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await deleteUserById(id);
      
      // Cập nhật Redux: Xóa user khỏi list ngay lập tức
      dispatch(removeUserFromList(id));
      
      showCustomToast("Đã xóa người dùng thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi xóa user:", err);
      showCustomToast("Không thể xóa người dùng!", "error");
    }
  };

  // --- LOGIC LƯU USER SAU KHI EDIT ---
  const handleSaveUser = async (userData) => {
    if (!editingUser) return;
    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        authorityList: userData.authorityId ? [{ id: userData.authorityId }] : [],
      };

      // Gọi API cập nhật
      const res = await updateUserById(editingUser.id, payload);
      const updatedData = res.data || res || { ...editingUser, ...payload };

      // Cập nhật Redux: Update thông tin user đó trong list
      dispatch(updateUserInList({ id: editingUser.id, ...updatedData }));

      showCustomToast("Cập nhật người dùng thành công!", "success");
      setShowModal(false);
    } catch (err) {
      console.error("Lỗi khi lưu user:", err);
      showCustomToast("Cập nhật người dùng thất bại!", "error");
    }
  };

  const onSwitchClick = (user) => {
    setUserToToggle(user);
    setConfirmModalOpen(true);
  };

  // --- LOGIC KHÓA/MỞ KHÓA ---
  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;

    setConfirmModalOpen(false); 

    const newStatus = !userToToggle.enabled;
    const actionText = newStatus ? "mở khóa" : "khóa";

    try {
      await updateUserById(userToToggle.id, { 
        enabled: newStatus,
      });

      dispatch(updateUserStatusInList({ 
          id: userToToggle.id, 
          enabled: newStatus 
      }));

      showCustomToast(`Đã ${actionText} tài khoản thành công!`, "success");
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      showCustomToast(`${err.response?.data?.message || "Cập nhật trạng thái thất bại!"}`, "error");
    } finally {
      setUserToToggle(null);
    }
  };

  // Thống kê
  const totalUsers = users.length;
  const adminUsers = users.filter(
    (user) => user.authorityList?.some((auth) => auth.roleCode === "ADMIN")
  ).length;

  if (loading) return <UserSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin người dùng hệ thống</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Quản trị viên</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{adminUsers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
              👑
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng danh sách */}
      <UserManagement
        users={users} // Truyền users từ Redux
        searchTerm={searchTerm}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={onSwitchClick}
      />

      {/* Modal Edit */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />

      {/* Modal Confirm Lock/Unlock */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        PaperProps={{
          style: { borderRadius: 16, padding: '8px' }
        }}
      >
        <DialogTitle className="flex items-center gap-2 text-red-600">
           <WarningAmberIcon color={userToToggle?.enabled ? "error" : "success"} />
           {userToToggle?.enabled ? "Xác nhận khóa tài khoản?" : "Xác nhận mở khóa?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn 
            <span className="font-bold"> {userToToggle?.enabled ? " KHÓA" : " MỞ KHÓA"} </span> 
            tài khoản email: <span className="font-semibold text-gray-800">{userToToggle?.email}</span> không?
            <br/>
            {userToToggle?.enabled 
              ? "Người dùng sẽ không thể đăng nhập vào hệ thống sau khi bị khóa." 
              : "Người dùng sẽ có thể truy cập lại hệ thống bình thường."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)} color="inherit" style={{textTransform: 'none'}}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleConfirmToggleStatus} 
            variant="contained"
            color={userToToggle?.enabled ? "error" : "success"}
            autoFocus
            style={{textTransform: 'none', borderRadius: 8}}
          >
            {userToToggle?.enabled ? "Khóa ngay" : "Mở khóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default User;