import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory2 as InventoryIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LocalOffer as LocalOfferIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logOut } from '../../../utils/jwt-helper';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  const location = useLocation();
  const navigative = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { id: 'users', label: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { id: 'products', label: 'Quản lý sản phẩm', icon: <InventoryIcon />, path: '/admin/products' },
    { id: 'orders', label: 'Đơn hàng', icon: <ShoppingCartIcon />, path: '/admin/orders' },
    { id: 'discounts', label: 'Mã giảm giá', icon: <LocalOfferIcon />, path: '/admin/discounts' },
    { id: 'analytics', label: 'Thống kê', icon: <BarChartIcon />, path: '/admin/analytics' },
    { id: 'flashsales', label: 'FlashSale', icon: <FlashOnIcon />, path: '/admin/flashsales' },
    
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () =>{
    if(window.confirm('Bạn có chắc muốn đăng xuất?')){
      logOut();

      setSidebarOpen(false);
      navigative("/");
      window.location.reload();
    }
  }

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-500 to-blue-700 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        flex flex-col justify-between
      `}>
        {/* Header và Navigation */}
        <div>
          <div className="flex items-center justify-center h-16 border-b border-blue-400">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="text-white text-xl" />
              <span className="text-white text-xl font-semibold">Admin Panel</span>
            </div>
          </div>

          <nav className="mt-8">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors duration-200
                      ${isActive(item.path)
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-blue-100 hover:bg-blue-600 hover:text-white"
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout Button - Luôn nằm dưới cùng */}
        <div className="p-4 border-t border-blue-400">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg 
              transition-colors duration-200
              text-blue-100 hover:bg-red-600 hover:text-white
            "
          >
            <LogoutIcon className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;