import { useEffect, useCallback } from "react";
import { logOut } from '../../utils/jwt-helper';
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../store/features/common";
import { fetchUserDetails } from "../../api/user/userInfo";
import { loadUserInfo, selectUserInfo, clearUserInfo } from "../../store/features/user";
import { showCustomToast } from "../../components/Toaster/ShowCustomToast";
import {
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ShoppingBag as ShoppingBagIcon,
  Favorite as FavoriteIcon,
  Logout as LogoutIcon,
  Discount as DiscountIcon
} from '@mui/icons-material';

const Account = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setLoading(true));
    fetchUserDetails()
      .then((res) => dispatch(loadUserInfo(res)))
      .catch(() => {})
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  const onLogOut = useCallback(() => {
    dispatch(clearUserInfo());
    logOut();
    navigate("/");
    showCustomToast('Đã đăng xuất thành công', "success");
  }, [navigate]);

  // --- 1. HÀM LẤY CHỮ CÁI ĐẦU ---
  const getAvatarInitial = () => {
    if (userInfo?.firstName) return userInfo.firstName.charAt(0).toUpperCase();
    if (userInfo?.lastName) return userInfo.lastName.charAt(0).toUpperCase();
    return "U";
  };
  // ------------------------------

  const menuItems = [
    { 
      to: "/account-details/profile", 
      label: "Thông tin tài khoản", 
      icon: <AccountCircleIcon className="w-5 h-5" />,
      description: "Quản lý thông tin cá nhân"
    },
    { 
      to: "/account-details/orders", 
      label: "Đơn hàng của tôi", 
      icon: <ShoppingBagIcon className="w-5 h-5" />,
      description: "Theo dõi và quản lý đơn hàng"
    },
    { 
      to: "/account-details/wishlist", 
      label: "Sản phẩm yêu thích", 
      icon: <FavoriteIcon className="w-5 h-5" />,
      description: "Danh sách sản phẩm đã lưu"
    },
    { 
      to: "/account-details/discount", 
      label: "Mã giảm giá", 
      icon: <DiscountIcon className="w-5 h-5" />,
      description: "Kho voucher của tôi"
    },
    { 
      to: "/account-details/settings", 
      label: "Cài đặt tài khoản", 
      icon: <SettingsIcon className="w-5 h-5" />,
      description: "Tùy chỉnh tài khoản"
    },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {userInfo?.email && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                
                {/* --- 2. PHẦN AVATAR ĐÃ SỬA --- */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${!userInfo?.avatarUrl ? 'bg-primary' : 'bg-gray-100'}`}>
                   {userInfo?.avatarUrl ? (
                      <img 
                           src={userInfo.avatarUrl} 
                           alt="User Avatar" 
                           className="w-full h-full object-cover" 
                           onError={(e) => { e.target.style.display='none'; }} 
                      />
                   ) : (
                      <span className="text-2xl md:text-3xl font-bold text-white select-none">
                           {getAvatarInitial()}
                      </span>
                   )}
                </div>
                {/* ----------------------------- */}

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Xin chào, {userInfo?.firstName} {userInfo?.lastName}!
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">Quản lý tài khoản và đơn hàng của bạn</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Sidebar Navigation */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                  <nav className="p-3 space-y-1">
                    {menuItems.map(({ to, label, icon, description }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-start gap-3 p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                            isActive 
                              ? "bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-100" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`
                        }
                      >
                          {({ isActive }) => (
                            <>
                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                  isActive ? "bg-white text-blue-600 shadow-sm" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-blue-600"
                                }`}>
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center h-9">
                                  <span className="text-sm">{label}</span>
                                </div>
                                {isActive && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-r-full" />
                                )}
                            </>
                          )}
                      </NavLink>
                    ))}
                  </nav>

                  {/* Logout Section */}
                  <div className="border-t border-gray-200 p-3 mt-1">
                    <button
                      onClick={onLogOut}
                      className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogoutIcon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-sm">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 w-full lg:min-w-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                  <div className="p-4 sm:p-6 lg:p-8 flex-1">
                    <Outlet />
                  </div>
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Account;