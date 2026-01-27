import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { IconButton, Tooltip, Switch } from "@mui/material"; 
import { useState } from "react";
import { forgotPasswordRandom } from "../../../api/user/userInfo";
import { UserManagementSkeleton } from "../skeleton/UserManagementSkeleton";
import { showCustomToast } from '../../../components/Toaster/ShowCustomToast';

const UserManagement = ({users, onEdit, onDelete, searchTerm = "", onToggleStatus, loading }) => {
  // 📩 Gửi email reset password
  const handleForgotPassword = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn gửi mật khẩu mới cho ${user.email}?`)) return;

    try {
      if (user.provider === "GOOGLE" || user.provider === "google") {
        showCustomToast("Người dùng đăng nhập bằng Google không thể đặt lại mật khẩu qua email.", "warning");
        return;
      }

      showCustomToast("Mật khẩu đang được gửi qua email cho bạn...", "info");

      const res = await forgotPasswordRandom(user.email);
      const message = typeof res === "string" ? res : res?.message;

      if (message?.toLowerCase().includes("đã được gửi")) {
        showCustomToast("Đã gửi mật khẩu mới tới email người dùng!", "success");
      } else {
        showCustomToast(message || "Không thể gửi email. Vui lòng thử lại!", "error");
      }
    } catch (err) {
      console.error("Lỗi khi gửi mật khẩu:", err);
      showCustomToast("Gửi email thất bại!", "error");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <UserManagementSkeleton />;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Người dùng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-56">Thông tin liên hệ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Vai trò</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-40">Thao tác</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roles = user.authorityList?.map((a) => a.roleCode) || [];
                const roleDisplay = roles.join(", ") || "No Role";
                const primaryRole = roles[0] || "";
                
                // Màu sắc cho Role
                const roleColorClass =
                  primaryRole === "ADMIN"
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : primaryRole === "MODERATOR"
                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200";

                // Style cho hàng bị khóa
                const rowClass = !user.enabled ? "bg-gray-50 opacity-75 grayscale-[50%]" : "hover:bg-gray-50";

                return (
                  <tr key={user.id} className={`transition-all duration-150 ${rowClass}`}>
                    {/* Người dùng */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${!user.enabled ? 'bg-gray-400' : 'bg-blue-500'}`}>
                          {user.name?.charAt(0).toUpperCase() ||
                            user.firstName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div
                            className="text-sm font-medium text-gray-900 truncate max-w-[150px]"
                            title={user.name || `${user.firstName} ${user.lastName}`}
                          >
                            {user.name || `${user.firstName} ${user.lastName}`}
                          </div>
                          <div
                            className="text-xs text-gray-500 truncate max-w-[150px]"
                            title={user.id}
                          >
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Liên hệ */}
                    <td className="px-4 py-3 text-sm">
                      <div
                        className="truncate max-w-[180px]"
                        title={user.email}
                      >
                        {user.email}
                      </div>
                      <div
                        className="text-gray-500 truncate max-w-[180px]"
                        title={user.phone || user.phoneNumber || "Chưa có số điện thoại"}
                      >
                        {user.phone || user.phoneNumber || "Chưa có số điện thoại"}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${roleColorClass} truncate max-w-[100px]`}
                        title={roleDisplay}
                      >
                        {roleDisplay}
                      </span>
                    </td>

                    {/* CỘT TRẠNG THÁI */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Tooltip title={user.enabled ? "Đang hoạt động (Click để khóa)" : "Đã khóa (Click để mở)"}>
                          <Switch
                            checked={user.enabled || false}
                            onChange={() => onToggleStatus && onToggleStatus(user)}
                            color="success"
                            size="small"
                          />
                        </Tooltip>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${user.enabled ? 'text-green-600' : 'text-red-500'}`}>
                          {user.enabled ? 'Active' : 'Locked'}
                        </span>
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip title="Quên mật khẩu">
                          <IconButton 
                            onClick={() => handleForgotPassword(user)} 
                            size="small"
                            className="hover:bg-indigo-50"
                            disabled={!user.enabled} 
                          >
                            <LockResetIcon fontSize="small" className={!user.enabled ? "text-gray-400" : "text-indigo-600"} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            onClick={() => onEdit(user)} 
                            size="small"
                            className="hover:bg-blue-50"
                          >
                            <EditIcon fontSize="small" className="text-blue-600" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa người dùng">
                          <IconButton 
                            onClick={() => onDelete(user.id)} 
                            size="small"
                            className="hover:bg-red-50"
                          >
                            <DeleteIcon fontSize="small" className="text-red-600" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm
                  ? "Hãy thử thay đổi từ khóa tìm kiếm"
                  : "Danh sách người dùng trống"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;