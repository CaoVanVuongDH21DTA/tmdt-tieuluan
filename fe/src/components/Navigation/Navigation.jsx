import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectTotalQuantity } from "../../store/features/cart";
import AsideShop from "../Aside/AsideShop";
import SearchBox from "../Search/SearchBox";
import { LogoShop } from "../logo/logoShop";
import { logOut, isTokenValid } from "../../utils/jwt-helper";
import { clearUserInfo, loadUserInfo, selectUserInfo } from "../../store/features/user";
import { fetchUserDetails } from "../../api/user/userInfo";
import { setLoading } from "../../store/features/common";
import {
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  ShoppingBag as ShoppingBagIcon,
  AccountCircle as AccountCircleIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { showCustomToast } from "../Toaster/ShowCustomToast";

const Navigation = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const totalQuantity = useSelector(selectTotalQuantity);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);
  const isLoggedIn = isTokenValid();

  const location = useLocation();
  // Xử lý tên hiển thị
  const username = `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() || "User";

  useEffect(() => {
    dispatch(setLoading(true));
    fetchUserDetails()
      .then((res) => dispatch(loadUserInfo(res)))
      .catch(() => {})
      .finally(() => dispatch(setLoading(false)));
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logOut();
    dispatch(clearUserInfo({}));
    setShowUserMenu(false);
    navigate("/");
    showCustomToast("Đã đăng xuất thành công.", "success");
  };

  useEffect(() => {
    setImgError(false);
  }, [userInfo?.avatarUrl]);

  // --- HELPER FUNCTION ---
  // Chỉ giữ lại hàm lấy chữ cái đầu
  const getAvatarInitial = () => {
    if (userInfo?.firstName) return userInfo.firstName.charAt(0).toUpperCase();
    if (userInfo?.lastName) return userInfo.lastName.charAt(0).toUpperCase();
    return "U";
  };

  // Component Avatar tái sử dụng
  const UserAvatar = ({ size = "w-8 h-8", textSize = "text-sm", border = "border-2" }) => (
    <div
      className={`${size} rounded-full ${border} border-white shadow-sm overflow-hidden flex items-center justify-center transition-colors flex-shrink-0 ${
        !userInfo?.avatarUrl || imgError ? "bg-primary" : "bg-gray-100"
      }`}
    >
      {userInfo?.avatarUrl && !imgError ? (
        <img
          src={userInfo.avatarUrl}
          alt="User Avatar"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`${textSize} font-bold text-white select-none`}>
          {getAvatarInitial()}
        </span>
      )}
    </div>
  );

  return (
    <nav className="bg-white text-gray-800 shadow-lg w-full z-40 sticky top-0 border-b">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <LogoShop />
          </Link>

          {/* Search Box - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBox />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Hotline - Desktop */}
            <div className="hidden lg:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <PhoneIcon className="text-blue-600 text-lg" />
              <div className="text-sm">
                <div className="font-semibold text-blue-600">1900.1234</div>
                <div className="text-gray-600 text-xs">Hỗ trợ 24/7</div>
              </div>
            </div>

            {/* Cart */}
            <Link
              to="/cart-items"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ShoppingCartIcon className="text-gray-600 text-xl" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {totalQuantity}
                </span>
              )}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Giỏ hàng
              </div>
            </Link>

            {/* User Menu / Login */}
            {isLoggedIn ? (
              <div className="relative">
                {/* 1. BUTTON AVATAR TRÊN NAVBAR (DESKTOP) */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full transition-colors group focus:outline-none"
                >
                  <UserAvatar size="w-9 h-9" textSize="text-sm" />
                  
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Tài khoản
                  </div>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-black z-50 overflow-hidden"
                    >
                      {/* 2. AVATAR TRONG DROPDOWN MENU */}
                      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar size="w-12 h-12" textSize="text-xl" border="border-2" />
                          <div className="overflow-hidden">
                            <p className="font-semibold truncate">{username}</p>
                            <p className="text-blue-100 text-sm">Tài khoản của tôi</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          to="/account-details/profile"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <AccountCircleIcon className="text-primary text-xl" />
                          <span className="font-medium">Thông tin tài khoản</span>
                        </Link>
                        <Link
                          to="/account-details/orders"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ShoppingBagIcon className="text-primary text-xl" />
                          <span className="font-medium">Đơn mua</span>
                        </Link>
                        <Link
                          to="/account-details/wishlist"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FavoriteIcon className="text-primary text-xl" />
                          <span className="font-medium">Sản phẩm yêu thích</span>
                        </Link>
                        <Link
                          to="/order-tracking"
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HistoryIcon className="text-primary text-xl" />
                          <span className="font-medium">Lịch sử mua hàng</span>
                        </Link>
                        <div className="border-t my-2"></div>
                        <button
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors group w-full text-red-600"
                          onClick={handleLogout}
                        >
                          <LogoutIcon className="text-xl" />
                          <span className="font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center justify-center gap-2 
                           bg-gradient-to-r from-primary to-primary-dark 
                           text-white font-medium 
                           px-4 py-2 rounded-lg 
                           hover:from-primary-dark hover:to-blue-900 
                           transition-all shadow-md hover:shadow-lg
                           text-sm sm:text-base 
                           w-full sm:w-auto"
              >
                <PersonIcon className="text-base sm:text-lg" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {showMobileMenu ? (
                <CloseIcon className="text-gray-600" />
              ) : (
                <MenuIcon className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden pb-4"
            >
              <SearchBox isMobile={true} onClose={() => setShowSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-gray-50 border-t py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/showroom"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <LocationOnIcon fontSize="small" />
                <span>Hệ thống Showroom</span>
              </Link>
              <Link
                to="/order-tracking"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <AssignmentIcon fontSize="small" />
                <span>Tra cứu đơn hàng</span>
              </Link>
            </div>
            <div className="hidden lg:block text-sm text-gray-500">
              {isLoggedIn
                ? `Xin chào, ${username}`
                : "Chào mừng đến với LaptopStore"}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-1 hover:bg-primary-dark rounded-full"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* 3. AVATAR TRONG MOBILE MENU */}
                {isLoggedIn && (
                  <div className="flex items-center gap-3 mt-4">
                    <UserAvatar size="w-12 h-12" textSize="text-xl" />
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">{username}</p>
                      <p className="text-blue-100 text-sm">Tài khoản của tôi</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <SearchBox
                    isMobile={true}
                    onClose={() => setShowMobileMenu(false)}
                  />
                </div>

                <div className="px-4 pb-4">
                  <AsideShop onClose={() => setShowMobileMenu(false)} />
                </div>

                <div className="border-t pt-4">
                  <Link
                    to="/showroom"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LocationOnIcon className="text-primary" />
                    <span>Hệ thống Showroom</span>
                  </Link>
                  <Link
                    to="/order-tracking"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <AssignmentIcon className="text-primary" />
                    <span>Tra cứu đơn hàng</span>
                  </Link>
                </div>
              </div>

              {/* Footer - Only show login if NOT logged in */}
              {!isLoggedIn && (
                <div className="p-4 border-t">
                  <Link
                    to="/auth/login"
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold text-center block hover:bg-primary-dark transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;