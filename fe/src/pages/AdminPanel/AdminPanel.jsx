import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { fetchUserDetails } from '../../api/user/userInfo';
import { loadUserInfo } from '../../store/features/user';
import { isTokenValid } from '../../utils/jwt-helper';
import { showCustomToast } from '../../components/Toaster/ShowCustomToast';
import { SidebarSkeleton } from './skeleton/SidebarSkeleton'; 
import SessionHandle from '../../components/Session/SessionHandle';

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle');
  const userInfoFromRedux = useSelector((state) => state.userState.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus !== 'idle') {
      return;
    }

    const run = async () => {
      setAuthStatus('loading');

      // Check token
      if (!isTokenValid()) {
        navigate("/auth/login");
        return;
      }

      let infoToVerify = userInfoFromRedux;

      // Fetch data nếu Redux chưa có
      if (!infoToVerify?.authorityList) {
        try {
          const userRes = await fetchUserDetails();
          dispatch(loadUserInfo(userRes)); 
          infoToVerify = userRes; 
        } catch (err) {
          showCustomToast("Không thể tải thông tin người dùng", "error");
          navigate("/auth/login");
          return;
        }
      }

      // Check quyền ADMIN
      const isAdmin = infoToVerify?.authorityList?.some(
        (auth) => auth.authority === "ADMIN"
      );

      if (isAdmin) {
        setAuthStatus('success');
      } else {
        setAuthStatus('error');
        showCustomToast("Bạn không có quyền truy cập", "warning");
        navigate("/403");
      }
    };

    run();
  }, [authStatus, dispatch, navigate]);


  // 2. LOGIC HIỂN THỊ LOADING (Dùng Skeleton thay vì text "Đang tải...")
  if (authStatus !== 'success') { 
    return (
      <div className="flex h-screen bg-gray-50">
        {/* KHUNG XƯƠNG SIDEBAR (Chỉ hiện trên Desktop để giữ layout) */}
        <div className="hidden lg:block w-64 flex-shrink-0 h-full">
           <SidebarSkeleton />
        </div>

        {/* KHUNG XƯƠNG CONTENT (Giả lập Header + Nội dung đang load) */}
        <div className="flex-1 flex flex-col overflow-x-hidden lg:ml-2">
           {/* Header giả (Giữ chỗ cho Header thật) */}
           <div className="h-16 bg-white border-b border-gray-200 shadow-sm mb-6"></div>
           
           {/* Nội dung loading chính giữa */}
           <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <span className="text-gray-500 font-medium animate-pulse">Đang xác thực quyền truy cập...</span>
           </div>
        </div>
      </div>
    ); 
  }

  // 3. UI CHÍNH (Khi đã Success)
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Thông báo token hết hạn */}
      <SessionHandle/>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-x-hidden lg:ml-2">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;