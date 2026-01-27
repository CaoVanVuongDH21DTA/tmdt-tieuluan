import { useState, useEffect } from 'react';
import { 
  Security, 
  Notifications, 
  PrivacyTip, 
  Password,
  Delete,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Email,       
  ArrowBack,  
  Send,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import { changePasswordAPI } from "../../api/auth/authentication";
import { requestChangeEmailAPI, verifyChangeEmailAPI, deleteUserById } from "../../api/user/userInfo";

// 1. IMPORT THÊM CÁC HOOKS VÀ ACTION CẦN THIẾT
import { useSelector, useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom"; 
import { selectUserInfo, clearUserInfo } from "../../store/features/user";
import { logOut } from '../../utils/jwt-helper';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [isLoading, setIsLoading] = useState(false); 
  
  // 2. KHỞI TẠO HOOKS
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const userInfo = useSelector(selectUserInfo);
  const userEmail = userInfo?.email;

  // --- STATE CHO ĐỔI MẬT KHẨU ---
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false
  });

  // --- STATE CHO ĐỔI EMAIL (2 BƯỚC) ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '', 
    otp: ''
  });
  const [showEmailPass, setShowEmailPass] = useState(false); 

  // --- STATE CHO XÓA TÀI KHOẢN ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (activeSection !== 'account') {
      setShowChangePassword(false);
    }
  }, [activeSection]);

  // ================= LOGIC ĐỔI MẬT KHẨU =================
  const handleChangePassword = () => setShowChangePassword(true);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showCustomToast('Mật khẩu mới không khớp', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return showCustomToast('Mật khẩu mới phải có ít nhất 6 ký tự', "error");
    }

    setIsLoading(true);
    try {
      const res = await changePasswordAPI({
        email: userEmail,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showCustomToast(res.message || 'Đổi mật khẩu thành công!', "success");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      showCustomToast(err.response?.data?.message || 'Đổi mật khẩu thất bại', "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ================= LOGIC ĐỔI EMAIL (MODAL 2 BƯỚC) =================

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailStep(1);
    setEmailForm({ newEmail: '', currentPassword: '', otp: '' });
  };

  // Bước 1: Gửi yêu cầu
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    if (!emailForm.newEmail.toLowerCase().endsWith("@gmail.com")) {
      return showCustomToast("Email mới bắt buộc phải có đuôi @gmail.com", "error");
    }

    if (emailForm.newEmail === userEmail) {
      return showCustomToast("Email mới không được trùng email hiện tại", "error");
    }

    setIsLoading(true);
    try {
      await requestChangeEmailAPI({
        newEmail: emailForm.newEmail,
        currentPassword: emailForm.currentPassword
      });
      
      showCustomToast("Mã xác thực đã được gửi đến email mới!", "success");
      setEmailStep(2); 
    } catch (err) {
      showCustomToast(err.response?.data?.message || "Lỗi khi gửi yêu cầu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. LOGIC QUAN TRỌNG: BƯỚC 2 XÁC THỰC & LOGOUT ---
  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    if (emailForm.otp.length < 6) {
        return showCustomToast("Mã OTP phải có 6 chữ số", "warning");
    }

    setIsLoading(true);
    try {
      await verifyChangeEmailAPI({ otp: emailForm.otp });
      showCustomToast(`Đổi email thành công! Vui lòng đăng nhập lại bằng ${emailForm.newEmail}`, "success");
      closeEmailModal();
      setTimeout(() => {
          dispatch(clearUserInfo());
          localStorage.removeItem('authToken'); 
          navigate('/auth/login');
      }, 1500);

    } catch (err) {
      showCustomToast(err.response?.data?.message || "Mã OTP không đúng", "error");
    } finally {
      setIsLoading(false);
    }
  };

    // ================= LOGIC KHÓA TÀI KHOẢN =================
  const handleDeleteAccount = async () => {
    if (!userInfo.id) return showCustomToast("Không tìm thấy thông tin người dùng", "error");

    setIsLoading(true);
    try {
      // 1. Gọi API xóa/khóa user
      await deleteUserById(userInfo.id);
      
      // 2. Thông báo thành công
      showCustomToast("Tài khoản đã bị vô hiệu hóa thành công.", "success");
      
      // 3. Đóng Modal
      setShowDeleteModal(false);

      // 4. Logout và chuyển hướng
      setTimeout(() => {
        dispatch(clearUserInfo());
        logOut();
        navigate('/');
      }, 1500);

    } catch (err) {
      console.error(err);
      showCustomToast(err.response?.data?.message || "Lỗi khi xóa tài khoản", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= CONFIG UI (GIỮ NGUYÊN) =================
  const settingsSections = [
    {
      id: 'account',
      title: 'Tài Khoản & Bảo Mật',
      icon: <Security className="w-5 h-5" />,
      features: [
        {
          title: 'Đổi mật khẩu',
          description: 'Cập nhật mật khẩu đăng nhập',
          action: handleChangePassword,
          icon: <Password className="w-5 h-5" />
        }
      ]
    },
    {
        id: 'notifications',
        title: 'Thông Báo',
        icon: <Notifications className="w-5 h-5" />,
        features: [
          {
            title: 'Thông báo email',
            description: userEmail || 'Chưa cập nhật',
            action: () => setShowEmailModal(true),
            icon: <Email className="w-5 h-5" />
          },
        ]
      },
      {
        id: 'privacy',
        title: 'Quyền Riêng Tư',
        icon: <PrivacyTip className="w-5 h-5" />,
        features: [
          {
            title: 'Xóa tài khoản',
            description: 'Xóa vĩnh viễn tài khoản',
            action: () => setShowDeleteModal(true),
            icon: <Delete className="w-5 h-5" />,
            dangerous: true
          }
        ]
      }
  ];

  const currentSection = settingsSections.find(section => section.id === activeSection);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài Đặt</h1>
        <p className="text-gray-600">Quản lý cài đặt tài khoản và tùy chọn cá nhân</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {showChangePassword ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Password className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Đổi Mật Khẩu</h2>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                </div>
                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500"
                            required
                            />
                            <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500"
                            required
                            />
                            <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowChangePassword(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                    {isLoading ? 'Đang xử lý...' : <><CheckCircle className="w-5 h-5" /> Cập nhật</>}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                {currentSection?.icon}
                <h2 className="text-xl font-bold text-gray-900">{currentSection?.title}</h2>
              </div>
              <div className="space-y-4">
                {currentSection?.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${feature.dangerous ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${feature.dangerous ? 'text-red-700' : 'text-gray-900'}`}>{feature.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                    </div>
                    <button onClick={feature.action} className={`px-4 py-2 rounded-lg font-medium transition-colors ${feature.dangerous ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {feature.dangerous ? 'Xóa' : 'Thay đổi'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ================= MODAL THAY ĐỔI EMAIL ================= */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {emailStep === 1 ? 'Thay đổi Email (Bước 1/2)' : 'Xác thực Email (Bước 2/2)'}
              </h2>
              <button onClick={closeEmailModal} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="p-6">
              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                  <p className="text-sm text-gray-600">Vui lòng nhập email mới và mật khẩu hiện tại để xác minh danh tính.</p>
                  
                  {/* Email Mới */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email mới</label>
                    <input
                      type="email"
                      placeholder="vidu@gmail.com"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                      pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                      title="Vui lòng nhập địa chỉ email có đuôi @gmail.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Mật Khẩu Hiện Tại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input
                        type={showEmailPass ? "text" : "password"}
                        placeholder="Nhập mật khẩu để tiếp tục"
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <button type="button" onClick={() => setShowEmailPass(!showEmailPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showEmailPass ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={closeEmailModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                       {isLoading ? 'Đang gửi...' : <><Send fontSize="small"/> Gửi mã xác thực</>}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                    Một mã xác thực đã được gửi đến <b>{emailForm.newEmail}</b>. Vui lòng kiểm tra hộp thư.
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 số)</label>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="123456"
                      value={emailForm.otp}
                      onChange={(e) => setEmailForm({...emailForm, otp: e.target.value.replace(/[^0-9]/g, '')})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button type="button" onClick={() => setEmailStep(1)} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <ArrowBack fontSize="small"/> Quay lại nhập email
                    </button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                      {isLoading ? 'Đang xác thực...' : 'Xác nhận thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL XÓA TÀI KHOẢN ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-t-4 border-red-600"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Warning className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn có chắc chắn?</h2>
              <p className="text-gray-600 mb-6">
                Hành động này sẽ <b>vô hiệu hóa vĩnh viễn</b> tài khoản của bạn. Bạn sẽ bị đăng xuất ngay lập tức và không thể khôi phục dữ liệu.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
                >
                  {isLoading ? 'Đang xử lý...' : <><Delete/> Xác nhận xóa tài khoản</>}
                </button>
                
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  disabled={isLoading}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;